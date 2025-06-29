export interface Table {
  id: string;
  number: number;
  capacity: number;
  location: 'indoor' | 'outdoor' | 'vip' | 'terrace';
  amenities: string[]; // ['smoking_area', 'private', 'view', 'bar_access']
  isActive: boolean;
  priceMultiplier: number; // 1.0 for regular, 1.5 for VIP, etc.
}

export interface TimeSlot {
  id: string;
  startTime: string; // "18:00"
  endTime: string; // "20:00"
  duration: number; // minutes
  isActive: boolean;
  maxReservations: number;
}

export interface Reservation {
  id?: string;
  tableId: string;
  tableNumber: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: Date;
  timeSlot: string; // "18:00-20:00"
  startTime: string; // "18:00"
  endTime: string; // "20:00"
  partySize: number;
  status: ReservationStatus;
  specialRequests?: string;
  depositAmount?: number;
  totalAmount?: number;
  preOrderItems?: string[]; // Menu item IDs for pre-ordering
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  noShowAt?: Date;
  reminderSent?: boolean;
  notes?: string; // Admin notes
}

export type ReservationStatus = 
  | 'pending'      // Waiting for confirmation
  | 'confirmed'    // Confirmed by customer/admin
  | 'seated'       // Customer has arrived and been seated
  | 'completed'    // Reservation completed successfully
  | 'cancelled'    // Cancelled by customer/admin
  | 'no_show'      // Customer didn't show up
  | 'expired';     // Reservation expired

export interface ReservationFilters {
  status?: ReservationStatus;
  date?: Date;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tableNumber?: number;
  customerName?: string;
  partySize?: number;
  location?: string;
}

export interface ReservationStats {
  totalReservations: number;
  todayReservations: number;
  upcomingReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  noShowRate: number;
  averagePartySize: number;
  popularTimeSlots: { slot: string; count: number }[];
  tableUtilization: { tableNumber: number; utilizationRate: number }[];
  revenue: number;
  occupancyRate: number;
}

export interface AvailabilityCheck {
  date: Date;
  timeSlot: string;
  partySize: number;
  preferredLocation?: string;
}

export interface AvailableTable {
  table: Table;
  timeSlot: string;
  available: boolean;
  price: number;
}

export interface ReservationFormData {
  tableId?: string;
  date: string;
  timeSlot: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
  preOrderItems?: string[];
}

export interface TableAvailability {
  date: Date;
  timeSlots: {
    slot: string;
    availableTables: Table[];
    totalCapacity: number;
    bookedCapacity: number;
  }[];
} 