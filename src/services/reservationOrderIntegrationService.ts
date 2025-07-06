import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc
} from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import { ReservationService } from './reservationService';
import { OrderService } from './orderService';
import { Reservation } from '../types/reservation';
import { Order } from '../types/order';

export interface ReservationOrderLink {
  reservation: Reservation;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  preOrderItems?: string[];
}

export class ReservationOrderIntegrationService {
  
  // Check if a table has an active reservation for today
  static async getActiveReservationForTable(tableNumber: number): Promise<ReservationOrderLink | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find active reservations for this table today
      const reservations = await ReservationService.getReservations({
        tableNumber,
        dateRange: { start: today, end: tomorrow }
      });
      
      // Find current active reservation (confirmed or seated)
      const activeReservation = reservations.find(r => 
        ['confirmed', 'seated'].includes(r.status) &&
        this.isReservationCurrentlyActive(r)
      );
      
      if (!activeReservation) {
        return null;
      }
      
      return {
        reservation: activeReservation,
        customerInfo: {
          name: activeReservation.customerName,
          email: activeReservation.customerEmail,
          phone: activeReservation.customerPhone,
        },
        preOrderItems: activeReservation.preOrderItems,
      };
    } catch (error) {
      console.error('Error getting active reservation for table:', error);
      return null;
    }
  }
  
  // Check if a reservation is currently active (within time window)
  private static isReservationCurrentlyActive(reservation: Reservation): boolean {
    const now = new Date();
    const reservationDate = new Date(reservation.date);
    const [startHour, startMinute] = reservation.startTime.split(':').map(Number);
    const [endHour, endMinute] = reservation.endTime.split(':').map(Number);
    
    const startTime = new Date(reservationDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(reservationDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // Allow ordering 30 minutes before reservation and 3 hours after
    const orderingStartTime = new Date(startTime);
    orderingStartTime.setMinutes(orderingStartTime.getMinutes() - 30);
    
    const orderingEndTime = new Date(endTime);
    orderingEndTime.setHours(orderingEndTime.getHours() + 3);
    
    return now >= orderingStartTime && now <= orderingEndTime;
  }
  
  // Create an order with reservation integration
  static async createOrderWithReservation(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
    reservationId?: string
  ): Promise<string> {
    try {
      // Enhanced order data with reservation context and default payment status
      const enhancedOrderData = {
        ...orderData,
        orderType: reservationId ? 'reservation' as const : 'walk-in' as const,
        payment: {
          status: 'unpaid' as const,
          amount: orderData.totalAmount,
        },
        // Only add reservationId if it's not undefined
        ...(reservationId && { reservationId }),
      };
      
      // Create the order
      const orderId = await OrderService.createOrder(enhancedOrderData);
      
      // If this order is linked to a reservation, update reservation status
      if (reservationId) {
        await this.updateReservationStatusFromOrder(reservationId, 'seated');
      }
      
      return orderId;
    } catch (error) {
      console.error('Error creating order with reservation:', error);
      throw error;
    }
  }
  
  // Update reservation status based on order status
  static async updateReservationStatusFromOrder(
    reservationId: string, 
    newStatus: Reservation['status']
  ): Promise<void> {
    try {
      await ReservationService.updateReservationStatus(reservationId, newStatus);
    } catch (error) {
      console.error('Error updating reservation status:', error);
      // Don't throw - order creation should succeed even if reservation update fails
    }
  }
  
  // Get customer's recent orders for a table (helps staff understand context)
  static async getRecentOrdersForReservation(reservationId: string): Promise<Order[]> {
    try {
      const db = getFirestoreDB();
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('reservationId', '==', reservationId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedCompletionTime: data.estimatedCompletionTime?.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Order;
      });
    } catch (error) {
      console.error('Error getting orders for reservation:', error);
      return [];
    }
  }
  
  // Auto-complete reservation when order is delivered and paid
  static async handleOrderCompletion(orderId: string): Promise<void> {
    try {
      // Get the order
      const order = await OrderService.getOrderById(orderId);
      if (!order || !order.reservationId) {
        return; // No reservation linked
      }
      
      // Check if order is delivered
      if (order.status === 'delivered') {
        // Get the reservation
        const db = getFirestoreDB();
        const reservationDoc = await getDoc(doc(db, 'reservations', order.reservationId));
        
        if (reservationDoc.exists()) {
          const reservation = { id: reservationDoc.id, ...reservationDoc.data() } as Reservation;
          
          // Only update if reservation is not already completed
          if (reservation.status !== 'completed') {
            await this.updateReservationStatusFromOrder(order.reservationId, 'completed');
          }
        }
      }
    } catch (error) {
      console.error('Error handling order completion:', error);
    }
  }
  
  // Get enhanced table status with reservation context
  static async getTableContextForOrdering(tableNumber: number): Promise<{
    hasActiveReservation: boolean;
    reservationInfo?: ReservationOrderLink;
    suggestedCustomerInfo?: {
      name: string;
      email: string;
      phone: string;
    };
  }> {
    try {
      const reservationInfo = await this.getActiveReservationForTable(tableNumber);
      
      if (reservationInfo) {
        return {
          hasActiveReservation: true,
          reservationInfo,
          suggestedCustomerInfo: reservationInfo.customerInfo,
        };
      }
      
      return {
        hasActiveReservation: false,
      };
    } catch (error) {
      console.error('Error getting table context:', error);
      return {
        hasActiveReservation: false,
      };
    }
  }
  
  // Helper to create pre-order items from reservation
  static async processPreOrderItems(preOrderItems: string[]): Promise<any[]> {
    // Convert menu item IDs to cart items
    try {
      if (!preOrderItems || preOrderItems.length === 0) {
        return [];
      }

      const { MenuService } = await import('./menuService');
      const allMenuItems = await MenuService.getAllMenuItems();
      
      const cartItems = preOrderItems
        .map(itemId => {
          const menuItem = allMenuItems.find((item: any) => item.id === itemId);
          if (menuItem) {
            return {
              id: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              quantity: 1,
              category: menuItem.category,
              description: menuItem.description,
              specialInstructions: '',
              createdAt: new Date(),
            };
          }
          return null;
        })
        .filter(item => item !== null);

      return cartItems;
    } catch (error) {
      console.error('Error processing pre-order items:', error);
      return [];
    }
  }
  
  // Get all reservation-linked orders for admin view
  static async getReservationOrdersByDateRange(start: Date, end: Date): Promise<{
    reservationOrders: Order[];
    walkInOrders: Order[];
  }> {
    try {
      const orders = await OrderService.getOrdersWithFilters({
        dateRange: { start, end }
      });
      
      const reservationOrders = orders.filter(order => order.orderType === 'reservation');
      const walkInOrders = orders.filter(order => order.orderType === 'walk-in');
      
      return {
        reservationOrders,
        walkInOrders,
      };
    } catch (error) {
      console.error('Error getting reservation orders:', error);
      return {
        reservationOrders: [],
        walkInOrders: [],
      };
    }
  }
  
  // Link an order to a reservation and update status
  static async linkOrderToReservation(_orderId: string, reservationId: string): Promise<void> {
    try {
      // Check if there are existing orders for this reservation
      const existingOrders = await this.getRecentOrdersForReservation(reservationId);
      const isFirstOrder = existingOrders.length === 0;
      
      // Update reservation status to 'seated' when order is linked
      const message = isFirstOrder ? 'Order placed' : 'Additional order placed';
      await ReservationService.updateReservationStatus(
        reservationId, 
        'seated', 
        message
      );
    } catch (error) {
      console.error('Error linking order to reservation:', error);
      throw error;
    }
  }

  // Complete reservation when payment is processed
  static async completeReservationWithPayment(reservationId: string, _orderId: string): Promise<void> {
    try {
      await ReservationService.updateReservationStatus(
        reservationId,
        'completed',
        'Payment completed'
      );
    } catch (error) {
      console.error('Error completing reservation with payment:', error);
      throw error;
    }
  }

  // Validate that order data is consistent with reservation data
  static validateOrderReservationConsistency(orderData: any, reservation: any): boolean {
    try {
      // Check table number consistency
      if (orderData.tableNumber !== reservation.tableNumber) {
        console.warn('Table number mismatch:', orderData.tableNumber, 'vs', reservation.tableNumber);
        return false;
      }
      
      // Check customer name consistency (optional - only if order has customer name)
      if (orderData.customerName && orderData.customerName !== reservation.customerName) {
        console.warn('Customer name mismatch:', orderData.customerName, 'vs', reservation.customerName);
        return false;
      }
      
      // Check customer email consistency (optional - only if order has customer email)
      if (orderData.customerEmail && orderData.customerEmail !== reservation.customerEmail) {
        console.warn('Customer email mismatch:', orderData.customerEmail, 'vs', reservation.customerEmail);
        return false;
      }
      
      // Check customer phone consistency (optional - only if order has customer phone)
      if (orderData.customerPhone && orderData.customerPhone !== reservation.customerPhone) {
        console.warn('Customer phone mismatch:', orderData.customerPhone, 'vs', reservation.customerPhone);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating order-reservation consistency:', error);
      return false;
    }
  }
} 