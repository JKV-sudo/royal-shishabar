import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  ChefHat,
  Truck,
  Crown,
  X,
  CreditCard,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "../../types/order";
import { ReservationOrderIntegrationService } from "../../services/reservationOrderIntegrationService";
import { OrderService } from "../../services/orderService";

interface ReservationBillViewProps {
  reservationId: string;
  customerName?: string;
  tableNumber: number;
  className?: string;
}

const ReservationBillView: React.FC<ReservationBillViewProps> = ({
  reservationId,
  tableNumber,
  className = "",
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaidOrders, setShowPaidOrders] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const reservationOrders =
          await ReservationOrderIntegrationService.getRecentOrdersForReservation(
            reservationId
          );
        setOrders(reservationOrders);
      } catch (error) {
        console.error("Error loading reservation orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Set up real-time listener for orders updates
    const unsubscribe = OrderService.onOrdersChangeWithFilters(
      {
        dateRange: {
          start: new Date(new Date().setHours(0, 0, 0, 0)),
          end: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      (allOrders) => {
        // Filter to only orders for this reservation
        const reservationOrders = allOrders.filter(
          (order) =>
            order.reservationId === reservationId ||
            order.tableNumber === tableNumber
        );
        setOrders(reservationOrders);
      }
    );

    return unsubscribe;
  }, [reservationId, tableNumber]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "preparing":
        return <ChefHat className="w-4 h-4 text-orange-500" />;
      case "ready":
        return <AlertCircle className="w-4 h-4 text-green-500" />;
      case "delivered":
        return <Truck className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "preparing":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    const statusMap = {
      pending: "Bestellt",
      confirmed: "Bestätigt",
      preparing: "In Zubereitung",
      ready: "Bereit",
      delivered: "Serviert",
      cancelled: "Storniert",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "unpaid":
        return <CreditCard className="w-4 h-4 text-yellow-500" />;
      case "refunded":
        return <RotateCcw className="w-4 h-4 text-blue-500" />;
      case "partial":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "refunded":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "partial":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPaymentStatus = (status: PaymentStatus) => {
    const statusMap = {
      paid: "Bezahlt",
      unpaid: "Offen",
      refunded: "Erstattet",
      partial: "Teilweise",
    };
    return statusMap[status] || status;
  };

  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const unpaidOrders = activeOrders.filter(
    (order) => order.payment?.status === "unpaid"
  );
  const paidOrders = activeOrders.filter(
    (order) => order.payment?.status === "paid"
  );

  const unpaidAmount = unpaidOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const paidAmount = paidOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const totalAmount = unpaidAmount + paidAmount;

  const displayOrders = showPaidOrders ? paidOrders : unpaidOrders;
  const hasOrders = displayOrders.length > 0;
  const hasUnpaidOrders = unpaidOrders.length > 0;

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-royal-gold/20 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-royal-gold/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!hasUnpaidOrders && !paidOrders.length) {
    return (
      <div className={`p-4 border-t border-royal-gold/30 ${className}`}>
        <div className="flex items-center justify-between text-royal-cream/70 text-sm">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4" />
            <span>Noch keine Bestellungen</span>
          </div>
          <span className="text-royal-gold font-bold">0,00€</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t border-royal-gold/30 ${className}`}>
      {/* Summary Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-royal-gold" />
            <h4 className="font-semibold text-royal-cream">
              {showPaidOrders ? "Bezahlte Bestellungen" : "Offene Rechnung"}
            </h4>
          </div>
          <div className="text-right">
            <div className="text-royal-gold font-bold text-lg">
              {showPaidOrders ? paidAmount.toFixed(2) : unpaidAmount.toFixed(2)}
              €
            </div>
            <div className="text-royal-cream/60 text-xs">
              {displayOrders.length} Bestellung
              {displayOrders.length !== 1 ? "en" : ""}
            </div>
          </div>
        </div>

        {/* Payment Status Summary */}
        {(hasUnpaidOrders || paidOrders.length > 0) && (
          <div className="flex items-center justify-between mb-3 p-3 bg-royal-charcoal-dark rounded-royal border border-royal-gold/20">
            <div className="flex items-center space-x-4 text-sm">
              {hasUnpaidOrders && (
                <div className="flex items-center space-x-1 text-yellow-400">
                  <CreditCard className="w-4 h-4" />
                  <span>Offen: {unpaidAmount.toFixed(2)}€</span>
                </div>
              )}
              {paidOrders.length > 0 && (
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bezahlt: {paidAmount.toFixed(2)}€</span>
                </div>
              )}
            </div>
            <div className="text-royal-cream font-medium text-sm">
              Gesamt: {totalAmount.toFixed(2)}€
            </div>
          </div>
        )}

        {/* Toggle between paid/unpaid orders */}
        {hasUnpaidOrders && paidOrders.length > 0 && (
          <div className="flex bg-royal-charcoal-dark rounded-royal p-1 mb-3">
            <button
              onClick={() => setShowPaidOrders(false)}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                !showPaidOrders
                  ? "bg-royal-gold text-royal-charcoal"
                  : "text-royal-cream/80 hover:text-royal-cream"
              }`}
            >
              Offene ({unpaidOrders.length})
            </button>
            <button
              onClick={() => setShowPaidOrders(true)}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                showPaidOrders
                  ? "bg-royal-gold text-royal-charcoal"
                  : "text-royal-cream/80 hover:text-royal-cream"
              }`}
            >
              Bezahlt ({paidOrders.length})
            </button>
          </div>
        )}

        {/* Quick Status Overview */}
        <div className="flex flex-wrap gap-2 mb-3">
          {displayOrders.map((order) => (
            <div key={order.id} className="space-y-1">
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                <span>{formatStatus(order.status)}</span>
              </div>
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getPaymentStatusColor(
                  order.payment?.status || "unpaid"
                )}`}
              >
                {getPaymentStatusIcon(order.payment?.status || "unpaid")}
                <span>
                  {formatPaymentStatus(order.payment?.status || "unpaid")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Details Button */}
        {hasOrders && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-royal-cream/80 hover:text-royal-gold transition-colors text-sm font-medium"
          >
            {showDetails ? "Details ausblenden" : "Details anzeigen"}
          </button>
        )}
      </div>

      {/* Detailed Order View */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {displayOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-royal-charcoal-dark rounded-royal p-4 border border-royal-gold/20"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="text-royal-cream font-medium">
                        Bestellung #{order.id.slice(-6)}
                      </span>
                    </div>
                    <div className="text-royal-gold font-bold">
                      {order.totalAmount.toFixed(2)}€
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-royal-cream/80">
                            {item.quantity}x
                          </span>
                          <span className="text-royal-cream">{item.name}</span>
                          {(item.category.toLowerCase() === "shisha" ||
                            item.category.toLowerCase() === "tobacco") && (
                            <span title="Loyalty Punkte">
                              <Crown className="w-3 h-3 text-royal-purple" />
                            </span>
                          )}
                        </div>
                        <span className="text-royal-cream/80">
                          {(item.price * item.quantity).toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Status & Time */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-royal-gold/20">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs border ${getPaymentStatusColor(
                          order.payment?.status || "unpaid"
                        )}`}
                      >
                        {getPaymentStatusIcon(
                          order.payment?.status || "unpaid"
                        )}
                        <span className="ml-1">
                          {formatPaymentStatus(
                            order.payment?.status || "unpaid"
                          )}
                        </span>
                      </span>
                    </div>
                    <span className="text-royal-cream/60 text-xs">
                      {new Date(order.createdAt).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Payment Details */}
                  {order.payment?.status === "paid" && order.payment.paidAt && (
                    <div className="mt-3 p-2 bg-green-900/20 rounded border border-green-500/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-400">Bezahlt am:</span>
                        <span className="text-royal-cream">
                          {new Date(order.payment.paidAt).toLocaleString(
                            "de-DE",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      {order.payment.method && (
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-green-400">Zahlungsart:</span>
                          <span className="text-royal-cream">
                            {order.payment.method === "cash"
                              ? "Bar"
                              : order.payment.method === "card"
                              ? "Karte"
                              : order.payment.method === "bank_transfer"
                              ? "Überweisung"
                              : order.payment.method === "mobile_payment"
                              ? "Mobile"
                              : order.payment.method}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="mt-3 p-2 bg-royal-charcoal rounded border border-royal-gold/10">
                      <span className="text-royal-cream/60 text-xs uppercase tracking-wide">
                        Anweisungen:
                      </span>
                      <p className="text-royal-cream text-sm">
                        {order.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* Loyalty Discount */}
                  {order.loyaltyDiscount && (
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-royal-purple">
                        <Crown className="w-4 h-4" />
                        <span>Loyalty Rabatt</span>
                      </div>
                      <span className="text-royal-purple font-medium">
                        -{order.loyaltyDiscount.amount.toFixed(2)}€
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReservationBillView;
