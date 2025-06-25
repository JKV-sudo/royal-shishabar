import { EventService } from '../services/eventService';
import { PopupService } from '../services/popupService';

class EventNotificationManager {
  private static instance: EventNotificationManager;
  private notificationInterval: NodeJS.Timeout | null = null;
  private lastNotificationTime: Date | null = null;
  private readonly NOTIFICATION_COOLDOWN = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  static getInstance(): EventNotificationManager {
    if (!EventNotificationManager.instance) {
      EventNotificationManager.instance = new EventNotificationManager();
    }
    return EventNotificationManager.instance;
  }

  // Start periodic event notifications
  startPeriodicNotifications(): void {
    if (this.notificationInterval) {
      return; // Already running
    }

    // Check for upcoming events every 5 minutes
    this.notificationInterval = setInterval(async () => {
      await this.checkAndCreateUpcomingEventNotification();
    }, 5 * 60 * 1000); // 5 minutes

    // Initial check
    this.checkAndCreateUpcomingEventNotification();
  }

  // Stop periodic notifications
  stopPeriodicNotifications(): void {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
  }

  // Check and create upcoming event notification if needed
  private async checkAndCreateUpcomingEventNotification(): Promise<void> {
    try {
      const now = new Date();
      
      // Check if enough time has passed since last notification
      if (this.lastNotificationTime && 
          now.getTime() - this.lastNotificationTime.getTime() < this.NOTIFICATION_COOLDOWN) {
        return;
      }

      const upcomingEvents = await EventService.getUpcomingEvents(3);
      
      if (upcomingEvents.length > 0) {
        const nextEvent = upcomingEvents[0];
        const eventDate = new Date(nextEvent.date);
        const timeUntilEvent = eventDate.getTime() - now.getTime();
        const daysUntilEvent = Math.ceil(timeUntilEvent / (1000 * 60 * 60 * 24));

        // Only create notification for events happening soon
        if (daysUntilEvent <= 7) {
          await EventService.createUpcomingEventNotification();
          this.lastNotificationTime = now;
          console.log('Upcoming event notification created');
        }
      }
    } catch (error) {
      console.error('Error checking for upcoming event notifications:', error);
    }
  }

  // Manually trigger upcoming event notification
  async triggerUpcomingEventNotification(): Promise<void> {
    try {
      await EventService.createUpcomingEventNotification();
      this.lastNotificationTime = new Date();
      console.log('Manual upcoming event notification triggered');
    } catch (error) {
      console.error('Error triggering upcoming event notification:', error);
    }
  }

  // Create a test event notification
  async createTestEventNotification(): Promise<void> {
    try {
      console.log('EventNotificationManager: Creating test event notification');
      const testEvent = {
        id: 'test-event',
        title: 'Test Event',
        description: 'This is a test event',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '20:00',
        location: 'Royal Shisha Bar',
        imageUrl: '',
        price: 25,
        capacity: 50,
        isActive: true,
        createdBy: 'test-admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
        category: 'Live Music',
        tags: ['test', 'music'],
      };

      console.log('EventNotificationManager: Test event data:', testEvent);
      await PopupService.createEventNotification(testEvent);
      console.log('EventNotificationManager: Test event notification created successfully');
    } catch (error) {
      console.error('EventNotificationManager: Error creating test event notification:', error);
      throw error;
    }
  }
}

export const eventNotificationManager = EventNotificationManager.getInstance();

// Auto-start notifications when the module is imported
if (typeof window !== 'undefined') {
  // Only start in browser environment
  setTimeout(() => {
    eventNotificationManager.startPeriodicNotifications();
  }, 1000); // Start after 1 second
} 