import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Check } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { MenuItem } from "../../types/menu";
import { CartItem } from "../../types/order";
import toast from "react-hot-toast";

interface AddToCartProps {
  item: MenuItem;
  onAdd?: () => void;
}

const AddToCart: React.FC<AddToCartProps> = ({ item, onAdd }) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    try {
      // Convert MenuItem to CartItem
      const cartItem: CartItem = {
        id: `${item.id}-${Date.now()}`, // Unique ID for cart item
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        category: item.category,
        imageUrl: item.imageUrl,
      };

      // Add to cart
      addItem(cartItem);

      // Visual feedback
      setIsAdded(true);
      toast.success(`${item.name} zum Warenkorb hinzugefügt!`);

      // Call optional callback
      if (onAdd) {
        onAdd();
      }

      // Reset visual feedback after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Fehler beim Hinzufügen zum Warenkorb");
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
    <motion.button
      onClick={handleAddToCart}
      disabled={isAdded}
      whileHover={{ scale: isAdded ? 1 : 1.02 }}
      whileTap={{ scale: isAdded ? 1 : 0.98 }}
      className={`w-full px-4 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
        isAdded
          ? "bg-green-500 text-white"
          : "bg-royal-gold text-royal-charcoal hover:bg-royal-gold/90 royal-glow"
      }`}
    >
      {isAdded ? (
        <>
          <Check className="w-5 h-5" />
          <span>Hinzugefügt!</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          <span>In den Warenkorb</span>
        </>
      )}
    </motion.button>
  );
};

export default AddToCart;
