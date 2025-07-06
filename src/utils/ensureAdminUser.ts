import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';

export const ensureAdminUser = async (userId: string, email: string, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔧 Ensuring admin user exists (attempt ${attempt}/${retries})...`);
      
      const db = getFirestoreDB();
      const userRef = doc(db, 'users', userId);
      
      // Try to get the user document
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log('🔧 Creating admin user in Firestore...');
        
        const userData = {
          email: email,
          name: email === 'jacob-s@live.de' ? 'Jacob (Admin)' : 'Admin User',
          role: 'admin',
          phone: email === 'jacob-s@live.de' ? '+49 15122029769' : '',
          avatar: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        await setDoc(userRef, userData);
        console.log('✅ Admin user created successfully in Firestore');
        
        // Verify the document was created
        const verifySnap = await getDoc(userRef);
        if (verifySnap.exists()) {
          console.log('✅ Verified admin user document exists');
          return true;
        } else {
          throw new Error('Failed to verify user document creation');
        }
        
      } else {
        const userData = userSnap.data();
        console.log('📄 Existing user data:', userData);
        
        if (userData.role !== 'admin') {
          console.log('🔧 Updating user role to admin...');
          
          const updatedData = {
            ...userData,
            role: 'admin',
            updatedAt: serverTimestamp(),
            // Ensure name is set for jacob-s@live.de
            name: email === 'jacob-s@live.de' ? 'Jacob (Admin)' : (userData.name || 'Admin User'),
            phone: email === 'jacob-s@live.de' ? '+49 15122029769' : (userData.phone || ''),
          };
          
          await setDoc(userRef, updatedData, { merge: true });
          console.log('✅ User role updated to admin');
          
          // Verify the update
          const verifySnap = await getDoc(userRef);
          if (verifySnap.exists() && verifySnap.data().role === 'admin') {
            console.log('✅ Verified admin role update');
            return true;
          } else {
            throw new Error('Failed to verify role update');
          }
          
        } else {
          console.log('✅ Admin user already exists with correct role');
          return true;
        }
      }
      
    } catch (error) {
      console.error(`❌ Error ensuring admin user (attempt ${attempt}):`, error);
      
      if (attempt === retries) {
        console.error('❌ All retries failed. Admin user setup incomplete.');
        return false;
      } else {
        console.log(`🔄 Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  return false;
}; 