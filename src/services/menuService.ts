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
import { MenuItem, MenuCategory, MENU_CATEGORIES } from '../types/menu';

export class MenuService {
  private static COLLECTION = 'menu_items';

  // Create a new menu item
  static async createMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const itemData = {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(getFirestoreDB(), this.COLLECTION), itemData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw new Error('Failed to create menu item');
    }
  }

  // Get all menu items
  static async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const q = query(
        collection(getFirestoreDB(), this.COLLECTION)
      );

      const querySnapshot = await getDocs(q);
      const items: MenuItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          imageUrl: data.imageUrl,
          isAvailable: data.isAvailable,
          isPopular: data.isPopular || false,
          allergens: data.allergens || [],
          ingredients: data.ingredients || [],
          calories: data.calories,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
        });
      });

      return items.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error getting menu items:', error);
      throw new Error('Failed to get menu items');
    }
  }

  // Get menu items by category
  static async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    try {
      const q = query(
        collection(getFirestoreDB(), this.COLLECTION),
        where('category', '==', category),
        where('isAvailable', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const items: MenuItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          imageUrl: data.imageUrl,
          isAvailable: data.isAvailable,
          isPopular: data.isPopular || false,
          allergens: data.allergens || [],
          ingredients: data.ingredients || [],
          calories: data.calories,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
        });
      });

      return items.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting menu items by category:', error);
      throw new Error('Failed to get menu items by category');
    }
  }

  // Get popular menu items
  static async getPopularMenuItems(): Promise<MenuItem[]> {
    try {
      const q = query(
        collection(getFirestoreDB(), this.COLLECTION),
        where('isPopular', '==', true),
        where('isAvailable', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const items: MenuItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          imageUrl: data.imageUrl,
          isAvailable: data.isAvailable,
          isPopular: data.isPopular || false,
          allergens: data.allergens || [],
          ingredients: data.ingredients || [],
          calories: data.calories,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
        });
      });

      return items.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting popular menu items:', error);
      throw new Error('Failed to get popular menu items');
    }
  }

  // Update a menu item
  static async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
    try {
      const itemRef = doc(getFirestoreDB(), this.COLLECTION, id);
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw new Error('Failed to update menu item');
    }
  }

  // Delete a menu item
  static async deleteMenuItem(id: string): Promise<void> {
    try {
      const itemRef = doc(getFirestoreDB(), this.COLLECTION, id);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw new Error('Failed to delete menu item');
    }
  }

  // Toggle menu item availability
  static async toggleMenuItemAvailability(id: string, isAvailable: boolean): Promise<void> {
    try {
      await this.updateMenuItem(id, { isAvailable });
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      throw new Error('Failed to toggle menu item availability');
    }
  }

  // Toggle menu item popularity
  static async toggleMenuItemPopularity(id: string, isPopular: boolean): Promise<void> {
    try {
      await this.updateMenuItem(id, { isPopular });
    } catch (error) {
      console.error('Error toggling menu item popularity:', error);
      throw new Error('Failed to toggle menu item popularity');
    }
  }

  // Real-time listener for menu items
  static onMenuItemsChange(callback: (items: MenuItem[]) => void): () => void {
    const q = query(
      collection(getFirestoreDB(), this.COLLECTION)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: MenuItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          imageUrl: data.imageUrl,
          isAvailable: data.isAvailable,
          isPopular: data.isPopular || false,
          allergens: data.allergens || [],
          ingredients: data.ingredients || [],
          calories: data.calories,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
        });
      });

      const sortedItems = items.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });

      callback(sortedItems);
    }, (error) => {
      console.error('Error listening to menu items:', error);
    });

    return unsubscribe;
  }

  // Get menu categories
  static getMenuCategories(): MenuCategory[] {
    return MENU_CATEGORIES;
  }

  // Create sample menu items
  static async createSampleMenuItems(): Promise<void> {
    const sampleItems = [
      {
        name: 'Klassischer Burger',
        description: 'Saftiger Rindfleischburger mit frischem Salat, Tomate und spezieller Sauce',
        price: 12.99,
        category: 'food' as const,
        isAvailable: true,
        isPopular: true,
        allergens: ['gluten', 'milch'],
        ingredients: ['rindfleisch', 'salat', 'tomate', 'zwiebel', 'brötchen'],
        calories: 650,
        createdBy: 'admin'
      },
      {
        name: 'Margherita Pizza',
        description: 'Traditionelle Pizza mit Tomatensauce, Mozzarella und Basilikum',
        price: 16.99,
        category: 'food' as const,
        isAvailable: true,
        isPopular: true,
        allergens: ['gluten', 'milch'],
        ingredients: ['teig', 'tomatensauce', 'mozzarella', 'basilikum'],
        calories: 800,
        createdBy: 'admin'
      },
      {
        name: 'Premium Kaffee',
        description: 'Frisch gebrühter Premium Kaffee',
        price: 4.99,
        category: 'drinks' as const,
        isAvailable: true,
        isPopular: true,
        allergens: [],
        ingredients: ['kaffeebohnen', 'wasser'],
        calories: 5,
        createdBy: 'admin'
      },
      {
        name: 'Craft Bier',
        description: 'Lokale Craft Bier Auswahl',
        price: 7.99,
        category: 'drinks' as const,
        isAvailable: true,
        isPopular: false,
        allergens: ['gluten'],
        ingredients: ['malz', 'hopfen', 'hefe', 'wasser'],
        calories: 150,
        createdBy: 'admin'
      },
      {
        name: 'Premium Shisha Tabak',
        description: 'Hochwertiger aromatisierter Tabak für Shisha',
        price: 15.99,
        category: 'tobacco' as const,
        isAvailable: true,
        isPopular: true,
        allergens: [],
        ingredients: ['tabak', 'natürliche aromen'],
        calories: 0,
        createdBy: 'admin'
      },
      {
        name: 'Shisha Set',
        description: 'Komplettes Shisha Setup mit Bowl und Schläuchen',
        price: 25.99,
        category: 'other' as const,
        isAvailable: true,
        isPopular: false,
        allergens: [],
        ingredients: [],
        calories: 0,
        createdBy: 'admin'
      }
    ];

    for (const item of sampleItems) {
      try {
        await this.createMenuItem(item);
      } catch (error) {
        console.error('Error creating sample menu item:', error);
      }
    }
  }
} 