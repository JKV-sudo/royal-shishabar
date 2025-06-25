import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Event, EventFormData, EventFilters, EventStats } from '../types/event';

const EVENTS_COLLECTION = 'events';

export class EventService {
  // Get all events with optional filters
  static async getEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('date', 'desc')];
      
      if (filters?.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }
      
      if (filters?.category) {
        constraints.push(where('category', '==', filters.category));
      }
      
      if (filters?.dateFrom) {
        constraints.push(where('date', '>=', filters.dateFrom));
      }
      
      if (filters?.dateTo) {
        constraints.push(where('date', '<=', filters.dateTo));
      }

      const q = query(collection(db, EVENTS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event);
      });

      // Apply search filter if provided
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        return events.filter(event => 
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)
        );
      }

      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // Get a single event by ID
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  // Create a new event (admin only)
  static async createEvent(eventData: EventFormData, createdBy: string): Promise<string> {
    try {
      const eventDoc = {
        ...eventData,
        date: Timestamp.fromDate(new Date(eventData.date)),
        isActive: true,
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        attendees: [],
      };

      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update an event (admin only)
  static async updateEvent(eventId: string, eventData: Partial<EventFormData>): Promise<void> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      const updateData: any = {
        ...eventData,
        updatedAt: serverTimestamp(),
      };

      if (eventData.date) {
        updateData.date = Timestamp.fromDate(new Date(eventData.date));
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete an event (admin only)
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Toggle event active status (admin only)
  static async toggleEventStatus(eventId: string, isActive: boolean): Promise<void> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      await updateDoc(docRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling event status:', error);
      throw error;
    }
  }

  // Add/remove attendee from event
  static async toggleAttendance(eventId: string, userId: string): Promise<void> {
    try {
      const event = await this.getEventById(eventId);
      if (!event) throw new Error('Event not found');

      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      const attendees = event.attendees || [];
      const isAttending = attendees.includes(userId);

      if (isAttending) {
        // Remove attendee
        const updatedAttendees = attendees.filter(id => id !== userId);
        await updateDoc(docRef, {
          attendees: updatedAttendees,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Add attendee
        const updatedAttendees = [...attendees, userId];
        await updateDoc(docRef, {
          attendees: updatedAttendees,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error toggling attendance:', error);
      throw error;
    }
  }

  // Get upcoming events
  static async getUpcomingEvents(limitCount: number = 5): Promise<Event[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('date', '>=', now),
        where('isActive', '==', true),
        orderBy('date', 'asc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const events: Event[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event);
      });

      return events;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  // Get events created by a specific admin
  static async getEventsByAdmin(adminId: string): Promise<Event[]> {
    try {
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('createdBy', '==', adminId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const events: Event[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event);
      });

      return events;
    } catch (error) {
      console.error('Error fetching admin events:', error);
      throw error;
    }
  }

  // Get event statistics
  static async getEventStats(): Promise<EventStats> {
    try {
      const allEvents = await this.getEvents();
      const now = new Date();
      
      const activeEvents = allEvents.filter(event => event.isActive);
      const upcomingEvents = allEvents.filter(event => 
        event.isActive && event.date > now
      );
      
      const totalAttendees = allEvents.reduce((total, event) => 
        total + (event.attendees?.length || 0), 0
      );

      return {
        totalEvents: allEvents.length,
        activeEvents: activeEvents.length,
        upcomingEvents: upcomingEvents.length,
        totalAttendees,
      };
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    }
  }
} 