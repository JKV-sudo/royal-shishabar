import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
};

// Lazy initialization to improve performance
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

// Initialize Firebase app
const initializeFirebase = (): FirebaseApp => {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }
  return app;
};

// Get Firebase app instance
export const getFirebaseApp = (): FirebaseApp => {
  return initializeFirebase();
};

// Get Firebase Auth instance
export const getFirebaseAuth = (): Auth => {
  if (!authInstance) {
    const firebaseApp = getFirebaseApp();
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
};

// Get Firestore instance
export const getFirestoreDB = (): Firestore => {
  if (!dbInstance) {
    const firebaseApp = getFirebaseApp();
    dbInstance = getFirestore(firebaseApp);
  }
  return dbInstance;
};

// Get Firebase Storage instance
export const getFirebaseStorage = (): FirebaseStorage => {
  if (!storageInstance) {
    const firebaseApp = getFirebaseApp();
    storageInstance = getStorage(firebaseApp);
  }
  return storageInstance;
};

// Default export
export default getFirebaseApp();
