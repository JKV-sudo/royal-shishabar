import React, { useState, useCallback, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { getFirestoreDB } from "../../config/firebase";
import { Order } from "../../types/order";
import { MenuItem } from "../../types/menu";
import { CartItem } from "../../types/order";
import { OrderService } from "../../services/orderService";
import LoadingSpinner from "../common/LoadingSpinner";
import { ErrorEmptyState, NoDataEmptyState } from "../common/EmptyState";
import {
  useMultipleAdminDataLoader,
  useRealtimeAdminData,
} from "../../hooks/useAdminDataLoader";
import { toast } from "react-hot-toast";
import {
  Clock,
  CheckCircle,
  Hash,
  ChefHat,
  Coffee,
  Flame,
  RefreshCw,
} from "lucide-react";
import { safeToDateWithFallback } from "../../utils/dateUtils";

interface OrderWithItem extends Order {
  currentItem: CartItem & MenuItem;
}

interface BarOperationsData {
  menuItems: MenuItem[];
  pendingOrders: Order[];
}

interface BarOperationsProps {}

const BarOperations: React.FC<BarOperationsProps> = () => {
  const [drinkOrders, setDrinkOrders] = useState<OrderWithItem[]>([]);
  const [shishaOrders, setShishaOrders] = useState<OrderWithItem[]>([]);
  const [completingOrders, setCompletingOrders] = useState<Set<string>>(
    new Set()
  );

  const db = getFirestoreDB();

  // Use our robust data loader for initial data
  const {
    data: initialData,
    loading: loadingInitial,
    error: initialError,
    isEmpty,
    loadMultipleData: loadInitialData,
    reload: reloadInitialData,
  } = useMultipleAdminDataLoader<BarOperationsData>({
    initialData: { menuItems: [], pendingOrders: [] },
    onSuccess: (data) => {
      console.log("📊 BarOperations: Initial data loaded successfully", {
        menuItems: data.menuItems.length,
        pendingOrders: data.pendingOrders.length,
      });
      processOrdersWithMenuItems(data.pendingOrders, data.menuItems);
    },
    onError: (error) => {
      console.error("❌ BarOperations: Initial data loading failed:", error);
      toast.error("Fehler beim Laden der Daten");
    },
    checkEmpty: (data) =>
      data.menuItems.length === 0 && data.pendingOrders.length === 0,
  });

  // Use realtime data loader for live updates
  const {
    loading: loadingRealtime,
    error: realtimeError,
    setupRealtimeListener,
  } = useRealtimeAdminData<Order[]>([], (data) =>
    Array.isArray(data) ? data.length === 0 : !data
  );

  // Load initial data when component mounts
  useEffect(() => {
    console.log("🔄 BarOperations: Loading initial data");

    loadInitialData({
      // Load menu items
      menuItems: async () => {
        console.log("📋 Loading menu items...");
        const menuQuery = query(collection(db, "menuItems"));
        const snapshot = await getDocs(menuQuery);

        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[];

        console.log("📋 Menu items loaded:", items.length);
        return items;
      },

      // Load pending orders
      pendingOrders: async () => {
        console.log("📊 Loading pending orders...");
        const ordersQuery = query(
          collection(db, "orders"),
          where("status", "in", ["pending", "confirmed", "preparing"]),
          orderBy("createdAt", "asc")
        );

        const snapshot = await getDocs(ordersQuery);

        const orders = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: safeToDateWithFallback(data.createdAt),
            updatedAt: safeToDateWithFallback(data.updatedAt),
          } as Order;
        });

        console.log("📊 Orders loaded:", orders.length);
        return orders;
      },
    });
  }, []);

  // Set up realtime listener after initial data is loaded
  useEffect(() => {
    if (!initialData || loadingInitial) return;

    console.log("🔄 BarOperations: Setting up realtime listener");

    const unsubscribe = setupRealtimeListener(
      (callback) => {
        const ordersQuery = query(
          collection(db, "orders"),
          where("status", "in", ["pending", "confirmed", "preparing"]),
          orderBy("createdAt", "asc")
        );

        return onSnapshot(
          ordersQuery,
          (snapshot) => {
            console.log("📊 Realtime orders update:", {
              docs: snapshot.docs.length,
              fromCache: snapshot.metadata.fromCache,
              hasPendingWrites: snapshot.metadata.hasPendingWrites,
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

            callback(orders);
          },
          (error) => {
            console.error("❌ Realtime listener error:", error);
            toast.error("Fehler bei der Echtzeitaktualisierung");
          }
        );
      },
      (orders: Order[]) => {
        // Process orders with current menu items
        if (initialData?.menuItems) {
          processOrdersWithMenuItems(orders, initialData.menuItems);
        }
        return orders;
      }
    );

    return () => {
      console.log("🔄 Cleaning up realtime listener");
      unsubscribe();
    };
  }, [initialData, loadingInitial, setupRealtimeListener]);

  // Process orders with menu items to create OrderWithItem objects
  const processOrdersWithMenuItems = useCallback(
    (orders: Order[], menuItems: MenuItem[]) => {
      console.log("🔄 Processing orders with menu items", {
        orders: orders.length,
        menuItems: menuItems.length,
      });

      const drinks: OrderWithItem[] = [];
      const shisha: OrderWithItem[] = [];

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
              orderItem.menuItemId
            );
          }
        });
      });

      console.log("🍹 Processed drink orders:", drinks.length);
      console.log("💨 Processed shisha orders:", shisha.length);

      setDrinkOrders(drinks);
      setShishaOrders(shisha);
    },
    []
  );

  // Handle completing an order item
  const handleCompleteItem = async (orderId: string) => {
    if (completingOrders.has(orderId)) return;

    setCompletingOrders((prev) => new Set(prev).add(orderId));

    try {
      await OrderService.updateOrderStatus(orderId, "ready");
      toast.success("Bestellung abgeschlossen");

      // Reload data to ensure consistency
      reloadInitialData();
    } catch (error) {
      console.error("❌ Error completing order:", error);
      toast.error("Fehler beim Abschließen der Bestellung");
    } finally {
      setCompletingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Handle starting preparation
  const handleStartPreparing = async (orderId: string) => {
    if (completingOrders.has(orderId)) return;

    setCompletingOrders((prev) => new Set(prev).add(orderId));

    try {
      await OrderService.updateOrderStatus(orderId, "preparing");
      toast.success("Zubereitung gestartet");
    } catch (error) {
      console.error("❌ Error starting preparation:", error);
      toast.error("Fehler beim Starten der Zubereitung");
    } finally {
      setCompletingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Utility functions for order priority and formatting
  const getOrderPriority = (createdAt: any) => {
    const now = new Date();
    const orderTime = safeToDateWithFallback(createdAt);
    const diffMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60)
    );

    if (diffMinutes > 20) return "urgent";
    if (diffMinutes > 10) return "high";
    return "normal";
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 border-red-300 text-red-800";
      case "high":
        return "bg-orange-100 border-orange-300 text-orange-800";
      default:
        return "bg-blue-100 border-blue-300 text-blue-800";
    }
  };

  const formatWaitTime = (createdAt: any) => {
    const now = new Date();
    const orderTime = safeToDateWithFallback(createdAt);
    const diffMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60)
    );
    return `${diffMinutes} min`;
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "DRINGEND";
      case "high":
        return "HOCH";
      default:
        return "NORMAL";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Wartend";
      case "confirmed":
        return "Bestätigt";
      case "preparing":
        return "In Zubereitung";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Order card component
  const OrderCard = ({ order }: { order: OrderWithItem }) => {
    const priority = getOrderPriority(order.createdAt);
    const isCompleting = completingOrders.has(order.id);

    return (
      <div
        className={`
        p-4 rounded-lg border-2 mb-4 transition-all duration-300
        ${getPriorityStyles(priority)}
        ${isCompleting ? "opacity-50 pointer-events-none" : ""}
      `}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4" />
            <span className="font-semibold">#{order.id}</span>
            <span
              className={`px-2 py-1 rounded text-xs ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatWaitTime(order.createdAt)}</span>
            <span className="font-medium">{getPriorityText(priority)}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-1">
            {order.currentItem.category === "drinks" ? (
              <Coffee className="w-5 h-5 text-blue-600" />
            ) : (
              <Flame className="w-5 h-5 text-orange-600" />
            )}
            <span className="font-medium">{order.currentItem.name}</span>
          </div>
          <p className="text-sm text-gray-600 ml-7">
            Menge: {order.currentItem.quantity}
          </p>
          {order.currentItem.specialInstructions && (
            <p className="text-sm text-gray-600 ml-7 mt-1">
              Notizen: {order.currentItem.specialInstructions}
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          {order.status === "pending" && (
            <button
              onClick={() => handleStartPreparing(order.id)}
              disabled={isCompleting}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  Wird gestartet...
                </div>
              ) : (
                <>
                  <ChefHat className="w-4 h-4 mr-1 inline" />
                  Zubereitung starten
                </>
              )}
            </button>
          )}

          {(order.status === "confirmed" || order.status === "preparing") && (
            <button
              onClick={() => handleCompleteItem(order.id)}
              disabled={isCompleting}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  Wird abgeschlossen...
                </div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1 inline" />
                  Abschließen
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          <p>Tisch: {order.tableNumber || "N/A"}</p>
          <p>Kunde: {order.customerName || "N/A"}</p>
          <p>
            Erstellt: {safeToDateWithFallback(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  // Handle loading states
  if (loadingInitial) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Laden der Bardaten...</span>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error states
  if (initialError) {
    return (
      <div className="p-6">
        <ErrorEmptyState
          title="Fehler beim Laden der Daten"
          description={initialError}
          onRetry={reloadInitialData}
          retrying={loadingInitial}
        />
      </div>
    );
  }

  // Handle empty states
  if (isEmpty) {
    return (
      <div className="p-6">
        <NoDataEmptyState
          title="Keine Daten verfügbar"
          description="Es sind keine Menüdaten oder Bestellungen vorhanden."
          onRefresh={reloadInitialData}
          refreshing={loadingInitial}
        />
      </div>
    );
  }

  const totalOrders = drinkOrders.length + shishaOrders.length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Barbereich ({totalOrders} Bestellungen)
        </h1>
        <div className="flex items-center space-x-4">
          {loadingRealtime && (
            <div className="flex items-center space-x-2 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Aktualisierung...</span>
            </div>
          )}
          <button
            onClick={reloadInitialData}
            disabled={loadingInitial}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingInitial ? "animate-spin" : ""}`}
            />
            <span>Aktualisieren</span>
          </button>
        </div>
      </div>

      {realtimeError && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              Echtzeitaktualisierung unterbrochen: {realtimeError}
            </span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Drinks Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Coffee className="w-6 h-6 mr-2 text-blue-600" />
            Getränke ({drinkOrders.length})
          </h2>
          <div className="space-y-4">
            {drinkOrders.length > 0 ? (
              drinkOrders.map((order) => (
                <OrderCard
                  key={`${order.id}-${order.currentItem.menuItemId}`}
                  order={order}
                />
              ))
            ) : (
              <NoDataEmptyState
                title="Keine Getränkebestellungen"
                description="Derzeit gibt es keine offenen Getränkebestellungen."
              />
            )}
          </div>
        </div>

        {/* Shisha Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Flame className="w-6 h-6 mr-2 text-orange-600" />
            Shisha ({shishaOrders.length})
          </h2>
          <div className="space-y-4">
            {shishaOrders.length > 0 ? (
              shishaOrders.map((order) => (
                <OrderCard
                  key={`${order.id}-${order.currentItem.menuItemId}`}
                  order={order}
                />
              ))
            ) : (
              <NoDataEmptyState
                title="Keine Shisha-Bestellungen"
                description="Derzeit gibt es keine offenen Shisha-Bestellungen."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarOperations;
