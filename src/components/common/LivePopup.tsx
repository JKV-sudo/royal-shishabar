import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Calendar, Clock, MapPin, Star } from "lucide-react";
import { PopupService, Popup } from "../../services/popupService";
import { format } from "date-fns";

interface LivePopupProps {
  message?: string;
  duration?: number;
  showEventNotifications?: boolean;
}

const LivePopup: React.FC<LivePopupProps> = ({
  message = "🎉 Special Event Tonight! Live DJ & Premium Hookah",
  duration = 8000,
  showEventNotifications = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<Popup | null>(null);
  const [popupIndex, setPopupIndex] = useState(0);
  const [allPopups, setAllPopups] = useState<Popup[]>([]);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);

  useEffect(() => {
    console.log("LivePopup: showEventNotifications =", showEventNotifications);

    if (!showEventNotifications) {
      // Show default popup
      console.log("LivePopup: Showing default popup");
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 2000 + duration);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }

    // Listen to popup changes
    console.log("LivePopup: Setting up popup listener");
    const unsubscribe = PopupService.onActivePopupsChange((popups) => {
      console.log("LivePopup: Received popups:", popups.length, popups);
      setAllPopups(popups);

      if (popups.length > 0 && !isVisible && !hasBeenClosed) {
        console.log("LivePopup: Showing first popup");
        setCurrentPopup(popups[0]);
        setPopupIndex(0);
        setIsVisible(true);
      } else if (popups.length === 0 && !isVisible && !hasBeenClosed) {
        // Show default popup if no event notifications
        console.log("LivePopup: No event popups, showing default");
        setTimeout(() => {
          setIsVisible(true);
        }, 2000);
      }
    });

    return unsubscribe;
  }, [duration, showEventNotifications]);

  useEffect(() => {
    if (allPopups.length > 0 && isVisible) {
      // Auto-advance to next popup
      const timer = setTimeout(() => {
        const nextIndex = (popupIndex + 1) % allPopups.length;
        setPopupIndex(nextIndex);
        setCurrentPopup(allPopups[nextIndex]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [allPopups, popupIndex, isVisible, duration]);

  const handleClose = () => {
    console.log("LivePopup: Close button clicked");
    console.log("LivePopup: Closing popup");
    setIsVisible(false);
    setHasBeenClosed(true);
  };

  const handleCloseWithEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("LivePopup: Close button clicked with event");
    handleClose();
  };

  // Add keyboard handler for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        console.log("LivePopup: Escape key pressed, closing popup");
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  const handleNext = () => {
    if (allPopups.length > 1) {
      const nextIndex = (popupIndex + 1) % allPopups.length;
      setPopupIndex(nextIndex);
      setCurrentPopup(allPopups[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (allPopups.length > 1) {
      const prevIndex =
        popupIndex === 0 ? allPopups.length - 1 : popupIndex - 1;
      setPopupIndex(prevIndex);
      setCurrentPopup(allPopups[prevIndex]);
    }
  };

  const renderEventPopup = (popup: Popup) => {
    const eventData = popup.eventData;
    if (!eventData) return null;

    // Handle both Firestore Timestamp and Date objects
    let eventDate: Date;
    if (eventData.date) {
      if (typeof eventData.date === "object" && "toDate" in eventData.date) {
        // It's a Firestore Timestamp
        eventDate = eventData.date.toDate();
      } else if (eventData.date instanceof Date) {
        // It's already a Date object
        eventDate = eventData.date;
      } else {
        // It's a string or number, try to create a Date
        eventDate = new Date(eventData.date);
      }
    } else {
      eventDate = new Date();
    }

    // Validate the date
    if (isNaN(eventDate.getTime())) {
      console.warn("Invalid event date:", eventData.date);
      eventDate = new Date();
    }

    const now = new Date();
    const timeUntilEvent = eventDate.getTime() - now.getTime();
    const daysUntilEvent = Math.ceil(timeUntilEvent / (1000 * 60 * 60 * 24));

    return (
      <div className="max-w-md">
        <div className="flex items-start gap-3">
          {eventData.imageUrl && (
            <img
              src={eventData.imageUrl}
              alt={eventData.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-royal-charcoal text-lg leading-tight mb-1">
              {popup.title}
            </h3>
            <p className="text-royal-charcoal/80 text-sm mb-2">
              {popup.message}
            </p>

            {/* Event Details */}
            <div className="space-y-1 text-xs text-royal-charcoal/70">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(eventDate, "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{eventData.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{eventData.location}</span>
              </div>
              {eventData.category && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{eventData.category}</span>
                </div>
              )}
            </div>

            {/* Urgency indicator */}
            {daysUntilEvent <= 1 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {daysUntilEvent === 0 ? "TONIGHT!" : "TOMORROW!"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultPopup = () => (
    <div className="flex items-center gap-3">
      <Crown className="w-5 h-5 text-royal-charcoal animate-pulse" />
      <span className="font-semibold text-sm md:text-base text-royal-charcoal">
        {message}
      </span>
    </div>
  );

  console.log(
    "LivePopup: Rendering, isVisible =",
    isVisible,
    "currentPopup =",
    currentPopup
  );

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
          <div
            className="bg-royal-gradient-gold text-royal-charcoal px-6 py-4 rounded-royal shadow-lg royal-glow border border-royal-gold/30 backdrop-blur-sm"
            onClick={(e) => {
              // Close popup when clicking on the background
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <div className="flex items-start gap-3">
              {/* Content */}
              <div className="flex-1">
                {currentPopup?.type === "event" && currentPopup.eventData
                  ? renderEventPopup(currentPopup)
                  : renderDefaultPopup()}
              </div>

              {/* Navigation Controls */}
              {allPopups.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevious}
                    className="p-1 hover:bg-royal-charcoal/20 rounded-full transition-colors"
                    title="Previous notification"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <span className="text-xs text-royal-charcoal/60 px-1">
                    {popupIndex + 1}/{allPopups.length}
                  </span>

                  <button
                    onClick={handleNext}
                    className="p-1 hover:bg-royal-charcoal/20 rounded-full transition-colors"
                    title="Next notification"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={handleCloseWithEvent}
                className="p-2 hover:bg-royal-charcoal/20 rounded-full transition-colors flex-shrink-0 cursor-pointer z-10 relative"
                title="Close notification"
                aria-label="Close notification"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-royal-charcoal/20 rounded-full h-1">
              <motion.div
                className="bg-royal-charcoal h-1 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LivePopup;
