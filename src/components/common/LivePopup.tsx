import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X } from "lucide-react";

interface LivePopupProps {
  message?: string;
  duration?: number;
}

const LivePopup: React.FC<LivePopupProps> = ({
  message = "🎉 Special Event Tonight! Live DJ & Premium Hookah",
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after 2 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Hide popup after duration
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000 + duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-royal-gradient-gold text-royal-charcoal px-6 py-4 rounded-royal shadow-lg royal-glow border border-royal-gold/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-royal-charcoal animate-pulse" />
              <span className="font-semibold text-sm md:text-base">
                {message}
              </span>
              <button
                onClick={handleClose}
                className="ml-2 p-1 hover:bg-royal-charcoal/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LivePopup;
