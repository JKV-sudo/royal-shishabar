import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Phone,
  Hash,
  Crown,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
// import { OrderService } from "../../services/orderService"; // May be needed for fallback
import {
  ReservationOrderIntegrationService,
  ReservationOrderLink,
} from "../../services/reservationOrderIntegrationService";
import { ReservationService } from "../../services/reservationService";
import { Order, LoyaltyDiscount } from "../../types/order";
import LoyaltyOrderIntegration from "../loyalty/LoyaltyOrderIntegration";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const {
    state,
    removeItem,
    updateQuantity,
    clearCart,
    setTableNumber,
    setCustomerInfo,
    setSpecialInstructions,
    getTotalAmount,
  } = useCart();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] =
    useState<LoyaltyDiscount | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [reservationContext, setReservationContext] =
    useState<ReservationOrderLink | null>(null);
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  const [autoReservationChecked, setAutoReservationChecked] = useState(false);

  // Auto-detect user's active reservation when cart opens
  useEffect(() => {
    const checkUserReservation = async () => {
      if (!user || !isOpen || autoReservationChecked) return;

      setIsLoadingReservation(true);
      setAutoReservationChecked(true);

      try {
        const activeReservation =
          await ReservationService.getUserActiveReservation(user.id);

        if (activeReservation) {
          // Auto-populate reservation context with proper null checks
          const reservationLink: ReservationOrderLink = {
            reservation: activeReservation,
            customerInfo: {
              name: activeReservation.customerName || "",
              email: activeReservation.customerEmail || "",
              phone: activeReservation.customerPhone || "",
            },
            preOrderItems: activeReservation.preOrderItems || [],
          };

          setReservationContext(reservationLink);
          setTableNumber(activeReservation.tableNumber);
          setCustomerInfo(
            activeReservation.customerName,
            activeReservation.customerPhone
          );

          toast.success(
            `Automatisch verbunden mit Ihrer Reservierung für Tisch ${activeReservation.tableNumber}!`
          );
        }
      } catch (error) {
        console.error("Error checking user reservation:", error);
      } finally {
        setIsLoadingReservation(false);
      }
    };

    checkUserReservation();
  }, [user, isOpen, autoReservationChecked, setTableNumber, setCustomerInfo]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleLoyaltyApplied = (
    discount: number,
    loyaltyCardId: string,
    verificationCode: string
  ) => {
    const loyaltyData: LoyaltyDiscount = {
      amount: discount,
      loyaltyCardId,
      customerPhone: state.customerPhone,
      freeShishasRedeemed: 1, // This could be calculated based on the discount
      verificationCode,
      isVerified: false,
      appliedAt: new Date(),
    };

    setLoyaltyDiscount(loyaltyData);
    setDiscountAmount(discount);
  };

  const getFinalTotal = () => {
    return Math.max(0, getTotalAmount() - discountAmount);
  };

  // Check for active reservation when table number changes
  const checkForReservation = async (tableNumber: number) => {
    if (!tableNumber || tableNumber <= 0) {
      setReservationContext(null);
      return;
    }

    setIsLoadingReservation(true);
    try {
      const context =
        await ReservationOrderIntegrationService.getTableContextForOrdering(
          tableNumber
        );

      if (context.hasActiveReservation && context.reservationInfo) {
        setReservationContext(context.reservationInfo);

        // Auto-populate customer information from reservation
        if (context.suggestedCustomerInfo) {
          setCustomerInfo(
            context.suggestedCustomerInfo.name,
            context.suggestedCustomerInfo.phone
          );
        }

        toast.success(
          `Reservierung gefunden für ${context.suggestedCustomerInfo?.name}! Kundendaten wurden automatisch ausgefüllt.`
        );
      } else {
        setReservationContext(null);
      }
    } catch (error) {
      console.error("Error checking for reservation:", error);
      setReservationContext(null);
    } finally {
      setIsLoadingReservation(false);
    }
  };

  // Enhanced table number handler
  const handleTableNumberChange = (tableNumber: number) => {
    setTableNumber(tableNumber);
    checkForReservation(tableNumber);
  };

  const handleSubmitOrder = async () => {
    if (!state.tableNumber) {
      toast.error("Bitte geben Sie eine Tischnummer ein");
      return;
    }

    if (state.items.length === 0) {
      toast.error("Ihr Warenkorb ist leer");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build order data with careful null/undefined checks
      const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
        tableNumber: state.tableNumber,
        items: state.items,
        totalAmount: getFinalTotal(),
        status: "pending",
        orderType: reservationContext ? "reservation" : "walk-in",
        payment: {
          status: "unpaid" as const,
          amount: getFinalTotal(),
        },
      };

      // Add optional fields only if they have valid values
      if (state.customerName && state.customerName.trim()) {
        orderData.customerName = state.customerName.trim();
      }

      if (state.customerPhone && state.customerPhone.trim()) {
        orderData.customerPhone = state.customerPhone.trim();
      }

      // For reservation orders, try to get email from reservation context
      if (
        reservationContext &&
        reservationContext.customerInfo.email &&
        reservationContext.customerInfo.email.trim()
      ) {
        orderData.customerEmail = reservationContext.customerInfo.email.trim();
      }

      if (state.specialInstructions && state.specialInstructions.trim()) {
        orderData.specialInstructions = state.specialInstructions.trim();
      }

      if (loyaltyDiscount) {
        orderData.loyaltyDiscount = loyaltyDiscount;
      }

      // Use integration service for reservation-linked orders
      await ReservationOrderIntegrationService.createOrderWithReservation(
        orderData,
        reservationContext?.reservation.id
      );

      const successMessage = reservationContext
        ? `Bestellung erfolgreich für Reservierung von ${reservationContext.customerInfo.name} aufgegeben!`
        : "Bestellung erfolgreich aufgegeben!";

      toast.success(successMessage);
      clearCart();
      setShowCheckout(false);
      setLoyaltyDiscount(null);
      setDiscountAmount(0);
      onClose();
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(
        "Fehler beim Aufgeben der Bestellung. Bitte versuchen Sie es erneut."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Cart Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-royal shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="bg-royal-gradient-gold p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-royal-charcoal" />
                <h2 className="text-xl font-royal font-bold text-royal-charcoal">
                  Warenkorb
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-royal-charcoal/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-royal-charcoal" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {state.items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-700 font-medium mb-2">
                    Ihr Warenkorb ist leer
                  </p>
                  {reservationContext && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-royal-purple/10 border border-royal-purple/20 rounded-royal p-3 mt-4"
                    >
                      <div className="flex items-center justify-center space-x-2 text-royal-purple">
                        <Crown className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Bereit für Tisch{" "}
                          {reservationContext.reservation.tableNumber}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Fügen Sie Artikel aus dem Menü hinzu, um Ihre Bestellung
                        zu starten
                      </p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-royal-charcoal/5 rounded-royal p-3 border border-royal-gold/20"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">
                                {item.name}
                              </h3>
                              {/* Loyalty Badge for Shisha Items */}
                              {(item.category.toLowerCase() === "shisha" ||
                                item.category.toLowerCase() === "tobacco") && (
                                <div className="flex items-center space-x-1 bg-royal-purple text-white px-2 py-1 rounded-full text-xs">
                                  <Crown className="w-3 h-3" />
                                  <span>Loyalty</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 font-medium">
                              {item.category}
                            </p>
                            {item.specialInstructions && (
                              <p className="text-xs text-royal-gold mt-1">
                                Anweisung: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors ml-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="w-6 h-6 rounded-full bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-semibold text-gray-900 w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="w-6 h-6 rounded-full bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-royal-gold">
                            {(item.price * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-royal-gold/20 pt-4">
                    {/* Loyalty Integration */}
                    <LoyaltyOrderIntegration
                      cartItems={state.items}
                      customerPhone={state.customerPhone}
                      customerName={state.customerName}
                      onLoyaltyApplied={handleLoyaltyApplied}
                      showInOrderFlow={showCheckout}
                    />

                    {/* Total Amount */}
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center text-gray-800 font-medium">
                        <span>Zwischensumme:</span>
                        <span>{getTotalAmount().toFixed(2)}€</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-royal-purple font-medium">
                          <span>Loyalty Rabatt:</span>
                          <span>-{discountAmount.toFixed(2)}€</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-royal-gold/20 pt-2">
                        <span>Gesamt:</span>
                        <span className="text-royal-gold">
                          {getFinalTotal().toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Form */}
                  {showCheckout ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 border-t border-royal-gold/20 pt-4"
                    >
                      {reservationContext ? (
                        /* Streamlined form for reservation customers */
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">
                            Bestellung für Ihre Reservierung
                          </h3>

                          {/* Reservation Info Summary */}
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-royal-purple/10 border border-royal-purple/20 rounded-royal p-4"
                          >
                            <div className="flex items-start space-x-3">
                              <Crown className="w-5 h-5 text-royal-purple mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-royal-purple">
                                  {reservationContext.customerInfo.name}
                                </h4>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                                  <div>
                                    📅{" "}
                                    {new Date(
                                      reservationContext.reservation.date
                                    ).toLocaleDateString("de-DE")}
                                  </div>
                                  <div>
                                    🕐{" "}
                                    {reservationContext.reservation.startTime} -{" "}
                                    {reservationContext.reservation.endTime}
                                  </div>
                                  <div>
                                    👥{" "}
                                    {reservationContext.reservation.partySize}{" "}
                                    Personen
                                  </div>
                                  <div>
                                    🪑 Tisch{" "}
                                    {reservationContext.reservation.tableNumber}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* Special Instructions Only */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-800">
                              Besondere Wünsche (optional)
                            </label>
                            <textarea
                              value={state.specialInstructions}
                              onChange={(e) =>
                                setSpecialInstructions(e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-royal bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-colors resize-none"
                              rows={3}
                              placeholder="Zusätzliche Anweisungen für Ihre Bestellung..."
                            />
                            <p className="text-xs text-gray-500">
                              z.B. "Extra scharf", "Ohne Zwiebeln", "Getränke
                              zuerst servieren"
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Full form for walk-in customers */
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">
                            Bestelldetails
                          </h3>

                          {/* Table Number */}
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-800">
                              <Hash className="w-4 h-4" />
                              <span>Tischnummer *</span>
                              {isLoadingReservation && (
                                <div className="w-4 h-4 border-2 border-royal-gold border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={state.tableNumber || ""}
                              onChange={(e) =>
                                handleTableNumberChange(
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full p-3 border border-gray-300 rounded-royal bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-colors"
                              placeholder="z.B. 5"
                              required
                            />
                          </div>

                          {/* Customer Name */}
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-800">
                              <User className="w-4 h-4" />
                              <span>Name (optional)</span>
                            </label>
                            <input
                              type="text"
                              value={state.customerName}
                              onChange={(e) =>
                                setCustomerInfo(
                                  e.target.value,
                                  state.customerPhone
                                )
                              }
                              className="w-full p-3 border border-gray-300 rounded-royal bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-colors"
                              placeholder="Ihr Name"
                            />
                          </div>

                          {/* Customer Phone */}
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-800">
                              <Phone className="w-4 h-4" />
                              <span>Telefon (optional)</span>
                            </label>
                            <input
                              type="tel"
                              value={state.customerPhone}
                              onChange={(e) =>
                                setCustomerInfo(
                                  state.customerName,
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border border-gray-300 rounded-royal bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-colors"
                              placeholder="+49 15781413767"
                            />
                          </div>

                          {/* Special Instructions */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-800">
                              Spezielle Anweisungen (optional)
                            </label>
                            <textarea
                              value={state.specialInstructions}
                              onChange={(e) =>
                                setSpecialInstructions(e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-royal bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-colors resize-none"
                              rows={3}
                              placeholder="Zusätzliche Anweisungen für Ihre Bestellung..."
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCheckout(true)}
                        className="flex-1 bg-royal-gradient-gold text-royal-charcoal font-royal font-bold py-3 px-6 rounded-royal royal-glow hover:shadow-lg transition-all duration-300"
                      >
                        {reservationContext ? "Bestellen" : "Bestellen"}
                      </button>
                      <button
                        onClick={() => {
                          clearCart();
                          setReservationContext(null);
                          setAutoReservationChecked(false);
                        }}
                        className="px-4 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-royal transition-all duration-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Submit Order */}
                  {showCheckout && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || !state.tableNumber}
                      className="w-full bg-royal-gradient-gold text-royal-charcoal font-royal font-bold py-4 px-6 rounded-royal royal-glow hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Bestellung wird aufgegeben..."
                        : "Bestellung aufgeben"}
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Cart;
