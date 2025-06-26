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

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
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
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  tableNumber?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
} 