import { EventService } from '../services/eventService';
import { EventFormData } from '../types/event';

export const sampleEvents: EventFormData[] = [
  {
    title: "Live Jazz Night",
    description: "Experience the smooth sounds of live jazz music while enjoying our premium shisha selection. Featuring local jazz artists and special cocktails.",
    date: "2024-02-15",
    time: "20:00",
    location: "Royal Shisha Bar - Main Lounge",
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop",
    price: 25,
    capacity: 50,
    category: "Live Music",
    tags: ["jazz", "live music", "cocktails"]
  },
  {
    title: "Middle Eastern Night",
    description: "Immerse yourself in authentic Middle Eastern culture with traditional music, belly dancing performances, and our signature shisha flavors.",
    date: "2024-02-20",
    time: "19:30",
    location: "Royal Shisha Bar - Terrace",
    imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop",
    price: 30,
    capacity: 40,
    category: "Themed Night",
    tags: ["middle eastern", "belly dance", "traditional"]
  },
  {
    title: "VIP Lounge Experience",
    description: "Exclusive VIP experience with premium shisha, gourmet appetizers, and private seating. Limited availability for our most discerning guests.",
    date: "2024-02-25",
    time: "21:00",
    location: "Royal Shisha Bar - VIP Lounge",
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
    price: 75,
    capacity: 20,
    category: "VIP Event",
    tags: ["vip", "exclusive", "premium"]
  },
  {
    title: "DJ Electronic Night",
    description: "Get ready for an electrifying night with our resident DJ spinning the latest electronic and house music. Special light show included.",
    date: "2024-03-01",
    time: "22:00",
    location: "Royal Shisha Bar - Dance Floor",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    price: 20,
    capacity: 80,
    category: "DJ Night",
    tags: ["electronic", "dj", "dance"]
  },
  {
    title: "Shisha Masterclass",
    description: "Learn the art of shisha preparation from our expert staff. Includes hands-on experience, flavor combinations, and take-home guide.",
    date: "2024-03-05",
    time: "18:00",
    location: "Royal Shisha Bar - Workshop Area",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    price: 45,
    capacity: 15,
    category: "Special Event",
    tags: ["workshop", "learning", "shisha"]
  },
  {
    title: "Sunset Rooftop Gathering",
    description: "Enjoy breathtaking sunset views from our rooftop terrace with light refreshments and our signature shisha blends.",
    date: "2024-03-10",
    time: "18:30",
    location: "Royal Shisha Bar - Rooftop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    price: 15,
    capacity: 35,
    category: "Special Event",
    tags: ["sunset", "rooftop", "relaxing"]
  }
];

export const addSampleEvents = async (adminUserId: string) => {
  try {
    console.log('Adding sample events...');
    
    for (const eventData of sampleEvents) {
      await EventService.createEvent(eventData, adminUserId);
      console.log(`Created event: ${eventData.title}`);
    }
    
    console.log('All sample events created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating sample events:', error);
    return false;
  }
}; 