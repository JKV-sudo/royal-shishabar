import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDB } from '../config/firebase';
import { User } from '../stores/authStore';

export interface SocialProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  provider: any;
}

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: '🔍',
    color: '#4285F4',
    provider: new GoogleAuthProvider(),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    provider: new FacebookAuthProvider(),
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: '🐦',
    color: '#1DA1F2',
    provider: new TwitterAuthProvider(),
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    color: '#333333',
    provider: new GithubAuthProvider(),
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: '🍎',
    color: '#000000',
    provider: new OAuthProvider('apple.com'),
  },
];

// Custom Instagram OAuth (requires additional setup)
export const INSTAGRAM_PROVIDER = new OAuthProvider('instagram.com');

export class SocialAuthService {
  // Sign in with Google
  static async signInWithGoogle(): Promise<User> {
    try {
      const auth = getFirebaseAuth();
      const db = getFirestoreDB();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore
      const userData = await this.getUserData(firebaseUser.uid);

      if (!userData) {
        // Create new user document
        const newUserData: Omit<User, 'id'> = {
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'User',
          role: 'user',
          avatar: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUserData,
          createdAt: serverTimestamp(),
        });

        return {
          id: firebaseUser.uid,
          ...newUserData,
        };
      }

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name,
        role: userData.role,
        avatar: firebaseUser.photoURL || userData.avatar,
        createdAt: userData.createdAt,
      };
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign in with any social provider
  static async signInWithProvider(providerId: string): Promise<User> {
    try {
      const auth = getFirebaseAuth();
      const socialProvider = SOCIAL_PROVIDERS.find(p => p.id === providerId);
      if (!socialProvider) {
        throw new Error('Unsupported provider');
      }

      // Configure provider scopes
      this.configureProvider(socialProvider.provider, providerId);

      // Sign in with popup
      const userCredential = await signInWithPopup(auth, socialProvider.provider);
      return await this.handleSocialSignIn(userCredential.user, providerId);
    } catch (error: any) {
      throw new Error(this.getSocialErrorMessage(error.code, providerId));
    }
  }

  // Sign in with redirect (for mobile or when popup is blocked)
  static async signInWithRedirect(providerId: string): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      const socialProvider = SOCIAL_PROVIDERS.find(p => p.id === providerId);
      if (!socialProvider) {
        throw new Error('Unsupported provider');
      }

      this.configureProvider(socialProvider.provider, providerId);
      await signInWithRedirect(auth, socialProvider.provider);
    } catch (error: any) {
      throw new Error(this.getSocialErrorMessage(error.code, providerId));
    }
  }

  // Handle redirect result (call this after page load)
  static async handleRedirectResult(): Promise<User | null> {
    try {
      const auth = getFirebaseAuth();
      const result = await getRedirectResult(auth);
      if (result) {
        return await this.handleSocialSignIn(result.user, 'redirect');
      }
      return null;
    } catch (error: any) {
      console.error('Redirect sign-in error:', error);
      throw new Error(this.getSocialErrorMessage(error.code, 'redirect'));
    }
  }

  // Sign in with Instagram (custom implementation)
  static async signInWithInstagram(): Promise<User> {
    try {
      const auth = getFirebaseAuth();
      // Configure Instagram provider
      INSTAGRAM_PROVIDER.addScope('user_profile');
      INSTAGRAM_PROVIDER.addScope('user_media');

      const userCredential = await signInWithPopup(auth, INSTAGRAM_PROVIDER);
      return await this.handleSocialSignIn(userCredential.user, 'instagram');
    } catch (error: any) {
      throw new Error(this.getSocialErrorMessage(error.code, 'instagram'));
    }
  }

  // Handle social sign-in result
  private static async handleSocialSignIn(firebaseUser: FirebaseUser, providerId: string): Promise<User> {
    const db = getFirestoreDB();

    // Check if user exists in Firestore
    const userData = await this.getUserData(firebaseUser.uid);

    if (!userData) {
      // Create new user document
      const newUserData: Omit<User, 'id'> = {
        email: firebaseUser.email!,
        name: firebaseUser.displayName || 'User',
        role: 'customer',
        avatar: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUserData,
        socialProvider: providerId,
        lastSignIn: new Date(),
      });

      return {
        id: firebaseUser.uid,
        ...newUserData,
      };
    }

    // Update existing user's last sign-in
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      lastSignIn: new Date(),
      socialProvider: providerId,
    }, { merge: true });

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData.name,
      role: userData.role,
      avatar: firebaseUser.photoURL || userData.avatar,
      createdAt: userData.createdAt,
    };
  }

  // Configure provider with appropriate scopes
  private static configureProvider(provider: any, providerId: string): void {
    switch (providerId) {
      case 'google':
        provider.addScope('profile');
        provider.addScope('email');
        break;
      case 'facebook':
        provider.addScope('email');
        provider.addScope('public_profile');
        break;
      case 'twitter':
        // Twitter provider doesn't need additional scopes
        break;
      case 'github':
        provider.addScope('user:email');
        provider.addScope('read:user');
        break;
      case 'apple':
        provider.addScope('email');
        provider.addScope('name');
        break;
    }
  }

  // Get user data from Firestore
  static async getUserData(userId: string): Promise<Omit<User, 'id'> | null> {
    try {
      const db = getFirestoreDB();
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          email: data.email,
          name: data.name,
          role: data.role,
          avatar: data.avatar,
          createdAt: data.createdAt.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Get error message from Firebase error code
  private static getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked. Please allow popups for this site.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials.';
      default:
        return 'An error occurred during sign-in. Please try again.';
    }
  }

  // Get error message for social login
  private static getSocialErrorMessage(code: string, providerId: string): string {
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked. Please allow pop-ups for this site.';
      case 'auth/cancelled-popup-request':
        return 'Multiple pop-up requests were made. Please try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials.';
      case 'auth/operation-not-allowed':
        return `${providerId} sign-in is not enabled. Please contact support.`;
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return `Sign-in with ${providerId} failed. Please try again.`;
    }
  }

  // Get available providers based on configuration
  static getAvailableProviders(): SocialProvider[] {
    const availableProviders = [...SOCIAL_PROVIDERS];
    
    // Remove providers that aren't configured
    if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
      availableProviders.splice(availableProviders.findIndex(p => p.id === 'facebook'), 1);
    }
    
    if (!import.meta.env.VITE_TWITTER_API_KEY) {
      availableProviders.splice(availableProviders.findIndex(p => p.id === 'twitter'), 1);
    }

    return availableProviders;
  }
} 