import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import { OrderService } from './orderService';
import { EventService } from './eventService';

export interface AnalyticsData {
  // Dashboard Stats
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  monthlyGrowth: number;
  
  // Revenue Analytics
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
  
  // User Analytics
  newUsersThisMonth: number;
  activeUsersCount: number;
  engagementRate: number;
  
  // Order Analytics
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  averageOrderValue: number;
  
  // Event Analytics
  upcomingEvents: number;
  totalAttendees: number;
  eventEngagement: number;
}

export class AnalyticsService {
  // Get comprehensive analytics data
  static async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      const [
        orderStats,
        eventStats,
        userStats,
        revenueData
      ] = await Promise.all([
        OrderService.getOrderStats(),
        EventService.getEventStats(),
        this.getUserStats(),
        this.getRevenueData()
      ]);

      // Calculate monthly growth
      const monthlyGrowth = revenueData.lastMonthRevenue > 0 
        ? ((revenueData.thisMonthRevenue - revenueData.lastMonthRevenue) / revenueData.lastMonthRevenue) * 100
        : 0;

      // Calculate engagement rate (simplified - could be enhanced with more metrics)
      const engagementRate = userStats.totalUsers > 0 
        ? (userStats.activeUsers / userStats.totalUsers) * 100
        : 0;

      // Calculate event engagement
      const eventEngagement = eventStats.totalEvents > 0 
        ? (eventStats.totalAttendees / eventStats.totalEvents)
        : 0;

      return {
        // Dashboard Stats
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        totalEvents: eventStats.totalEvents,
        activeEvents: eventStats.activeEvents,
        totalRevenue: orderStats.totalRevenue,
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10, // Round to 1 decimal

        // Revenue Analytics
        thisMonthRevenue: revenueData.thisMonthRevenue,
        lastMonthRevenue: revenueData.lastMonthRevenue,
        revenueGrowth: Math.round(monthlyGrowth * 10) / 10,

        // User Analytics
        newUsersThisMonth: userStats.newUsersThisMonth,
        activeUsersCount: userStats.activeUsers,
        engagementRate: Math.round(engagementRate * 10) / 10,

        // Order Analytics
        totalOrders: orderStats.totalOrders,
        pendingOrders: orderStats.pendingOrders,
        deliveredOrders: orderStats.deliveredOrders,
        averageOrderValue: Math.round(orderStats.averageOrderValue * 100) / 100,

        // Event Analytics
        upcomingEvents: eventStats.upcomingEvents,
        totalAttendees: eventStats.totalAttendees,
        eventEngagement: Math.round(eventEngagement * 10) / 10,
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      throw error;
    }
  }

  // Get user statistics
  private static async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  }> {
    try {
      const db = getFirestoreDB();
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      let totalUsers = 0;
      let activeUsers = 0;
      let newUsersThisMonth = 0;

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        totalUsers++;

        // Consider users active if they were created in the last 30 days
        const createdAt = data.createdAt?.toDate() || new Date();
        if (createdAt >= thirtyDaysAgo) {
          activeUsers++;
        }

        // Count new users this month
        if (createdAt >= startOfMonth) {
          newUsersThisMonth++;
        }
      });

      return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
      };
    }
  }

  // Get revenue data for current and last month
  private static async getRevenueData(): Promise<{
    thisMonthRevenue: number;
    lastMonthRevenue: number;
  }> {
    try {
      const orders = await OrderService.getOrders();
      
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      let thisMonthRevenue = 0;
      let lastMonthRevenue = 0;

      orders.forEach((order) => {
        if (order.status === 'delivered') {
          const orderDate = order.createdAt;
          
          if (orderDate >= startOfThisMonth) {
            thisMonthRevenue += order.totalAmount;
          } else if (orderDate >= startOfLastMonth && orderDate <= endOfLastMonth) {
            lastMonthRevenue += order.totalAmount;
          }
        }
      });

      return {
        thisMonthRevenue,
        lastMonthRevenue,
      };
    } catch (error) {
      console.error('Error getting revenue data:', error);
      return {
        thisMonthRevenue: 0,
        lastMonthRevenue: 0,
      };
    }
  }

  // Real-time analytics listener
  static onAnalyticsChange(callback: (data: AnalyticsData) => void): () => void {
    let unsubscribeOrder: (() => void) | null = null;
    let unsubscribeEvents: (() => void) | null = null;
    let unsubscribeUsers: (() => void) | null = null;

    const updateAnalytics = async () => {
      try {
        const analyticsData = await this.getAnalyticsData();
        callback(analyticsData);
      } catch (error) {
        console.error('Error updating analytics:', error);
      }
    };

    // Set up real-time listeners
    const db = getFirestoreDB();

    // Listen to orders changes
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    unsubscribeOrder = onSnapshot(ordersQuery, updateAnalytics);

    // Listen to events changes
    const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    unsubscribeEvents = onSnapshot(eventsQuery, updateAnalytics);

    // Listen to users changes
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    unsubscribeUsers = onSnapshot(usersQuery, updateAnalytics);

    // Initial load
    updateAnalytics();

    // Return cleanup function
    return () => {
      if (unsubscribeOrder) unsubscribeOrder();
      if (unsubscribeEvents) unsubscribeEvents();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }
} 