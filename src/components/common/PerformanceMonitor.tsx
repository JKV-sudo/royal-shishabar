import React, { useEffect, useState } from "react";

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.DEV) {
      setIsVisible(true);

      const measurePerformance = () => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        const firstPaint = paint.find((entry) => entry.name === "first-paint");
        const firstContentfulPaint = paint.find(
          (entry) => entry.name === "first-contentful-paint"
        );

        setMetrics({
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          firstPaint: firstPaint ? firstPaint.startTime : 0,
          firstContentfulPaint: firstContentfulPaint
            ? firstContentfulPaint.startTime
            : 0,
        });
      };

      // Measure after page loads
      if (document.readyState === "complete") {
        measurePerformance();
      } else {
        window.addEventListener("load", measurePerformance);
        return () => window.removeEventListener("load", measurePerformance);
      }
    }
  }, []);

  if (!isVisible || !metrics) return null;

  const getPerformanceColor = (time: number) => {
    if (time < 1000) return "text-green-600";
    if (time < 3000) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs z-50">
      <div className="font-bold mb-2">Performance Monitor (Dev)</div>
      <div className="space-y-1">
        <div>
          Load Time:{" "}
          <span className={getPerformanceColor(metrics.loadTime)}>
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>
        <div>
          DOM Ready:{" "}
          <span className={getPerformanceColor(metrics.domContentLoaded)}>
            {metrics.domContentLoaded.toFixed(0)}ms
          </span>
        </div>
        <div>
          First Paint:{" "}
          <span className={getPerformanceColor(metrics.firstPaint)}>
            {metrics.firstPaint.toFixed(0)}ms
          </span>
        </div>
        <div>
          FCP:{" "}
          <span className={getPerformanceColor(metrics.firstContentfulPaint)}>
            {metrics.firstContentfulPaint.toFixed(0)}ms
          </span>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="mt-2 text-gray-400 hover:text-white"
      >
        Hide
      </button>
    </div>
  );
};

export default PerformanceMonitor;
