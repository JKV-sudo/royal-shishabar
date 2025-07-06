import {
  GoogleAuthProvider,
  signInWithPopup,

} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDB } from '../config/firebase';
import { User } from '../stores/authStore';

export interface SocialProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  provider: GoogleAuthProvider;
}

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: '🔍',
    color: '#4285F4',
    provider: new GoogleAuthProvider(),
  },
];

export class SocialAuthService {
  // Sign in with any social provider
  static async signInWithProvider(providerId: string): Promise<User> {
    const provider = SOCIAL_PROVIDERS.find(p => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not supported`);
    }

    try {
      const auth = getFirebaseAuth();
      const db = getFirestoreDB();
      
      // Configure provider scopes
      this.configureProvider(provider.provider, providerId);
      
      const result = await signInWithPopup(auth, provider.provider);
      const firebaseUser = result.user;

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userData;
      if (userDoc.exists()) {
        // User exists, get their data
        const data = userDoc.data();
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: data.name || firebaseUser.displayName || '',
          phone: data.phone,
          role: data.role || 'user',
          avatar: firebaseUser.photoURL || data.avatar,
          createdAt: data.createdAt.toDate(),
        };
      } else {
        // New user, create profile
        const newUserData = {
          email: firebaseUser.email!,
          name: firebaseUser.displayName || '',
          phone: undefined, // Will be collected later if needed
          role: 'user',
          avatar: firebaseUser.photoURL || undefined,
          createdAt: serverTimestamp(),
          socialProvider: providerId,
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);

        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || '',
          phone: undefined,
          role: 'user',
          avatar: firebaseUser.photoURL,
          createdAt: new Date(),
        };
      }

      return userData;
    } catch (error: any) {
      console.error('Social auth error:', error);
      throw new Error(this.getSocialErrorMessage(error.code, providerId));
    }
  }

  // Configure provider with appropriate scopes
  private static configureProvider(provider: GoogleAuthProvider, providerId: string): void {
    if (providerId === 'google') {
      provider.addScope('profile');
      provider.addScope('email');
    }
  }

  // Get user-friendly error messages
  private static getSocialErrorMessage(code: string, providerId: string): string {
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials.';
      case 'auth/auth-domain-config-required':
        return 'Authentication configuration error. Please contact support.';
      case 'auth/cancelled-popup-request':
        return 'Another sign-in request is already pending.';
      case 'auth/operation-not-allowed':
        return `${providerId} sign-in is not enabled. Please contact support.`;
      case 'auth/operation-not-supported-in-this-environment':
        return 'This operation is not supported in the current environment.';
      case 'auth/timeout':
        return 'The sign-in request timed out. Please try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/web-storage-unsupported':
        return 'Web storage is not supported in your browser.';
      default:
        return `An error occurred during ${providerId} sign-in. Please try again.`;
    }
  }

  // Get available social providers
  static getAvailableProviders(): SocialProvider[] {
    return SOCIAL_PROVIDERS;
  }

  // Get supported provider IDs
  static getSupportedProviders(): string[] {
    return SOCIAL_PROVIDERS.map(p => p.id);
  }
} 