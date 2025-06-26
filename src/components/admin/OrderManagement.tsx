import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  Users,
  Euro,
} from "lucide-react";
import { OrderService } from "../../services/orderService";
import {
  Order,
  OrderStatus,
  OrderStats,
  OrderFilters,
} from "../../types/order";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import toast from "react-hot-toast";

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const statusColors = {
    pending: "bg-royal-gold/20 text-royal-gold border border-royal-gold/30",
    confirmed:
      "bg-royal-purple/20 text-royal-purple-light border border-royal-purple/30",
    preparing:
      "bg-royal-burgundy/20 text-royal-burgundy-light border border-royal-burgundy/30",
    ready: "bg-green-600/20 text-green-500 border border-green-600/30",
    delivered:
      "bg-royal-charcoal/20 text-royal-cream border border-royal-charcoal/30",
    cancelled: "bg-red-600/20 text-red-500 border border-red-600/30",
  };

  const statusIcons = {
    pending: Clock,
    confirmed: Package,
    preparing: RefreshCw,
    ready: CheckCircle,
    delivered: CheckCircle,
    cancelled: XCircle,
  };

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await OrderService.getOrdersWithFilters(filters);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Fehler beim Laden der Bestellungen");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await OrderService.getOrderStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus);
      toast.success("Bestellstatus erfolgreich aktualisiert");
      loadOrders();
      loadStats();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Fehler beim Aktualisieren des Bestellstatus");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (
      !confirm("Sind Sie sicher, dass Sie diese Bestellung löschen möchten?")
    ) {
      return;
    }

    try {
      await OrderService.deleteOrder(orderId);
      toast.success("Bestellung erfolgreich gelöscht");
      loadOrders();
      loadStats();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Fehler beim Löschen der Bestellung");
    }
  };

  const getTotalItems = (order: Order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const formatStatus = (status: OrderStatus) => {
    const statusMap = {
      pending: "Ausstehend",
      confirmed: "Bestätigt",
      preparing: "In Zubereitung",
      ready: "Bereit",
      delivered: "Ausgeliefert",
      cancelled: "Storniert",
    };
    return statusMap[status];
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-royal font-bold text-royal-charcoal">
            Bestellverwaltung
          </h2>
          <p className="text-royal-charcoal/70">
            Verwalten Sie alle Kundenbestellungen und deren Status
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="bg-royal-gradient-gold text-royal-charcoal px-4 py-2 rounded-royal royal-glow hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Aktualisieren</span>
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-royal-charcoal-dark p-4 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-royal-cream/70">
                  Gesamtbestellungen
                </p>
                <p className="text-2xl font-bold text-royal-cream">
                  {stats.totalOrders}
                </p>
              </div>
              <Package className="w-8 h-8 text-royal-gold" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-royal-charcoal-dark p-4 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-royal-cream/70">Ausstehend</p>
                <p className="text-2xl font-bold text-royal-gold">
                  {stats.pendingOrders}
                </p>
              </div>
              <Clock className="w-8 h-8 text-royal-gold" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-royal-charcoal-dark p-4 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-royal-cream/70">Gesamtumsatz</p>
                <p className="text-2xl font-bold text-royal-gold">
                  {stats.totalRevenue.toFixed(2)}€
                </p>
              </div>
              <Euro className="w-8 h-8 text-royal-gold" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-royal-charcoal-dark p-4 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-royal-cream/70">Ø Bestellwert</p>
                <p className="text-2xl font-bold text-royal-cream">
                  {stats.averageOrderValue.toFixed(2)}€
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-royal-gold" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-royal-charcoal-dark p-4 rounded-royal shadow-md border border-royal-gold/30 royal-glow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-royal-cream">Filter</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-royal-gold hover:text-royal-gold/80"
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? "Filter ausblenden" : "Filter anzeigen"}</span>
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-royal-cream mb-2">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: (e.target.value as OrderStatus) || undefined,
                  })
                }
                className="w-full p-2 border border-royal-gold/30 rounded-royal focus:outline-none focus:ring-2 focus:ring-royal-gold/50 bg-royal-charcoal text-royal-cream"
              >
                <option value="">Alle Status</option>
                <option value="pending">Ausstehend</option>
                <option value="confirmed">Bestätigt</option>
                <option value="preparing">In Zubereitung</option>
                <option value="ready">Bereit</option>
                <option value="delivered">Ausgeliefert</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-royal-cream mb-2">
                Tischnummer
              </label>
              <input
                type="number"
                value={filters.tableNumber || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    tableNumber: parseInt(e.target.value) || undefined,
                  })
                }
                placeholder="Alle Tische"
                className="w-full p-2 border border-royal-gold/30 rounded-royal focus:outline-none focus:ring-2 focus:ring-royal-gold/50 bg-royal-charcoal text-royal-cream"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-royal-cream mb-2">
                Suche
              </label>
              <input
                type="text"
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Kunde, Artikel, etc."
                className="w-full p-2 border border-royal-gold/30 rounded-royal focus:outline-none focus:ring-2 focus:ring-royal-gold/50 bg-royal-charcoal text-royal-cream"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-royal-charcoal-dark rounded-royal shadow-md border border-royal-gold/30 overflow-hidden royal-glow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-royal-gradient-gold">
              <tr>
                <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                  Bestellung
                </th>
                <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                  Tisch
                </th>
                <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                  Kunde
                </th>
                <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                  Artikel
                </th>
                <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                  Gesamt
                </th>
                <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                  Datum
                </th>
                <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-royal-gold/20">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-royal-charcoal/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-royal-charcoal/70">
                        #{order.id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-royal-gold/20 text-royal-charcoal px-2 py-1 rounded-full text-sm font-semibold">
                        Tisch {order.tableNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-royal-charcoal">
                          {order.customerName || "Anonym"}
                        </p>
                        {order.customerPhone && (
                          <p className="text-sm text-royal-charcoal/70">
                            {order.customerPhone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-royal-charcoal/70">
                        <p>{getTotalItems(order)} Artikel</p>
                        <p className="text-xs">
                          {order.items
                            .slice(0, 2)
                            .map((item) => item.name)
                            .join(", ")}
                          {order.items.length > 2 && "..."}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-royal-gold">
                        {order.totalAmount.toFixed(2)}€
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status]
                        }`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-royal-charcoal/70">
                      {format(order.createdAt, "dd.MM.yyyy HH:mm", {
                        locale: de,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1 hover:bg-royal-gold/20 rounded transition-colors"
                          title="Details anzeigen"
                        >
                          <Eye className="w-4 h-4 text-royal-gold" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(
                              order.id,
                              e.target.value as OrderStatus
                            )
                          }
                          className="text-xs border border-royal-gold/30 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-royal-gold/50"
                        >
                          <option value="pending">Ausstehend</option>
                          <option value="confirmed">Bestätigt</option>
                          <option value="preparing">In Zubereitung</option>
                          <option value="ready">Bereit</option>
                          <option value="delivered">Ausgeliefert</option>
                          <option value="cancelled">Storniert</option>
                        </select>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Bestellung löschen"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-royal-charcoal/30 mb-4" />
            <p className="text-royal-charcoal/70">
              Keine Bestellungen gefunden
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white rounded-royal shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-royal-gradient-gold p-4 flex items-center justify-between">
              <h3 className="text-xl font-royal font-bold text-royal-charcoal">
                Bestelldetails #{selectedOrder.id.slice(-8)}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-royal-charcoal/20 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5 text-royal-charcoal" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-royal-charcoal/70">Tischnummer</p>
                  <p className="font-semibold text-royal-charcoal">
                    Tisch {selectedOrder.tableNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-royal-charcoal/70">Status</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[selectedOrder.status]
                    }`}
                  >
                    {formatStatus(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-royal-charcoal/70">Kunde</p>
                  <p className="font-semibold text-royal-charcoal">
                    {selectedOrder.customerName || "Anonym"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-royal-charcoal/70">Telefon</p>
                  <p className="font-semibold text-royal-charcoal">
                    {selectedOrder.customerPhone || "Nicht angegeben"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-royal-charcoal/70">Bestelldatum</p>
                  <p className="font-semibold text-royal-charcoal">
                    {format(selectedOrder.createdAt, "dd.MM.yyyy HH:mm", {
                      locale: de,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-royal-charcoal/70">Gesamtbetrag</p>
                  <p className="font-bold text-royal-gold text-lg">
                    {selectedOrder.totalAmount.toFixed(2)}€
                  </p>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <div>
                  <p className="text-sm text-royal-charcoal/70 mb-2">
                    Spezielle Anweisungen
                  </p>
                  <p className="bg-royal-gold/10 p-3 rounded-royal text-royal-charcoal">
                    {selectedOrder.specialInstructions}
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <p className="text-sm text-royal-charcoal/70 mb-3">
                  Bestellte Artikel
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-royal-charcoal/5 rounded-royal"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-royal-charcoal">
                          {item.name}
                        </p>
                        <p className="text-sm text-royal-charcoal/70">
                          {item.category}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs text-royal-gold mt-1">
                            Anweisung: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-royal-charcoal">
                          {item.quantity}x {item.price.toFixed(2)}€
                        </p>
                        <p className="font-bold text-royal-gold">
                          {(item.price * item.quantity).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
