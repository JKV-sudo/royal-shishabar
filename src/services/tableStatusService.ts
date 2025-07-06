import { 
  collection, 
  query, 
  onSnapshot,
  orderBy 
} from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import { ReservationService } from './reservationService';
import { OrderService } from './orderService';
import { 
  TableStatus, 
  TableStatusType, 
  TableStatusConfig, 
  TableStatusStats 
} from '../types/tableStatus';
import { Table, Reservation } from '../types/reservation';
import { Order } from '../types/order';

export class TableStatusService {
  private static config: TableStatusConfig = {
    warningTimeMinutes: 45,      // Yellow warning after 45 minutes
    overdueTimeMinutes: 90,      // Red alert after 90 minutes
    maxServiceTimeMinutes: 30,   // Expected max time from order to serve
  };

  // Update configuration
  static updateConfig(newConfig: Partial<TableStatusConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current table status for all tables
  static async getTableStatuses(): Promise<TableStatus[]> {
    try {
      // Get all tables
      const tables = await ReservationService.getTables();
      
      // Get today's reservations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const reservations = await ReservationService.getReservations({
        dateRange: { start: today, end: tomorrow }
      });
      
      // Get today's orders
      const orders = await OrderService.getOrdersWithFilters({
        dateRange: { start: today, end: tomorrow }
      });
      
      // Combine data for each table
      const tableStatuses: TableStatus[] = [];
      
      for (const table of tables) {
        const tableReservations = reservations.filter(r => r.tableNumber === table.number);
        const tableOrders = orders.filter(o => o.tableNumber === table.number);
        
        const status = this.calculateTableStatus(table, tableReservations, tableOrders);
        tableStatuses.push(status);
      }
      
      return tableStatuses.sort((a, b) => a.table.number - b.table.number);
    } catch (error) {
      console.error('Error getting table statuses:', error);
      throw error;
    }
  }

  // Calculate status for a single table
  private static calculateTableStatus(
    table: Table, 
    reservations: Reservation[], 
    orders: Order[]
  ): TableStatus {
    const now = new Date();
    
    // Base table status
    const tableStatus: TableStatus = {
      table,
      reservation: null,
      currentOrder: null,
      status: 'available',
      lastActivity: now,
    };

    // Check if table is disabled
    if (!table.isActive) {
      tableStatus.status = 'unavailable';
      return tableStatus;
    }

    // Find current/relevant reservation
    const activeReservation = reservations.find(r => 
      ['confirmed', 'seated'].includes(r.status) &&
      this.isReservationActive(r, now)
    );

    if (activeReservation) {
      tableStatus.reservation = activeReservation;
      tableStatus.customerName = activeReservation.customerName;
      tableStatus.partySize = activeReservation.partySize;
      tableStatus.lastActivity = activeReservation.updatedAt;
    }

    // Find current order
    const activeOrder = orders
      .filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (activeOrder) {
      tableStatus.currentOrder = activeOrder;
      tableStatus.customerName = activeOrder.customerName || tableStatus.customerName;
      tableStatus.lastActivity = activeOrder.updatedAt;
    }

    // Calculate waiting time
    if (tableStatus.lastActivity) {
      tableStatus.waitingTime = Math.floor((now.getTime() - tableStatus.lastActivity.getTime()) / (1000 * 60));
    }

    // Determine status based on reservation and order state
    tableStatus.status = this.determineTableStatusType(tableStatus, now);

    return tableStatus;
  }

  // Determine if a reservation is currently active
  private static isReservationActive(reservation: Reservation, now: Date): boolean {
    const reservationDate = new Date(reservation.date);
    const [startHour, startMinute] = reservation.startTime.split(':').map(Number);
    const [endHour, endMinute] = reservation.endTime.split(':').map(Number);
    
    const startTime = new Date(reservationDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(reservationDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // Add 2 hour buffer after end time for cleanup
    endTime.setHours(endTime.getHours() + 2);
    
    return now >= startTime && now <= endTime;
  }

  // Determine the table status type based on current state
  private static determineTableStatusType(tableStatus: TableStatus, _now: Date): TableStatusType {
    const { reservation, currentOrder, waitingTime } = tableStatus;

    // Check if overdue first
    if (waitingTime && waitingTime > this.config.overdueTimeMinutes) {
      return 'overdue';
    }

    // If there's an active order, determine status based on order state
    if (currentOrder) {
      switch (currentOrder.status) {
        case 'pending':
        case 'confirmed':
        case 'preparing':
          return 'ordered';
        case 'ready':
          // Check if it's been ready too long
          if (waitingTime && waitingTime > this.config.warningTimeMinutes) {
            return 'overdue';
          }
          return 'served';
        case 'delivered':
          return 'awaiting_payment';
      }
    }

    // If there's a reservation but no order
    if (reservation) {
      if (reservation.status === 'confirmed') {
        return 'reserved';
      }
      if (reservation.status === 'seated') {
        return 'seated';
      }
    }

    // Default to available
    return 'available';
  }

  // Get real-time table status updates
  static onTableStatusChange(callback: (statuses: TableStatus[]) => void): () => void {
    const db = getFirestoreDB();
    
    // Set up listeners for both reservations and orders
    const unsubscribes: (() => void)[] = [];
    
    // Listen to reservation changes
    const reservationUnsubscribe = onSnapshot(
      query(collection(db, 'reservations'), orderBy('updatedAt', 'desc')),
      () => {
        // Refresh table statuses when reservations change
        this.getTableStatuses().then(callback).catch(console.error);
      }
    );
    
    // Listen to order changes  
    const orderUnsubscribe = onSnapshot(
      query(collection(db, 'orders'), orderBy('updatedAt', 'desc')),
      () => {
        // Refresh table statuses when orders change
        this.getTableStatuses().then(callback).catch(console.error);
      }
    );
    
    unsubscribes.push(reservationUnsubscribe, orderUnsubscribe);
    
    // Initial load
    this.getTableStatuses().then(callback).catch(console.error);
    
    // Return cleanup function
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }

  // Get table status statistics
  static async getTableStatusStats(statuses: TableStatus[]): Promise<TableStatusStats> {
    const stats: TableStatusStats = {
      totalTables: statuses.length,
      available: 0,
      occupied: 0,
      ordersInProgress: 0,
      awaitingPayment: 0,
      overdue: 0,
      averageWaitTime: 0,
      revenue: 0,
    };

    let totalWaitTime = 0;
    let tablesWithWaitTime = 0;

    for (const status of statuses) {
      switch (status.status) {
        case 'available':
          stats.available++;
          break;
        case 'reserved':
        case 'seated':
          stats.occupied++;
          break;
        case 'ordered':
        case 'served':
          stats.occupied++;
          stats.ordersInProgress++;
          break;
        case 'awaiting_payment':
          stats.awaitingPayment++;
          break;
        case 'overdue':
          stats.overdue++;
          break;
      }

      if (status.waitingTime) {
        totalWaitTime += status.waitingTime;
        tablesWithWaitTime++;
      }

      if (status.currentOrder && status.currentOrder.status === 'delivered') {
        stats.revenue += status.currentOrder.totalAmount;
      }
    }

    stats.averageWaitTime = tablesWithWaitTime > 0 ? totalWaitTime / tablesWithWaitTime : 0;

    return stats;
  }

  // Get status color for UI
  static getStatusColor(status: TableStatusType): string {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'reserved':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'seated':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'ordered':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'served':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'awaiting_payment':
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case 'overdue':
        return 'bg-red-100 border-red-300 text-red-800 animate-pulse';
      case 'cleaning':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'unavailable':
        return 'bg-gray-200 border-gray-400 text-gray-600';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  }

  // Get status icon for UI
  static getStatusIcon(status: TableStatusType): string {
    switch (status) {
      case 'available':
        return '✅';
      case 'reserved':
        return '📅';
      case 'seated':
        return '👥';
      case 'ordered':
        return '🍽️';
      case 'served':
        return '🥘';
      case 'awaiting_payment':
        return '💳';
      case 'overdue':
        return '⚠️';
      case 'cleaning':
        return '🧽';
      case 'unavailable':
        return '❌';
      default:
        return '❓';
    }
  }

  // Get status display name
  static getStatusDisplayName(status: TableStatusType): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'reserved':
        return 'Reserved';
      case 'seated':
        return 'Seated';
      case 'ordered':
        return 'Order In Progress';
      case 'served':
        return 'Food Served';
      case 'awaiting_payment':
        return 'Awaiting Payment';
      case 'overdue':
        return 'OVERDUE';
      case 'cleaning':
        return 'Cleaning';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  }
} 