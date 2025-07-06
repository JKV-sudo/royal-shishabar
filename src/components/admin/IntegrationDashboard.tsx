import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Euro,
  Link,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  BookOpen,
  Utensils,
  Crown,
} from "lucide-react";
import { ReservationOrderIntegrationService } from "../../services/reservationOrderIntegrationService";
import { ReservationService } from "../../services/reservationService";

interface IntegrationStats {
  totalReservations: number;
  totalOrders: number;
  linkedOrders: number;
  walkInOrders: number;
  linkageRate: number;
  totalRevenue: number;
  reservationRevenue: number;
  walkInRevenue: number;
  averageOrderValue: number;
}

export const IntegrationDashboard: React.FC = () => {
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setHours(0, 0, 0, 0)),
    end: new Date(new Date().setHours(23, 59, 59, 999)),
  });

  const fetchIntegrationStats = async () => {
    try {
      setIsLoading(true);

      // Get reservations for today
      const reservations = await ReservationService.getReservations({
        dateRange: dateRange,
      });

      // Get orders split by type
      const { reservationOrders, walkInOrders } =
        await ReservationOrderIntegrationService.getReservationOrdersByDateRange(
          dateRange.start,
          dateRange.end
        );

      // Calculate statistics
      const totalReservations = reservations.length;
      const totalOrders = reservationOrders.length + walkInOrders.length;
      const linkedOrders = reservationOrders.length;
      const linkageRate =
        totalReservations > 0 ? (linkedOrders / totalReservations) * 100 : 0;

      const reservationRevenue = reservationOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      const walkInRevenue = walkInOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      const totalRevenue = reservationRevenue + walkInRevenue;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalReservations,
        totalOrders,
        linkedOrders,
        walkInOrders: walkInOrders.length,
        linkageRate,
        totalRevenue,
        reservationRevenue,
        walkInRevenue,
        averageOrderValue,
      });
    } catch (error) {
      console.error("Error fetching integration stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationStats();
  }, [dateRange]);

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-royal-cream mb-2">
            Reservation-Order Integration Dashboard
          </h2>
          <p className="text-royal-cream/70">
            Monitor the connection between reservations and orders
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date selector */}
          <div className="flex items-center space-x-2 bg-royal-charcoal p-2 rounded-lg">
            <Calendar className="w-4 h-4 text-royal-cream" />
            <input
              type="date"
              value={dateRange.start.toISOString().split("T")[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                setDateRange({
                  start: new Date(newDate.setHours(0, 0, 0, 0)),
                  end: new Date(newDate.setHours(23, 59, 59, 999)),
                });
              }}
              className="bg-transparent text-royal-cream text-sm border-none outline-none"
            />
          </div>

          <button
            onClick={fetchIntegrationStats}
            className="flex items-center space-x-2 bg-royal-gradient-gold text-royal-charcoal px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Integration Overview */}
      {stats && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-royal-cream/70 text-sm">
                    Integration Rate
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatPercentage(stats.linkageRate)}
                  </p>
                  <p className="text-xs text-royal-cream/50 mt-1">
                    {stats.linkedOrders} of {stats.totalReservations}{" "}
                    reservations
                  </p>
                </div>
                <Link className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-royal-cream/70 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-royal-gold">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <p className="text-xs text-royal-cream/50 mt-1">
                    {stats.totalOrders} orders today
                  </p>
                </div>
                <Euro className="w-8 h-8 text-royal-gold" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-royal-cream/70 text-sm">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {formatCurrency(stats.averageOrderValue)}
                  </p>
                  <p className="text-xs text-royal-cream/50 mt-1">per order</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-royal-cream/70 text-sm">Reservations</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.totalReservations}
                  </p>
                  <p className="text-xs text-royal-cream/50 mt-1">today</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Split */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20"
            >
              <h3 className="text-lg font-semibold text-royal-cream mb-4 flex items-center">
                <Euro className="w-5 h-5 mr-2" />
                Revenue Breakdown
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="text-royal-cream">Reservation Orders</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-purple-400">
                      {formatCurrency(stats.reservationRevenue)}
                    </p>
                    <p className="text-xs text-royal-cream/50">
                      {stats.linkedOrders} orders
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span className="text-royal-cream">Walk-in Orders</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-orange-400">
                      {formatCurrency(stats.walkInRevenue)}
                    </p>
                    <p className="text-xs text-royal-cream/50">
                      {stats.walkInOrders} orders
                    </p>
                  </div>
                </div>

                {/* Revenue visual bar */}
                <div className="mt-4">
                  <div className="flex bg-royal-charcoal-dark rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-purple-400 h-full"
                      style={{
                        width:
                          stats.totalRevenue > 0
                            ? `${
                                (stats.reservationRevenue /
                                  stats.totalRevenue) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                    <div
                      className="bg-orange-400 h-full"
                      style={{
                        width:
                          stats.totalRevenue > 0
                            ? `${
                                (stats.walkInRevenue / stats.totalRevenue) * 100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-royal-cream/50">
                    <span>
                      {stats.totalRevenue > 0
                        ? formatPercentage(
                            (stats.reservationRevenue / stats.totalRevenue) *
                              100
                          )
                        : "0%"}{" "}
                      Reservations
                    </span>
                    <span>
                      {stats.totalRevenue > 0
                        ? formatPercentage(
                            (stats.walkInRevenue / stats.totalRevenue) * 100
                          )
                        : "0%"}{" "}
                      Walk-ins
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Integration Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20"
            >
              <h3 className="text-lg font-semibold text-royal-cream mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Integration Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-royal-cream">
                    Connected Reservations
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 font-semibold">
                      {stats.linkedOrders}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-royal-cream">
                    Unlinked Reservations
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 font-semibold">
                      {stats.totalReservations - stats.linkedOrders}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-royal-cream">Walk-in Orders</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-400 font-semibold">
                      {stats.walkInOrders}
                    </span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="mt-4 p-3 rounded-lg bg-royal-charcoal-dark">
                  <div className="flex items-center space-x-2">
                    {stats.linkageRate >= 80 ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : stats.linkageRate >= 60 ? (
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm text-royal-cream">
                      {stats.linkageRate >= 80
                        ? "Excellent integration rate!"
                        : stats.linkageRate >= 60
                        ? "Good integration rate"
                        : "Integration rate could be improved"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Integration Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-royal-charcoal p-6 rounded-lg border border-royal-gold/20"
          >
            <h3 className="text-lg font-semibold text-royal-cream mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Integration Benefits (Free Reservations + Paid Orders)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="font-semibold text-royal-cream">
                  Customer Experience
                </h4>
                <p className="text-sm text-royal-cream/70 mt-1">
                  Seamless transition from free table reservation to paid food
                  ordering
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Utensils className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-semibold text-royal-cream">
                  Order Efficiency
                </h4>
                <p className="text-sm text-royal-cream/70 mt-1">
                  Auto-populated customer data speeds up the ordering process
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Euro className="w-6 h-6 text-royal-gold" />
                </div>
                <h4 className="font-semibold text-royal-cream">
                  Revenue Tracking
                </h4>
                <p className="text-sm text-royal-cream/70 mt-1">
                  Clear separation between table bookings (free) and food sales
                  (paid)
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};
