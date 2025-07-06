import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirebaseAuth } from "../config/firebase";
import { createContext, useContext, useEffect, ReactNode } from "react";
import { User } from "firebase/auth";
import { useAuthStore } from "../stores/authStore";
import { AuthService } from "../services/authService";
import { ensureAdminUser } from "../utils/ensureAdminUser";
import { CookieAuthService } from "../services/cookieAuthService";

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  error: Error | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, loading, error] = useAuthState(getFirebaseAuth());
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    if (user) {
      // User is signed in
      console.log("🔍 User authenticated, managing session:", user.uid);

      const handleUserSession = async () => {
        // First, try to load from cookie for instant UI update
        const cachedSession = CookieAuthService.loadSession();

        if (cachedSession && cachedSession.userId === user.uid) {
          console.log("🍪 Using cached session for instant load");
          const cachedUser = CookieAuthService.sessionToUser(cachedSession);
          setUser(cachedUser);

          // Check if we need to refresh from Firestore
          if (!CookieAuthService.shouldRefreshSession(cachedSession)) {
            console.log("🍪 Session is fresh, skipping Firestore fetch");
            CookieAuthService.extendSession(); // Extend session on activity
            return;
          }

          console.log("🔄 Session needs refresh, fetching from Firestore...");
        }

        // Fetch fresh data from Firestore (either no cache or refresh needed)
        await fetchUserDataWithTimeout();
      };

      const fetchUserDataWithTimeout = async () => {
        console.log("🔍 Fetching user data for:", user.uid);

        // Check for known admin emails first to avoid unnecessary Firestore calls
        const isKnownAdmin =
          user.email === "admin@royal-shishabar.com" ||
          user.email === "royal.waldkraiburg@gmail.com" ||
          user.email === "jacob-s@live.de" ||
          user.email?.includes("admin");

        try {
          // Add a timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Timeout fetching user data")),
              8000
            )
          );

          // Retry mechanism for better reliability
          let userData = null;
          let retryCount = 0;
          const maxRetries = 2;

          while (retryCount <= maxRetries && !userData) {
            try {
              const userDataPromise = AuthService.getUserData(user.uid);
              userData = (await Promise.race([
                userDataPromise,
                timeoutPromise,
              ])) as any;

              if (
                userData &&
                typeof userData === "object" &&
                "role" in userData
              ) {
                break; // Successfully got user data with role
              }
            } catch (retryError) {
              console.warn(
                `🔄 Retry ${retryCount + 1}/${maxRetries + 1} failed:`,
                retryError
              );
              retryCount++;
              if (retryCount <= maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
              }
            }
          }

          if (userData && typeof userData === "object" && "name" in userData) {
            console.log("✅ User data loaded successfully:", userData);

            // Prioritize database role, but ensure known admins get admin role
            const finalRole =
              userData.role || (isKnownAdmin ? "admin" : "user");

            const finalUser = {
              id: user.uid,
              email: user.email!,
              name: userData.name,
              phone: userData.phone,
              role: finalRole,
              avatar: user.photoURL || userData.avatar,
              createdAt: userData.createdAt,
            };

            setUser(finalUser);

            // Save to cookie for future fast access
            CookieAuthService.saveSession(finalUser);
          } else {
            console.warn(
              "⚠️ No user data found in Firestore, using known admin status"
            );

            const userRole = isKnownAdmin ? "admin" : "user";

            console.log(
              `Setting fallback role: ${userRole} for email: ${user.email}`
            );

            // If this is an admin user, ensure they exist in Firestore
            if (isKnownAdmin) {
              ensureAdminUser(user.uid, user.email!, 3).then((success) => {
                if (success) {
                  console.log("✅ Admin user document ensured in Firestore");
                } else {
                  console.warn("⚠️ Could not ensure admin user document");
                }
              });
            }

            // Use basic Firebase Auth data with potential admin role
            const fallbackUser = {
              id: user.uid,
              email: user.email!,
              name: user.displayName || user.email?.split("@")[0] || "User",
              role: userRole,
              avatar: user.photoURL || "",
              createdAt: new Date(),
            };

            setUser(fallbackUser);

            // Save fallback to cookie
            CookieAuthService.saveSession(fallbackUser);
          }
        } catch (finalError) {
          console.error(
            "❌ Failed to fetch user data from Firestore:",
            finalError
          );

          const userRole = isKnownAdmin ? "admin" : "user";

          console.log(
            `Setting emergency fallback role: ${userRole} for email: ${user.email}`
          );

          // If this is an admin user, ensure they exist in Firestore
          if (isKnownAdmin) {
            ensureAdminUser(user.uid, user.email!, 3).then((success) => {
              if (success) {
                console.log(
                  "✅ Admin user document ensured in Firestore (fallback)"
                );
              } else {
                console.warn(
                  "⚠️ Could not ensure admin user document (fallback)"
                );
              }
            });
          }

          // Continue with basic user data from Firebase Auth
          const emergencyUser = {
            id: user.uid,
            email: user.email!,
            name: user.displayName || user.email?.split("@")[0] || "User",
            role: userRole,
            avatar: user.photoURL || "",
            createdAt: new Date(),
          };

          setUser(emergencyUser);

          // Save emergency fallback to cookie
          CookieAuthService.saveSession(emergencyUser);
        }
      };

      handleUserSession();
    } else if (user === null) {
      // User is signed out, clear everything
      console.log("🔓 User signed out, clearing session");
      logout();
      CookieAuthService.clearSession();
    } else {
      // user is undefined (loading state)
      // Try to load from cookie while Firebase Auth initializes
      const cachedSession = CookieAuthService.loadSession();
      if (cachedSession) {
        console.log(
          "🍪 Loading cached session while Firebase Auth initializes"
        );
        const cachedUser = CookieAuthService.sessionToUser(cachedSession);
        setUser(cachedUser);
      }
    }
  }, [user, setUser, logout]);

  const value = {
    user,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
