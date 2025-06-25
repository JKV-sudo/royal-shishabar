import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDB } from '../config/firebase';
import { Event } from '../types/event';

export interface Popup {
  id?: string;
  type: 'info' | 'alert' | 'promotion' | 'event';
  title: string;
  message: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  expiresAt?: Date;
  priority: number; // Higher number = higher priority
  eventId?: string; // For event-specific popups
  eventData?: Partial<Event>; // Store event details for display
}

export class PopupService {
  private static COLLECTION = 'popups';

  // Create a new popup
  static async createPopup(popup: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const popupData = {
        ...popup,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(getFirestoreDB(), this.COLLECTION), popupData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating popup:', error);
      throw new Error('Failed to create popup');
    }
  }

  // Create an event notification popup
  static async createEventNotification(event: Event): Promise<string> {
    try {
      console.log('PopupService: Creating event notification for event:', event.title);
      const eventDate = new Date(event.date);
      const now = new Date();
      const timeUntilEvent = eventDate.getTime() - now.getTime();
      const daysUntilEvent = Math.ceil(timeUntilEvent / (1000 * 60 * 60 * 24));

      let title = '';
      let message = '';

      if (daysUntilEvent === 0) {
        title = '🎉 Event Tonight!';
        message = `Don't miss ${event.title} happening tonight at ${event.time}!`;
      } else if (daysUntilEvent === 1) {
        title = '📅 Event Tomorrow!';
        message = `${event.title} is happening tomorrow at ${event.time}. Get ready for an amazing time!`;
      } else if (daysUntilEvent <= 7) {
        title = '📅 Upcoming Event!';
        message = `${event.title} is coming up in ${daysUntilEvent} days. Don't miss out!`;
      } else {
        title = '📅 New Event Announced!';
        message = `We're excited to announce ${event.title} on ${eventDate.toLocaleDateString()} at ${event.time}!`;
      }

      console.log('PopupService: Generated title:', title, 'message:', message);

      const popupData: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'event',
        title,
        message,
        isActive: true,
        createdBy: event.createdBy,
        priority: 10, // High priority for event notifications
        expiresAt: new Date(eventDate.getTime() + (24 * 60 * 60 * 1000)), // Expire 24 hours after event
        eventId: event.id,
        eventData: {
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          imageUrl: event.imageUrl,
          category: event.category,
        },
      };

      console.log('PopupService: Popup data to create:', popupData);
      const popupId = await this.createPopup(popupData);
      console.log('PopupService: Event notification created with ID:', popupId);
      return popupId;
    } catch (error) {
      console.error('PopupService: Error creating event notification:', error);
      throw new Error('Failed to create event notification');
    }
  }

  // Create a next upcoming event popup
  static async createUpcomingEventPopup(upcomingEvents: Event[]): Promise<string | null> {
    try {
      if (upcomingEvents.length === 0) {
        return null;
      }

      const nextEvent = upcomingEvents[0];
      const eventDate = new Date(nextEvent.date);
      const now = new Date();
      const timeUntilEvent = eventDate.getTime() - now.getTime();
      const daysUntilEvent = Math.ceil(timeUntilEvent / (1000 * 60 * 60 * 24));

      let title = '';
      let message = '';

      if (daysUntilEvent === 0) {
        title = '🎉 Tonight\'s Event!';
        message = `Join us for ${nextEvent.title} tonight at ${nextEvent.time} - ${nextEvent.location}`;
      } else if (daysUntilEvent === 1) {
        title = '📅 Tomorrow\'s Highlight!';
        message = `${nextEvent.title} tomorrow at ${nextEvent.time}. ${nextEvent.location}`;
      } else {
        title = '📅 Next Upcoming Event!';
        message = `${nextEvent.title} in ${daysUntilEvent} days. ${eventDate.toLocaleDateString()} at ${nextEvent.time}`;
      }

      const popupData: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'event',
        title,
        message,
        isActive: true,
        createdBy: 'system',
        priority: 8, // High priority but lower than new event notifications
        expiresAt: new Date(eventDate.getTime() + (24 * 60 * 60 * 1000)), // Expire 24 hours after event
        eventId: nextEvent.id,
        eventData: {
          title: nextEvent.title,
          date: nextEvent.date,
          time: nextEvent.time,
          location: nextEvent.location,
          imageUrl: nextEvent.imageUrl,
          category: nextEvent.category,
        },
      };

      return this.createPopup(popupData);
    } catch (error) {
      console.error('Error creating upcoming event popup:', error);
      throw new Error('Failed to create upcoming event popup');
    }
  }

  // Get event-specific popups
  static async getEventPopups(): Promise<Popup[]> {
    try {
      const q = query(
        collection(getFirestoreDB(), this.COLLECTION),
        where('type', '==', 'event'),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const popups: Popup[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        popups.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
          expiresAt: data.expiresAt?.toDate(),
          priority: data.priority || 0,
          eventId: data.eventId,
          eventData: data.eventData,
        });
      });

      // Filter out expired popups
      const now = new Date();
      return popups.filter(popup => !popup.expiresAt || popup.expiresAt > now);
    } catch (error) {
      console.error('Error getting event popups:', error);
      throw new Error('Failed to get event popups');
    }
  }

  // Update a popup
  static async updatePopup(id: string, updates: Partial<Popup>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(getFirestoreDB(), this.COLLECTION, id), updateData);
    } catch (error) {
      console.error('Error updating popup:', error);
      throw new Error('Failed to update popup');
    }
  }

  // Delete a popup
  static async deletePopup(id: string): Promise<void> {
    try {
      await deleteDoc(doc(getFirestoreDB(), this.COLLECTION, id));
    } catch (error) {
      console.error('Error deleting popup:', error);
      throw new Error('Failed to delete popup');
    }
  }

  // Get all active popups
  static async getActivePopups(): Promise<Popup[]> {
    try {
      const q = query(
        collection(getFirestoreDB(), this.COLLECTION),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const popups: Popup[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        popups.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
          expiresAt: data.expiresAt?.toDate(),
          priority: data.priority || 0,
          eventId: data.eventId,
          eventData: data.eventData,
        });
      });

      // Filter out expired popups
      const now = new Date();
      return popups.filter(popup => !popup.expiresAt || popup.expiresAt > now);
    } catch (error) {
      console.error('Error getting active popups:', error);
      throw new Error('Failed to get popups');
    }
  }

  // Get all popups (for admin)
  static async getAllPopups(): Promise<Popup[]> {
    try {
      const q = query(
        collection(getFirestoreDB(), this.COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const popups: Popup[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        popups.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
          expiresAt: data.expiresAt?.toDate(),
          priority: data.priority || 0,
          eventId: data.eventId,
          eventData: data.eventData,
        });
      });

      return popups;
    } catch (error) {
      console.error('Error getting all popups:', error);
      throw new Error('Failed to get popups');
    }
  }

  // Listen to active popups in real-time
  static onActivePopupsChange(callback: (popups: Popup[]) => void): () => void {
    console.log('PopupService: Setting up real-time listener');
    const q = query(
      collection(getFirestoreDB(), this.COLLECTION),
      where('isActive', '==', true),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      console.log('PopupService: Received snapshot with', querySnapshot.size, 'documents');
      const popups: Popup[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('PopupService: Processing popup:', doc.id, data);
        popups.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          message: data.message,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
          expiresAt: data.expiresAt?.toDate(),
          priority: data.priority || 0,
          eventId: data.eventId,
          eventData: data.eventData,
        });
      });

      // Filter out expired popups
      const now = new Date();
      const activePopups = popups.filter(popup => !popup.expiresAt || popup.expiresAt > now);
      console.log('PopupService: Filtered to', activePopups.length, 'active popups');
      
      callback(activePopups);
    });
  }

  // Toggle popup active status
  static async togglePopupStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await updateDoc(doc(getFirestoreDB(), this.COLLECTION, id), {
        isActive,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error toggling popup status:', error);
      throw new Error('Failed to update popup status');
    }
  }

  // Create a sample popup (for testing)
  static async createSamplePopup(): Promise<string> {
    const samplePopup: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'promotion',
      title: '🎉 Weekend Special!',
      message: 'Get 20% off on all premium hookah flavors this weekend!',
      isActive: true,
      createdBy: 'admin',
      priority: 1,
    };

    return this.createPopup(samplePopup);
  }
} 