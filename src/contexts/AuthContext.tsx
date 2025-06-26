import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirebaseAuth } from "../config/firebase";
import { createContext, useContext, useEffect, ReactNode } from "react";
import { User } from "firebase/auth";
import { useAuthStore } from "../stores/authStore";
import { AuthService } from "../services/authService";

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
      // User is signed in, get their data from Firestore
      AuthService.getUserData(user.uid)
        .then((userData) => {
          if (userData) {
            setUser({
              id: user.uid,
              email: user.email!,
              name: userData.name,
              role: userData.role,
              avatar: user.photoURL || userData.avatar,
              createdAt: userData.createdAt,
            });
          }
        })
        .catch((error) => {
          console.warn("Failed to fetch user data from Firestore:", error);
          // Continue with basic user data from Firebase Auth
          setUser({
            id: user.uid,
            email: user.email!,
            name: user.displayName || "User",
            role: "user",
            avatar: user.photoURL || "",
            createdAt: new Date(),
          });
        });
    } else {
      // User is signed out, clear the store
      logout();
    }
  }, [user, setUser, logout]);

  const value = {
    user,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
