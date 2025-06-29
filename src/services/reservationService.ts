import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  UpdateData,
} from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import {
  Reservation,
  ReservationFormData,
  ReservationFilters,
  ReservationStats,
  AvailabilityCheck,
  AvailableTable,
  Table,
  TimeSlot,
} from '../types/reservation';

const RESERVATIONS_COLLECTION = 'reservations';
const TABLES_COLLECTION = 'tables';
const TIME_SLOTS_COLLECTION = 'timeSlots';

export class ReservationService {
  // Create a new reservation
  static async createReservation(
    reservationData: ReservationFormData,
    userId: string
  ): Promise<string> {
    try {
      const db = getFirestoreDB();
      
      // Get table details
      const tableDoc = await getDoc(doc(db, TABLES_COLLECTION, reservationData.tableId!));
      if (!tableDoc.exists()) {
        throw new Error('Table not found');
      }
      const table = { id: tableDoc.id, ...tableDoc.data() } as Table;

      // Check availability one more time
      const isAvailable = await this.checkTableAvailability(
        reservationData.tableId!,
        new Date(reservationData.date),
        reservationData.timeSlot
      );

      if (!isAvailable) {
        throw new Error('Table is no longer available for the selected time');
      }

      // Calculate pricing (base price + location multiplier)
      const basePrice = 25; // Base reservation fee
      const totalAmount = basePrice * table.priceMultiplier;

      const reservation: Omit<Reservation, 'id'> = {
        tableId: reservationData.tableId!,
        tableNumber: table.number,
        userId,
        customerName: reservationData.customerName,
        customerEmail: reservationData.customerEmail,
        customerPhone: reservationData.customerPhone,
        date: Timestamp.fromDate(new Date(reservationData.date)) as unknown as Date,
        timeSlot: reservationData.timeSlot,
        startTime: reservationData.timeSlot.split('-')[0],
        endTime: reservationData.timeSlot.split('-')[1],
        partySize: reservationData.partySize,
        status: 'pending',
        specialRequests: reservationData.specialRequests,
        totalAmount,
        preOrderItems: reservationData.preOrderItems || [],
        createdAt: Timestamp.now() as unknown as Date,
        updatedAt: Timestamp.now() as unknown as Date,
      };

      const docRef = await addDoc(collection(db, RESERVATIONS_COLLECTION), reservation);
      
      // Send confirmation email/notification here if needed
      console.log('Reservation created:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  // Get all reservations with optional filters
  static async getReservations(filters?: ReservationFilters): Promise<Reservation[]> {
    try {
      const db = getFirestoreDB();
      let q = query(collection(db, RESERVATIONS_COLLECTION), orderBy('date', 'desc'));

      // Apply filters
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.date) {
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);
        
        q = query(q, 
          where('date', '>=', Timestamp.fromDate(startOfDay)),
          where('date', '<=', Timestamp.fromDate(endOfDay))
        );
      }
      if (filters?.tableNumber) {
        q = query(q, where('tableNumber', '==', filters.tableNumber));
      }

      const querySnapshot = await getDocs(q);
      let reservations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          confirmedAt: data.confirmedAt?.toDate(),
          cancelledAt: data.cancelledAt?.toDate(),
          noShowAt: data.noShowAt?.toDate(),
        } as Reservation;
      });

      // Apply client-side filters
      if (filters?.customerName) {
        const searchTerm = filters.customerName.toLowerCase();
        reservations = reservations.filter(r => 
          r.customerName.toLowerCase().includes(searchTerm)
        );
      }
      if (filters?.partySize) {
        reservations = reservations.filter(r => r.partySize === filters.partySize);
      }
      if (filters?.dateRange) {
        reservations = reservations.filter(r => 
          r.date >= filters.dateRange!.start && r.date <= filters.dateRange!.end
        );
      }

      return reservations;
    } catch (error) {
      console.error('Error getting reservations:', error);
      throw error;
    }
  }

  // Get user's reservations
  static async getUserReservations(userId: string): Promise<Reservation[]> {
    try {
      const db = getFirestoreDB();
      const q = query(
        collection(db, RESERVATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          confirmedAt: data.confirmedAt?.toDate(),
          cancelledAt: data.cancelledAt?.toDate(),
          noShowAt: data.noShowAt?.toDate(),
        } as Reservation;
      });
    } catch (error) {
      console.error('Error getting user reservations:', error);
      throw error;
    }
  }

  // Update reservation status
  static async updateReservationStatus(
    reservationId: string, 
    status: Reservation['status'],
    notes?: string
  ): Promise<void> {
    try {
      const db = getFirestoreDB();
      const updateData: UpdateData<Reservation> = {
        status,
        updatedAt: Timestamp.now() as unknown as Date,
      };

      if (notes) {
        updateData.notes = notes;
      }

      // Add timestamp for specific status changes
      if (status === 'confirmed') {
        updateData.confirmedAt = Timestamp.now() as unknown as Date;
      } else if (status === 'cancelled') {
        updateData.cancelledAt = Timestamp.now() as unknown as Date;
      } else if (status === 'no_show') {
        updateData.noShowAt = Timestamp.now() as unknown as Date;
      }

      await updateDoc(doc(db, RESERVATIONS_COLLECTION, reservationId), updateData);
    } catch (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }
  }

  // Cancel reservation
  static async cancelReservation(reservationId: string, reason?: string): Promise<void> {
    try {
      await this.updateReservationStatus(reservationId, 'cancelled', reason);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  }

  // Check table availability
  static async checkTableAvailability(
    tableId: string,
    date: Date,
    timeSlot: string
  ): Promise<boolean> {
    try {
      const db = getFirestoreDB();
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, RESERVATIONS_COLLECTION),
        where('tableId', '==', tableId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        where('timeSlot', '==', timeSlot),
        where('status', 'in', ['pending', 'confirmed', 'seated'])
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking table availability:', error);
      return false;
    }
  }

  // Get available tables for a specific date and time
  static async getAvailableTables(check: AvailabilityCheck): Promise<AvailableTable[]> {
    try {
      const db = getFirestoreDB();
      
      // Get all active tables
      const tablesQuery = query(
        collection(db, TABLES_COLLECTION),
        where('isActive', '==', true),
        where('capacity', '>=', check.partySize)
      );
      
      const tablesSnapshot = await getDocs(tablesQuery);
      const tables = tablesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Table[];

      // Filter by location if specified
      const filteredTables = check.preferredLocation 
        ? tables.filter(t => t.location === check.preferredLocation)
        : tables;

      // Check availability for each table
      const availableTables: AvailableTable[] = [];
      
      for (const table of filteredTables) {
        const isAvailable = await this.checkTableAvailability(
          table.id,
          check.date,
          check.timeSlot
        );

        const basePrice = 25;
        const price = basePrice * table.priceMultiplier;

        availableTables.push({
          table,
          timeSlot: check.timeSlot,
          available: isAvailable,
          price,
        });
      }

      return availableTables.sort((a, b) => a.table.number - b.table.number);
    } catch (error) {
      console.error('Error getting available tables:', error);
      throw error;
    }
  }

  // Get reservation statistics
  static async getReservationStats(): Promise<ReservationStats> {
    try {
      const reservations = await this.getReservations();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayReservations = reservations.filter(r => 
        r.date >= today && r.date < tomorrow
      );

      const upcomingReservations = reservations.filter(r => 
        r.date >= today && ['pending', 'confirmed'].includes(r.status)
      );

      const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
      const pendingReservations = reservations.filter(r => r.status === 'pending');
      const cancelledReservations = reservations.filter(r => r.status === 'cancelled');
      const noShowReservations = reservations.filter(r => r.status === 'no_show');

      const noShowRate = reservations.length > 0 
        ? (noShowReservations.length / reservations.length) * 100 
        : 0;

      const averagePartySize = reservations.length > 0
        ? reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length
        : 0;

      // Calculate popular time slots
      const timeSlotCounts = reservations.reduce((acc, r) => {
        acc[r.timeSlot] = (acc[r.timeSlot] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const popularTimeSlots = Object.entries(timeSlotCounts)
        .map(([slot, count]) => ({ slot, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate table utilization
      const tableUtilization = reservations.reduce((acc, r) => {
        const existing = acc.find(t => t.tableNumber === r.tableNumber);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ tableNumber: r.tableNumber, count: 1 });
        }
        return acc;
      }, [] as { tableNumber: number; count: number }[]);

      const tableUtilizationRates = tableUtilization.map(t => ({
        tableNumber: t.tableNumber,
        utilizationRate: (t.count / reservations.length) * 100,
      }));

      const revenue = reservations
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

      return {
        totalReservations: reservations.length,
        todayReservations: todayReservations.length,
        upcomingReservations: upcomingReservations.length,
        confirmedReservations: confirmedReservations.length,
        pendingReservations: pendingReservations.length,
        cancelledReservations: cancelledReservations.length,
        noShowRate: Math.round(noShowRate * 10) / 10,
        averagePartySize: Math.round(averagePartySize * 10) / 10,
        popularTimeSlots,
        tableUtilization: tableUtilizationRates,
        revenue,
        occupancyRate: reservations.length > 0 ? (confirmedReservations.length / reservations.length) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting reservation stats:', error);
      throw error;
    }
  }

  // Real-time listener for reservations
  static onReservationsChange(
    callback: (reservations: Reservation[]) => void,
    filters?: ReservationFilters
  ): () => void {
    const db = getFirestoreDB();
    let q = query(collection(db, RESERVATIONS_COLLECTION), orderBy('date', 'desc'));

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reservations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          confirmedAt: data.confirmedAt?.toDate(),
          cancelledAt: data.cancelledAt?.toDate(),
          noShowAt: data.noShowAt?.toDate(),
        } as Reservation;
      });
      callback(reservations);
    });

    return unsubscribe;
  }

  // Initialize sample tables (for development)
  static async initializeSampleTables(): Promise<void> {
    try {
      const db = getFirestoreDB();
      const batch = writeBatch(db);

      const sampleTables: Omit<Table, 'id'>[] = [
        { number: 1, capacity: 2, location: 'indoor', amenities: ['smoking_area'], isActive: true, priceMultiplier: 1.0 },
        { number: 2, capacity: 4, location: 'indoor', amenities: ['smoking_area'], isActive: true, priceMultiplier: 1.0 },
        { number: 3, capacity: 6, location: 'indoor', amenities: ['smoking_area', 'private'], isActive: true, priceMultiplier: 1.2 },
        { number: 4, capacity: 2, location: 'outdoor', amenities: ['smoking_area', 'view'], isActive: true, priceMultiplier: 1.1 },
        { number: 5, capacity: 4, location: 'outdoor', amenities: ['smoking_area', 'view'], isActive: true, priceMultiplier: 1.1 },
        { number: 6, capacity: 8, location: 'vip', amenities: ['smoking_area', 'private', 'bar_access'], isActive: true, priceMultiplier: 1.5 },
        { number: 7, capacity: 4, location: 'terrace', amenities: ['smoking_area', 'view'], isActive: true, priceMultiplier: 1.3 },
        { number: 8, capacity: 6, location: 'terrace', amenities: ['smoking_area', 'view', 'private'], isActive: true, priceMultiplier: 1.4 },
      ];

      sampleTables.forEach((table) => {
        const docRef = doc(collection(db, TABLES_COLLECTION));
        batch.set(docRef, table);
      });

      await batch.commit();
      console.log('Sample tables initialized');
    } catch (error) {
      console.error('Error initializing sample tables:', error);
      throw error;
    }
  }

  // Initialize sample time slots
  static async initializeSampleTimeSlots(): Promise<void> {
    try {
      const db = getFirestoreDB();
      const batch = writeBatch(db);

      const sampleTimeSlots: Omit<TimeSlot, 'id'>[] = [
        { startTime: '17:00', endTime: '19:00', duration: 120, isActive: true, maxReservations: 20 },
        { startTime: '19:00', endTime: '21:00', duration: 120, isActive: true, maxReservations: 20 },
        { startTime: '21:00', endTime: '23:00', duration: 120, isActive: true, maxReservations: 20 },
        { startTime: '23:00', endTime: '01:00', duration: 120, isActive: true, maxReservations: 15 },
      ];

      sampleTimeSlots.forEach((slot) => {
        const docRef = doc(collection(db, TIME_SLOTS_COLLECTION));
        batch.set(docRef, slot);
      });

      await batch.commit();
      console.log('Sample time slots initialized');
    } catch (error) {
      console.error('Error initializing sample time slots:', error);
      throw error;
    }
  }

  // Get all tables
  static async getTables(): Promise<Table[]> {
    try {
      const db = getFirestoreDB();
      const q = query(collection(db, TABLES_COLLECTION), orderBy('number', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Table[];
    } catch (error) {
      console.error('Error getting tables:', error);
      throw error;
    }
  }

  // Get all time slots
  static async getTimeSlots(): Promise<TimeSlot[]> {
    try {
      const db = getFirestoreDB();
      const q = query(collection(db, TIME_SLOTS_COLLECTION), orderBy('startTime', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeSlot[];
    } catch (error) {
      console.error('Error getting time slots:', error);
      throw error;
    }
  }
} 