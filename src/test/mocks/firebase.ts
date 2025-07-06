// Firebase mocks for testing admin components
import { vi } from 'vitest';
import { Order } from '../../types/order';
import { Reservation } from '../../types/reservation';
import { MenuItem } from '../../types/menu';
import { TableStatus } from '../../types/tableStatus';

// Mock data generators
export const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'order-123',
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '+49123456789',
  items: [
    {
      id: 'item-1',
      name: 'Test Shisha',
      price: 15.99,
      quantity: 1,
      category: 'shisha',
      description: 'Test shisha flavor'
    }
  ],
  totalAmount: 15.99,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
  tableNumber: 1,
  specialInstructions: '',
  loyaltyCardId: null,
  discountApplied: 0,
  paymentMethod: 'cash',
  isWalkIn: false,
  userId: 'user-123',
  ...overrides
});

export const createMockReservation = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: 'reservation-123',
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '+49123456789',
  date: new Date(),
  startTime: '18:00',
  endTime: '22:00',
  tableNumber: 1,
  partySize: 4,
  status: 'confirmed',
  specialRequests: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-123',
  ...overrides
});

export const createMockMenuItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id: 'menu-item-123',
  name: 'Test Shisha',
  description: 'Test shisha flavor',
  price: 15.99,
  category: 'shisha',
  isAvailable: true,
  isPopular: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockTableStatus = (overrides: Partial<TableStatus> = {}): TableStatus => ({
  table: {
    id: 'table-1',
    number: 1,
    capacity: 4,
    location: 'indoor',
    amenities: ['smoking_area'],
    priceMultiplier: 1.0,
    isActive: true
  },
  reservation: null,
  currentOrder: null,
  status: 'available',
  lastActivity: new Date(),
  ...overrides
});

// Mock Firebase SDK functions
export const createMockFirestore = () => {
  const mockCollection = vi.fn();
  const mockDoc = vi.fn();
  const mockQuery = vi.fn();
  const mockWhere = vi.fn();
  const mockOrderBy = vi.fn();
  const mockLimit = vi.fn();
  const mockOnSnapshot = vi.fn();
  const mockGetDocs = vi.fn();
  const mockGetDoc = vi.fn();
  const mockUpdateDoc = vi.fn();
  const mockDeleteDoc = vi.fn();
  const mockAddDoc = vi.fn();
  const mockWriteBatch = vi.fn();

  // Mock successful responses
  const mockQuerySnapshot = {
    docs: [
      {
        id: 'doc-1',
        data: () => ({ name: 'Test Data' }),
        exists: () => true
      }
    ],
    forEach: vi.fn((callback) => {
      mockQuerySnapshot.docs.forEach(callback);
    }),
    size: 1,
    empty: false
  };

  const mockDocSnapshot = {
    id: 'doc-1',
    data: () => ({ name: 'Test Data' }),
    exists: () => true
  };

  // Configure default mock behaviors
  mockGetDocs.mockResolvedValue(mockQuerySnapshot);
  mockGetDoc.mockResolvedValue(mockDocSnapshot);
  mockUpdateDoc.mockResolvedValue(undefined);
  mockDeleteDoc.mockResolvedValue(undefined);
  mockAddDoc.mockResolvedValue({ id: 'new-doc-id' });
  mockOnSnapshot.mockImplementation((query, callback) => {
    // Simulate real-time update
    setTimeout(() => callback(mockQuerySnapshot), 100);
    return () => {}; // Unsubscribe function
  });

  // Mock batch operations
  const mockBatch = {
    update: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined)
  };
  mockWriteBatch.mockReturnValue(mockBatch);

  return {
    collection: mockCollection,
    doc: mockDoc,
    query: mockQuery,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    onSnapshot: mockOnSnapshot,
    getDocs: mockGetDocs,
    getDoc: mockGetDoc,
    updateDoc: mockUpdateDoc,
    deleteDoc: mockDeleteDoc,
    addDoc: mockAddDoc,
    writeBatch: mockWriteBatch,
    // Mock objects for testing
    mockQuerySnapshot,
    mockDocSnapshot,
    mockBatch
  };
};

// Mock Firebase config
export const mockFirebaseConfig = {
  getFirestoreDB: vi.fn(() => ({}))
};

// Error scenarios for testing
export const createFirebaseError = (code: string, message: string) => ({
  code,
  message,
  name: 'FirebaseError'
});

// Common error scenarios
export const FIREBASE_ERRORS = {
  NETWORK: createFirebaseError('unavailable', 'Network unavailable'),
  PERMISSION_DENIED: createFirebaseError('permission-denied', 'Permission denied'),
  NOT_FOUND: createFirebaseError('not-found', 'Document not found'),
  TIMEOUT: createFirebaseError('timeout', 'Request timeout'),
  INVALID_DATA: createFirebaseError('invalid-argument', 'Invalid data')
};

// Mock service responses
export const createMockServiceResponse = {
  success: (data: any) => ({ success: true, data }),
  error: (error: any) => ({ success: false, error }),
  loading: () => ({ loading: true })
};

// Test utilities for admin components
export const createTestScenarios = {
  // Network failure scenarios
  networkFailure: (mockFirestore: any) => {
    mockFirestore.getDocs.mockRejectedValue(FIREBASE_ERRORS.NETWORK);
    mockFirestore.getDoc.mockRejectedValue(FIREBASE_ERRORS.NETWORK);
    mockFirestore.onSnapshot.mockImplementation((query, callback, errorCallback) => {
      setTimeout(() => errorCallback(FIREBASE_ERRORS.NETWORK), 100);
      return () => {};
    });
  },
  
  // Permission denied scenarios
  permissionDenied: (mockFirestore: any) => {
    mockFirestore.getDocs.mockRejectedValue(FIREBASE_ERRORS.PERMISSION_DENIED);
    mockFirestore.updateDoc.mockRejectedValue(FIREBASE_ERRORS.PERMISSION_DENIED);
    mockFirestore.deleteDoc.mockRejectedValue(FIREBASE_ERRORS.PERMISSION_DENIED);
  },
  
  // Empty data scenarios
  emptyData: (mockFirestore: any) => {
    const emptySnapshot = {
      docs: [],
      forEach: vi.fn(),
      size: 0,
      empty: true
    };
    mockFirestore.getDocs.mockResolvedValue(emptySnapshot);
    mockFirestore.onSnapshot.mockImplementation((query, callback) => {
      setTimeout(() => callback(emptySnapshot), 100);
      return () => {};
    });
  },
  
  // Slow loading scenarios
  slowLoading: (mockFirestore: any, delay: number = 5000) => {
    mockFirestore.getDocs.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, delay))
    );
  }
};

// Mock component props helpers
export const createMockComponentProps = {
  barOperations: () => ({}),
  orderManagement: () => ({}),
  tableManagement: () => ({}),
  liveTableGrid: () => ({
    onTableClick: vi.fn()
  }),
  reservationManagement: () => ({}),
  menuManagement: () => ({}),
  loyaltyManagement: () => ({}),
  popupManagement: () => ({})
};

// Test data sets for different admin components
export const TEST_DATA = {
  orders: [
    createMockOrder({ id: 'order-1', status: 'pending' }),
    createMockOrder({ id: 'order-2', status: 'preparing' }),
    createMockOrder({ id: 'order-3', status: 'ready' }),
    createMockOrder({ id: 'order-4', status: 'delivered' })
  ],
  reservations: [
    createMockReservation({ id: 'res-1', status: 'confirmed' }),
    createMockReservation({ id: 'res-2', status: 'seated' }),
    createMockReservation({ id: 'res-3', status: 'completed' })
  ],
  menuItems: [
    createMockMenuItem({ id: 'item-1', category: 'shisha' }),
    createMockMenuItem({ id: 'item-2', category: 'drinks' }),
    createMockMenuItem({ id: 'item-3', category: 'food' })
  ],
  tableStatuses: [
    createMockTableStatus({ table: { id: 'table-1', number: 1, capacity: 4, location: 'indoor', amenities: ['smoking_area'], priceMultiplier: 1.0, isActive: true }, status: 'available' }),
    createMockTableStatus({ table: { id: 'table-2', number: 2, capacity: 6, location: 'outdoor', amenities: ['smoking_area'], priceMultiplier: 1.0, isActive: true }, status: 'occupied' }),
    createMockTableStatus({ table: { id: 'table-3', number: 3, capacity: 2, location: 'vip', amenities: ['smoking_area', 'private'], priceMultiplier: 1.5, isActive: true }, status: 'reserved' })
  ]
};

export default {
  createMockFirestore,
  createMockOrder,
  createMockReservation,
  createMockMenuItem,
  createMockTableStatus,
  createTestScenarios,
  createMockComponentProps,
  TEST_DATA,
  FIREBASE_ERRORS
}; 