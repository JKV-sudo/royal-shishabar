import React, { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { Event } from "../types/event";
import { EventService } from "../services/eventService";
import { AnalyticsService, AnalyticsData } from "../services/analyticsService";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";
import MenuManagement from "../components/admin/MenuManagement";
import SpecialOfferManagement from "../components/admin/SpecialOfferManagement";
import OrderManagement from "../components/admin/OrderManagement";
import PopupManagement from "../components/admin/PopupManagement";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  BarChart3,
  Settings,
  Crown,
  Activity,
  TrendingUp,
  UserCheck,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Utensils,
  Tag,
  Package,
  MessageSquare,
} from "lucide-react";

const Admin: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    revenueGrowth: 0,
    newUsersThisMonth: 0,
    activeUsersCount: 0,
    engagementRate: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    averageOrderValue: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    eventEngagement: 0,
  });

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-royal-charcoal-dark flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-royal-gold mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-royal-cream mb-2">
            Access Denied
          </h1>
          <p className="text-royal-cream-light">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await EventService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      toast.error("Failed to load events");
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await AnalyticsService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([loadEvents(), loadAnalytics()]);
    toast.success("Data refreshed successfully");
  };

  useEffect(() => {
    loadEvents();
    loadAnalytics();

    // Set up real-time analytics listener
    const unsubscribe = AnalyticsService.onAnalyticsChange((data) => {
      setAnalyticsData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await EventService.deleteEvent(eventId);
        toast.success("Event deleted successfully");
        loadEvents();
      } catch (error) {
        toast.error("Failed to delete event");
      }
    }
  };

  const handleToggleEventStatus = async (
    eventId: string,
    currentStatus: boolean
  ) => {
    try {
      await EventService.toggleEventStatus(eventId, !currentStatus);
      toast.success(
        `Event ${currentStatus ? "deactivated" : "activated"} successfully`
      );
      loadEvents();
    } catch (error) {
      toast.error("Failed to update event status");
    }
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "events", name: "Events", icon: Calendar },
    { id: "users", name: "Users", icon: Users },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
    { id: "settings", name: "Settings", icon: Settings },
    { id: "menu", name: "Menu", icon: Utensils },
    { id: "special-offers", name: "Sonderangebote", icon: Tag },
    { id: "orders", name: "Orders", icon: Package },
    { id: "popup", name: "Popups", icon: MessageSquare },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-royal-cream">
          Dashboard Overview
        </h2>
        <button
          onClick={refreshData}
          className="flex items-center space-x-2 px-4 py-2 bg-royal-gradient-gold text-royal-charcoal rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Total Users</p>
              <p className="text-2xl font-bold text-royal-gold">
                {analyticsData.totalUsers}
              </p>
            </div>
            <Users className="w-8 h-8 text-royal-gold" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Active Events</p>
              <p className="text-2xl font-bold text-royal-gold">
                {analyticsData.activeEvents}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-royal-gold" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-royal-gold">
                €{analyticsData.totalRevenue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-royal-gold" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Monthly Growth</p>
              <p
                className={`text-2xl font-bold ${
                  analyticsData.monthlyGrowth >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {analyticsData.monthlyGrowth >= 0 ? "+" : ""}
                {analyticsData.monthlyGrowth}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-royal-gold" />
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Total Orders</p>
              <p className="text-xl font-bold text-royal-gold">
                {analyticsData.totalOrders}
              </p>
            </div>
            <Package className="w-6 h-6 text-royal-gold" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Avg Order Value</p>
              <p className="text-xl font-bold text-royal-gold">
                €{analyticsData.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <BarChart3 className="w-6 h-6 text-royal-gold" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream-light text-sm">Event Attendees</p>
              <p className="text-xl font-bold text-royal-gold">
                {analyticsData.totalAttendees}
              </p>
            </div>
            <Users className="w-6 h-6 text-royal-gold" />
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-royal-cream">
          Event Management
        </h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-royal-gradient-gold text-royal-charcoal rounded-lg hover:shadow-lg transition-all duration-200">
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-royal-charcoal rounded-lg border border-royal-gold/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-royal-charcoal-dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-gold uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-gold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-gold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-gold uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-royal-gold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-royal-gold/10">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-royal-charcoal-dark">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-royal-cream">
                          {event.title}
                        </div>
                        <div className="text-sm text-royal-cream-light">
                          {event.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-royal-cream">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {event.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-royal-cream">
                      {event.attendees?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleToggleEventStatus(event.id, event.isActive)
                          }
                          className="text-royal-gold hover:text-royal-cream"
                        >
                          {event.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button className="text-blue-400 hover:text-blue-300">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-royal-cream">User Management</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-royal-gradient-gold text-royal-charcoal rounded-lg hover:shadow-lg transition-all duration-200">
          <UserCheck className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-royal-charcoal rounded-lg border border-royal-gold/20 p-6">
        <p className="text-royal-cream-light">
          User management functionality will be implemented here. This will
          include:
        </p>
        <ul className="mt-4 space-y-2 text-royal-cream-light">
          <li>• View all registered users</li>
          <li>• Manage user roles and permissions</li>
          <li>• Ban/unban users</li>
          <li>• View user activity and statistics</li>
        </ul>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-royal-cream">
          Analytics & Reports
        </h2>
        <button
          onClick={refreshData}
          className="flex items-center space-x-2 px-4 py-2 bg-royal-gradient-gold text-royal-charcoal rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow">
          <h3 className="text-lg font-semibold text-royal-cream mb-4">
            Revenue Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">This Month</span>
              <span className="text-royal-gold font-semibold">
                €{analyticsData.thisMonthRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Last Month</span>
              <span className="text-royal-gold font-semibold">
                €{analyticsData.lastMonthRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Growth</span>
              <span
                className={`font-semibold ${
                  analyticsData.revenueGrowth >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {analyticsData.revenueGrowth >= 0 ? "+" : ""}
                {analyticsData.revenueGrowth}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow">
          <h3 className="text-lg font-semibold text-royal-cream mb-4">
            User Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">New Users (30d)</span>
              <span className="text-royal-gold font-semibold">
                +{analyticsData.newUsersThisMonth}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Active Users</span>
              <span className="text-royal-gold font-semibold">
                {analyticsData.activeUsersCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Engagement Rate</span>
              <span className="text-green-400 font-semibold">
                {analyticsData.engagementRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow">
          <h3 className="text-lg font-semibold text-royal-cream mb-4">
            Order Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Total Orders</span>
              <span className="text-royal-gold font-semibold">
                {analyticsData.totalOrders}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Pending Orders</span>
              <span className="text-yellow-400 font-semibold">
                {analyticsData.pendingOrders}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Delivered Orders</span>
              <span className="text-green-400 font-semibold">
                {analyticsData.deliveredOrders}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">
                Average Order Value
              </span>
              <span className="text-royal-gold font-semibold">
                €{analyticsData.averageOrderValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20 royal-glow">
          <h3 className="text-lg font-semibold text-royal-cream mb-4">
            Event Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Total Events</span>
              <span className="text-royal-gold font-semibold">
                {analyticsData.totalEvents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Upcoming Events</span>
              <span className="text-blue-400 font-semibold">
                {analyticsData.upcomingEvents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Total Attendees</span>
              <span className="text-royal-gold font-semibold">
                {analyticsData.totalAttendees}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-royal-cream-light">Event Engagement</span>
              <span className="text-green-400 font-semibold">
                {analyticsData.eventEngagement.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-royal-cream">System Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20">
          <h3 className="text-lg font-semibold text-royal-cream mb-4">
            General Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-royal-cream-light mb-2">
                Site Name
              </label>
              <input
                type="text"
                defaultValue="Royal Shisha Bar"
                className="w-full px-3 py-2 bg-royal-charcoal-dark border border-royal-gold/30 rounded-lg text-royal-cream focus:outline-none focus:border-royal-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-royal-cream-light mb-2">
                Contact Email
              </label>
              <input
                type="email"
                defaultValue="Royal.Waldkraiburg@gmail.com"
                className="w-full px-3 py-2 bg-royal-charcoal-dark border border-royal-gold/30 rounded-lg text-royal-cream focus:outline-none focus:border-royal-gold"
              />
            </div>
            <button className="w-full px-4 py-2 bg-royal-gradient-gold text-royal-charcoal rounded-lg hover:shadow-lg transition-all duration-200">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20">
          <h3 className="text-lg font-semibold text-royal-cream mb-4">
            Security Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-royal-cream-light">
                Two-Factor Authentication
              </span>
              <button className="w-12 h-6 bg-royal-gold rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-royal-cream-light">
                Email Notifications
              </span>
              <button className="w-12 h-6 bg-royal-gold rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-royal-cream-light">Maintenance Mode</span>
              <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="space-y-6">
      <MenuManagement />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "events":
        return renderEvents();
      case "users":
        return renderUsers();
      case "analytics":
        return renderAnalytics();
      case "settings":
        return renderSettings();
      case "menu":
        return renderMenu();
      case "special-offers":
        return <SpecialOfferManagement />;
      case "orders":
        return <OrderManagement />;
      case "popup":
        return <PopupManagement />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-royal-charcoal-dark">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-royal-charcoal min-h-screen border-r border-royal-gold/20">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <Crown className="w-8 h-8 text-royal-gold" />
              <h1 className="text-xl font-bold text-royal-cream">
                Admin Panel
              </h1>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-royal-gradient-gold text-royal-charcoal"
                        : "text-royal-cream hover:bg-royal-charcoal-dark"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
