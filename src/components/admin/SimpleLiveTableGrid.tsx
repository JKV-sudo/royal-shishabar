import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MapPin,
  Crown,
  Star,
  RefreshCw,
  TrendingUp,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ReservationService } from "../../services/reservationService";
import { OrderService } from "../../services/orderService";
import { Table } from "../../types/reservation";
import { Order } from "../../types/order";
import { ErrorEmptyState, NoDataEmptyState } from "../common/EmptyState";
import { toast } from "react-hot-toast";

interface SimpleLiveTableGridProps {
  onTableClick?: (table: Table) => void;
}

interface SimpleTableStatus {
  table: Table;
  hasActiveOrder: boolean;
  orderAmount?: number;
  isOpenBill?: boolean;
  isSeated?: boolean;
  statusType: "available" | "seated" | "active_order" | "open_bill";
}

interface SimpleStats {
  totalTables: number;
  available: number;
  occupied: number;
  openBills: number;
  totalRevenue: number;
}

export const SimpleLiveTableGrid: React.FC<SimpleLiveTableGridProps> = ({
  onTableClick,
}) => {
  const [showLegend, setShowLegend] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate simple table statuses
  const calculateTableStatuses = (): SimpleTableStatus[] => {
    return tables.map((table) => {
      const tableOrders = orders.filter(
        (order) =>
          order.tableNumber === table.number &&
          ["pending", "confirmed", "preparing", "ready", "delivered"].includes(
            order.status
          )
      );

      const activeOrder = tableOrders.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      // Check for open bills (delivered but unpaid/partial)
      const isOpenBill =
        activeOrder?.status === "delivered" &&
        (activeOrder.payment?.status === "unpaid" ||
          activeOrder.payment?.status === "partial");

      // Check for active orders (not delivered or delivered but paid)
      const hasActiveOrder = !!activeOrder && !isOpenBill;

      // Check if table is seated (has recent paid orders but no current active orders)
      const recentPaidOrders = orders.filter(
        (order) =>
          order.tableNumber === table.number &&
          order.status === "delivered" &&
          order.payment?.status === "paid" &&
          // Consider orders from last 2 hours as "recent"
          new Date().getTime() - order.createdAt.getTime() < 2 * 60 * 60 * 1000
      );

      const isSeated =
        !hasActiveOrder && !isOpenBill && recentPaidOrders.length > 0;

      // Determine status type for styling
      let statusType: "available" | "seated" | "active_order" | "open_bill";
      if (isOpenBill) {
        statusType = "open_bill";
      } else if (hasActiveOrder) {
        statusType = "active_order";
      } else if (isSeated) {
        statusType = "seated";
      } else {
        statusType = "available";
      }

      return {
        table,
        hasActiveOrder,
        orderAmount: activeOrder?.totalAmount,
        isOpenBill,
        isSeated,
        statusType,
      };
    });
  };

  // Calculate simple stats
  const calculateStats = (statuses: SimpleTableStatus[]): SimpleStats => {
    const totalTables = statuses.length;
    const occupied = statuses.filter(
      (s) => s.hasActiveOrder || s.isSeated
    ).length;
    const available = totalTables - occupied;
    const openBills = statuses.filter((s) => s.isOpenBill).length;
    const totalRevenue = statuses.reduce(
      (sum, s) => sum + (s.orderAmount || 0),
      0
    );

    return {
      totalTables,
      available,
      occupied,
      openBills,
      totalRevenue,
    };
  };

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tablesData, ordersData] = await Promise.all([
        ReservationService.getTables(),
        OrderService.getOrders(),
      ]);

      setTables(tablesData);
      setOrders(ordersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error("Fehler beim Laden der Daten");
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Laden der Tische...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState
          title="Fehler beim Laden der Tische"
          description={error}
          onRetry={loadData}
          retrying={loading}
        />
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="p-6">
        <NoDataEmptyState
          title="Keine Tische verfügbar"
          description="Es sind derzeit keine Tische konfiguriert."
          onRefresh={loadData}
          refreshing={loading}
        />
      </div>
    );
  }

  const tableStatuses = calculateTableStatuses();
  const stats = calculateStats(tableStatuses);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-royal-charcoal to-royal-charcoal-dark rounded-xl p-6 border border-royal-gold/20 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-royal-gold mb-2 flex items-center">
              <div className="w-3 h-3 bg-royal-gold rounded-full mr-3 animate-pulse"></div>
              Tischübersicht
              <span className="ml-3 text-xl text-royal-cream/80">
                ({tableStatuses.length} Tische)
              </span>
            </h2>
            <p className="text-royal-cream/80 text-lg">
              Live Übersicht von Tischen und aktuellen Bestellungen
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Legende</span>
              {showLegend ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-royal-gold to-yellow-500 text-royal-charcoal px-6 py-3 rounded-xl hover:from-yellow-500 hover:to-royal-gold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-medium"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Aktualisieren</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Available Tables */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wide">
                Verfügbar
              </p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">
                {stats.available}
              </p>
              <p className="text-emerald-600/80 text-xs mt-1">Tische frei</p>
            </div>
            <div className="bg-emerald-200 p-3 rounded-full">
              <div className="text-2xl">✅</div>
            </div>
          </div>
        </div>

        {/* Occupied Tables */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-semibold uppercase tracking-wide">
                Besetzt
              </p>
              <p className="text-3xl font-bold text-amber-700 mt-1">
                {stats.occupied}
              </p>
              <p className="text-amber-600/80 text-xs mt-1">Aktive Tische</p>
            </div>
            <div className="bg-amber-200 p-3 rounded-full">
              <Users className="w-6 h-6 text-amber-700" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-royal-gold/20 to-yellow-100 p-6 rounded-2xl border-2 border-royal-gold/30 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 text-sm font-semibold uppercase tracking-wide">
                Umsatz
              </p>
              <p className="text-3xl font-bold text-yellow-200 mt-1">
                €{stats.totalRevenue.toFixed(0)}
              </p>
              <p className="text-yellow-400/80 text-xs mt-1">
                Aktueller Umsatz
              </p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-300" />
            </div>
          </div>
        </div>

        {/* Open Bills Card - Enhanced for visibility */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-300 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 relative overflow-hidden">
          {stats.openBills > 0 && (
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-200 rounded-full transform translate-x-8 -translate-y-8 animate-pulse"></div>
          )}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-red-600 text-sm font-semibold uppercase tracking-wide">
                Offene Rechnungen
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  stats.openBills > 0
                    ? "text-red-700 animate-pulse"
                    : "text-red-700"
                }`}
              >
                {stats.openBills}
              </p>
              <p className="text-red-600/80 text-xs mt-1">
                Bereit zum Kassieren
              </p>
            </div>
            <div
              className={`bg-red-200 p-3 rounded-full ${
                stats.openBills > 0 ? "animate-bounce" : ""
              }`}
            >
              <div className="text-2xl">💳</div>
            </div>
          </div>
          {stats.openBills > 0 && (
            <div className="mt-3 bg-red-200 rounded-lg p-2">
              <p className="text-red-800 text-xs font-medium text-center">
                ⚠️ Aufmerksamkeit erforderlich!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-slate-50 to-slate-100 p-8 rounded-2xl border-2 border-slate-200 shadow-xl"
        >
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">
              Tischstatus Legende
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-slate-700 font-bold mb-4 text-lg flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Tischstatus
              </h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="w-12 h-12 rounded-xl bg-emerald-200 border-2 border-emerald-300 flex items-center justify-center shadow-sm">
                    <span className="text-lg">✅</span>
                  </div>
                  <div className="text-slate-700">
                    <div className="font-semibold text-emerald-700">
                      Verfügbar
                    </div>
                    <div className="text-sm text-emerald-600">
                      Bereit für neue Kunden
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="w-12 h-12 rounded-xl bg-purple-200 border-2 border-purple-300 flex items-center justify-center shadow-sm">
                    <span className="text-lg">🪑</span>
                  </div>
                  <div className="text-slate-700">
                    <div className="font-semibold text-purple-700">Besetzt</div>
                    <div className="text-sm text-purple-600">
                      Kürzlich bezahlt, bereit für neue Bestellung
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="w-12 h-12 rounded-xl bg-amber-200 border-2 border-amber-300 flex items-center justify-center shadow-sm">
                    <span className="text-lg">🍽️</span>
                  </div>
                  <div className="text-slate-700">
                    <div className="font-semibold text-amber-700">
                      Aktive Bestellung
                    </div>
                    <div className="text-sm text-amber-600">
                      Bestellung wird bearbeitet
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="w-12 h-12 rounded-xl bg-red-200 border-2 border-red-300 flex items-center justify-center shadow-sm animate-pulse">
                    <span className="text-lg">💳</span>
                  </div>
                  <div className="text-slate-700">
                    <div className="font-semibold text-red-700">
                      Offene Rechnung
                    </div>
                    <div className="text-sm text-red-600">
                      ⚠️ Bereit zum Kassieren!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-slate-700 font-bold mb-4 text-lg flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Bereiche & Informationen
              </h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="bg-yellow-200 p-2 rounded-lg">
                    <Crown className="w-6 h-6 text-yellow-700" />
                  </div>
                  <div className="text-slate-700">
                    <div className="font-semibold text-yellow-700">
                      VIP Bereich
                    </div>
                    <div className="text-sm text-yellow-600">
                      Premium Tische
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="bg-green-200 p-2 rounded-lg">
                    <Star className="w-6 h-6 text-green-700" />
                  </div>
                  <div className="text-slate-700">
                    <div className="font-semibold text-green-700">
                      Außenbereich
                    </div>
                    <div className="text-sm text-green-600">
                      Terrasse & Garten
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="bg-blue-200 p-2 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-700" />
                  </div>
                  <div className="text-slate-700">
                    <div className="font-semibold text-blue-700">
                      Innenbereich
                    </div>
                    <div className="text-sm text-blue-600">Hauptrestaurant</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                  <p className="text-slate-600 text-sm">
                    <strong>💡 Tipp:</strong> Klicken Sie auf einen Tisch für
                    weitere Details
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tables Grid */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Tische ({tableStatuses.length})
          </h3>
          <div className="text-sm text-slate-600">
            Klicken Sie auf einen Tisch für Details
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {tableStatuses
            .sort((a, b) => a.table.number - b.table.number)
            .map((tableStatus) => {
              return (
                <motion.div
                  key={tableStatus.table.id}
                  layout
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTableClick?.(tableStatus.table)}
                  className={`
                    relative cursor-pointer rounded-2xl p-6 min-h-[140px] transition-all duration-300 transform hover:shadow-xl
                    ${
                      tableStatus.statusType === "open_bill"
                        ? "bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 shadow-lg"
                        : tableStatus.statusType === "active_order"
                        ? "bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 shadow-md"
                        : tableStatus.statusType === "seated"
                        ? "bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 shadow-md"
                        : "bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-300 shadow-sm"
                    }
                    hover:shadow-2xl
                  `}
                >
                  {/* Open Bill Alert Indicator */}
                  {tableStatus.isOpenBill && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                  )}

                  {/* Capacity Badge */}
                  <div className="absolute top-3 left-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        tableStatus.statusType === "open_bill"
                          ? "bg-red-200 text-red-800"
                          : tableStatus.statusType === "active_order"
                          ? "bg-amber-200 text-amber-800"
                          : tableStatus.statusType === "seated"
                          ? "bg-purple-200 text-purple-800"
                          : "bg-emerald-200 text-emerald-800"
                      }`}
                    >
                      {tableStatus.table.capacity}P
                    </div>
                  </div>

                  {/* Location Icon */}
                  <div className="absolute top-3 right-3">
                    <div
                      className={`p-2 rounded-lg ${
                        tableStatus.table.location === "vip"
                          ? "bg-yellow-200"
                          : tableStatus.table.location === "outdoor"
                          ? "bg-green-200"
                          : "bg-blue-200"
                      }`}
                    >
                      {getLocationIcon(tableStatus.table.location)}
                    </div>
                  </div>

                  {/* Table Number - Centered */}
                  <div className="text-center mt-8 mb-4">
                    <span
                      className={`font-bold text-2xl ${
                        tableStatus.statusType === "open_bill"
                          ? "text-red-800"
                          : tableStatus.statusType === "active_order"
                          ? "text-amber-800"
                          : tableStatus.statusType === "seated"
                          ? "text-purple-800"
                          : "text-emerald-800"
                      }`}
                    >
                      {tableStatus.table.number}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="text-center mb-4">
                    <div
                      className={`text-4xl ${
                        tableStatus.isOpenBill ? "animate-bounce" : ""
                      }`}
                    >
                      {tableStatus.statusType === "open_bill" && "💳"}
                      {tableStatus.statusType === "active_order" && "🍽️"}
                      {tableStatus.statusType === "seated" && "🪑"}
                      {tableStatus.statusType === "available" && "✅"}
                    </div>
                  </div>

                  {/* Status Text */}
                  <div className="text-center mb-3">
                    <span
                      className={`text-sm font-semibold ${
                        tableStatus.statusType === "open_bill"
                          ? "text-red-700"
                          : tableStatus.statusType === "active_order"
                          ? "text-amber-700"
                          : tableStatus.statusType === "seated"
                          ? "text-purple-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {tableStatus.statusType === "open_bill"
                        ? "Kassieren!"
                        : tableStatus.statusType === "active_order"
                        ? "Aktiv"
                        : tableStatus.statusType === "seated"
                        ? "Besetzt"
                        : "Verfügbar"}
                    </span>
                  </div>

                  {/* Order Amount */}
                  {tableStatus.orderAmount && (
                    <div className="absolute bottom-3 left-3 right-3">
                      {tableStatus.isOpenBill ? (
                        <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-center shadow-lg">
                          <div className="text-xs font-bold animate-pulse">
                            OFFENE RECHNUNG
                          </div>
                          <div className="text-lg font-bold">
                            €{tableStatus.orderAmount.toFixed(0)}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-700 text-white px-3 py-2 rounded-lg text-center shadow-md">
                          <div className="text-xs">Bestellung</div>
                          <div className="text-base font-semibold">
                            €{tableStatus.orderAmount.toFixed(0)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SimpleLiveTableGrid;
