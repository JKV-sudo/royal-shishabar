import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { MenuItem } from "../../types/menu";
import { CartItem } from "../../types/order";

interface AddToCartProps {
  item: MenuItem;
  className?: string;
}

const AddToCart: React.FC<AddToCartProps> = ({ item, className = "" }) => {
  const { addItem, state } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showInstructions, setShowInstructions] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const existingCartItem = state.items.find(
    (cartItem) => cartItem.menuItemId === item.id
  );

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`, // Unique ID for cart item
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      category: item.category,
      imageUrl: item.imageUrl,
      specialInstructions: specialInstructions.trim() || undefined,
    };

    addItem(cartItem);
    setQuantity(1);
    setSpecialInstructions("");
    setShowInstructions(false);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quantity Selector */}
      <div className="flex items-center justify-between bg-royal-charcoal/10 rounded-royal p-3">
        <span className="text-sm font-medium text-royal-charcoal">Menge:</span>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="w-8 h-8 rounded-full bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4" />
          </motion.button>

          <span className="w-8 text-center font-bold text-royal-charcoal">
            {quantity}
          </span>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= 10}
            className="w-8 h-8 rounded-full bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Special Instructions */}
      <div className="space-y-2">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-sm text-royal-gold hover:text-royal-gold/80 transition-colors"
        >
          {showInstructions
            ? "Spezielle Anweisungen ausblenden"
            : "Spezielle Anweisungen hinzufügen"}
        </button>

        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="z.B. ohne Eis, extra scharf, etc."
              className="w-full p-3 border border-royal-gold/30 rounded-royal bg-white/50 text-royal-charcoal placeholder-royal-charcoal/50 focus:outline-none focus:ring-2 focus:ring-royal-gold/50 resize-none"
              rows={2}
            />
          </motion.div>
        )}
      </div>

      {/* Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        className="w-full bg-royal-gradient-gold text-royal-charcoal font-royal font-bold py-3 px-6 rounded-royal royal-glow hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <ShoppingCart className="w-5 h-5" />
        <span>
          {existingCartItem
            ? `Hinzufügen (${existingCartItem.quantity} bereits im Warenkorb)`
            : `Zum Warenkorb hinzufügen - ${(item.price * quantity).toFixed(
                2
              )}€`}
        </span>
      </motion.button>

      {/* Price Display */}
      <div className="text-center">
        <span className="text-sm text-royal-charcoal/70">
          Einzelpreis: {item.price.toFixed(2)}€
        </span>
        {quantity > 1 && (
          <div className="text-lg font-bold text-royal-gold">
            Gesamt: {(item.price * quantity).toFixed(2)}€
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToCart;
