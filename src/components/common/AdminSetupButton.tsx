import React, { useState } from "react";
import { promoteCurrentUserToAdmin } from "../../utils/adminSetup";
import { useAuthStore } from "../../stores/authStore";
import { eventNotificationManager } from "../../utils/eventNotifications";
import { toast } from "react-hot-toast";

const AdminSetupButton: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const handlePromoteToAdmin = async () => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    setIsLoading(true);
    try {
      const success = await promoteCurrentUserToAdmin();
      if (success) {
        toast.success("Promoted to admin! Please refresh the page.");
      } else {
        toast.error("Failed to promote to admin");
      }
    } catch (error) {
      toast.error("Error promoting to admin");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsNotificationLoading(true);
    try {
      await eventNotificationManager.createTestEventNotification();
      toast.success("Test notification created! Check the popup.");
    } catch (error) {
      toast.error("Failed to create test notification");
      console.error("Error:", error);
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const handleTriggerUpcomingNotification = async () => {
    setIsNotificationLoading(true);
    try {
      await eventNotificationManager.triggerUpcomingEventNotification();
      toast.success("Upcoming event notification triggered!");
    } catch (error) {
      toast.error("Failed to trigger upcoming notification");
      console.error("Error:", error);
    } finally {
      setIsNotificationLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <div className="text-xs font-bold mb-3">DEV MODE</div>
      <div className="space-y-2">
        <button
          onClick={handlePromoteToAdmin}
          disabled={isLoading}
          className="w-full px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Promoting..." : "Make Me Admin"}
        </button>

        <button
          onClick={handleTestNotification}
          disabled={isNotificationLoading}
          className="w-full px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isNotificationLoading ? "Creating..." : "Test Event Notification"}
        </button>

        <button
          onClick={handleTriggerUpcomingNotification}
          disabled={isNotificationLoading}
          className="w-full px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isNotificationLoading ? "Triggering..." : "Trigger Upcoming Event"}
        </button>
      </div>
    </div>
  );
};

export default AdminSetupButton;
