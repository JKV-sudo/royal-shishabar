import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
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
  // Track completion state - use orderID + menuItemId for unique identification
  const [completingItems, setCompletingItems] = useState<Set<string>>(
    new Set()
  );

  // CRITICAL FIX: Add refs to prevent aggressive reloading
  const isProcessingRef = useRef(false);
  const lastProcessedOrdersRef = useRef<string>("");
  const menuItemsRef = useRef<MenuItem[]>([]);
  const hasLoadedInitialDataRef = useRef(false); // CRITICAL FIX: Track if initial data was loaded
  const setupRealtimeListenerRef = useRef<any>(null); // CRITICAL FIX: Store stable reference to setupRealtimeListener

  const db = getFirestoreDB();

  // CRITICAL FIX: Memoize the processOrdersWithMenuItems function with proper dependencies
  const processOrdersWithMenuItems = useCallback(
    (orders: Order[], menuItems: MenuItem[]) => {
      // CRITICAL FIX: Prevent duplicate processing
      if (isProcessingRef.current) {
        return;
      }

      // CRITICAL FIX: Check if orders have actually changed
      const ordersHash = JSON.stringify(
        orders.map((o) => ({
          id: o.id,
          status: o.status,
          updatedAt: o.updatedAt,
        }))
      );
      if (ordersHash === lastProcessedOrdersRef.current) {
        return;
      }

      isProcessingRef.current = true;
      lastProcessedOrdersRef.current = ordersHash;

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
            // FIXED: Create fallback item when menu item not found
            console.warn(
              "⚠️ Menu item not found for orderItem:",
              orderItem.menuItemId,
              "Creating fallback item"
            );

            const fallbackOrderWithItem: OrderWithItem = {
              ...order,
              currentItem: {
                ...orderItem,
                id: orderItem.menuItemId,
                name: orderItem.name || `Item ${orderItem.menuItemId}`,
                category: "drinks", // Default to drinks to ensure it shows up
                price: orderItem.price,
                description: "Menu item not found",
                isAvailable: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            };

            drinks.push(fallbackOrderWithItem);
          }
        });
      });

      setDrinkOrders(drinks);
      setShishaOrders(shisha);

      // CRITICAL FIX: Reset processing flag after a short delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 100);
    },
    [] // Empty dependency array to prevent infinite re-renders
  );

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
      // CRITICAL FIX: Store menu items in ref for real-time updates
      menuItemsRef.current = data.menuItems;
      processOrdersWithMenuItems(data.pendingOrders, data.menuItems);
    },
    onError: (error) => {
      console.error("❌ BarOperations: Initial data loading failed:", error);
      toast.error("Fehler beim Laden der Daten");
    },
    checkEmpty: (data) =>
      data.menuItems.length === 0 && data.pendingOrders.length === 0,
  });

  // CRITICAL FIX: Use realtime data loader with proper cleanup
  const {
    loading: loadingRealtime,
    error: realtimeError,
    setupRealtimeListener,
  } = useRealtimeAdminData<Order[]>([], (data) =>
    Array.isArray(data) ? data.length === 0 : !data
  );

  // CRITICAL FIX: Store stable reference to setupRealtimeListener
  setupRealtimeListenerRef.current = setupRealtimeListener;

  // CRITICAL FIX: Load initial data only once when component mounts
  useEffect(() => {
    // CRITICAL FIX: Prevent multiple initial data loads
    if (hasLoadedInitialDataRef.current) {
      return;
    }

    hasLoadedInitialDataRef.current = true;

    loadInitialData({
      // Load menu items
      menuItems: async () => {
        const menuQuery = query(collection(db, "menuItems"));
        const snapshot = await getDocs(menuQuery);

        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[];

        return items;
      },

      // Load pending orders
      pendingOrders: async () => {
        // FIXED: Remove orderBy to avoid composite index requirement
        const ordersQuery = query(
          collection(db, "orders"),
          where("status", "in", ["pending", "confirmed", "preparing"])
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

        // Sort in JavaScript instead of Firestore to avoid index requirement
        return orders.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
      },
    });
  }, []); // CRITICAL FIX: Empty dependency array - only run once on mount

  // CRITICAL FIX: Set up realtime listener with debouncing and proper cleanup
  useEffect(() => {
    if (!initialData || loadingInitial) return;

    let isSubscribed = true;
    let debounceTimeout: NodeJS.Timeout | null = null;

    const unsubscribe = setupRealtimeListenerRef.current(
      (callback: (data: Order[]) => void) => {
        // FIXED: Remove orderBy to avoid composite index requirement
        const ordersQuery = query(
          collection(db, "orders"),
          where("status", "in", ["pending", "confirmed", "preparing"])
        );

        return onSnapshot(
          ordersQuery,
          (snapshot) => {
            if (!isSubscribed) return;

            const orders = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: safeToDateWithFallback(data.createdAt),
                updatedAt: safeToDateWithFallback(data.updatedAt),
              } as Order;
            });

            // Sort in JavaScript instead of Firestore to avoid index requirement
            const sortedOrders = orders.sort(
              (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            );

            // CRITICAL FIX: Debounce real-time updates to prevent aggressive processing
            if (debounceTimeout) {
              clearTimeout(debounceTimeout);
            }

            debounceTimeout = setTimeout(() => {
              if (!isSubscribed) return;
              callback(sortedOrders);
            }, 300); // 300ms debounce
          },
          (error) => {
            if (!isSubscribed) return;
            console.error("❌ Realtime listener error:", error);
            toast.error("Fehler bei der Echtzeitaktualisierung");
          }
        );
      },
      (orders: Order[]) => {
        if (!isSubscribed || !menuItemsRef.current.length) return orders;

        // CRITICAL FIX: Use stored menu items instead of initialData
        processOrdersWithMenuItems(orders, menuItemsRef.current);
        return orders;
      }
    );

    return () => {
      isSubscribed = false;
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [initialData, loadingInitial]);

  // Helper function to generate unique item key
  const getItemKey = (orderId: string, menuItemId: string) => {
    return `${orderId}-${menuItemId}`;
  };

  // CRITICAL FIX: Optimized order completion without full data reload
  const handleCompleteItem = async (orderId: string, menuItemId: string) => {
    const itemKey = getItemKey(orderId, menuItemId);
    if (completingItems.has(itemKey)) return;

    setCompletingItems((prev) => new Set(prev).add(itemKey));

    try {
      await OrderService.updateOrderStatus(orderId, "ready");
      toast.success("Bestellung abgeschlossen");

      // CRITICAL FIX: Don't reload all data, just let real-time listener handle it
      // The real-time listener will automatically update the UI
    } catch (error) {
      console.error("❌ Error completing order:", error);
      toast.error("Fehler beim Abschließen der Bestellung");
    } finally {
      setCompletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // CRITICAL FIX: Optimized preparation start without full data reload
  const handleStartPreparing = async (orderId: string, menuItemId: string) => {
    const itemKey = getItemKey(orderId, menuItemId);
    if (completingItems.has(itemKey)) return;

    setCompletingItems((prev) => new Set(prev).add(itemKey));

    try {
      await OrderService.updateOrderStatus(orderId, "preparing");
      toast.success("Zubereitung gestartet");

      // CRITICAL FIX: Don't reload all data, just let real-time listener handle it
      // The real-time listener will automatically update the UI
    } catch (error) {
      console.error("❌ Error starting preparation:", error);
      toast.error("Fehler beim Starten der Zubereitung");
    } finally {
      setCompletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
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
    const itemKey = getItemKey(order.id, order.currentItem.menuItemId);
    const isCompleting = completingItems.has(itemKey);

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
            <span className="font-semibold">#{order.id.slice(-6)}</span>
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
            {order.currentItem.isAvailable === false && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Menü-Item fehlt
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 ml-7">
            Menge: {order.currentItem.quantity}
          </p>
          {order.currentItem.specialInstructions && (
            <p className="text-sm text-gray-600 ml-7 mt-1">
              Notizen: {order.currentItem.specialInstructions}
            </p>
          )}
          {order.currentItem.description === "Menu item not found" && (
            <p className="text-sm text-orange-600 ml-7 mt-1 font-medium">
              ⚠️ Menü-Item nicht gefunden (ID: {order.currentItem.id})
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          {order.status === "pending" && (
            <button
              onClick={() =>
                handleStartPreparing(order.id, order.currentItem.menuItemId)
              }
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
              onClick={() =>
                handleCompleteItem(order.id, order.currentItem.menuItemId)
              }
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
