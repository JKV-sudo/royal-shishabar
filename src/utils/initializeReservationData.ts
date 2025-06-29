import { ReservationService } from '../services/reservationService';
import { toast } from 'react-hot-toast';

export const initializeReservationData = async (): Promise<boolean> => {
  try {
    console.log('Initializing reservation system data...');
    
    // Initialize sample tables
    await ReservationService.initializeSampleTables();
    console.log('Sample tables initialized');
    
    // Initialize sample time slots
    await ReservationService.initializeSampleTimeSlots();
    console.log('Sample time slots initialized');
    
    toast.success('Reservation system initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing reservation data:', error);
    toast.error('Failed to initialize reservation system');
    return false;
  }
};

// Function to check if data is already initialized
export const checkReservationDataExists = async (): Promise<boolean> => {
  try {
    const tables = await ReservationService.getTables();
    const timeSlots = await ReservationService.getTimeSlots();
    
    return tables.length > 0 && timeSlots.length > 0;
  } catch (error) {
    console.error('Error checking reservation data:', error);
    return false;
  }
};

// Auto-initialize if data doesn't exist
export const autoInitializeReservationData = async (): Promise<void> => {
  try {
    const dataExists = await checkReservationDataExists();
    
    if (!dataExists) {
      console.log('No reservation data found, initializing...');
      await initializeReservationData();
    } else {
      console.log('Reservation data already exists');
    }
  } catch (error) {
    console.error('Error in auto-initialization:', error);
  }
}; 