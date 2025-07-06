import { create } from 'zustand';
import { AuthService } from '../services/authService';
import { SocialAuthService } from '../services/socialAuthService';
import { CookieAuthService } from '../services/cookieAuthService';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signInWithSocial: (providerId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initializeFromCookie: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  
  // Initialize auth state from cookie on app start
  initializeFromCookie: () => {
    const cachedSession = CookieAuthService.loadSession();
    if (cachedSession) {
      console.log('🍪 Initializing auth state from cookie');
      const user = CookieAuthService.sessionToUser(cachedSession);
      set({ user, isAuthenticated: true });
    }
  },
  
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    
    // Save to cookie whenever user state changes
    if (user) {
      CookieAuthService.saveSession(user);
    } else {
      CookieAuthService.clearSession();
    }
  },
  
  logout: () => {
    AuthService.signOut();
    CookieAuthService.clearSession();
    set({ user: null, isAuthenticated: false });
  },
  
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const firebaseUser = await AuthService.signIn(email, password);
      const userData = await AuthService.getUserData(firebaseUser.uid);
      
      if (userData) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          avatar: firebaseUser.photoURL || userData.avatar,
          createdAt: userData.createdAt,
        };
        
        set({ user, isLoading: false, isAuthenticated: true });
        CookieAuthService.saveSession(user);
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  signUp: async (email: string, password: string, name: string, phone?: string) => {
    set({ isLoading: true });
    try {
      const firebaseUser = await AuthService.signUp(email, password, name, phone);
      const userData = await AuthService.getUserData(firebaseUser.uid);
      
      if (userData) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          avatar: firebaseUser.photoURL || userData.avatar,
          createdAt: userData.createdAt,
        };
        
        set({ user, isLoading: false, isAuthenticated: true });
        CookieAuthService.saveSession(user);
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Helper functions for quick role checks
  signInWithSocial: async (providerId: string) => {
    set({ isLoading: true });
    try {
      const user = await SocialAuthService.signInWithProvider(providerId);
      set({ user, isLoading: false, isAuthenticated: true });
      CookieAuthService.saveSession(user);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    await AuthService.resetPassword(email);
  },
}));

// Helper functions for quick access (can be used outside components)
export const isUserAdmin = (): boolean => {
  return CookieAuthService.isAdmin();
};

export const isUserStaffOrAdmin = (): boolean => {
  return CookieAuthService.isStaffOrAdmin();
};

export const getUserRole = (): string | null => {
  return CookieAuthService.getUserRole();
};

export const isUserAuthenticated = (): boolean => {
  return CookieAuthService.isAuthenticated();
};
