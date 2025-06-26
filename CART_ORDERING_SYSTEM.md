# Cart & Ordering System

## Overview

The Royal Shisha Bar now includes a complete cart and ordering system that allows customers to:
- Add menu items to their cart
- Specify quantities and special instructions
- Provide table number and customer information
- Submit orders that appear in the admin panel

## Features

### Customer Features

1. **Add to Cart**
   - Quantity selector (1-10 items)
   - Special instructions for each item
   - Real-time price calculation
   - Visual feedback when items are added

2. **Cart Management**
   - View all items in cart
   - Modify quantities
   - Remove items
   - Clear entire cart
   - Real-time total calculation

3. **Checkout Process**
   - Table number input (required)
   - Customer name (optional)
   - Phone number (optional)
   - Special instructions for entire order
   - Order submission with confirmation

4. **Cart Button**
   - Fixed position on mobile (bottom-right)
   - Header position on desktop
   - Item count badge
   - One-click cart access

### Admin Features

1. **Order Management**
   - View all orders in real-time
   - Filter by status, table number, or search
   - Update order status (pending → confirmed → preparing → ready → delivered)
   - Delete orders
   - View detailed order information

2. **Order Statistics**
   - Total orders count
   - Orders by status
   - Total revenue
   - Average order value
   - Real-time updates

3. **Order Details**
   - Complete order information
   - Customer details
   - Item breakdown with quantities and prices
   - Special instructions
   - Order timestamps

## Technical Implementation

### Components

1. **CartContext** (`src/contexts/CartContext.tsx`)
   - Global cart state management
   - Cart actions (add, remove, update, clear)
   - Customer information management
   - Total calculations

2. **AddToCart** (`src/components/common/AddToCart.tsx`)
   - Quantity selector
   - Special instructions input
   - Add to cart functionality
   - Price display

3. **Cart** (`src/components/common/Cart.tsx`)
   - Cart modal display
   - Item management
   - Checkout form
   - Order submission

4. **CartButton** (`src/components/common/CartButton.tsx`)
   - Cart access button
   - Item count badge
   - Responsive positioning

5. **OrderManagement** (`src/components/admin/OrderManagement.tsx`)
   - Admin order interface
   - Order filtering and search
   - Status management
   - Statistics display

### Services

1. **OrderService** (`src/services/orderService.ts`)
   - Firebase CRUD operations
   - Real-time listeners
   - Order statistics
   - Filter functionality

### Types

1. **Order Types** (`src/types/order.ts`)
   - CartItem interface
   - Order interface
   - OrderStatus enum
   - OrderStats interface
   - OrderFilters interface

## Database Structure

### Orders Collection

```typescript
interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletionTime?: Date;
  completedAt?: Date;
}
```

### CartItem Interface

```typescript
interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  specialInstructions?: string;
}
```

## Order Status Flow

1. **pending** - Order submitted by customer
2. **confirmed** - Order confirmed by staff
3. **preparing** - Order being prepared
4. **ready** - Order ready for delivery
5. **delivered** - Order delivered to customer
6. **cancelled** - Order cancelled

## Usage Instructions

### For Customers

1. **Adding Items to Cart**
   - Navigate to the Menu page
   - Select quantity for desired item
   - Add special instructions if needed
   - Click "Zum Warenkorb hinzufügen"

2. **Managing Cart**
   - Click cart button (mobile: bottom-right, desktop: header)
   - Modify quantities or remove items
   - Click "Zur Kasse" to proceed

3. **Checkout**
   - Enter table number (required)
   - Optionally provide name and phone
   - Add special instructions for entire order
   - Click "Bestellung aufgeben"

### For Admins

1. **Accessing Orders**
   - Log in as admin
   - Navigate to Admin panel
   - Click "Orders" tab

2. **Managing Orders**
   - View all orders in real-time
   - Use filters to find specific orders
   - Update status using dropdown
   - View details by clicking eye icon
   - Delete orders if needed

3. **Monitoring Statistics**
   - View order statistics at top of page
   - Monitor revenue and order counts
   - Track order status distribution

## Security

- Orders are stored in Firebase Firestore
- Firestore rules ensure proper access control
- Only authenticated users can submit orders
- Only admins can manage orders
- Customer data is optional and minimal

## Future Enhancements

1. **Payment Integration**
   - Online payment processing
   - Payment status tracking
   - Receipt generation

2. **Order Notifications**
   - Email/SMS confirmations
   - Status update notifications
   - Order ready alerts

3. **Advanced Features**
   - Order history for customers
   - Favorite orders
   - Reorder functionality
   - Delivery tracking

4. **Analytics**
   - Popular items tracking
   - Peak ordering times
   - Customer behavior analysis
   - Revenue forecasting 