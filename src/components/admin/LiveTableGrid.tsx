import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  MapPin,
  Crown,
  Star,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  Settings,
  TrendingUp,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TableStatusService } from "../../services/tableStatusService";
// import { ReservationOrderIntegrationService } from "../../services/reservationOrderIntegrationService";
import {
  TableStatus,
  TableStatusStats,
  TableStatusConfig,
} from "../../types/tableStatus";

interface LiveTableGridProps {
  onTableClick?: (tableStatus: TableStatus) => void;
}

export const LiveTableGrid: React.FC<LiveTableGridProps> = ({
  onTableClick,
}) => {
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [stats, setStats] = useState<TableStatusStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [config, setConfig] = useState<TableStatusConfig>({
    warningTimeMinutes: 45,
    overdueTimeMinutes: 90,
    maxServiceTimeMinutes: 30,
  });

  useEffect(() => {
    // Set up real-time listener
    const unsubscribe = TableStatusService.onTableStatusChange(
      async (statuses) => {
        setTableStatuses(statuses);
        const statsData = await TableStatusService.getTableStatusStats(
          statuses
        );
        setStats(statsData);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleConfigUpdate = () => {
    TableStatusService.updateConfig(config);
    setShowConfig(false);
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case "vip":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "outdoor":
        return <Star className="w-4 h-4 text-green-500" />;
      default:
        return <MapPin className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLocationDisplayName = (location: string) => {
    switch (location) {
      case "vip":
        return "VIP";
      case "outdoor":
        return "Outdoor";
      default:
        return "Indoor";
    }
  };

  const formatWaitingTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-royal-cream mb-2">
            Live Table Status
          </h2>
          <p className="text-royal-cream/70">
            Real-time monitoring of table reservations and orders
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Legend</span>
            {showLegend ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center space-x-2 bg-royal-charcoal text-royal-cream px-4 py-2 rounded-lg hover:bg-royal-charcoal-dark transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Config</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 bg-royal-gradient-gold text-royal-charcoal px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-royal-cream/70 text-sm">Available</p>
                <p className="text-xl font-bold text-green-400">
                  {stats.available}
                </p>
              </div>
              <div className="text-green-400">✅</div>
            </div>
          </div>

          <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-royal-cream/70 text-sm">Occupied</p>
                <p className="text-xl font-bold text-orange-400">
                  {stats.occupied}
                </p>
              </div>
              <Users className="w-6 h-6 text-orange-400" />
            </div>
          </div>

          <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-royal-cream/70 text-sm">Orders</p>
                <p className="text-xl font-bold text-purple-400">
                  {stats.ordersInProgress}
                </p>
              </div>
              <div className="text-purple-400">🍽️</div>
            </div>
          </div>

          <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-royal-cream/70 text-sm">Payment</p>
                <p className="text-xl font-bold text-indigo-400">
                  {stats.awaitingPayment}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-royal-cream/70 text-sm">Overdue</p>
                <p className="text-xl font-bold text-red-400">
                  {stats.overdue}
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>

          <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-royal-cream/70 text-sm">Avg Wait</p>
                <p className="text-xl font-bold text-yellow-400">
                  {Math.round(stats.averageWaitTime)}m
                </p>
              </div>
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>

          <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-royal-cream/70 text-sm">Revenue</p>
                <p className="text-xl font-bold text-royal-gold">
                  €{stats.revenue.toFixed(0)}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-royal-gold" />
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/30"
        >
          <div className="flex items-center mb-4">
            <Info className="w-5 h-5 text-royal-gold mr-2" />
            <h3 className="text-lg font-bold text-royal-cream">Staff Legend</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Table Status */}
            <div>
              <h4 className="text-royal-cream font-semibold mb-3 text-sm uppercase tracking-wide">
                Table Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-green-100 border-2 border-green-300 flex items-center justify-center">
                    <span className="text-sm">✅</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Available</div>
                    <div className="text-xs text-royal-cream/60">
                      Ready for customers
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                    <span className="text-sm">📅</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Reserved</div>
                    <div className="text-xs text-royal-cream/60">
                      Customer hasn't arrived
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center">
                    <span className="text-sm">👥</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Seated</div>
                    <div className="text-xs text-royal-cream/60">
                      Customer seated, no order
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-orange-100 border-2 border-orange-300 flex items-center justify-center">
                    <span className="text-sm">🍽️</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Order Placed</div>
                    <div className="text-xs text-royal-cream/60">
                      Kitchen preparing
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-purple-100 border-2 border-purple-300 flex items-center justify-center">
                    <span className="text-sm">🥘</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Food Served</div>
                    <div className="text-xs text-royal-cream/60">
                      Customers eating
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center">
                    <span className="text-sm">💳</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Awaiting Payment</div>
                    <div className="text-xs text-royal-cream/60">
                      Ready to checkout
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-red-100 border-2 border-red-300 flex items-center justify-center animate-pulse">
                    <span className="text-sm">⚠️</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium text-red-400">OVERDUE</div>
                    <div className="text-xs text-red-300">
                      Needs immediate attention!
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
                    <span className="text-sm">❌</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Unavailable</div>
                    <div className="text-xs text-royal-cream/60">
                      Disabled/maintenance
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Types */}
            <div>
              <h4 className="text-royal-cream font-semibold mb-3 text-sm uppercase tracking-wide">
                Location Types
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">VIP Area</div>
                    <div className="text-xs text-royal-cream/60">
                      Premium seating (Table 20)
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-green-500" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Outdoor</div>
                    <div className="text-xs text-royal-cream/60">
                      Terrace area (Tables 21-30)
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Indoor</div>
                    <div className="text-xs text-royal-cream/60">
                      Main dining area (Tables 1-19)
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="text-royal-cream font-semibold mb-3 mt-6 text-sm uppercase tracking-wide">
                Timing Alerts
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">45 minutes</div>
                    <div className="text-xs text-royal-cream/60">
                      Yellow warning
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">90 minutes</div>
                    <div className="text-xs text-red-300">
                      Red alert - Take action!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Display */}
            <div>
              <h4 className="text-royal-cream font-semibold mb-3 text-sm uppercase tracking-wide">
                Information Shown
              </h4>
              <div className="space-y-3">
                <div className="bg-royal-charcoal-dark p-3 rounded border border-royal-gold/20">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-lg">T5</span>
                    </div>
                    <div className="text-xs opacity-75">Indoor</div>
                    <div className="text-lg mt-1">🍽️</div>
                    <div className="text-xs font-medium">Order Placed</div>
                    <div className="text-xs font-medium mt-1">John Doe</div>
                    <div className="text-xs opacity-75">4 people</div>
                    <div className="text-xs font-bold mt-1">25m</div>
                    <div className="text-xs font-bold">€45.50</div>
                  </div>
                </div>

                <div className="text-royal-cream/70 text-xs">
                  <div>
                    <strong>T5:</strong> Table number
                  </div>
                  <div>
                    <strong>Indoor:</strong> Location type
                  </div>
                  <div>
                    <strong>John Doe:</strong> Customer name
                  </div>
                  <div>
                    <strong>4 people:</strong> Party size
                  </div>
                  <div>
                    <strong>25m:</strong> Waiting time
                  </div>
                  <div>
                    <strong>€45.50:</strong> Order amount
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-royal-gold/10 rounded-lg border border-royal-gold/30">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-royal-gold mt-0.5" />
              <div className="text-royal-cream/90 text-sm">
                <div className="font-semibold mb-1">Quick Tips:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Click any table for detailed information</li>
                  <li>Red pulsing tables need immediate attention</li>
                  <li>Use Config to adjust timing thresholds</li>
                  <li>System updates in real-time automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {tableStatuses.map((tableStatus) => (
          <motion.div
            key={tableStatus.table.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${TableStatusService.getStatusColor(
              tableStatus.status
            )}`}
            onClick={() => onTableClick?.(tableStatus)}
          >
            {/* Table Number */}
            <div className="text-center mb-2">
              <div className="flex items-center justify-center space-x-1 mb-1">
                {getLocationIcon(tableStatus.table.location)}
                <span className="font-bold text-lg">
                  T{tableStatus.table.number}
                </span>
              </div>
              <div className="text-xs opacity-75">
                {getLocationDisplayName(tableStatus.table.location)}
              </div>
            </div>

            {/* Status */}
            <div className="text-center mb-2">
              <div className="text-lg">
                {TableStatusService.getStatusIcon(tableStatus.status)}
              </div>
              <div className="text-xs font-medium">
                {TableStatusService.getStatusDisplayName(tableStatus.status)}
              </div>
            </div>

            {/* Customer Info */}
            {tableStatus.customerName && (
              <div className="text-center mb-2">
                <div className="text-xs font-medium truncate">
                  {tableStatus.customerName}
                </div>
                {tableStatus.partySize && (
                  <div className="text-xs opacity-75">
                    {tableStatus.partySize} people
                  </div>
                )}
              </div>
            )}

            {/* Waiting Time */}
            {tableStatus.waitingTime && tableStatus.waitingTime > 0 && (
              <div className="text-center">
                <div className="text-xs font-bold">
                  {formatWaitingTime(tableStatus.waitingTime)}
                </div>
              </div>
            )}

            {/* Order Amount */}
            {tableStatus.currentOrder && (
              <div className="text-center mt-1">
                <div className="text-xs font-bold">
                  €{tableStatus.currentOrder.totalAmount.toFixed(2)}
                </div>
              </div>
            )}

            {/* Overdue Indicator */}
            {tableStatus.status === "overdue" && (
              <div className="absolute top-1 right-1">
                <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/30 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-royal-cream mb-4">
              Table Status Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-royal-cream/70 text-sm mb-2">
                  Warning Time (minutes)
                </label>
                <input
                  type="number"
                  value={config.warningTimeMinutes}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      warningTimeMinutes: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-royal-charcoal-dark border border-royal-gold/30 rounded text-royal-cream"
                />
              </div>

              <div>
                <label className="block text-royal-cream/70 text-sm mb-2">
                  Overdue Time (minutes)
                </label>
                <input
                  type="number"
                  value={config.overdueTimeMinutes}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      overdueTimeMinutes: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-royal-charcoal-dark border border-royal-gold/30 rounded text-royal-cream"
                />
              </div>

              <div>
                <label className="block text-royal-cream/70 text-sm mb-2">
                  Max Service Time (minutes)
                </label>
                <input
                  type="number"
                  value={config.maxServiceTimeMinutes}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maxServiceTimeMinutes: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-royal-charcoal-dark border border-royal-gold/30 rounded text-royal-cream"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleConfigUpdate}
                className="flex-1 bg-royal-gradient-gold text-royal-charcoal py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Update
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 bg-royal-charcoal-dark text-royal-cream py-2 px-4 rounded-lg border border-royal-gold/30 hover:bg-royal-charcoal transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTableGrid;
