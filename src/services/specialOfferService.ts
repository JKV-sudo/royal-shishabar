import { getFirestoreDB } from "../config/firebase";
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
  increment,
} from "firebase/firestore";
import { SpecialOffer } from "../types/menu";

const COLLECTION_NAME = "specialOffers";

export class SpecialOfferService {
  // Real-time listener for all special offers (admin use)
  static onSpecialOffersChange(callback: (offers: SpecialOffer[]) => void) {
    const q = query(
      collection(getFirestoreDB(), COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const offers: SpecialOffer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        offers.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SpecialOffer);
      });
      callback(offers);
    });
  }

  // Real-time listener for active special offers (customer use)
  static onActiveSpecialOffersChange(callback: (offers: SpecialOffer[]) => void) {
    const now = new Date();
    const q = query(
      collection(getFirestoreDB(), COLLECTION_NAME),
      where("isActive", "==", true),
      where("endDate", ">=", now),
      orderBy("endDate", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const offers: SpecialOffer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only include offers where startDate <= now
        if (data.startDate?.toDate() <= now) {
          offers.push({
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate() || new Date(),
            endDate: data.endDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as SpecialOffer);
        }
      });
      callback(offers);
    });
  }

  // Get all special offers (admin use)
  static async getAllSpecialOffers(): Promise<SpecialOffer[]> {
    const q = query(
      collection(getFirestoreDB(), COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    const offers: SpecialOffer[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      offers.push({
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as SpecialOffer);
    });
    
    return offers;
  }

  // Get active special offers (customer use)
  static async getActiveSpecialOffers(): Promise<SpecialOffer[]> {
    const now = new Date();
    const q = query(
      collection(getFirestoreDB(), COLLECTION_NAME),
      where("isActive", "==", true),
      where("endDate", ">=", now),
      orderBy("endDate", "asc")
    );
    
    const snapshot = await getDocs(q);
    const offers: SpecialOffer[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Only include offers where startDate <= now
      if (data.startDate?.toDate() <= now) {
        offers.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SpecialOffer);
      }
    });
    
    return offers;
  }

  // Create a new special offer
  static async createSpecialOffer(offerData: Omit<SpecialOffer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(getFirestoreDB(), COLLECTION_NAME), {
      ...offerData,
      startDate: Timestamp.fromDate(offerData.startDate),
      endDate: Timestamp.fromDate(offerData.endDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  }

  // Update a special offer
  static async updateSpecialOffer(
    id: string,
    updates: Partial<Omit<SpecialOffer, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const docRef = doc(getFirestoreDB(), COLLECTION_NAME, id);
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Convert dates to Timestamps if they exist
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(updates.endDate);
    }

    await updateDoc(docRef, updateData);
  }

  // Delete a special offer
  static async deleteSpecialOffer(id: string): Promise<void> {
    const docRef = doc(getFirestoreDB(), COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  // Get a single special offer by ID
  static async getSpecialOfferById(id: string): Promise<SpecialOffer | null> {
    const docRef = doc(getFirestoreDB(), COLLECTION_NAME, id);
    const docSnap = await getDocs(query(collection(getFirestoreDB(), COLLECTION_NAME), where("__name__", "==", id)));
    
    if (docSnap.empty) {
      return null;
    }

    const data = docSnap.docs[0].data();
    return {
      id: docSnap.docs[0].id,
      ...data,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as SpecialOffer;
  }

  // Increment usage count for an offer
  static async incrementUsage(id: string): Promise<void> {
    const docRef = doc(getFirestoreDB(), COLLECTION_NAME, id);
    await updateDoc(docRef, {
      currentUses: increment(1),
      updatedAt: serverTimestamp(),
    });
  }

  // Check if an offer is still valid (not expired and within usage limits)
  static isOfferValid(offer: SpecialOffer): boolean {
    const now = new Date();
    const isWithinDateRange = offer.startDate <= now && offer.endDate >= now;
    const isWithinUsageLimit = !offer.maxUses || offer.currentUses < offer.maxUses;
    
    return offer.isActive && isWithinDateRange && isWithinUsageLimit;
  }
} 