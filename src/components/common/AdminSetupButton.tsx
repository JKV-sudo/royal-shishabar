import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Crown, Calendar } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import {
  initializeReservationTables,
  initializeReservationTimeSlots,
} from "../../utils/initializeReservationData";
// import { initializeSampleEvents } from "../../utils/sampleEvents";
import toast from "react-hot-toast";

const AdminSetupButton: React.FC = () => {
  const { user } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only show for admin users
  if (!user || user.role !== "admin") {
    return null;
  }

  const handleInitializeTables = async () => {
    try {
      setIsLoading(true);
      await initializeReservationTables();
      toast.success("Tables initialized successfully!");
    } catch (error) {
      console.error("Tables initialization failed:", error);
      toast.error("Tables initialization failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeTimeSlots = async () => {
    try {
      setIsLoading(true);
      await initializeReservationTimeSlots();
      toast.success("Time slots initialized successfully!");
    } catch (error) {
      console.error("Time slots initialization failed:", error);
      toast.error("Time slots initialization failed");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleInitializeSampleEvents = async () => {
  //   try {
  //     setIsLoading(true);
  //     await initializeSampleEvents();
  //     toast.success("Sample events created successfully!");
  //   } catch (error) {
  //     console.error("Sample events creation failed:", error);
  //     toast.error("Sample events creation failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative"
      >
        {/* Main Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-royal-gradient-gold rounded-full flex items-center justify-center text-royal-charcoal royal-glow shadow-lg"
        >
          <Settings className="w-6 h-6" />
        </motion.button>

        {/* Expanded Menu */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-16 left-0 bg-royal-charcoal-dark rounded-lg p-4 shadow-xl border border-royal-gold/30 w-64"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="w-5 h-5 text-royal-gold" />
              <span className="text-royal-cream font-semibold">
                Admin Setup
              </span>
            </div>

            <div className="space-y-3">
              {/* Initialize Tables */}
              <button
                onClick={handleInitializeTables}
                disabled={isLoading}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-royal-charcoal hover:bg-royal-charcoal-light rounded-lg text-royal-cream transition-colors disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                <span>Initialize Tables</span>
              </button>

              {/* Initialize Time Slots */}
              <button
                onClick={handleInitializeTimeSlots}
                disabled={isLoading}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-royal-charcoal hover:bg-royal-charcoal-light rounded-lg text-royal-cream transition-colors disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                <span>Initialize Time Slots</span>
              </button>

              {/* Sample Events - Temporarily disabled */}
              {/* <button
                 onClick={handleInitializeSampleEvents}
                 disabled={isLoading}
                 className="w-full flex items-center space-x-2 px-3 py-2 bg-royal-charcoal hover:bg-royal-charcoal-light rounded-lg text-royal-cream transition-colors disabled:opacity-50"
               >
                 <Plus className="w-4 h-4" />
                 <span>Create Sample Events</span>
               </button> */}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSetupButton;
