import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Popup {
  id?: string;
  type: 'info' | 'alert' | 'promotion';
  title: string;
  message: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  expiresAt?: Date;
  priority: number; // Higher number = higher priority
}

export class PopupService {
  private static COLLECTION = 'popups';

  // Create a new popup
  static async createPopup(popup: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const popupData = {
        ...popup,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), popupData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating popup:', error);
      throw new Error('Failed to create popup');
    }
  }

  // Update a popup
  static async updatePopup(id: string, updates: Partial<Popup>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, this.COLLECTION, id), updateData);
    } catch (error) {
      console.error('Error updating popup:', error);
      throw new Error('Failed to update popup');
    }
  }

  // Delete a popup
  static async deletePopup(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, id));
    } catch (error) {
      console.error('Error deleting popup:', error);
      throw new Error('Failed to delete popup');
    }
  }

  // Get all active popups
  static async getActivePopups(): Promise<Popup[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const popups: Popup[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        popups.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
          expiresAt: data.expiresAt?.toDate(),
          priority: data.priority || 0,
        });
      });

      // Filter out expired popups
      const now = new Date();
      return popups.filter(popup => !popup.expiresAt || popup.expiresAt > now);
    } catch (error) {
      console.error('Error getting active popups:', error);
      throw new Error('Failed to get popups');
    }
  }

  // Get all popups (for admin)
  static async getAllPopups(): Promise<Popup[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const popups: Popup[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        popups.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
          expiresAt: data.expiresAt?.toDate(),
          priority: data.priority || 0,
        });
      });

      return popups;
    } catch (error) {
      console.error('Error getting all popups:', error);
      throw new Error('Failed to get popups');
    }
  }

  // Listen to active popups in real-time
  static onActivePopupsChange(callback: (popups: Popup[]) => void): () => void {
    const q = query(
      collection(db, this.COLLECTION),
      where('isActive', '==', true),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const popups: Popup[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        popups.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
          expiresAt: data.expiresAt?.toDate(),
          priority: data.priority || 0,
        });
      });

      // Filter out expired popups
      const now = new Date();
      const activePopups = popups.filter(popup => !popup.expiresAt || popup.expiresAt > now);
      
      callback(activePopups);
    });
  }

  // Toggle popup active status
  static async togglePopupStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION, id), {
        isActive,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error toggling popup status:', error);
      throw new Error('Failed to update popup status');
    }
  }

  // Create a sample popup (for testing)
  static async createSamplePopup(): Promise<string> {
    const samplePopup: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'promotion',
      title: '🎉 Weekend Special!',
      message: 'Get 20% off on all premium hookah flavors this weekend!',
      isActive: true,
      createdBy: 'admin',
      priority: 1,
    };

    return this.createPopup(samplePopup);
  }
} 