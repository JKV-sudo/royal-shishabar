export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  isPopular?: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  ingredients?: string | string[];
  preparationTime?: string | number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecialOffer {
  id?: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  validUntil?: Date;
  isActive: boolean;
  imageUrl?: string;
  terms?: string[];
  maxUses?: number;
  currentUses: number;
  category: 'food' | 'drinks' | 'tobacco' | 'combo' | 'event' | 'other';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export const MENU_CATEGORIES = [
  { id: "food", name: "Speisen", icon: "🍽️" },
  { id: "drinks", name: "Getränke", icon: "🥤" },
  { id: "tobacco", name: "Tabak", icon: "🚬" },
  { id: "shisha", name: "Shisha", icon: "💨" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
  { id: "snacks", name: "Snacks", icon: "🍿" },
  { id: "other", name: "Sonstiges", icon: "📦" },
]; 