import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  writeBatch,
} from "firebase/firestore";
import { Event } from "../types/event";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

export class AdminService {
  // Get comprehensive admin statistics
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // Get user statistics
      const usersRef = collection(db, "users");
      const totalUsersSnapshot = await getCountFromServer(usersRef);
      const activeUsersSnapshot = await getCountFromServer(
        query(usersRef, where("isActive", "==", true))
      );

      // Get event statistics
      const eventsRef = collection(db, "events");
      const totalEventsSnapshot = await getCountFromServer(eventsRef);
      const activeEventsSnapshot = await getCountFromServer(
        query(eventsRef, where("isActive", "==", true))
      );

      // Mock revenue data for now - replace with actual payment processing
      const totalRevenue = 28450;
      const monthlyGrowth = 15.3;

      return {
        totalUsers: totalUsersSnapshot.data().count,
        activeUsers: activeUsersSnapshot.data().count,
        totalEvents: totalEventsSnapshot.data().count,
        activeEvents: activeEventsSnapshot.data().count,
        totalRevenue,
        monthlyGrowth,
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw new Error("Failed to fetch admin statistics");
    }
  }

  // Get all users with pagination
  static async getUsers(limitCount: number = 50): Promise<User[]> {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"), limit(limitCount));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin?.toDate() || new Date(),
      })) as User[];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  // Update user role
  static async updateUserRole(userId: string, newRole: "customer" | "staff" | "admin"): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Failed to update user role");
    }
  }

  // Toggle user active status
  static async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isActive,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      throw new Error("Failed to update user status");
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }

  // Get recent activity (events, user registrations, etc.)
  static async getRecentActivity(limitCount: number = 10): Promise<any[]> {
    try {
      // This would typically combine data from multiple collections
      // For now, return mock data
      return [
        {
          id: "1",
          type: "user_registration",
          message: "New user registration",
          timestamp: new Date(),
          userId: "user123",
          userName: "John Doe",
        },
        {
          id: "2",
          type: "event_created",
          message: "Event created: Live Music Night",
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          eventId: "event123",
          eventName: "Live Music Night",
        },
        {
          id: "3",
          type: "payment_received",
          message: "Payment received",
          timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          amount: 45.00,
          eventId: "event456",
        },
      ];
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw new Error("Failed to fetch recent activity");
    }
  }

  // Get system health metrics
  static async getSystemHealth(): Promise<any> {
    try {
      // Mock system health data
      return {
        database: {
          status: "healthy",
          responseTime: "45ms",
          connections: 12,
        },
        storage: {
          status: "healthy",
          usedSpace: "2.3GB",
          totalSpace: "10GB",
        },
        api: {
          status: "healthy",
          uptime: "99.9%",
          lastError: null,
        },
      };
    } catch (error) {
      console.error("Error fetching system health:", error);
      throw new Error("Failed to fetch system health");
    }
  }

  // Update system settings
  static async updateSystemSettings(settings: any): Promise<void> {
    try {
      const settingsRef = doc(db, "system", "settings");
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating system settings:", error);
      throw new Error("Failed to update system settings");
    }
  }

  // Get system settings
  static async getSystemSettings(): Promise<any> {
    try {
      // Mock system settings
      return {
        siteName: "Royal Shisha Bar",
        contactEmail: "admin@royalshishabar.com",
        maintenanceMode: false,
        twoFactorAuth: true,
        emailNotifications: true,
        maxFileSize: "5MB",
        allowedFileTypes: ["jpg", "png", "gif", "mp4"],
      };
    } catch (error) {
      console.error("Error fetching system settings:", error);
      throw new Error("Failed to fetch system settings");
    }
  }

  // Export data (for backup purposes)
  static async exportData(collectionName: string): Promise<any[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error exporting data:", error);
      throw new Error("Failed to export data");
    }
  }

  // Bulk operations
  static async bulkUpdateEvents(updates: { id: string; updates: Partial<Event> }[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, updates }) => {
        const eventRef = doc(db, "events", id);
        batch.update(eventRef, {
          ...updates,
          updatedAt: new Date(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error performing bulk update:", error);
      throw new Error("Failed to perform bulk update");
    }
  }
} 