import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  TrendingUp,
  Euro,
  Package,
  Filter,
  BarChart3,
  PieChart,
  Target,
} from "lucide-react";
import { OrderService } from "../../services/orderService";
import { Order, OrderFilters, OrderStatus } from "../../types/order";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
import { de } from "date-fns/locale";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReportData {
  orders: Order[];
  stats: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
    ordersByStatus: Record<string, number>;
    ordersByHour: Record<string, number>;
    paymentMethods: Record<string, number>;
  };
}

type ReportPeriod =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "custom";

const OrderReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("today");
  const [customDateRange, setCustomDateRange] = useState({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });
  const [showFilters, setShowFilters] = useState(false);
  const [additionalFilters, setAdditionalFilters] = useState<OrderFilters>({});

  useEffect(() => {
    generateReport();
  }, [selectedPeriod, customDateRange]);

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();

    switch (selectedPeriod) {
      case "today":
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case "yesterday":
        const yesterday = subDays(now, 1);
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday),
        };
      case "this_week":
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case "last_week":
        const lastWeek = subWeeks(now, 1);
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
        };
      case "this_month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case "last_month":
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      case "custom":
        return {
          start: startOfDay(new Date(customDateRange.start)),
          end: endOfDay(new Date(customDateRange.end)),
        };
      default:
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange();

      const filters: OrderFilters = {
        dateRange,
        ...additionalFilters,
      };

      const orders = await OrderService.getOrdersWithFilters(filters);
      const stats = calculateStats(orders);

      setReportData({
        orders,
        stats,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Fehler beim Generieren des Berichts");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders: Order[]) => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products analysis
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productMap.get(item.name) || {
          quantity: 0,
          revenue: 0,
        };
        productMap.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.price * item.quantity,
        });
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Orders by hour
    const ordersByHour = orders.reduce((acc, order) => {
      const hour = format(order.createdAt, "HH");
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Payment methods
    const paymentMethods = orders.reduce((acc, order) => {
      const method = order.payment?.method || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      topProducts,
      ordersByStatus,
      ordersByHour,
      paymentMethods,
    };
  };

  const getPeriodLabel = (): string => {
    const dateRange = getDateRange();

    switch (selectedPeriod) {
      case "today":
        return "Heute";
      case "yesterday":
        return "Gestern";
      case "this_week":
        return "Diese Woche";
      case "last_week":
        return "Letzte Woche";
      case "this_month":
        return "Dieser Monat";
      case "last_month":
        return "Letzter Monat";
      case "custom":
        return `${format(dateRange.start, "dd.MM.yyyy", {
          locale: de,
        })} - ${format(dateRange.end, "dd.MM.yyyy", { locale: de })}`;
      default:
        return "Unbekannt";
    }
  };

  const generatePDF = async () => {
    if (!reportData) return;

    try {
      const doc = new jsPDF();
      const dateRange = getDateRange();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(212, 175, 55); // Royal gold color
      doc.text("Royal Shisha Bar", 20, 25);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Bestellbericht", 20, 40);

      doc.setFontSize(12);
      doc.text(`Zeitraum: ${getPeriodLabel()}`, 20, 50);
      doc.text(
        `Erstellt am: ${format(new Date(), "dd.MM.yyyy HH:mm", {
          locale: de,
        })}`,
        20,
        60
      );

      // Summary Stats
      doc.setFontSize(14);
      doc.text("Zusammenfassung", 20, 80);

      const summaryData = [
        ["Gesamtbestellungen", reportData.stats.totalOrders.toString()],
        ["Gesamtumsatz", `${reportData.stats.totalRevenue.toFixed(2)}€`],
        [
          "Durchschnittlicher Bestellwert",
          `${reportData.stats.averageOrderValue.toFixed(2)}€`,
        ],
      ];

      doc.autoTable({
        startY: 85,
        head: [["Metrik", "Wert"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [212, 175, 55] },
        margin: { left: 20 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60 },
        },
      });

      // Orders by Status
      let yPosition = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text("Bestellungen nach Status", 20, yPosition);

      const statusData = Object.entries(reportData.stats.ordersByStatus).map(
        ([status, count]) => [getStatusLabel(status), count.toString()]
      );

      doc.autoTable({
        startY: yPosition + 5,
        head: [["Status", "Anzahl"]],
        body: statusData,
        theme: "grid",
        headStyles: { fillColor: [212, 175, 55] },
        margin: { left: 20 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40 },
        },
      });

      // Top Products
      yPosition = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text("Top Produkte", 20, yPosition);

      const productData = reportData.stats.topProducts
        .slice(0, 10)
        .map((product) => [
          product.name,
          product.quantity.toString(),
          `${product.revenue.toFixed(2)}€`,
        ]);

      doc.autoTable({
        startY: yPosition + 5,
        head: [["Produkt", "Menge", "Umsatz"]],
        body: productData,
        theme: "grid",
        headStyles: { fillColor: [212, 175, 55] },
        margin: { left: 20 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
        },
      });

      // New page for detailed orders
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Detaillierte Bestellliste", 20, 25);

      const orderData = reportData.orders.map((order) => [
        `#${order.id.slice(-8)}`,
        `Tisch ${order.tableNumber}`,
        order.customerName || "Anonym",
        `${order.totalAmount.toFixed(2)}€`,
        getStatusLabel(order.status),
        format(order.createdAt, "dd.MM HH:mm", { locale: de }),
      ]);

      doc.autoTable({
        startY: 35,
        head: [["ID", "Tisch", "Kunde", "Betrag", "Status", "Zeit"]],
        body: orderData,
        theme: "grid",
        headStyles: { fillColor: [212, 175, 55] },
        margin: { left: 20 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 },
        },
        styles: { fontSize: 8 },
      });

      // Save the PDF
      const fileName = `bestellbericht_${format(
        new Date(),
        "yyyy-MM-dd_HH-mm"
      )}.pdf`;
      doc.save(fileName);

      toast.success("PDF-Bericht erfolgreich erstellt!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Fehler beim Erstellen des PDF-Berichts");
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Ausstehend",
      confirmed: "Bestätigt",
      preparing: "In Zubereitung",
      ready: "Bereit",
      delivered: "Ausgeliefert",
      cancelled: "Storniert",
    };
    return statusMap[status] || status;
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvContent = [
      // Headers
      [
        "Bestellungs-ID",
        "Tisch",
        "Kunde",
        "Telefon",
        "Betrag",
        "Status",
        "Datum",
        "Zeit",
        "Artikel",
      ].join(","),
      // Data rows
      ...reportData.orders.map((order) =>
        [
          `#${order.id.slice(-8)}`,
          `Tisch ${order.tableNumber}`,
          order.customerName || "Anonym",
          order.customerPhone || "",
          `${order.totalAmount.toFixed(2)}€`,
          getStatusLabel(order.status),
          format(order.createdAt, "dd.MM.yyyy", { locale: de }),
          format(order.createdAt, "HH:mm", { locale: de }),
          order.items
            .map((item) => `${item.quantity}x ${item.name}`)
            .join("; "),
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bestellbericht_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV-Export erfolgreich!");
  };

  if (loading && !reportData) {
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
            Bestellberichte
          </h2>
          <p className="text-royal-charcoal/70">
            Generieren Sie detaillierte Berichte über Bestellungen und Umsätze
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            disabled={!reportData || reportData.orders.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-royal royal-glow hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={generatePDF}
            disabled={!reportData || reportData.orders.length === 0}
            className="bg-royal-gradient-gold text-royal-charcoal px-4 py-2 rounded-royal royal-glow hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>PDF Download</span>
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-royal-charcoal-dark p-6 rounded-royal shadow-md border border-royal-gold/30 royal-glow">
        <h3 className="text-lg font-semibold text-royal-cream mb-4">
          Zeitraum auswählen
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
          {[
            { value: "today", label: "Heute" },
            { value: "yesterday", label: "Gestern" },
            { value: "this_week", label: "Diese Woche" },
            { value: "last_week", label: "Letzte Woche" },
            { value: "this_month", label: "Dieser Monat" },
            { value: "last_month", label: "Letzter Monat" },
            { value: "custom", label: "Benutzerdefiniert" },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as ReportPeriod)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedPeriod === period.value
                  ? "bg-royal-gold text-royal-charcoal"
                  : "bg-royal-charcoal text-royal-cream hover:bg-royal-charcoal-light"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {selectedPeriod === "custom" && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-royal-cream mb-1">
                Von
              </label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-royal-charcoal text-royal-cream border border-royal-gold/30 rounded focus:outline-none focus:ring-1 focus:ring-royal-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-royal-cream mb-1">
                Bis
              </label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    end: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-royal-charcoal text-royal-cream border border-royal-gold/30 rounded focus:outline-none focus:ring-1 focus:ring-royal-gold"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-royal-gold hover:text-royal-gold/80 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Zusätzliche Filter</span>
            </button>
            <span className="text-royal-cream text-sm">
              Zeitraum: {getPeriodLabel()}
            </span>
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-royal-purple text-white px-4 py-2 rounded royal-glow hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            <span>Bericht generieren</span>
          </button>
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-royal-gold/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-royal-cream mb-1">
                  Status
                </label>
                <select
                  value={additionalFilters.status || ""}
                  onChange={(e) =>
                    setAdditionalFilters((prev) => ({
                      ...prev,
                      status: e.target.value ? (e.target.value as OrderStatus) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 bg-royal-charcoal text-royal-cream border border-royal-gold/30 rounded focus:outline-none focus:ring-1 focus:ring-royal-gold"
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
                <label className="block text-sm font-medium text-royal-cream mb-1">
                  Tischnummer
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="z.B. 5"
                  value={additionalFilters.tableNumber || ""}
                  onChange={(e) =>
                    setAdditionalFilters((prev) => ({
                      ...prev,
                      tableNumber: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 bg-royal-charcoal text-royal-cream border border-royal-gold/30 rounded focus:outline-none focus:ring-1 focus:ring-royal-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-royal-cream mb-1">
                  Suche
                </label>
                <input
                  type="text"
                  placeholder="Kundenname oder Artikel..."
                  value={additionalFilters.search || ""}
                  onChange={(e) =>
                    setAdditionalFilters((prev) => ({
                      ...prev,
                      search: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 bg-royal-charcoal text-royal-cream border border-royal-gold/30 rounded focus:outline-none focus:ring-1 focus:ring-royal-gold"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Statistics Cards */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-royal-charcoal-dark p-6 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-royal-cream/70">Bestellungen</p>
                <p className="text-2xl font-bold text-royal-cream">
                  {reportData.stats.totalOrders}
                </p>
              </div>
              <Package className="w-8 h-8 text-royal-gold" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-royal-charcoal-dark p-6 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-royal-cream/70">Gesamtumsatz</p>
                <p className="text-2xl font-bold text-royal-gold">
                  {reportData.stats.totalRevenue.toFixed(2)}€
                </p>
              </div>
              <Euro className="w-8 h-8 text-royal-gold" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-royal-charcoal-dark p-6 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-royal-cream/70">Ø Bestellwert</p>
                <p className="text-2xl font-bold text-royal-cream">
                  {reportData.stats.averageOrderValue.toFixed(2)}€
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-royal-gold" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-royal-charcoal-dark p-6 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-royal-cream/70">Top Produkte</p>
                <p className="text-2xl font-bold text-royal-cream">
                  {reportData.stats.topProducts.length}
                </p>
              </div>
              <Target className="w-8 h-8 text-royal-gold" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Detailed Analysis */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-royal-charcoal-dark p-6 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <h3 className="text-lg font-semibold text-royal-cream mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-royal-gold" />
              Top Produkte
            </h3>
            <div className="space-y-3">
              {reportData.stats.topProducts
                .slice(0, 8)
                .map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-royal-gold">
                        #{index + 1}
                      </span>
                      <span className="text-royal-cream">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-royal-cream/70">
                        {product.quantity}x
                      </div>
                      <div className="text-sm font-medium text-royal-gold">
                        {product.revenue.toFixed(2)}€
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Orders by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-royal-charcoal-dark p-6 rounded-royal shadow-md border border-royal-gold/30 royal-glow"
          >
            <h3 className="text-lg font-semibold text-royal-cream mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-royal-gold" />
              Bestellungen nach Status
            </h3>
            <div className="space-y-3">
              {Object.entries(reportData.stats.ordersByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-royal-cream">
                      {getStatusLabel(status)}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="bg-royal-gold/20 h-2 rounded-full w-20">
                        <div
                          className="bg-royal-gold h-2 rounded-full"
                          style={{
                            width: `${
                              (count / reportData.stats.totalOrders) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-royal-gold font-medium w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Orders Table */}
      {reportData && reportData.orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-royal-charcoal-dark rounded-royal shadow-md border border-royal-gold/30 royal-glow overflow-hidden"
        >
          <div className="p-6 border-b border-royal-gold/20">
            <h3 className="text-lg font-semibold text-royal-cream flex items-center">
              <FileText className="w-5 h-5 mr-2 text-royal-gold" />
              Bestelldetails ({reportData.orders.length} Bestellungen)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-royal-gradient-gold">
                <tr>
                  <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                    Tisch
                  </th>
                  <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                    Kunde
                  </th>
                  <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                    Betrag
                  </th>
                  <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                    Datum
                  </th>
                  <th className="px-4 py-3 text-left text-royal-charcoal font-semibold">
                    Artikel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-royal-gold/20">
                {reportData.orders.slice(0, 50).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-royal-charcoal/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-royal-cream/70">
                        #{order.id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-royal-gold/20 text-royal-gold px-2 py-1 rounded-full text-sm font-semibold">
                        Tisch {order.tableNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-royal-cream">
                      {order.customerName || "Anonym"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-royal-gold">
                        {order.totalAmount.toFixed(2)}€
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-royal-cream/70">
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-royal-cream/70">
                      {format(order.createdAt, "dd.MM.yyyy HH:mm", {
                        locale: de,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-royal-cream/70 max-w-xs">
                        {order.items
                          .map((item) => `${item.quantity}x ${item.name}`)
                          .join(", ")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reportData.orders.length > 50 && (
            <div className="p-4 bg-royal-charcoal/30 text-center text-royal-cream/70 text-sm">
              Zeige die ersten 50 von {reportData.orders.length} Bestellungen.
              Für alle Daten verwenden Sie den PDF- oder CSV-Export.
            </div>
          )}
        </motion.div>
      )}

      {/* No Data Message */}
      {reportData && reportData.orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-royal-charcoal-dark p-8 rounded-royal shadow-md border border-royal-gold/30 royal-glow text-center"
        >
          <Package className="w-16 h-16 text-royal-gold/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-royal-cream mb-2">
            Keine Bestellungen gefunden
          </h3>
          <p className="text-royal-cream/70">
            Für den ausgewählten Zeitraum wurden keine Bestellungen gefunden.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default OrderReports;
