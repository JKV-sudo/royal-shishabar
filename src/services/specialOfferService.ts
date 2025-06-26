import { getFirestoreDB } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment as firestoreIncrement
} from 'firebase/firestore';
import { SpecialOffer } from '../types/menu';

export class SpecialOfferService {
  private static collectionName = 'specialOffers';

  // Create a new special offer
  static async createSpecialOffer(offerData: Omit<SpecialOffer, 'id' | 'createdAt' | 'updatedAt' | 'currentUses'>): Promise<string> {
    try {
      const db = getFirestoreDB();
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...offerData,
        currentUses: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating special offer:', error);
      throw new Error('Failed to create special offer');
    }
  }

  // Get all special offers
  static async getSpecialOffers(): Promise<SpecialOffer[]> {
    try {
      const db = getFirestoreDB();
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SpecialOffer;
      });
    } catch (error) {
      console.error('Error getting special offers:', error);
      throw new Error('Failed to get special offers');
    }
  }

  // Get active special offers
  static async getActiveSpecialOffers(): Promise<SpecialOffer[]> {
    try {
      const db = getFirestoreDB();
      const now = new Date();
      // Only filter by isActive to avoid composite index requirement
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const offers = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SpecialOffer;
      });

      // Filter by date range on client side
      return offers.filter(offer => 
        offer.startDate <= now && offer.endDate >= now
      );
    } catch (error) {
      console.error('Error getting active special offers:', error);
      throw new Error('Failed to get active special offers');
    }
  }

  // Get special offers by category
  static async getSpecialOffersByCategory(category: string): Promise<SpecialOffer[]> {
    try {
      const db = getFirestoreDB();
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SpecialOffer;
      });
    } catch (error) {
      console.error('Error getting special offers by category:', error);
      throw new Error('Failed to get special offers by category');
    }
  }

  // Update a special offer
  static async updateSpecialOffer(id: string, updateData: Partial<SpecialOffer>): Promise<void> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating special offer:', error);
      throw new Error('Failed to update special offer');
    }
  }

  // Delete a special offer
  static async deleteSpecialOffer(id: string): Promise<void> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting special offer:', error);
      throw new Error('Failed to delete special offer');
    }
  }

  // Increment usage count
  static async incrementUsage(id: string): Promise<void> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        currentUses: firestoreIncrement(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw new Error('Failed to increment usage');
    }
  }

  // Real-time listener for special offers
  static onSpecialOffersChange(callback: (offers: SpecialOffer[]) => void): () => void {
    const db = getFirestoreDB();
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const offers = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SpecialOffer;
      });
      callback(offers);
    });
  }

  // Real-time listener for active special offers
  static onActiveSpecialOffersChange(callback: (offers: SpecialOffer[]) => void): () => void {
    const db = getFirestoreDB();
    const now = new Date();
    // Only filter by isActive to avoid composite index requirement
    const q = query(
      collection(db, this.collectionName),
      where('isActive', '==', true)
    );

    return onSnapshot(q, (querySnapshot) => {
      const offers = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SpecialOffer;
      });

      // Filter by date range on client side
      const activeOffers = offers.filter(offer => 
        offer.startDate <= now && offer.endDate >= now
      );
      
      callback(activeOffers);
    });
  }
} 