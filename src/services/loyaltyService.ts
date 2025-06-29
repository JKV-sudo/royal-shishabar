import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import { LoyaltyCard, LoyaltyTransaction, LOYALTY_CONFIG } from '../types/loyalty';
import { CartItem } from '../types/order';

export class LoyaltyService {
  private static loyaltyCardsCollection = 'loyaltyCards';
  private static loyaltyTransactionsCollection = 'loyaltyTransactions';

  // Helper function to count shisha items in cart
  static countShishaItems(items: CartItem[]): number {
    return items
      .filter(item => 
        item.category.toLowerCase() === 'shisha' || 
        item.category.toLowerCase() === 'tobacco'
      )
      .reduce((total, item) => total + item.quantity, 0);
  }

  // Create or get loyalty card for a customer
  static async getOrCreateLoyaltyCard(customerPhone: string, customerName: string): Promise<LoyaltyCard> {
    try {
      const db = getFirestoreDB();
      
      // Try to find existing card by phone number
      const q = query(
        collection(db, this.loyaltyCardsCollection),
        where('customerPhone', '==', customerPhone)
      );
      const existingCards = await getDocs(q);

      if (!existingCards.empty) {
        const cardDoc = existingCards.docs[0];
        const data = cardDoc.data();
        return {
          id: cardDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastStampDate: data.lastStampDate?.toDate(),
        } as LoyaltyCard;
      }

      // Create new loyalty card
      const newCard: Omit<LoyaltyCard, 'id'> = {
        userId: '', // Can be set later when user logs in
        customerName,
        customerPhone,
        stamps: 0,
        totalShishaOrders: 0,
        freeShishaEarned: 0,
        freeShishaUsed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const docRef = await addDoc(collection(db, this.loyaltyCardsCollection), {
        ...newCard,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...newCard,
      };
    } catch (error) {
      console.error('Error getting or creating loyalty card:', error);
      throw error;
    }
  }

  // Add stamps for shisha purchases
  static async addStamps(loyaltyCardId: string, orderId: string, shishaCount: number): Promise<LoyaltyCard> {
    try {
      const db = getFirestoreDB();
      
      return await runTransaction(db, async (transaction) => {
        const cardRef = doc(db, this.loyaltyCardsCollection, loyaltyCardId);
        const cardDoc = await transaction.get(cardRef);
        
        if (!cardDoc.exists()) {
          throw new Error('Loyalty card not found');
        }

        const currentCard = cardDoc.data() as LoyaltyCard;
        
        // Limit stamps per visit to prevent abuse
        const stampsToAdd = Math.min(shishaCount, LOYALTY_CONFIG.MAX_STAMPS_PER_VISIT);
        const newStamps = currentCard.stamps + stampsToAdd;
        
        // Calculate free shishas earned
        const freeShishasEarned = Math.floor(newStamps / LOYALTY_CONFIG.STAMPS_FOR_FREE_SHISHA);
        const remainingStamps = newStamps % LOYALTY_CONFIG.STAMPS_FOR_FREE_SHISHA;
        
        const updatedCard: Partial<LoyaltyCard> = {
          stamps: remainingStamps,
          totalShishaOrders: currentCard.totalShishaOrders + shishaCount,
          freeShishaEarned: currentCard.freeShishaEarned + freeShishasEarned,
          updatedAt: new Date(),
          lastStampDate: new Date(),
        };

        // Update loyalty card
        transaction.update(cardRef, {
          ...updatedCard,
          updatedAt: serverTimestamp(),
          lastStampDate: serverTimestamp(),
        });

        // Record transaction for stamps earned
        if (stampsToAdd > 0) {
          const stampTransaction: Omit<LoyaltyTransaction, 'id'> = {
            loyaltyCardId,
            orderId,
            type: 'stamp_earned',
            shishaCount,
            stampsChanged: stampsToAdd,
            description: `Earned ${stampsToAdd} stamp${stampsToAdd > 1 ? 's' : ''} for ${shishaCount} shisha${shishaCount > 1 ? 's' : ''}`,
            createdAt: new Date(),
          };

          const transactionRef = doc(collection(db, this.loyaltyTransactionsCollection));
          transaction.set(transactionRef, {
            ...stampTransaction,
            createdAt: serverTimestamp(),
          });
        }

        // Record transaction for free shisha earned
        if (freeShishasEarned > 0) {
          const rewardTransaction: Omit<LoyaltyTransaction, 'id'> = {
            loyaltyCardId,
            orderId,
            type: 'free_shisha_earned',
            shishaCount: freeShishasEarned,
            stampsChanged: -freeShishasEarned * LOYALTY_CONFIG.STAMPS_FOR_FREE_SHISHA,
            description: `Earned ${freeShishasEarned} free shisha${freeShishasEarned > 1 ? 's' : ''}!`,
            createdAt: new Date(),
          };

          const rewardTransactionRef = doc(collection(db, this.loyaltyTransactionsCollection));
          transaction.set(rewardTransactionRef, {
            ...rewardTransaction,
            createdAt: serverTimestamp(),
          });
        }

        return {
          id: loyaltyCardId,
          ...currentCard,
          ...updatedCard,
        } as LoyaltyCard;
      });
    } catch (error) {
      console.error('Error adding stamps:', error);
      throw error;
    }
  }

  // Redeem free shisha
  static async redeemFreeShisha(loyaltyCardId: string, orderId: string, shishaCount: number = 1): Promise<LoyaltyCard> {
    try {
      const db = getFirestoreDB();
      
      return await runTransaction(db, async (transaction) => {
        const cardRef = doc(db, this.loyaltyCardsCollection, loyaltyCardId);
        const cardDoc = await transaction.get(cardRef);
        
        if (!cardDoc.exists()) {
          throw new Error('Loyalty card not found');
        }

        const currentCard = cardDoc.data() as LoyaltyCard;
        
        if (currentCard.freeShishaEarned < shishaCount) {
          throw new Error('Not enough free shishas available');
        }

        const updatedCard: Partial<LoyaltyCard> = {
          freeShishaEarned: currentCard.freeShishaEarned - shishaCount,
          freeShishaUsed: currentCard.freeShishaUsed + shishaCount,
          updatedAt: new Date(),
        };

        // Update loyalty card
        transaction.update(cardRef, {
          ...updatedCard,
          updatedAt: serverTimestamp(),
        });

        // Record transaction
        const redeemTransaction: Omit<LoyaltyTransaction, 'id'> = {
          loyaltyCardId,
          orderId,
          type: 'free_shisha_redeemed',
          shishaCount,
          stampsChanged: 0,
          description: `Redeemed ${shishaCount} free shisha${shishaCount > 1 ? 's' : ''}`,
          createdAt: new Date(),
        };

        const transactionRef = doc(collection(db, this.loyaltyTransactionsCollection));
        transaction.set(transactionRef, {
          ...redeemTransaction,
          createdAt: serverTimestamp(),
        });

        return {
          id: loyaltyCardId,
          ...currentCard,
          ...updatedCard,
        } as LoyaltyCard;
      });
    } catch (error) {
      console.error('Error redeeming free shisha:', error);
      throw error;
    }
  }

  // Get loyalty card by ID
  static async getLoyaltyCard(cardId: string): Promise<LoyaltyCard | null> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.loyaltyCardsCollection, cardId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastStampDate: data.lastStampDate?.toDate(),
        } as LoyaltyCard;
      }
      return null;
    } catch (error) {
      console.error('Error getting loyalty card:', error);
      throw error;
    }
  }

  // Get loyalty transactions for a card
  static async getLoyaltyTransactions(loyaltyCardId: string): Promise<LoyaltyTransaction[]> {
    try {
      const db = getFirestoreDB();
      const q = query(
        collection(db, this.loyaltyTransactionsCollection),
        where('loyaltyCardId', '==', loyaltyCardId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as LoyaltyTransaction;
      });
    } catch (error) {
      console.error('Error getting loyalty transactions:', error);
      throw error;
    }
  }

  // Search loyalty card by phone
  static async searchLoyaltyCardByPhone(phone: string): Promise<LoyaltyCard | null> {
    try {
      const db = getFirestoreDB();
      const q = query(
        collection(db, this.loyaltyCardsCollection),
        where('customerPhone', '==', phone)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastStampDate: data.lastStampDate?.toDate(),
        } as LoyaltyCard;
      }
      return null;
    } catch (error) {
      console.error('Error searching loyalty card by phone:', error);
      throw error;
    }
  }

  // Calculate potential free shishas from current stamps
  static calculatePotentialRewards(stamps: number): number {
    return Math.floor(stamps / LOYALTY_CONFIG.STAMPS_FOR_FREE_SHISHA);
  }

  // Calculate progress percentage to next reward
  static calculateProgressPercentage(stamps: number): number {
    const remaining = stamps % LOYALTY_CONFIG.STAMPS_FOR_FREE_SHISHA;
    return (remaining / LOYALTY_CONFIG.STAMPS_FOR_FREE_SHISHA) * 100;
  }
} 