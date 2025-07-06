import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import toast from 'react-hot-toast';

interface Table {
  number: number;
  seats: number;
  location: 'Innenbereich' | 'Außenbereich';
  isActive: boolean;
}

interface TimeSlot {
  slot: string;
  displayName: string;
  isActive: boolean;
  maxDuration: number; // in minutes
}

// Sample tables for the restaurant
const SAMPLE_TABLES: Table[] = [
  // Innenbereich Tables (Indoor)
  { number: 1, seats: 2, location: 'Innenbereich', isActive: true },
  { number: 2, seats: 4, location: 'Innenbereich', isActive: true },
  { number: 3, seats: 4, location: 'Innenbereich', isActive: true },
  { number: 4, seats: 6, location: 'Innenbereich', isActive: true },
  { number: 5, seats: 2, location: 'Innenbereich', isActive: true },
  { number: 6, seats: 4, location: 'Innenbereich', isActive: true },
  { number: 7, seats: 8, location: 'Innenbereich', isActive: true },
  { number: 8, seats: 4, location: 'Innenbereich', isActive: true },
  { number: 9, seats: 6, location: 'Innenbereich', isActive: true },
  { number: 10, seats: 2, location: 'Innenbereich', isActive: true },

  // Außenbereich Tables (Outdoor) - Close earlier
  { number: 11, seats: 4, location: 'Außenbereich', isActive: true },
  { number: 12, seats: 6, location: 'Außenbereich', isActive: true },
  { number: 13, seats: 4, location: 'Außenbereich', isActive: true },
  { number: 14, seats: 8, location: 'Außenbereich', isActive: true },
  { number: 15, seats: 2, location: 'Außenbereich', isActive: true },
];

// Sample time slots
const SAMPLE_TIME_SLOTS: TimeSlot[] = [
  { slot: '17:00-19:00', displayName: '17:00 - 19:00', isActive: true, maxDuration: 120 },
  { slot: '17:30-19:30', displayName: '17:30 - 19:30', isActive: true, maxDuration: 120 },
  { slot: '18:00-20:00', displayName: '18:00 - 20:00', isActive: true, maxDuration: 120 },
  { slot: '18:30-20:30', displayName: '18:30 - 20:30', isActive: true, maxDuration: 120 },
  { slot: '19:00-21:00', displayName: '19:00 - 21:00', isActive: true, maxDuration: 120 },
  { slot: '19:30-21:30', displayName: '19:30 - 21:30', isActive: true, maxDuration: 120 },
  { slot: '20:00-22:00', displayName: '20:00 - 22:00', isActive: true, maxDuration: 120 },
  { slot: '20:30-22:30', displayName: '20:30 - 22:30', isActive: true, maxDuration: 120 },
  { slot: '21:00-23:00', displayName: '21:00 - 23:00', isActive: true, maxDuration: 120 },
  { slot: '21:30-23:30', displayName: '21:30 - 23:30', isActive: true, maxDuration: 120 },
  { slot: '22:00-00:00', displayName: '22:00 - 00:00', isActive: true, maxDuration: 120 },
  { slot: '22:30-00:30', displayName: '22:30 - 00:30', isActive: true, maxDuration: 120 },
  { slot: '23:00-01:00', displayName: '23:00 - 01:00', isActive: true, maxDuration: 120 },
  { slot: '23:30-01:30', displayName: '23:30 - 01:30', isActive: true, maxDuration: 120 },
  { slot: '00:00-02:00', displayName: '00:00 - 02:00', isActive: true, maxDuration: 120 },
  { slot: '00:30-02:30', displayName: '00:30 - 02:30', isActive: true, maxDuration: 120 },
  { slot: '01:00-03:00', displayName: '01:00 - 03:00', isActive: true, maxDuration: 120 },
];

// Initialize sample tables
export const initializeReservationTables = async (): Promise<void> => {
  try {
    const db = getFirestoreDB();
    const tablesCollection = collection(db, 'tables');
    
    // Check if tables already exist
    const existingTables = await getDocs(tablesCollection);
    if (existingTables.size > 0) {
      toast.success('Tables already exist');
      return;
    }

    // Add sample tables
    const promises = SAMPLE_TABLES.map(table => 
      addDoc(tablesCollection, {
        ...table,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    await Promise.all(promises);
    console.log('Sample tables initialized');
  } catch (error) {
    console.error('Error initializing sample tables:', error);
    throw error;
  }
};

// Initialize sample time slots
export const initializeReservationTimeSlots = async (): Promise<void> => {
  try {
    const db = getFirestoreDB();
    const timeSlotsCollection = collection(db, 'timeSlots');
    
    // Check if time slots already exist
    const existingTimeSlots = await getDocs(timeSlotsCollection);
    if (existingTimeSlots.size > 0) {
      toast.success('Time slots already exist');
      return;
    }

    // Add sample time slots
    const promises = SAMPLE_TIME_SLOTS.map(timeSlot => 
      addDoc(timeSlotsCollection, {
        ...timeSlot,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    await Promise.all(promises);
    console.log('Sample time slots initialized');
  } catch (error) {
    console.error('Error initializing sample time slots:', error);
    throw error;
  }
};

// Auto-initialize data on app start (only if collections are empty)
export const autoInitializeReservationData = async (): Promise<void> => {
  try {
    const db = getFirestoreDB();
    
    // Check and initialize tables
    const tablesSnapshot = await getDocs(collection(db, 'tables'));
    if (tablesSnapshot.empty) {
      await initializeReservationTables();
    }
    
    // Check and initialize time slots
    const timeSlotsSnapshot = await getDocs(collection(db, 'timeSlots'));
    if (timeSlotsSnapshot.empty) {
      await initializeReservationTimeSlots();
    }
  } catch (error) {
    console.error('Error auto-initializing reservation data:', error);
    // Don't throw error to prevent app startup issues
  }
}; 