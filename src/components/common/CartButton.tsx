import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../contexts/CartContext";

interface CartButtonProps {
  onClick: () => void;
  className?: string;
}

const CartButton: React.FC<CartButtonProps> = ({ onClick, className = "" }) => {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative bg-royal-gradient-gold text-royal-charcoal p-3 rounded-royal royal-glow hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <ShoppingCart className="w-6 h-6" />

      {/* Item Count Badge */}
      {itemCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </motion.div>
      )}
    </motion.button>
  );
};

export default CartButton;
