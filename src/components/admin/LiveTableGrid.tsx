import React, { useState, useEffect, useCallback } from "react";
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
import {
  TableStatus,
  TableStatusStats,
  TableStatusConfig,
} from "../../types/tableStatus";
import {
  useRealtimeAdminData,
  useAdminDataLoader,
} from "../../hooks/useAdminDataLoader";
import { retryFirebaseOperation } from "../../utils/retryOperation";
import { ErrorEmptyState, NoDataEmptyState } from "../common/EmptyState";
import { toast } from "react-hot-toast";

interface LiveTableGridProps {
  onTableClick?: (tableStatus: TableStatus) => void;
}

interface LiveTableData {
  statuses: TableStatus[];
  stats: TableStatusStats;
}

export const LiveTableGrid: React.FC<LiveTableGridProps> = ({
  onTableClick,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [config, setConfig] = useState<TableStatusConfig>({
    warningTimeMinutes: 45,
    overdueTimeMinutes: 90,
    maxServiceTimeMinutes: 30,
  });

  // CRITICAL FIX: Add state to track if component is mounted
  const [isMounted, setIsMounted] = useState(true);

  // CRITICAL FIX: Memoize stats calculation to prevent expensive recalculations
  const calculateStats = useCallback(
    async (statuses: TableStatus[]): Promise<TableStatusStats> => {
      try {
        // CRITICAL FIX: Use simple local calculation instead of Firebase call for real-time updates
        const totalTables = statuses.length;
        const available = statuses.filter(
          (s) => s.status === "available"
        ).length;
        const occupied = statuses.filter(
          (s) =>
            s.status === "seated" ||
            s.status === "ordered" ||
            s.status === "served"
        ).length;
        const ordersInProgress = statuses.filter(
          (s) => s.currentOrder !== null
        ).length;
        const awaitingPayment = statuses.filter(
          (s) => s.status === "awaiting_payment"
        ).length;
        const overdue = statuses.filter((s) => s.status === "overdue").length;

        // CRITICAL FIX: Calculate revenue locally to avoid blocking UI
        const revenue = statuses.reduce((total, status) => {
          if (status.currentOrder && status.currentOrder.totalAmount) {
            return total + status.currentOrder.totalAmount;
          }
          return total;
        }, 0);

        // CRITICAL FIX: Calculate average wait time locally
        const waitTimes = statuses
          .filter((s) => s.waitTimeMinutes && s.waitTimeMinutes > 0)
          .map((s) => s.waitTimeMinutes || 0);

        const averageWaitTime =
          waitTimes.length > 0
            ? Math.round(
                waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
              )
            : 0;

        return {
          totalTables,
          available,
          occupied,
          ordersInProgress,
          awaitingPayment,
          overdue,
          averageWaitTime,
          revenue,
        };
      } catch (error) {
        console.warn("⚠️ Failed to calculate stats, using defaults:", error);
        // Return default stats if calculation fails
        return {
          totalTables: statuses.length,
          available: 0,
          occupied: 0,
          ordersInProgress: 0,
          awaitingPayment: 0,
          overdue: 0,
          averageWaitTime: 0,
          revenue: 0,
        };
      }
    },
    [] // Empty dependency array to prevent recalculation
  );

  // Use our robust data loader for initial data
  const {
    data: initialData,
    loading: loadingInitial,
    error: initialError,
    loadData: loadInitialData,
    reload: reloadInitialData,
  } = useAdminDataLoader<LiveTableData>({
    initialData: {
      statuses: [],
      stats: {
        totalTables: 0,
        available: 0,
        occupied: 0,
        ordersInProgress: 0,
        awaitingPayment: 0,
        overdue: 0,
        averageWaitTime: 0,
        revenue: 0,
      },
    },
    onSuccess: (data) => {
      console.log("📊 LiveTableGrid: Initial data loaded successfully", {
        statuses: data.statuses.length,
        totalRevenue: data.stats.revenue,
      });
    },
    onError: (error) => {
      console.error("❌ LiveTableGrid: Failed to load initial data:", error);
      toast.error("Fehler beim Laden der Tischstatus");
    },
    checkEmpty: (data) => data.statuses.length === 0,
  });

  // Use realtime data loader for live updates
  const { setupRealtimeListener } = useRealtimeAdminData<TableStatus[]>(
    [],
    (data) => (Array.isArray(data) ? data.length === 0 : !data)
  );

  // CRITICAL FIX: Set up component lifecycle
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Load initial data when component mounts
  useEffect(() => {
    if (!isMounted) return;

    console.log("🔄 LiveTableGrid: Loading initial data");

    loadInitialData(async () => {
      // Load statuses and calculate stats in parallel
      const statuses = await retryFirebaseOperation(
        () => TableStatusService.getTableStatuses(),
        3
      );

      // CRITICAL FIX: Only calculate stats if component is still mounted
      if (!isMounted)
        return {
          statuses: [],
          stats: initialData?.stats || ({} as TableStatusStats),
        };

      const stats = await calculateStats(statuses);

      return { statuses, stats };
    });
  }, [loadInitialData, calculateStats, isMounted]);

  // CRITICAL FIX: Set up realtime listener with proper cleanup and performance optimization
  useEffect(() => {
    if (!initialData || loadingInitial || !isMounted) return;

    console.log("🔄 LiveTableGrid: Setting up realtime listener");

    let isSubscribed = true; // CRITICAL FIX: Track subscription state

    const unsubscribe = setupRealtimeListener(
      (callback) => {
        return TableStatusService.onTableStatusChange(
          async (statuses: TableStatus[]) => {
            try {
              // CRITICAL FIX: Check if component is still mounted
              if (!isSubscribed || !isMounted) return;

              console.log("📊 Realtime table status update:", {
                statuses: statuses.length,
                occupied: statuses.filter(
                  (s) =>
                    s.status === "seated" ||
                    s.status === "ordered" ||
                    s.status === "served"
                ).length,
              });

              // CRITICAL FIX: Calculate stats asynchronously without blocking UI
              const statsPromise = calculateStats(statuses);

              // Update statuses immediately for responsive UI
              callback(statuses);

              // Update stats when calculation completes
              statsPromise
                .then((stats) => {
                  if (!isSubscribed || !isMounted) return;

                  // Update the complete data without showing loading state
                  loadInitialData(async () => ({ statuses, stats }), {
                    showLoadingState: false,
                    preserveData: false,
                  });
                })
                .catch((error) => {
                  if (!isSubscribed || !isMounted) return;

                  console.warn(
                    "⚠️ Stats calculation failed in realtime update:",
                    error
                  );
                });
            } catch (error) {
              if (!isSubscribed || !isMounted) return;

              console.error("❌ Error processing realtime update:", error);
            }
          }
        );
      },
      (statuses: TableStatus[]) => statuses
    );

    // CRITICAL FIX: Proper cleanup function
    return () => {
      console.log("🔄 Cleaning up LiveTableGrid realtime listener");
      isSubscribed = false;
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [
    initialData,
    loadingInitial,
    setupRealtimeListener,
    calculateStats,
    loadInitialData,
    isMounted, // CRITICAL FIX: Add isMounted to dependencies
  ]);

  // Handle config update
  const handleConfigUpdate = useCallback(async () => {
    try {
      await retryFirebaseOperation(
        () => Promise.resolve(TableStatusService.updateConfig(config)),
        2
      );
      toast.success("Konfiguration aktualisiert");
      await reloadInitialData();
    } catch (error) {
      console.error("❌ Failed to update config:", error);
      toast.error("Fehler beim Aktualisieren der Konfiguration");
    }
  }, [config, reloadInitialData]);

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

  const formatWaitingTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Handle loading state
  if (loadingInitial) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Laden der Tischstatus...</span>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-4 mb-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-4">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (initialError) {
    return (
      <div className="p-6">
        <ErrorEmptyState
          title="Fehler beim Laden des Tischstatus"
          description={initialError}
          onRetry={reloadInitialData}
          retrying={loadingInitial}
        />
      </div>
    );
  }

  // Handle empty state
  if (initialData?.statuses.length === 0) {
    return (
      <div className="p-6">
        <NoDataEmptyState
          title="Keine Tische verfügbar"
          description="Es sind derzeit keine Tische konfiguriert."
          onRefresh={reloadInitialData}
          refreshing={loadingInitial}
        />
      </div>
    );
  }

  const tableStatuses = initialData?.statuses || [];
  const stats = initialData?.stats || {
    totalTables: 0,
    available: 0,
    occupied: 0,
    ordersInProgress: 0,
    awaitingPayment: 0,
    overdue: 0,
    averageWaitTime: 0,
    revenue: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-royal-cream mb-2">
            Live Tischstatus ({tableStatuses.length} Tische)
          </h2>
          <p className="text-royal-cream/70">
            Echtzeitüberwachung von Tischreservierungen und Bestellungen
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Legende</span>
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
            onClick={reloadInitialData}
            disabled={loadingInitial}
            className="flex items-center space-x-2 bg-royal-gradient-gold text-royal-charcoal px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingInitial ? "animate-spin" : ""}`}
            />
            <span>Aktualisieren</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream/70 text-sm">Verfügbar</p>
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
              <p className="text-royal-cream/70 text-sm">Besetzt</p>
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
              <p className="text-royal-cream/70 text-sm">Bestellungen</p>
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
              <p className="text-royal-cream/70 text-sm">Zahlung</p>
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
              <p className="text-royal-cream/70 text-sm">Überfällig</p>
              <p className="text-xl font-bold text-red-400">{stats.overdue}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
        </div>

        <div className="bg-royal-charcoal p-4 rounded-lg border border-royal-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-royal-cream/70 text-sm">Ø Wartezeit</p>
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
              <p className="text-royal-cream/70 text-sm">Umsatz</p>
              <p className="text-xl font-bold text-royal-gold">
                €{stats.revenue.toFixed(0)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-royal-gold" />
          </div>
        </div>
      </div>

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
            <h3 className="text-lg font-bold text-royal-cream">
              Personal Legende
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Table Status */}
            <div>
              <h4 className="text-royal-cream font-semibold mb-3 text-sm uppercase tracking-wide">
                Tischstatus
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-green-100 border-2 border-green-300 flex items-center justify-center">
                    <span className="text-sm">✅</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Verfügbar</div>
                    <div className="text-xs text-royal-cream/60">
                      Bereit für Kunden
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                    <span className="text-sm">📅</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Reserviert</div>
                    <div className="text-xs text-royal-cream/60">
                      Kunde noch nicht da
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center">
                    <span className="text-sm">👥</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Besetzt</div>
                    <div className="text-xs text-royal-cream/60">
                      Kunde sitzt, keine Bestellung
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-orange-100 border-2 border-orange-300 flex items-center justify-center">
                    <span className="text-sm">🍽️</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Bestellung aufgegeben</div>
                    <div className="text-xs text-royal-cream/60">
                      Küche bereitet zu
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-purple-100 border-2 border-purple-300 flex items-center justify-center">
                    <span className="text-sm">🥘</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Essen serviert</div>
                    <div className="text-xs text-royal-cream/60">
                      Kunden essen
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center">
                    <span className="text-sm">💳</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Warten auf Zahlung</div>
                    <div className="text-xs text-royal-cream/60">
                      Bereit zum Kassieren
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-red-100 border-2 border-red-300 flex items-center justify-center animate-pulse">
                    <span className="text-sm">⚠️</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium text-red-400">ÜBERFÄLLIG</div>
                    <div className="text-xs text-red-300">
                      Braucht sofortige Aufmerksamkeit!
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
                    <span className="text-sm">❌</span>
                  </div>
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Nicht verfügbar</div>
                    <div className="text-xs text-royal-cream/60">
                      Deaktiviert/Wartung
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Types */}
            <div>
              <h4 className="text-royal-cream font-semibold mb-3 text-sm uppercase tracking-wide">
                Bereiche
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">VIP Bereich</div>
                    <div className="text-xs text-royal-cream/60">
                      Premium Sitzplätze (Tisch 20)
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-green-500" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Außenbereich</div>
                    <div className="text-xs text-royal-cream/60">
                      Terrasse (Tische 21-30)
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">Innenbereich</div>
                    <div className="text-xs text-royal-cream/60">
                      Hauptrestaurant (Tische 1-19)
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="text-royal-cream font-semibold mb-3 mt-6 text-sm uppercase tracking-wide">
                Zeitwarnungen
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">
                      {config.warningTimeMinutes} Minuten
                    </div>
                    <div className="text-xs text-royal-cream/60">
                      Gelbe Warnung
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div className="text-royal-cream/90 text-sm">
                    <div className="font-medium">
                      {config.overdueTimeMinutes} Minuten
                    </div>
                    <div className="text-xs text-royal-cream/60">
                      Rote Überfälligkeit
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-royal-cream font-semibold mb-3 text-sm uppercase tracking-wide">
                Schnellaktionen
              </h4>
              <div className="space-y-2 text-sm text-royal-cream/90">
                <div>
                  <div className="font-medium">Tisch anklicken</div>
                  <div className="text-xs text-royal-cream/60">
                    Details und Aktionen anzeigen
                  </div>
                </div>
                <div>
                  <div className="font-medium">Automatische Updates</div>
                  <div className="text-xs text-royal-cream/60">
                    Status aktualisiert sich live
                  </div>
                </div>
                <div>
                  <div className="font-medium">Konfiguration</div>
                  <div className="text-xs text-royal-cream/60">
                    Zeitlimits anpassen
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
        {tableStatuses
          .sort((a, b) => a.table.number - b.table.number)
          .map((tableStatus) => {
            const isOverdue = tableStatus.status === "overdue";
            const waitingTime = tableStatus.waitingTime || 0;
            const isWarning = waitingTime > config.warningTimeMinutes;

            return (
              <motion.div
                key={tableStatus.table.id}
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTableClick?.(tableStatus)}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200
                  ${
                    isOverdue
                      ? "border-red-400 bg-red-100 animate-pulse"
                      : isWarning
                      ? "border-yellow-400 bg-yellow-100"
                      : tableStatus.status === "available"
                      ? "border-green-300 bg-green-100"
                      : tableStatus.status === "seated" ||
                        tableStatus.status === "ordered" ||
                        tableStatus.status === "served"
                      ? "border-orange-300 bg-orange-100"
                      : tableStatus.status === "reserved"
                      ? "border-blue-300 bg-blue-100"
                      : tableStatus.status === "awaiting_payment"
                      ? "border-indigo-300 bg-indigo-100"
                      : "border-gray-300 bg-gray-100"
                  }
                  hover:shadow-lg
                `}
              >
                {/* Table Number */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">
                    {tableStatus.table.number}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getLocationIcon(tableStatus.table.location)}
                    {tableStatus.currentOrder && (
                      <span className="text-xs">🍽️</span>
                    )}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="text-center mb-2">
                  <div className="text-2xl">
                    {tableStatus.status === "available" && "✅"}
                    {tableStatus.status === "reserved" && "📅"}
                    {(tableStatus.status === "seated" ||
                      tableStatus.status === "ordered" ||
                      tableStatus.status === "served") &&
                      "👥"}
                    {tableStatus.status === "awaiting_payment" && "💳"}
                    {tableStatus.status === "unavailable" && "❌"}
                    {isOverdue && "⚠️"}
                  </div>
                </div>

                {/* Waiting Time */}
                {waitingTime > 0 && (
                  <div className="text-center">
                    <div
                      className={`text-xs font-medium ${
                        isOverdue
                          ? "text-red-700"
                          : isWarning
                          ? "text-yellow-700"
                          : "text-gray-700"
                      }`}
                    >
                      {formatWaitingTime(waitingTime)}
                    </div>
                  </div>
                )}

                {/* Capacity */}
                <div className="absolute top-1 left-1">
                  <span className="text-xs text-gray-600">
                    {tableStatus.table.capacity}
                  </span>
                </div>

                {/* Order Total (if available) */}
                {tableStatus.currentOrder && (
                  <div className="absolute top-1 right-1">
                    <span className="text-xs text-green-600 font-medium">
                      €{tableStatus.currentOrder.totalAmount.toFixed(0)}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Zeitkonfiguration</h2>
              <button
                onClick={() => setShowConfig(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warnzeit (Minuten)
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
                  min="1"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Überfälligkeitszeit (Minuten)
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
                  min="1"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximale Servicezeit (Minuten)
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
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleConfigUpdate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setShowConfig(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTableGrid;
