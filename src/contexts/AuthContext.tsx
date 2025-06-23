import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import { useAuthStore } from "../stores/authStore";
import { AuthService } from "../services/authService";

interface AuthContextType {
  loading: boolean;
  error: Error | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, loading, error] = useAuthState(auth);
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    if (user) {
      // User is signed in, get their data from Firestore
      AuthService.getUserData(user.uid).then((userData) => {
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
      });
    } else {
      // User is signed out, clear the store
      logout();
    }
  }, [user, setUser, logout]);

  const value = {
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
