export interface LoyaltyCard {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  stamps: number; // Current number of stamps (0-10)
  totalShishaOrders: number; // Lifetime total
  freeShishaEarned: number; // Number of free shishas earned
  freeShishaUsed: number; // Number of free shishas used
  createdAt: Date;
  updatedAt: Date;
  lastStampDate?: Date;
  isActive: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  loyaltyCardId: string;
  orderId: string;
  type: 'stamp_earned' | 'free_shisha_redeemed' | 'free_shisha_earned';
  shishaCount: number; // Number of shishas involved in this transaction
  stampsChanged: number; // How many stamps were added/removed
  description: string;
  createdAt: Date;
}

export interface LoyaltyReward {
  stampsRequired: number;
  rewardType: 'free_shisha';
  description: string;
  isActive: boolean;
}

export const LOYALTY_CONFIG = {
  STAMPS_FOR_FREE_SHISHA: 10,
  MAX_STAMPS_PER_VISIT: 5, // Limit stamps per order to prevent abuse
  STAMP_EXPIRY_DAYS: 365, // Stamps expire after 1 year
} as const;

export type LoyaltyStatus = 'active' | 'inactive' | 'expired'; 