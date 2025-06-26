import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { CartItem } from "../types/order";

interface CartState {
  items: CartItem[];
  tableNumber: number | null;
  customerName: string;
  customerPhone: string;
  specialInstructions: string;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_TABLE_NUMBER"; payload: number }
  | { type: "SET_CUSTOMER_INFO"; payload: { name: string; phone: string } }
  | { type: "SET_SPECIAL_INSTRUCTIONS"; payload: string }
  | {
      type: "UPDATE_ITEM_INSTRUCTIONS";
      payload: { id: string; instructions: string };
    }
  | { type: "LOAD_CART"; payload: CartState };

const initialState: CartState = {
  items: [],
  tableNumber: null,
  customerName: "",
  customerPhone: "",
  specialInstructions: "",
};

// Load cart from localStorage
const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem("royal-shisha-cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // Convert date strings back to Date objects
      return {
        ...parsedCart,
        items: parsedCart.items.map((item: any) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        })),
      };
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return initialState;
};

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  try {
    localStorage.setItem("royal-shisha-cart", JSON.stringify(state));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;

  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, action.payload],
        };
      }
      break;
    }

    case "REMOVE_ITEM":
      newState = {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
      break;

    case "UPDATE_QUANTITY":
      newState = {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
      break;

    case "CLEAR_CART":
      newState = {
        ...state,
        items: [],
        tableNumber: null,
        customerName: "",
        customerPhone: "",
        specialInstructions: "",
      };
      break;

    case "SET_TABLE_NUMBER":
      newState = {
        ...state,
        tableNumber: action.payload,
      };
      break;

    case "SET_CUSTOMER_INFO":
      newState = {
        ...state,
        customerName: action.payload.name,
        customerPhone: action.payload.phone,
      };
      break;

    case "SET_SPECIAL_INSTRUCTIONS":
      newState = {
        ...state,
        specialInstructions: action.payload,
      };
      break;

    case "UPDATE_ITEM_INSTRUCTIONS":
      newState = {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, specialInstructions: action.payload.instructions }
            : item
        ),
      };
      break;

    case "LOAD_CART":
      newState = action.payload;
      break;

    default:
      return state;
  }

  // Save to localStorage after every state change
  saveCartToStorage(newState);
  return newState;
};

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setTableNumber: (tableNumber: number) => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setSpecialInstructions: (instructions: string) => void;
  updateItemInstructions: (id: string, instructions: string) => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    if (
      savedCart.items.length > 0 ||
      savedCart.tableNumber ||
      savedCart.customerName ||
      savedCart.customerPhone ||
      savedCart.specialInstructions
    ) {
      dispatch({ type: "LOAD_CART", payload: savedCart });
    }
  }, []);

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const setTableNumber = (tableNumber: number) => {
    dispatch({ type: "SET_TABLE_NUMBER", payload: tableNumber });
  };

  const setCustomerInfo = (name: string, phone: string) => {
    dispatch({ type: "SET_CUSTOMER_INFO", payload: { name, phone } });
  };

  const setSpecialInstructions = (instructions: string) => {
    dispatch({ type: "SET_SPECIAL_INSTRUCTIONS", payload: instructions });
  };

  const updateItemInstructions = (id: string, instructions: string) => {
    dispatch({
      type: "UPDATE_ITEM_INSTRUCTIONS",
      payload: { id, instructions },
    });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setTableNumber,
    setCustomerInfo,
    setSpecialInstructions,
    updateItemInstructions,
    getTotalItems,
    getTotalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
