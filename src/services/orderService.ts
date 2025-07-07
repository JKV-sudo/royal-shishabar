import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import { Order, OrderStatus, OrderStats, OrderFilters, PaymentStatus, PaymentMethod, PaymentInfo } from '../types/order';
import { LoyaltyService } from './loyaltyService';
import { safeToDate, safeToDateWithFallback } from '../utils/dateUtils';

export class OrderService {
  private static collectionName = 'orders';

  // Helper function to remove undefined values from object
  private static removeUndefinedValues(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      // Skip only undefined values (allow null, empty strings, 0, false)
      if (value === undefined) {
        return;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        const cleanedArray = value.map(item => 
          typeof item === 'object' ? this.removeUndefinedValues(item) : item
        ).filter(item => item !== undefined);
        cleaned[key] = cleanedArray;
      }
      // Handle nested objects (but not Date objects or Firestore special objects)
      else if (typeof value === 'object' && value !== null && !(value instanceof Date) && !value?.toDate && !value?.isEqual) {
        const cleanedNested = this.removeUndefinedValues(value);
        if (cleanedNested && Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      }
      // Handle primitive values and special objects (Date, Timestamp, etc.)
      else {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }

  // Safe date conversion specifically for order data
  private static convertOrderDates(data: any): any {
    const converted = {
      ...data,
      createdAt: safeToDateWithFallback(data.createdAt),
      updatedAt: safeToDateWithFallback(data.updatedAt),
      estimatedCompletionTime: safeToDate(data.estimatedCompletionTime),
      completedAt: safeToDate(data.completedAt),
    };

    // Ensure payment object exists with default values
    if (!converted.payment) {
      converted.payment = {
        status: 'unpaid' as PaymentStatus,
        amount: converted.totalAmount || 0,
      };
    }

    return converted;
  }

  // Create a new order
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const db = getFirestoreDB();
      
      console.log('🔍 Creating order with raw data:', orderData);
      
      // Ensure payment object exists with proper defaults
      const orderWithPayment = {
        ...orderData,
        payment: orderData.payment || {
          status: 'unpaid' as PaymentStatus,
          amount: orderData.totalAmount || 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Clean the order data by removing undefined values
      const cleanedOrderData = this.removeUndefinedValues(orderWithPayment);

      console.log('✅ Cleaned order data:', cleanedOrderData);

      const docRef = await addDoc(collection(db, this.collectionName), cleanedOrderData);
      console.log('🎉 Order created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      import('../utils/productionLogger').then(({ logger }) => {
        logger.error('Error creating order:', error);
        logger.debug('Order data that failed:', orderData);
      });
      throw error;
    }
  }

  // Get all orders
  static async getOrders(): Promise<Order[]> {
    try {
      const db = getFirestoreDB();
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...this.convertOrderDates(data),
        } as Order;
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  // Get orders with filters
  static async getOrdersWithFilters(filters: OrderFilters): Promise<Order[]> {
    try {
      console.log('🔍 Loading orders with filters:', filters);
      const db = getFirestoreDB();
      const collectionRef = collection(db, this.collectionName);
      let q: any = collectionRef;

      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.paymentStatus) {
        q = query(q, where('payment.status', '==', filters.paymentStatus));
      }
      if (filters.tableNumber) {
        q = query(q, where('tableNumber', '==', filters.tableNumber));
      }
      if (filters.dateRange) {
        q = query(q, 
          where('createdAt', '>=', Timestamp.fromDate(filters.dateRange.start)),
          where('createdAt', '<=', Timestamp.fromDate(filters.dateRange.end))
        );
      }

      // Order by creation date (newest first)
      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      let orders = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...this.convertOrderDates(data),
        } as Order;
      });

      // Apply search filter on client side
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        orders = orders.filter(order =>
          order.customerName?.toLowerCase().includes(searchTerm) ||
          order.items.some(item => item.name.toLowerCase().includes(searchTerm)) ||
          order.tableNumber.toString().includes(searchTerm)
        );
      }

      console.log('✅ Orders loaded successfully:', orders.length, 'orders');
      return orders;
    } catch (error) {
      console.error('❌ Error getting orders with filters:', error);
      throw error;
    }
  }

  // Get order by ID
  static async getOrderById(id: string): Promise<Order | null> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...this.convertOrderDates(data),
        } as Order;
      }
      return null;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      throw error;
    }
  }

  // Update order status
  static async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    console.log(`📊 Updating order status:`, { orderId: id, newStatus: status });
    
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, id);
      
      const updateData = this.removeUndefinedValues({
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'delivered' && { completedAt: serverTimestamp() }),
      });

      await updateDoc(docRef, updateData);
      console.log(`✅ Order status updated successfully: ${id} -> ${status}`);

      // If order is confirmed by staff, add loyalty stamps
      if (status === 'confirmed') {
        console.log(`🎯 Order confirmed! Triggering loyalty stamp process for order: ${id}`);
        try {
          await this.addLoyaltyStampsForOrder(id);
          console.log(`✅ Loyalty stamp process completed for order: ${id}`);
        } catch (loyaltyError) {
          console.error('❌ Error adding loyalty stamps:', loyaltyError);
          console.error('❌ Loyalty error details:', {
            orderId: id,
            errorMessage: loyaltyError instanceof Error ? loyaltyError.message : String(loyaltyError),
            errorStack: loyaltyError instanceof Error ? loyaltyError.stack : undefined
          });
          // Don't throw here - order status update was successful
        }
      } else {
        console.log(`ℹ️  Order status '${status}' does not trigger loyalty stamps`);
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      console.error('❌ Status update error details:', {
        orderId: id,
        status,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  // Add loyalty stamps for confirmed order
  private static async addLoyaltyStampsForOrder(orderId: string): Promise<void> {
    console.log(`🎯 Starting loyalty stamp process for order: ${orderId}`);
    
    try {
      const order = await this.getOrderById(orderId);
      console.log('📋 Order details:', {
        orderId,
        exists: !!order,
        customerPhone: order?.customerPhone,
        customerName: order?.customerName,
        itemCount: order?.items?.length || 0,
        items: order?.items?.map(item => ({ name: item.name, category: item.category, quantity: item.quantity }))
      });

      if (!order) {
        console.log('❌ Order not found for loyalty stamps');
        return;
      }

      if (!order.customerPhone || !order.customerName) {
        console.log('❌ Order missing customer info for loyalty stamps:', {
          hasPhone: !!order.customerPhone,
          hasName: !!order.customerName,
          phone: order.customerPhone,
          name: order.customerName
        });
        return;
      }

      // Count shisha items in the order
      const shishaCount = LoyaltyService.countShishaItems(order.items);
      console.log('🔢 Shisha count calculation:', {
        totalItems: order.items.length,
        shishaCount,
        itemBreakdown: order.items.map(item => ({
          name: item.name,
          category: item.category.toLowerCase(),
          quantity: item.quantity,
          isShisha: item.category.toLowerCase() === 'shisha' || item.category.toLowerCase() === 'tobacco'
        }))
      });

      if (shishaCount === 0) {
        console.log('❌ No shisha items in order for loyalty stamps');
        return;
      }

      console.log(`✅ Proceeding with loyalty stamp addition: ${shishaCount} shisha items found`);

      // Get or create loyalty card
      console.log('🏷️ Getting or creating loyalty card for:', {
        phone: order.customerPhone,
        name: order.customerName
      });

      const loyaltyCard = await LoyaltyService.getOrCreateLoyaltyCard(
        order.customerPhone,
        order.customerName
      );

      console.log('🏷️ Loyalty card retrieved:', {
        cardId: loyaltyCard.id,
        currentStamps: loyaltyCard.stamps,
        totalShishaOrders: loyaltyCard.totalShishaOrders,
        freeShishaEarned: loyaltyCard.freeShishaEarned
      });

      // Add stamps for shisha items
      console.log(`🎯 Adding ${shishaCount} stamps to loyalty card ${loyaltyCard.id}`);
      
      const updatedCard = await LoyaltyService.addStamps(loyaltyCard.id, orderId, shishaCount);
      
      console.log('🎉 Loyalty stamps added successfully!', {
        orderId,
        shishaCount,
        cardId: loyaltyCard.id,
        newStamps: updatedCard.stamps,
        newTotalOrders: updatedCard.totalShishaOrders,
        newFreeShishas: updatedCard.freeShishaEarned
      });
      
    } catch (error) {
      console.error('❌ Error processing loyalty stamps:', error);
      console.error('❌ Error details:', {
        orderId,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  // Verify loyalty discount
  static async verifyLoyaltyDiscount(orderId: string): Promise<void> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, orderId);
      
      await updateDoc(docRef, {
        'loyaltyDiscount.isVerified': true,
        updatedAt: serverTimestamp(),
      });

      console.log(`Loyalty discount verified for order ${orderId}`);
    } catch (error) {
      console.error('Error verifying loyalty discount:', error);
      throw error;
    }
  }

  // Update order
  static async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, id);
      
      const cleanedUpdates = this.removeUndefinedValues({
        ...updates,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(docRef, cleanedUpdates);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Process payment for an order
  static async processPayment(
    orderId: string, 
    paymentData: {
      method: PaymentMethod;
      amount: number;
      transactionId?: string;
      processedBy: string;
      notes?: string;
    }
  ): Promise<void> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, orderId);
      
      const paymentInfo: PaymentInfo = {
        status: 'paid',
        method: paymentData.method,
        amount: paymentData.amount,
        paidAt: new Date(),
        transactionId: paymentData.transactionId,
        processedBy: paymentData.processedBy,
        notes: paymentData.notes,
      };

      const updateData = this.removeUndefinedValues({
        payment: paymentInfo,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(docRef, updateData);
      console.log(`Payment processed for order ${orderId}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<void> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, orderId);
      
      const updateData = this.removeUndefinedValues({
        'payment.status': status,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(docRef, updateData);
      console.log(`Payment status updated to ${status} for order ${orderId}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Process refund
  static async processRefund(
    orderId: string,
    refundData: {
      amount: number;
      reason: string;
      processedBy: string;
    }
  ): Promise<void> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, orderId);
      
      const updateData = this.removeUndefinedValues({
        'payment.status': 'refunded' as PaymentStatus,
        'payment.refundAmount': refundData.amount,
        'payment.refundReason': refundData.reason,
        'payment.refundedBy': refundData.processedBy,
        'payment.refundedAt': new Date(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(docRef, updateData);
      console.log(`Refund processed for order ${orderId}: €${refundData.amount}`);
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Get unpaid orders for a table
  static async getUnpaidOrdersForTable(tableNumber: number): Promise<Order[]> {
    try {
      const db = getFirestoreDB();
      const q = query(
        collection(db, this.collectionName),
        where('tableNumber', '==', tableNumber),
        where('payment.status', 'in', ['unpaid', 'partial'])
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...this.convertOrderDates(data),
        } as Order;
      });
    } catch (error) {
      console.error('Error getting unpaid orders for table:', error);
      throw error;
    }
  }

  // Get unpaid orders for a reservation
  static async getUnpaidOrdersForReservation(reservationId: string): Promise<Order[]> {
    try {
      const db = getFirestoreDB();
      const q = query(
        collection(db, this.collectionName),
        where('reservationId', '==', reservationId),
        where('payment.status', 'in', ['unpaid', 'partial'])
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...this.convertOrderDates(data),
        } as Order;
      });
    } catch (error) {
      console.error('Error getting unpaid orders for reservation:', error);
      throw error;
    }
  }

  // Delete order
  static async deleteOrder(id: string): Promise<void> {
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Get order statistics
  static async getOrderStats(): Promise<OrderStats> {
    try {
      const orders = await this.getOrders();
      
      const stats: OrderStats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        preparingOrders: orders.filter(o => o.status === 'preparing').length,
        readyOrders: orders.filter(o => o.status === 'ready').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        paidOrders: orders.filter(o => o.payment?.status === 'paid').length,
        unpaidOrders: orders.filter(o => o.payment?.status === 'unpaid').length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        paidRevenue: orders.filter(o => o.payment?.status === 'paid').reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        unpaidRevenue: orders.filter(o => o.payment?.status === 'unpaid').reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length : 0,
      };

      return stats;
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }

  // Real-time listener for orders
  static onOrdersChange(callback: (orders: Order[]) => void): () => void {
    const db = getFirestoreDB();
    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...this.convertOrderDates(data),
        } as Order;
      });
      callback(orders);
    }, (error) => {
      console.error('Error listening to orders:', error);
    });

    return unsubscribe;
  }

  // Real-time listener for orders with filters
  static onOrdersChangeWithFilters(
    filters: OrderFilters,
    callback: (orders: Order[]) => void
  ): () => void {
    const db = getFirestoreDB();
    const collectionRef = collection(db, this.collectionName);
    let q: any = collectionRef;

    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.tableNumber) {
      q = query(q, where('tableNumber', '==', filters.tableNumber));
    }
    if (filters.dateRange) {
      q = query(q, 
        where('createdAt', '>=', Timestamp.fromDate(filters.dateRange.start)),
        where('createdAt', '<=', Timestamp.fromDate(filters.dateRange.end))
      );
    }

    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot: any) => {
      let orders = querySnapshot.docs.map((doc: any) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...this.convertOrderDates(data),
        } as Order;
      });

      // Apply search filter on client side
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        orders = orders.filter((order: any) =>
          order.customerName?.toLowerCase().includes(searchTerm) ||
          order.items.some((item: any) => item.name.toLowerCase().includes(searchTerm)) ||
          order.tableNumber.toString().includes(searchTerm)
        );
      }

      callback(orders);
    }, (error: any) => {
      console.error('Error listening to orders with filters:', error);
    });

    return unsubscribe;
  }
}
