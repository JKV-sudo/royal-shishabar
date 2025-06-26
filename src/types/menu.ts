export interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'drinks' | 'tobacco' | 'other' | 'special-offers';
  imageUrl?: string;
  isAvailable: boolean;
  isPopular?: boolean;
  allergens?: string[];
  ingredients?: string[];
  calories?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
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

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'food',
    name: 'Speisen',
    description: 'Leckere Gerichte und Snacks',
    icon: '🍽️',
    color: 'bg-orange-500',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'drinks',
    name: 'Getränke',
    description: 'Erfrischende Getränke und Cocktails',
    icon: '🥤',
    color: 'bg-blue-500',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'tobacco',
    name: 'Tabak',
    description: 'Premium Tabakprodukte',
    icon: '🚬',
    color: 'bg-gray-600',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'special-offers',
    name: 'Sonderangebote',
    description: 'Exklusive Rabatte und Angebote',
    icon: '🎉',
    color: 'bg-red-500',
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'other',
    name: 'Sonstiges',
    description: 'Weitere Artikel und Services',
    icon: '📦',
    color: 'bg-purple-500',
    isActive: true,
    sortOrder: 5
  }
]; 