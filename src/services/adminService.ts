import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import { User } from '../stores/authStore';

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
}

export class AdminService {
  // Get admin statistics
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // This is a placeholder implementation
      // In a real app, you would aggregate data from multiple collections
      return {
        totalUsers: 0,
        totalEvents: 0,
        activeEvents: 0,
        totalRevenue: 0,
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  }

  // Promote a user to admin role (only existing admins can do this)
  static async promoteToAdmin(userId: string, promotedBy: string): Promise<void> {
    try {
      // Verify the promoter is an admin
      const promoterData = await this.getUserData(promotedBy);
      if (!promoterData || promoterData.role !== 'admin') {
        throw new Error('Only admins can promote users to admin role');
      }

      // Update user role to admin
      const db = getFirestoreDB();
      await updateDoc(doc(db, 'users', userId), {
        role: 'admin',
        promotedBy,
        promotedAt: new Date(),
      });
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  }

  // Demote an admin to customer role (only existing admins can do this)
  static async demoteFromAdmin(userId: string, demotedBy: string): Promise<void> {
    try {
      // Verify the demoter is an admin
      const demoterData = await this.getUserData(demotedBy);
      if (!demoterData || demoterData.role !== 'admin') {
        throw new Error('Only admins can demote users from admin role');
      }

      // Update user role to customer
      const db = getFirestoreDB();
      await updateDoc(doc(db, 'users', userId), {
        role: 'customer',
        demotedBy,
        demotedAt: new Date(),
      });
    } catch (error) {
      console.error('Error demoting user from admin:', error);
      throw error;
    }
  }

  // Get user data
  static async getUserData(userId: string): Promise<Omit<User, 'id'> | null> {
    try {
      const db = getFirestoreDB();
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as Omit<User, 'id'>;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Check if user is admin
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const userData = await this.getUserData(userId);
      return userData?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Get all admins
  static async getAllAdmins(): Promise<User[]> {
    try {
      // Note: This would require a collection query, but for simplicity
      // we'll return an empty array. In a real app, you might want to
      // create a separate admins collection or use a different approach
      return [];
    } catch (error) {
      console.error('Error getting all admins:', error);
      return [];
    }
  }

  // Promote user to admin
  static async promoteUserToAdmin(userId: string): Promise<void> {
    try {
      const db = getFirestoreDB();
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: 'admin',
      });
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  }

  // Get user role
  static async getUserRole(userId: string): Promise<string | null> {
    try {
      const db = getFirestoreDB();
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return userDoc.data().role || 'user';
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
  }
} 