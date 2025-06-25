import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';

// Function to promote current user to admin (for testing)
export async function promoteCurrentUserToAdmin(): Promise<boolean> {
  try {
    // This is a development-only function
    // In production, you would want proper admin authentication
    const db = getFirestoreDB();
    
    // For demo purposes, we'll use a hardcoded user ID
    // In a real app, you'd get this from the current user's auth state
    const demoUserId = 'demo-admin-user';
    
    await updateDoc(doc(db, 'users', demoUserId), {
      role: 'admin',
    });
    
    return true;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return false;
  }
}

// Function to check if current user is admin
export const checkIfUserIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(getFirestoreDB(), 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}; 