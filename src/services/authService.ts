import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDB } from '../config/firebase';
import { User } from '../stores/authStore';

export interface AuthError {
  code: string;
  message: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: Date;
}

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign up with email and password
  static async signUp(
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<FirebaseUser> {
    try {
      const auth = getFirebaseAuth();
      const db = getFirestoreDB();
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: name,
      });

      // Create user document in Firestore
      const userData: Omit<UserData, 'id' | 'createdAt'> = {
        email: user.email!,
        name,
        phone,
        role: 'user',
        avatar: user.photoURL || undefined,
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
      });

      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Sign in with Google
  static async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get current user from Firebase Auth
  static getCurrentUser(): FirebaseUser | null {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Get user data from Firestore
  static async getUserData(userId: string): Promise<UserData | null> {
    try {
      const db = getFirestoreDB();
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: data.role,
          avatar: data.avatar,
          createdAt: data.createdAt.toDate(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const { id, ...updateData } = updates;
      const db = getFirestoreDB();
      await updateDoc(doc(db, 'users', userId), updateData);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        if (userData) {
          callback({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name,
            phone: userData.phone,
            role: userData.role,
            avatar: firebaseUser.photoURL || userData.avatar,
            createdAt: userData.createdAt,
          });
        }
      } else {
        callback(null);
      }
    });
  }

  // Get error message from Firebase error code
  private static getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
} 