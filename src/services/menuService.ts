import { getFirestoreDB } from "../config/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { MenuItem } from "../types/menu";

const COLLECTION_NAME = "menuItems";

export class MenuService {
  // Real-time listener for menu items
  static onMenuItemsChange(callback: (items: MenuItem[]) => void) {
    const q = query(
      collection(getFirestoreDB(), COLLECTION_NAME),
      where("isAvailable", "==", true),
      orderBy("category"),
      orderBy("name")
    );

    return onSnapshot(q, (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as MenuItem);
      });
      callback(items);
    });
  }

  // Get all menu items
  static async getAllMenuItems(): Promise<MenuItem[]> {
    const q = query(
      collection(getFirestoreDB(), COLLECTION_NAME),
      orderBy("category"),
      orderBy("name")
    );
    const snapshot = await getDocs(q);
    
    const items: MenuItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as MenuItem);
    });
    
    return items;
  }

  // Get available menu items
  static async getAvailableMenuItems(): Promise<MenuItem[]> {
    const q = query(
      collection(getFirestoreDB(), COLLECTION_NAME),
      where("isAvailable", "==", true),
      orderBy("category"),
      orderBy("name")
    );
    
    const snapshot = await getDocs(q);
    const items: MenuItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as MenuItem);
    });
    
    return items;
  }

  // Get menu items by category
  static async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    const q = query(
      collection(getFirestoreDB(), COLLECTION_NAME),
      where("category", "==", category),
      where("isAvailable", "==", true),
      orderBy("name")
    );
    
    const snapshot = await getDocs(q);
    const items: MenuItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as MenuItem);
    });
    
    return items;
  }

  // Create a new menu item
  static async createMenuItem(itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(getFirestoreDB(), COLLECTION_NAME), {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  }

  // Update a menu item
  static async updateMenuItem(
    id: string,
    updates: Partial<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const docRef = doc(getFirestoreDB(), COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  // Delete a menu item
  static async deleteMenuItem(id: string): Promise<void> {
    const docRef = doc(getFirestoreDB(), COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  // Get a single menu item by ID
  static async getMenuItemById(id: string): Promise<MenuItem | null> {
    const docRef = doc(getFirestoreDB(), COLLECTION_NAME, id);
    const docSnap = await getDocs(query(collection(getFirestoreDB(), COLLECTION_NAME), where("__name__", "==", id)));
    
    if (docSnap.empty) {
      return null;
    }

    const data = docSnap.docs[0].data();
    return {
      id: docSnap.docs[0].id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as MenuItem;
  }

  // Get unique categories
  static async getCategories(): Promise<string[]> {
    const items = await this.getAllMenuItems();
    const categories = Array.from(new Set(items.map(item => item.category)));
    return categories.sort();
  }

  // Toggle item availability
  static async toggleItemAvailability(id: string, isAvailable: boolean): Promise<void> {
    await this.updateMenuItem(id, { isAvailable });
  }

  // Toggle item availability (alias for compatibility)
  static async toggleMenuItemAvailability(id: string, isAvailable: boolean): Promise<void> {
    await this.updateMenuItem(id, { isAvailable });
  }

  // Toggle item popularity
  static async toggleMenuItemPopularity(id: string, isPopular: boolean): Promise<void> {
    await this.updateMenuItem(id, { isPopular });
  }

  // Create sample menu items
  static async createSampleMenuItems(): Promise<void> {
    const sampleItems = [
      {
        name: "Premium Shisha Mix",
        description: "Exklusive Mischung aus hochwertigen Tabaksorten",
        price: 15.00,
        category: "shisha",
        isAvailable: true,
        isPopular: true,
        imageUrl: "",
        allergens: [],
        ingredients: ["Premium Tabak", "Honig", "Glycerin"],
        preparationTime: "5-10 Minuten"
      },
      {
        name: "Royal Mojito",
        description: "Erfrischender Mojito mit Premium Rum",
        price: 12.50,
        category: "drinks",
        isAvailable: true,
        isPopular: true,
        imageUrl: "",
        allergens: [],
        ingredients: ["Premium Rum", "Minze", "Limette", "Zucker"],
        preparationTime: "3-5 Minuten"
      },
      {
        name: "Oriental Platter",
        description: "Auswahl orientalischer Spezialitäten",
        price: 18.00,
        category: "food",
        isAvailable: true,
        isPopular: false,
        imageUrl: "",
        allergens: ["Nüsse", "Gluten"],
        ingredients: ["Hummus", "Falafel", "Tabouleh", "Fladenbrot"],
        preparationTime: "10-15 Minuten"
      }
    ];

    for (const item of sampleItems) {
      await this.createMenuItem(item);
    }
  }

  // Search menu items
  static async searchMenuItems(searchTerm: string): Promise<MenuItem[]> {
    const items = await this.getAllMenuItems();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerSearchTerm) ||
      item.description.toLowerCase().includes(lowerSearchTerm) ||
      item.category.toLowerCase().includes(lowerSearchTerm)
    );
  }
} 