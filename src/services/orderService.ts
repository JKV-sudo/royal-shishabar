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
import { Order, OrderStatus, OrderStats, OrderFilters } from '../types/order';

export class OrderService {
  private static collectionName = 'orders';

  // Helper function to remove undefined values from object
  private static removeUndefinedValues(obj: any): any {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined && obj[key] !== null) {
        cleaned[key] = obj[key];
      }
    });
    return cleaned;
  }

  // Create a new order
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const db = getFirestoreDB();
      
      // Clean the order data by removing undefined values
      const cleanedOrderData = this.removeUndefinedValues({
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const docRef = await addDoc(collection(db, this.collectionName), cleanedOrderData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
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
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedCompletionTime: data.estimatedCompletionTime?.toDate(),
          completedAt: data.completedAt?.toDate(),
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

      const querySnapshot = await getDocs(q);
      let orders = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedCompletionTime: data.estimatedCompletionTime?.toDate(),
          completedAt: data.completedAt?.toDate(),
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

      return orders;
    } catch (error) {
      console.error('Error getting orders with filters:', error);
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
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedCompletionTime: data.estimatedCompletionTime?.toDate(),
          completedAt: data.completedAt?.toDate(),
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
    try {
      const db = getFirestoreDB();
      const docRef = doc(db, this.collectionName, id);
      
      const updateData = this.removeUndefinedValues({
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'delivered' && { completedAt: serverTimestamp() }),
      });

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating order status:', error);
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
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const preparingOrders = orders.filter(o => o.status === 'preparing').length;
      const readyOrders = orders.filter(o => o.status === 'ready').length;
      const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
      
      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.totalAmount, 0);
      
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalOrders,
        pendingOrders,
        preparingOrders,
        readyOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        averageOrderValue,
      };
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
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedCompletionTime: data.estimatedCompletionTime?.toDate(),
          completedAt: data.completedAt?.toDate(),
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
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedCompletionTime: data.estimatedCompletionTime?.toDate(),
          completedAt: data.completedAt?.toDate(),
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