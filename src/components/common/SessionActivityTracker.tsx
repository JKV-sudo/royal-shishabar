import { useEffect, useRef } from "react";
import { CookieAuthService } from "../../services/cookieAuthService";

/**
 * Component that tracks user activity and extends cookie sessions
 * Keeps users logged in while they're actively using the app
 */
const SessionActivityTracker: React.FC = () => {
  const lastActivityRef = useRef<number>(Date.now());
  const extendIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // List of events that indicate user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Update last activity timestamp
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Add activity event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Set up interval to check and extend session
    const checkAndExtendSession = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      const ACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes
      // const EXTEND_INTERVAL = 10 * 60 * 1000; // Check every 10 minutes

      // Only extend if user has been active recently
      if (timeSinceActivity < ACTIVITY_THRESHOLD) {
        const session = CookieAuthService.loadSession();
        if (session) {
          const timeToExpiry = session.sessionExpiry - now;
          const EXTEND_THRESHOLD = 2 * 60 * 60 * 1000; // Extend if less than 2 hours left

          if (timeToExpiry < EXTEND_THRESHOLD) {
            console.log("🍪 Extending session due to user activity");
            CookieAuthService.extendSession();
          }
        }
      }
    };

    // Check every 10 minutes
    extendIntervalRef.current = setInterval(
      checkAndExtendSession,
      10 * 60 * 1000
    );

    // Cleanup on unmount
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });

      if (extendIntervalRef.current) {
        clearInterval(extendIntervalRef.current);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default SessionActivityTracker;
