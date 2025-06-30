import React, { useState } from "react";
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
import { OrderService } from "../../services/orderService";
import { Order, LoyaltyDiscount } from "../../types/order";
import LoyaltyOrderIntegration from "../loyalty/LoyaltyOrderIntegration";
import toast from "react-hot-toast";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] =
    useState<LoyaltyDiscount | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

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
      const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
        tableNumber: state.tableNumber,
        items: state.items,
        totalAmount: getFinalTotal(),
        status: "pending",
        ...(state.customerName &&
          state.customerName.trim() && {
            customerName: state.customerName.trim(),
          }),
        ...(state.customerPhone &&
          state.customerPhone.trim() && {
            customerPhone: state.customerPhone.trim(),
          }),
        ...(state.specialInstructions &&
          state.specialInstructions.trim() && {
            specialInstructions: state.specialInstructions.trim(),
          }),
        ...(loyaltyDiscount && { loyaltyDiscount }),
      };

      await OrderService.createOrder(orderData);

      toast.success("Bestellung erfolgreich aufgegeben!");
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
                  <ShoppingCart className="w-16 h-16 mx-auto text-royal-charcoal/30 mb-4" />
                  <p className="text-royal-charcoal/70">
                    Ihr Warenkorb ist leer
                  </p>
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
                              <h3 className="font-semibold text-royal-charcoal">
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
                            <p className="text-sm text-royal-charcoal/70">
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
                            <span className="font-semibold text-royal-charcoal w-8 text-center">
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
                      <div className="flex justify-between items-center text-royal-charcoal">
                        <span>Zwischensumme:</span>
                        <span>{getTotalAmount().toFixed(2)}€</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-royal-purple">
                          <span>Loyalty Rabatt:</span>
                          <span>-{discountAmount.toFixed(2)}€</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold text-royal-charcoal border-t border-royal-gold/20 pt-2">
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
                      <h3 className="font-semibold text-royal-charcoal">
                        Bestelldetails
                      </h3>

                      {/* Table Number */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-royal-charcoal">
                          <Hash className="w-4 h-4" />
                          <span>Tischnummer *</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={state.tableNumber || ""}
                          onChange={(e) =>
                            setTableNumber(parseInt(e.target.value) || 0)
                          }
                          className="w-full p-3 border border-royal-gold/30 rounded-royal bg-white text-royal-charcoal focus:outline-none focus:ring-2 focus:ring-royal-gold/50"
                          placeholder="z.B. 5"
                          required
                        />
                      </div>

                      {/* Customer Name */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-royal-charcoal">
                          <User className="w-4 h-4" />
                          <span>Name (optional)</span>
                        </label>
                        <input
                          type="text"
                          value={state.customerName}
                          onChange={(e) =>
                            setCustomerInfo(e.target.value, state.customerPhone)
                          }
                          className="w-full p-3 border border-royal-gold/30 rounded-royal bg-white text-royal-charcoal focus:outline-none focus:ring-2 focus:ring-royal-gold/50"
                          placeholder="Ihr Name"
                        />
                      </div>

                      {/* Customer Phone */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-royal-charcoal">
                          <Phone className="w-4 h-4" />
                          <span>Telefon (optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={state.customerPhone}
                          onChange={(e) =>
                            setCustomerInfo(state.customerName, e.target.value)
                          }
                          className="w-full p-3 border border-royal-gold/30 rounded-royal bg-white text-royal-charcoal focus:outline-none focus:ring-2 focus:ring-royal-gold/50"
                          placeholder="+49 15781413767"
                        />
                      </div>

                      {/* Special Instructions */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-royal-charcoal">
                          Spezielle Anweisungen (optional)
                        </label>
                        <textarea
                          value={state.specialInstructions}
                          onChange={(e) =>
                            setSpecialInstructions(e.target.value)
                          }
                          className="w-full p-3 border border-royal-gold/30 rounded-royal bg-white text-royal-charcoal focus:outline-none focus:ring-2 focus:ring-royal-gold/50 resize-none"
                          rows={3}
                          placeholder="Zusätzliche Anweisungen für Ihre Bestellung..."
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCheckout(true)}
                        className="flex-1 bg-royal-gradient-gold text-royal-charcoal font-royal font-bold py-3 px-6 rounded-royal royal-glow hover:shadow-lg transition-all duration-300"
                      >
                        Zur Kasse
                      </button>
                      <button
                        onClick={clearCart}
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
