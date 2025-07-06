import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getFirestoreDB } from "../../config/firebase";
import { Order } from "../../types/order";
import { MenuItem } from "../../types/menu";
import { CartItem } from "../../types/order";
import { OrderService } from "../../services/orderService";
import LoadingSpinner from "../common/LoadingSpinner";
import { toast } from "react-hot-toast";
import { Clock, CheckCircle, Hash, ChefHat, Coffee, Flame } from "lucide-react";
import { safeToDateWithFallback } from "../../utils/dateUtils";

interface OrderWithItem extends Order {
  currentItem: CartItem & MenuItem;
}

interface BarOperationsProps {}

const BarOperations: React.FC<BarOperationsProps> = () => {
  const [drinkOrders, setDrinkOrders] = useState<OrderWithItem[]>([]);
  const [shishaOrders, setShishaOrders] = useState<OrderWithItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingOrders, setCompletingOrders] = useState<Set<string>>(
    new Set()
  );

  const db = getFirestoreDB();

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("⚠️ Safety timeout reached, setting loading to false");
      setLoading(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Load menu items
  useEffect(() => {
    console.log("🔄 BarOperations: Loading menu items");

    const menuQuery = query(collection(db, "menuItems"));
    const unsubscribeMenu = onSnapshot(
      menuQuery,
      (snapshot) => {
        console.log("📋 Menu snapshot received:", {
          docs: snapshot.docs.length,
          fromCache: snapshot.metadata.fromCache,
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
        });

        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[];

        console.log("📋 Menu items loaded:", items.length);
        console.log(
          "📋 Menu items categories:",
          items.map((item) => `${item.name} (${item.category})`)
        );
        setMenuItems(items);
      },
      (error) => {
        console.error("❌ Error loading menu items:", error);
        toast.error("Fehler beim Laden der Menüdaten");
        // Even if menu loading fails, don't block the orders loading
        setMenuItems([]);
      }
    );

    return () => {
      console.log("🔄 Cleaning up menu listener");
      unsubscribeMenu();
    };
  }, []);

  // Real-time orders listener with enhanced filtering
  useEffect(() => {
    console.log("🔄 BarOperations: Setting up real-time orders listener");
    console.log("📋 Menu items available:", menuItems.length);

    // Listen for orders that need bar/kitchen attention
    const ordersQuery = query(
      collection(db, "orders"),
      where("status", "in", ["pending", "confirmed", "preparing"]),
      orderBy("createdAt", "asc")
    );

    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        console.log("📊 BarOperations: Real-time update received");
        console.log("📊 Snapshot metadata:", {
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          isFromCache: snapshot.metadata.fromCache,
          docs: snapshot.docs.length,
        });

        const orders = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: safeToDateWithFallback(data.createdAt),
            updatedAt: safeToDateWithFallback(data.updatedAt),
          } as Order;
        });

        console.log("📊 BarOperations: Processing orders:", orders.length);

        // Separate orders by category with real-time updates
        const drinks: OrderWithItem[] = [];
        const shisha: OrderWithItem[] = [];

        // Only process orders if we have menu items to match against
        if (menuItems.length > 0) {
          orders.forEach((order) => {
            order.items.forEach((orderItem) => {
              const menuItem = menuItems.find(
                (item) => item.id === orderItem.menuItemId
              );
              if (menuItem) {
                const orderWithMenuItem: OrderWithItem = {
                  ...order,
                  currentItem: {
                    ...orderItem,
                    ...menuItem,
                  },
                };

                console.log(
                  `🍽️ Processing item: ${menuItem.name} (${menuItem.category})`
                );

                if (
                  menuItem.category === "drinks" ||
                  menuItem.category === "beverages"
                ) {
                  drinks.push(orderWithMenuItem);
                } else if (
                  menuItem.category === "shisha" ||
                  menuItem.category === "hookah" ||
                  menuItem.category === "tobacco"
                ) {
                  shisha.push(orderWithMenuItem);
                }
              } else {
                console.warn(
                  "⚠️ Menu item not found for orderItem:",
                  orderItem
                );
                console.warn(
                  "Available menu item IDs:",
                  menuItems.map((item) => item.id)
                );
                console.warn("Looking for:", orderItem.menuItemId);
              }
            });
          });
        } else {
          console.log("⚠️ No menu items loaded yet, showing empty results");
        }

        console.log("🍹 Real-time drink orders:", drinks.length);
        console.log("💨 Real-time shisha orders:", shisha.length);

        // Update state with animation-friendly updates
        setDrinkOrders(drinks);
        setShishaOrders(shisha);
        setLoading(false); // Always set loading to false, even if no menu items

        // Show toast notification for new orders (only for non-cached updates)
        if (!snapshot.metadata.fromCache) {
          const newOrdersCount = drinks.length + shisha.length;
          if (newOrdersCount > 0) {
            console.log("🔔 New orders detected, showing notification");
          }
        }
      },
      (error) => {
        console.error("❌ BarOperations: Real-time listener error:", error);
        setLoading(false);
        toast.error("Fehler beim Laden der Bestellungen");
      }
    );

    return () => {
      console.log("🔄 BarOperations: Cleaning up real-time listener");
      unsubscribeOrders();
    };
  }, [menuItems]);

  const handleCompleteItem = async (orderId: string) => {
    if (completingOrders.has(orderId)) {
      console.log("⏳ Order already being completed:", orderId);
      return;
    }

    try {
      console.log("🔄 Starting completion process for order:", orderId);

      // Add to completing set to prevent double-clicks
      setCompletingOrders((prev) => new Set([...prev, orderId]));

      // Show immediate UI feedback
      toast.loading("Bestellung wird als fertig markiert...", {
        id: `completing-${orderId}`,
      });

      // Update order status using the service
      await OrderService.updateOrderStatus(orderId, "ready");

      console.log("✅ Order marked as ready:", orderId);

      // Success feedback
      toast.success("Bestellung erfolgreich als fertig markiert!", {
        id: `completing-${orderId}`,
        duration: 3000,
      });

      // The real-time listener will automatically remove the order from the view
      console.log("🔄 Real-time listener should now remove order from view");
    } catch (error) {
      console.error("❌ Error completing order:", error);
      toast.error(
        "Fehler beim Abschließen der Bestellung: " +
          (error instanceof Error ? error.message : String(error)),
        {
          id: `completing-${orderId}`,
          duration: 5000,
        }
      );
    } finally {
      // Remove from completing set after a delay
      setTimeout(() => {
        setCompletingOrders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }, 1000);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    try {
      console.log("🔄 Starting preparation for order:", orderId);

      toast.loading("Bestellung wird in Vorbereitung gesetzt...", {
        id: `preparing-${orderId}`,
      });

      await OrderService.updateOrderStatus(orderId, "preparing");

      toast.success("Bestellung in Vorbereitung!", {
        id: `preparing-${orderId}`,
        duration: 2000,
      });
    } catch (error) {
      console.error("❌ Error starting preparation:", error);
      toast.error("Fehler beim Starten der Vorbereitung", {
        id: `preparing-${orderId}`,
        duration: 5000,
      });
    }
  };

  const getOrderPriority = (createdAt: any) => {
    const now = new Date();
    const orderTime = safeToDateWithFallback(createdAt);
    const minutesWaiting = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60)
    );

    if (minutesWaiting > 15) return "high";
    if (minutesWaiting > 10) return "medium";
    return "normal";
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          border:
            "border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-white shadow-red-100",
          badge: "bg-red-500 text-white animate-pulse",
          icon: "text-red-500",
        };
      case "medium":
        return {
          border:
            "border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-white shadow-yellow-100",
          badge: "bg-yellow-500 text-white",
          icon: "text-yellow-500",
        };
      default:
        return {
          border:
            "border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white shadow-green-100",
          badge: "bg-green-500 text-white",
          icon: "text-green-500",
        };
    }
  };

  const formatWaitTime = (createdAt: any) => {
    const now = new Date();
    const orderTime = safeToDateWithFallback(createdAt);
    const minutesWaiting = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60)
    );
    return `${minutesWaiting}min`;
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "DRINGEND";
      case "medium":
        return "MITTEL";
      default:
        return "NORMAL";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Neu";
      case "confirmed":
        return "Bestätigt";
      case "preparing":
        return "In Vorbereitung";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const OrderCard = ({ order }: { order: OrderWithItem }) => {
    const priority = getOrderPriority(order.createdAt);
    const styles = getPriorityStyles(priority);
    const isCompleting = completingOrders.has(order.id);

    return (
      <div
        className={`${
          styles.border
        } rounded-xl p-5 mb-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
          isCompleting ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-2 shadow-sm">
              <Hash className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">
                Tisch {order.tableNumber || order.id?.slice(-4)}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{formatWaitTime(order.createdAt)} Wartezeit</span>
              </div>
            </div>
          </div>

          {/* Priority Badge */}
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </span>
            <span
              className={`px-2 py-1 text-xs font-bold rounded-full ${styles.badge}`}
            >
              {getPriorityText(priority)}
            </span>
          </div>
        </div>

        {/* Order Item */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-gray-800 mb-1">
                {order.currentItem.name}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Menge: {order.currentItem.quantity}x
              </p>
              {order.currentItem.specialInstructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                  <p className="text-sm text-yellow-800">
                    <strong>Spezielle Anweisungen:</strong>{" "}
                    {order.currentItem.specialInstructions}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                €
                {(order.currentItem.price * order.currentItem.quantity).toFixed(
                  2
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {order.status === "pending" && (
            <button
              onClick={() => handleStartPreparing(order.id)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <ChefHat className="w-5 h-5" />
              <span>Vorbereitung starten</span>
            </button>
          )}

          <button
            onClick={() => handleCompleteItem(order.id)}
            disabled={isCompleting}
            className={`flex-1 ${
              isCompleting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isCompleting ? "Wird abgeschlossen..." : "Fertig"}</span>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingSpinner size="lg" />
        <div className="text-center space-y-2">
          <p className="text-gray-600">Lade Bestellungen...</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>📋 Menüelemente: {menuItems.length} geladen</p>
            <p>🍹 Getränke: {drinkOrders.length}</p>
            <p>💨 Shisha: {shishaOrders.length}</p>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <p>
              Debug: Falls das Laden hängt, prüfen Sie die Konsole für Fehler
            </p>
            <p>Firestore-Verbindung wird getestet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bar Operations
        </h1>
        <p className="text-gray-600">
          Live-Übersicht aller ausstehenden Bestellungen • Aktualisiert sich
          automatisch
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Live-Updates aktiv</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>
              {drinkOrders.length + shishaOrders.length} aktive Bestellungen
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Drinks Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Coffee className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Getränke ({drinkOrders.length})
              </h2>
              <p className="text-sm text-gray-600">
                Ausstehende Getränkebestellungen
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {drinkOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Coffee className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Keine ausstehenden Getränkebestellungen</p>
              </div>
            ) : (
              drinkOrders.map((order) => (
                <OrderCard
                  key={`${order.id}-${order.currentItem.id}`}
                  order={order}
                />
              ))
            )}
          </div>
        </div>

        {/* Shisha Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <Flame className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Shisha ({shishaOrders.length})
              </h2>
              <p className="text-sm text-gray-600">
                Ausstehende Shisha-Bestellungen
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {shishaOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Flame className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Keine ausstehenden Shisha-Bestellungen</p>
              </div>
            ) : (
              shishaOrders.map((order) => (
                <OrderCard
                  key={`${order.id}-${order.currentItem.id}`}
                  order={order}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarOperations;
