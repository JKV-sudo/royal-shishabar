import React from "react";

interface AddToCartProps {
  item: any;
  onAdd?: () => void;
}

const AddToCart: React.FC<AddToCartProps> = ({ item: _item, onAdd }) => {
  return (
    <button
      onClick={onAdd}
      className="px-4 py-2 bg-royal-gold text-royal-charcoal font-semibold rounded-lg hover:bg-royal-gold/90 transition-colors"
    >
      Add to Cart
    </button>
  );
};

export default AddToCart;
