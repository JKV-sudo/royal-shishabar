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
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import { Event, EventFormData, EventFilters, EventStats } from '../types/event';
import { PopupService } from './popupService';

const EVENTS_COLLECTION = 'events';

export class EventService {
  // Get all events with optional filters (public access)
  static async getEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
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

      // Only add orderBy if we don't have any where clauses that would require composite indexes
      if (constraints.length === 0) {
        constraints.push(orderBy('date', 'desc'));
      }

      const q = query(collection(getFirestoreDB(), EVENTS_COLLECTION), ...constraints);
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

      // Sort events by date (newest first) if no specific ordering was applied
      if (constraints.length === 0 || !constraints.some(c => c.type === 'orderBy')) {
        events.sort((a, b) => b.date.getTime() - a.date.getTime());
      }

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

  // Get a single event by ID (public access)
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const docRef = doc(getFirestoreDB(), EVENTS_COLLECTION, eventId);
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

      const docRef = await addDoc(collection(getFirestoreDB(), EVENTS_COLLECTION), eventDoc);
      const eventId = docRef.id;

      // Create the full event object for popup notification
      const fullEvent: Event = {
        id: eventId,
        ...eventData,
        date: new Date(eventData.date),
        isActive: true,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
      };

      // Create popup notification for the new event
      try {
        await PopupService.createEventNotification(fullEvent);
        console.log('Event notification popup created successfully');
      } catch (popupError) {
        console.error('Failed to create event notification popup:', popupError);
        // Don't throw error here as the event was created successfully
      }

      return eventId;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update an event (admin only)
  static async updateEvent(eventId: string, eventData: Partial<EventFormData>): Promise<void> {
    try {
      const docRef = doc(getFirestoreDB(), EVENTS_COLLECTION, eventId);
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
      const docRef = doc(getFirestoreDB(), EVENTS_COLLECTION, eventId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Toggle event active status (admin only)
  static async toggleEventStatus(eventId: string, isActive: boolean): Promise<void> {
    try {
      const docRef = doc(getFirestoreDB(), EVENTS_COLLECTION, eventId);
      await updateDoc(docRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling event status:', error);
      throw error;
    }
  }

  // Add/remove attendee from event (requires authentication)
  static async toggleAttendance(eventId: string, userId: string): Promise<void> {
    try {
      const event = await this.getEventById(eventId);
      if (!event) throw new Error('Event not found');

      const docRef = doc(getFirestoreDB(), EVENTS_COLLECTION, eventId);
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

  // Get upcoming events (public access)
  static async getUpcomingEvents(limitCount: number = 5): Promise<Event[]> {
    try {
      const now = new Date();
      const q = query(
        collection(getFirestoreDB(), EVENTS_COLLECTION),
        where('date', '>=', now),
        where('isActive', '==', true)
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

      // Sort by date ascending and limit
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
      return events.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  // Get events created by a specific admin (admin only)
  static async getEventsByAdmin(adminId: string): Promise<Event[]> {
    try {
      const q = query(
        collection(getFirestoreDB(), EVENTS_COLLECTION),
        where('createdBy', '==', adminId)
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

      // Sort by creation date descending
      events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return events;
    } catch (error) {
      console.error('Error fetching admin events:', error);
      throw error;
    }
  }

  // Create upcoming event popup notification
  static async createUpcomingEventNotification(): Promise<void> {
    try {
      const upcomingEvents = await this.getUpcomingEvents(3); // Get next 3 upcoming events
      if (upcomingEvents.length > 0) {
        await PopupService.createUpcomingEventPopup(upcomingEvents);
        console.log('Upcoming event notification popup created successfully');
      }
    } catch (error) {
      console.error('Failed to create upcoming event notification:', error);
      // Don't throw error as this is a background operation
    }
  }

  // Get event statistics (public access)
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