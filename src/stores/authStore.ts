import { create } from 'zustand';
import { AuthService } from '../services/authService';
import { SocialAuthService } from '../services/socialAuthService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithSocial: (providerId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  
  logout: () => {
    AuthService.signOut();
    set({ user: null, isAuthenticated: false });
  },
  
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await AuthService.signIn(email, password);
      set({ user, isLoading: false, isAuthenticated: true });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      const user = await AuthService.signUp(email, password, name);
      set({ user, isLoading: false, isAuthenticated: true });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  signInWithSocial: async (providerId: string) => {
    set({ isLoading: true });
    try {
      const user = await SocialAuthService.signInWithProvider(providerId);
      set({ user, isLoading: false, isAuthenticated: true });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  resetPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      await AuthService.resetPassword(email);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
