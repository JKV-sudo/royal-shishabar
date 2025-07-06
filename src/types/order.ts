export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  specialInstructions?: string;
}

export interface LoyaltyDiscount {
  amount: number;
  loyaltyCardId: string;
  customerPhone: string;
  freeShishasRedeemed: number;
  verificationCode: string;
  isVerified?: boolean;
  appliedAt: Date;
}

export interface PaymentInfo {
  status: PaymentStatus;
  method?: PaymentMethod;
  amount: number;
  paidAt?: Date;
  transactionId?: string;
  processedBy?: string; // Staff member who processed payment
  notes?: string;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partial';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile_payment' | 'other';

export interface Order {
  id: string;
  tableNumber: number;
  reservationId?: string; // Link to reservation if this order belongs to one
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  payment: PaymentInfo; // Payment tracking information
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string; // Added for better customer tracking
  specialInstructions?: string;
  loyaltyDiscount?: LoyaltyDiscount;
  orderType: 'reservation' | 'walk-in'; // Track order source
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletionTime?: Date;
  completedAt?: Date;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'delivered' 
  | 'cancelled';

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidOrders: number;
  unpaidOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  averageOrderValue: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  tableNumber?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
} 