import { Table, Reservation } from './reservation';
import { Order } from './order';

export interface TableStatus {
  table: Table;
  reservation: Reservation | null;
  currentOrder: Order | null;
  status: TableStatusType;
  waitingTime?: number; // in minutes
  estimatedServeTime?: Date;
  lastActivity?: Date;
  customerName?: string;
  partySize?: number;
}

export type TableStatusType = 
  | 'available'      // No reservation, no order
  | 'reserved'       // Has reservation, customer not arrived
  | 'seated'         // Customer seated, no order yet
  | 'ordered'        // Order placed, being prepared
  | 'served'         // Food served, customer eating
  | 'awaiting_payment' // Finished eating, waiting for payment
  | 'overdue'        // Been waiting too long (configurable time)
  | 'cleaning'       // Table being cleaned after customer left
  | 'unavailable';   // Table disabled or maintenance

export interface TableStatusConfig {
  warningTimeMinutes: number;    // Yellow warning after this time
  overdueTimeMinutes: number;    // Red alert after this time
  maxServiceTimeMinutes: number; // Expected max time from order to serve
}

export interface TableStatusStats {
  totalTables: number;
  available: number;
  occupied: number;
  ordersInProgress: number;
  awaitingPayment: number;
  overdue: number;
  averageWaitTime: number;
  revenue: number;
} 