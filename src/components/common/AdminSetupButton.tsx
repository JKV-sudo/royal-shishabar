import React, { useState } from "react";
import { promoteCurrentUserToAdmin } from "../../utils/adminSetup";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "react-hot-toast";

const AdminSetupButton: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-50">
      <div className="text-xs font-bold mb-2">DEV MODE</div>
      <button
        onClick={handlePromoteToAdmin}
        disabled={isLoading}
        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Promoting..." : "Make Me Admin"}
      </button>
    </div>
  );
};

export default AdminSetupButton;
