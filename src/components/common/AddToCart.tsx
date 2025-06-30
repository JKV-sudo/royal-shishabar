import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, ShoppingCart, Crown } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { MenuItem } from "../../types/menu";
import toast from "react-hot-toast";

interface AddToCartProps {
  item: MenuItem;
  onAdd?: () => void;
}

const AddToCart: React.FC<AddToCartProps> = ({ item, onAdd }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Check if this item is loyalty eligible
  const isLoyaltyEligible =
    item.category.toLowerCase() === "shisha" ||
    item.category.toLowerCase() === "tobacco";

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!item.isAvailable) {
      toast.error("Dieses Artikel ist derzeit nicht verfügbar");
      return;
    }

    setIsAdding(true);

    try {
      const cartItem = {
        id: `${item.id}-${Date.now()}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity,
        category: item.category,
        imageUrl: item.imageUrl,
        specialInstructions: specialInstructions.trim() || undefined,
      };

      addItem(cartItem);

      // Visual feedback
      toast.success(
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-4 h-4" />
          <span>{item.name} wurde zum Warenkorb hinzugefügt!</span>
        </div>
      );

      // Reset form
      setQuantity(1);
      setSpecialInstructions("");

      // Call optional callback
      if (onAdd) {
        onAdd();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Fehler beim Hinzufügen zum Warenkorb");
    } finally {
      setIsAdding(false);
    }
  };

  // Don't show button if item is not available
  if (!item.isAvailable) {
    return (
      <button
        disabled
        className="w-full px-4 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed opacity-50"
      >
        Nicht verfügbar
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Loyalty Badge */}
      {isLoyaltyEligible && (
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-1 bg-royal-purple text-white px-3 py-1 rounded-full text-sm">
            <Crown className="w-4 h-4" />
            <span>Sammelt Loyalty Stempel</span>
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
          className="w-8 h-8 rounded-full bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-lg font-semibold text-royal-charcoal w-12 text-center">
          {quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= 10}
          className="w-8 h-8 rounded-full bg-royal-gold/20 text-royal-gold hover:bg-royal-gold/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Special Instructions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-royal-charcoal">
          Spezielle Anweisungen (optional)
        </label>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="z.B. extra scharf, ohne Zwiebeln..."
          className="w-full p-3 border border-royal-gold/30 rounded-royal bg-white text-royal-charcoal focus:outline-none focus:ring-2 focus:ring-royal-gold/50 resize-none"
          rows={2}
          maxLength={200}
        />
      </div>

      {/* Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        disabled={!item.isAvailable || isAdding}
        className="w-full bg-royal-gradient-gold text-royal-charcoal font-royal font-bold py-3 px-6 rounded-royal royal-glow hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAdding ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-royal-charcoal border-t-transparent rounded-full animate-spin"></div>
            <span>Hinzufügen...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>
              Zum Warenkorb hinzufügen ({(item.price * quantity).toFixed(2)}€)
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default AddToCart;
