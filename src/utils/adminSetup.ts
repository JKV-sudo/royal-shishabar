import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';

// Function to promote current user to admin (for testing)
export const promoteCurrentUserToAdmin = async () => {
  const { user } = useAuthStore.getState();
  
  if (!user) {
    console.error('No user logged in');
    return false;
  }

  try {
    const userRef = doc(db, 'users', user.id);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error('User document not found');
      return false;
    }

    // Update user role to admin
    await updateDoc(userRef, {
      role: 'admin',
      promotedAt: new Date(),
    });

    console.log('User promoted to admin successfully!');
    console.log('Please refresh the page to see admin features.');
    return true;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return false;
  }
};

// Function to check if current user is admin
export const checkIfUserIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
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