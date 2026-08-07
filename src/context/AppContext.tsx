import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Restaurant,
  Store,
  Category,
  Product,
  Order,
  UserAccount,
  Offer,
  MediaItem,
  SiteSettings,
  OrderStatus
} from '../types/admin';
import {
  loadFromStorage,
  saveToStorage,
  INITIAL_RESTAURANTS,
  INITIAL_STORES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_OFFERS,
  INITIAL_SETTINGS
} from '../lib/store';

interface AppContextType {
  // Database connection indicator
  isDbConnected: boolean;

  // Admin Auth
  isAdminLoggedIn: boolean;
  adminEmail: string;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Restaurants
  restaurants: Restaurant[];
  addRestaurant: (rest: Omit<Restaurant, 'id'>) => Promise<void> | void;
  updateRestaurant: (id: string, rest: Partial<Restaurant>) => Promise<void> | void;
  deleteRestaurant: (id: string) => Promise<void> | void;
  toggleRestaurantActive: (id: string) => Promise<void> | void;

  // Stores
  stores: Store[];
  addStore: (st: Omit<Store, 'id'>) => Promise<void> | void;
  updateStore: (id: string, st: Partial<Store>) => Promise<void> | void;
  deleteStore: (id: string) => Promise<void> | void;
  toggleStoreActive: (id: string) => Promise<void> | void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void> | void;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void> | void;
  deleteCategory: (id: string) => Promise<void> | void;

  // Products
  products: Product[];
  addProduct: (prod: Omit<Product, 'id'>) => Promise<void> | void;
  updateProduct: (id: string, prod: Partial<Product>) => Promise<void> | void;
  deleteProduct: (id: string) => Promise<void> | void;
  toggleProductAvailable: (id: string) => Promise<void> | void;

  // Orders
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void> | void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<void> | void;

  // Users
  users: UserAccount[];
  toggleUserStatus: (id: string) => Promise<void> | void;
  deleteUser: (id: string) => Promise<void> | void;

  // Offers
  offers: Offer[];
  addOffer: (off: Omit<Offer, 'id'>) => Promise<void> | void;
  deleteOffer: (id: string) => Promise<void> | void;
  toggleOfferActive: (id: string) => Promise<void> | void;

  // Media
  mediaItems: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => Promise<void> | void;
  deleteMediaItem: (id: string) => Promise<void> | void;

  // Site Settings
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void> | void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  // Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() =>
    loadFromStorage('is_logged_in', false)
  );
  const [adminEmail, setAdminEmail] = useState<string>(() =>
    loadFromStorage('admin_email', 'admin@eshry.com')
  );

  // App Data state
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() =>
    loadFromStorage('restaurants', INITIAL_RESTAURANTS)
  );
  const [stores, setStores] = useState<Store[]>(() =>
    loadFromStorage('stores', INITIAL_STORES)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage('categories', INITIAL_CATEGORIES)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('products', INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('orders', INITIAL_ORDERS)
  );
  const [users, setUsers] = useState<UserAccount[]>(() =>
    loadFromStorage('users', INITIAL_USERS)
  );
  const [offers, setOffers] = useState<Offer[]>(() =>
    loadFromStorage('offers', INITIAL_OFFERS)
  );
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() =>
    loadFromStorage('media', [
      {
        id: 'med-1',
        name: 'grocery_food_hero.jpg',
        url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
        size: '1.2 MB',
        uploadedAt: '2026-08-01'
      }
    ])
  );
  const [settings, setSettings] = useState<SiteSettings>(() =>
    loadFromStorage('settings', INITIAL_SETTINGS)
  );

  // Sync state to localStorage as secondary offline cache
  useEffect(() => saveToStorage('is_logged_in', isAdminLoggedIn), [isAdminLoggedIn]);
  useEffect(() => saveToStorage('admin_email', adminEmail), [adminEmail]);
  useEffect(() => saveToStorage('restaurants', restaurants), [restaurants]);
  useEffect(() => saveToStorage('stores', stores), [stores]);
  useEffect(() => saveToStorage('categories', categories), [categories]);
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('offers', offers), [offers]);
  useEffect(() => saveToStorage('media', mediaItems), [mediaItems]);
  useEffect(() => saveToStorage('settings', settings), [settings]);

  // REALTIME FIRESTORE SUBSCRIPTIONS
  useEffect(() => {
    // 1. Settings listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'site_config'),
      snapshot => {
        setIsDbConnected(true);
        if (snapshot.exists()) {
          setSettings(snapshot.data() as SiteSettings);
        } else {
          // Seed settings to Firebase
          setDoc(doc(db, 'settings', 'site_config'), INITIAL_SETTINGS).catch(console.error);
        }
      },
      err => {
        console.warn('Firestore Settings Listener error:', err);
        setIsDbConnected(false);
      }
    );

    // 2. Restaurants listener
    const unsubRestaurants = onSnapshot(
      collection(db, 'restaurants'),
      snapshot => {
        setIsDbConnected(true);
        if (snapshot.empty) {
          // Seed initial restaurants
          const batch = writeBatch(db);
          INITIAL_RESTAURANTS.forEach(r => {
            batch.set(doc(db, 'restaurants', r.id), r);
          });
          batch.commit().catch(console.error);
        } else {
          const list = snapshot.docs.map(doc => doc.data() as Restaurant);
          setRestaurants(list);
        }
      },
      err => {
        console.warn('Firestore Restaurants error:', err);
      }
    );

    // 3. Stores listener
    const unsubStores = onSnapshot(
      collection(db, 'stores'),
      snapshot => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_STORES.forEach(s => {
            batch.set(doc(db, 'stores', s.id), s);
          });
          batch.commit().catch(console.error);
        } else {
          const list = snapshot.docs.map(doc => doc.data() as Store);
          setStores(list);
        }
      },
      err => console.warn('Firestore Stores error:', err)
    );

    // 4. Categories listener
    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      snapshot => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_CATEGORIES.forEach(c => {
            batch.set(doc(db, 'categories', c.id), c);
          });
          batch.commit().catch(console.error);
        } else {
          const list = snapshot.docs.map(doc => doc.data() as Category);
          setCategories(list);
        }
      },
      err => console.warn('Firestore Categories error:', err)
    );

    // 5. Products listener
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      snapshot => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_PRODUCTS.forEach(p => {
            batch.set(doc(db, 'products', p.id), p);
          });
          batch.commit().catch(console.error);
        } else {
          const list = snapshot.docs.map(doc => doc.data() as Product);
          setProducts(list);
        }
      },
      err => console.warn('Firestore Products error:', err)
    );

    // 6. Orders listener
    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      snapshot => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_ORDERS.forEach(o => {
            batch.set(doc(db, 'orders', o.id), o);
          });
          batch.commit().catch(console.error);
        } else {
          const list = snapshot.docs.map(doc => doc.data() as Order);
          // sort orders by date descending
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(list);
        }
      },
      err => console.warn('Firestore Orders error:', err)
    );

    // 7. Users listener
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      snapshot => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_USERS.forEach(u => {
            batch.set(doc(db, 'users', u.id), u);
          });
          batch.commit().catch(console.error);
        } else {
          const list = snapshot.docs.map(doc => doc.data() as UserAccount);
          setUsers(list);
        }
      },
      err => console.warn('Firestore Users error:', err)
    );

    // 8. Offers listener
    const unsubOffers = onSnapshot(
      collection(db, 'offers'),
      snapshot => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_OFFERS.forEach(off => {
            batch.set(doc(db, 'offers', off.id), off);
          });
          batch.commit().catch(console.error);
        } else {
          const list = snapshot.docs.map(doc => doc.data() as Offer);
          setOffers(list);
        }
      },
      err => console.warn('Firestore Offers error:', err)
    );

    // 9. Media listener
    const unsubMedia = onSnapshot(
      collection(db, 'media'),
      snapshot => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => doc.data() as MediaItem);
          setMediaItems(list);
        }
      },
      err => console.warn('Firestore Media error:', err)
    );

    return () => {
      unsubSettings();
      unsubRestaurants();
      unsubStores();
      unsubCategories();
      unsubProducts();
      unsubOrders();
      unsubUsers();
      unsubOffers();
      unsubMedia();
    };
  }, []);

  // Auth Methods
  const loginAdmin = (email: string, pass: string) => {
    if ((email === 'admin@eshry.com' && pass === 'admin123') || (email === 'admin' && pass === 'admin') || pass === 'admin123') {
      setIsAdminLoggedIn(true);
      setAdminEmail(email || 'admin@eshry.com');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
  };

  // Restaurant Actions
  const addRestaurant = async (rest: Omit<Restaurant, 'id'>) => {
    const newRest: Restaurant = { ...rest, id: `rest-${Date.now()}` };
    setRestaurants(prev => [newRest, ...prev]);
    try {
      await setDoc(doc(db, 'restaurants', newRest.id), newRest);
    } catch (e) {
      console.error('Error adding restaurant to Firestore:', e);
    }
  };

  const updateRestaurant = async (id: string, rest: Partial<Restaurant>) => {
    setRestaurants(prev => prev.map(r => (r.id === id ? { ...r, ...rest } : r)));
    try {
      await updateDoc(doc(db, 'restaurants', id), rest);
    } catch (e) {
      console.error('Error updating restaurant in Firestore:', e);
    }
  };

  const deleteRestaurant = async (id: string) => {
    setRestaurants(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'restaurants', id));
    } catch (e) {
      console.error('Error deleting restaurant in Firestore:', e);
    }
  };

  const toggleRestaurantActive = async (id: string) => {
    const target = restaurants.find(r => r.id === id);
    if (!target) return;
    const newActive = !target.active;
    setRestaurants(prev =>
      prev.map(r => (r.id === id ? { ...r, active: newActive } : r))
    );
    try {
      await updateDoc(doc(db, 'restaurants', id), { active: newActive });
    } catch (e) {
      console.error('Error toggling restaurant active in Firestore:', e);
    }
  };

  // Store Actions
  const addStore = async (st: Omit<Store, 'id'>) => {
    const newSt: Store = { ...st, id: `store-${Date.now()}` };
    setStores(prev => [newSt, ...prev]);
    try {
      await setDoc(doc(db, 'stores', newSt.id), newSt);
    } catch (e) {
      console.error('Error adding store to Firestore:', e);
    }
  };

  const updateStore = async (id: string, st: Partial<Store>) => {
    setStores(prev => prev.map(s => (s.id === id ? { ...s, ...st } : s)));
    try {
      await updateDoc(doc(db, 'stores', id), st);
    } catch (e) {
      console.error('Error updating store in Firestore:', e);
    }
  };

  const deleteStore = async (id: string) => {
    setStores(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'stores', id));
    } catch (e) {
      console.error('Error deleting store in Firestore:', e);
    }
  };

  const toggleStoreActive = async (id: string) => {
    const target = stores.find(s => s.id === id);
    if (!target) return;
    const newActive = !target.active;
    setStores(prev =>
      prev.map(s => (s.id === id ? { ...s, active: newActive } : s))
    );
    try {
      await updateDoc(doc(db, 'stores', id), { active: newActive });
    } catch (e) {
      console.error('Error toggling store active in Firestore:', e);
    }
  };

  // Category Actions
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    try {
      await setDoc(doc(db, 'categories', newCat.id), newCat);
    } catch (e) {
      console.error('Error adding category to Firestore:', e);
    }
  };

  const updateCategory = async (id: string, cat: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...cat } : c)));
    try {
      await updateDoc(doc(db, 'categories', id), cat);
    } catch (e) {
      console.error('Error updating category in Firestore:', e);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      console.error('Error deleting category in Firestore:', e);
    }
  };

  // Product Actions
  const addProduct = async (prod: Omit<Product, 'id'>) => {
    const newProd: Product = { ...prod, id: `prod-${Date.now()}` };
    setProducts(prev => [newProd, ...prev]);
    try {
      await setDoc(doc(db, 'products', newProd.id), newProd);
    } catch (e) {
      console.error('Error adding product to Firestore:', e);
    }
  };

  const updateProduct = async (id: string, prod: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...prod } : p)));
    try {
      await updateDoc(doc(db, 'products', id), prod);
    } catch (e) {
      console.error('Error updating product in Firestore:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.error('Error deleting product in Firestore:', e);
    }
  };

  const toggleProductAvailable = async (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const newAvail = !target.isAvailable;
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, isAvailable: newAvail } : p))
    );
    try {
      await updateDoc(doc(db, 'products', id), { isAvailable: newAvail });
    } catch (e) {
      console.error('Error toggling product available in Firestore:', e);
    }
  };

  // Order Actions
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch (e) {
      console.error('Error updating order status in Firestore:', e);
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (e) {
      console.error('Error adding order to Firestore:', e);
    }
  };

  // User Actions
  const toggleUserStatus = async (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'blocked' : 'active';
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, status: newStatus } : u))
    );
    try {
      await updateDoc(doc(db, 'users', id), { status: newStatus });
    } catch (e) {
      console.error('Error toggling user status in Firestore:', e);
    }
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      console.error('Error deleting user in Firestore:', e);
    }
  };

  // Offer Actions
  const addOffer = async (off: Omit<Offer, 'id'>) => {
    const newOffer: Offer = { ...off, id: `off-${Date.now()}` };
    setOffers(prev => [newOffer, ...prev]);
    try {
      await setDoc(doc(db, 'offers', newOffer.id), newOffer);
    } catch (e) {
      console.error('Error adding offer to Firestore:', e);
    }
  };

  const deleteOffer = async (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
    try {
      await deleteDoc(doc(db, 'offers', id));
    } catch (e) {
      console.error('Error deleting offer in Firestore:', e);
    }
  };

  const toggleOfferActive = async (id: string) => {
    const target = offers.find(o => o.id === id);
    if (!target) return;
    const newActive = !target.active;
    setOffers(prev =>
      prev.map(o => (o.id === id ? { ...o, active: newActive } : o))
    );
    try {
      await updateDoc(doc(db, 'offers', id), { active: newActive });
    } catch (e) {
      console.error('Error toggling offer active in Firestore:', e);
    }
  };

  // Media Actions
  const addMediaItem = async (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setMediaItems(prev => [newItem, ...prev]);
    try {
      await setDoc(doc(db, 'media', newItem.id), newItem);
    } catch (e) {
      console.error('Error adding media item to Firestore:', e);
    }
  };

  const deleteMediaItem = async (id: string) => {
    setMediaItems(prev => prev.filter(m => m.id !== id));
    try {
      await deleteDoc(doc(db, 'media', id));
    } catch (e) {
      console.error('Error deleting media item in Firestore:', e);
    }
  };

  // Settings Actions
  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await setDoc(doc(db, 'settings', 'site_config'), updated, { merge: true });
    } catch (e) {
      console.error('Error updating settings in Firestore:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isDbConnected,
        isAdminLoggedIn,
        adminEmail,
        loginAdmin,
        logoutAdmin,
        restaurants,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        toggleRestaurantActive,
        stores,
        addStore,
        updateStore,
        deleteStore,
        toggleStoreActive,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailable,
        orders,
        updateOrderStatus,
        addOrder,
        users,
        toggleUserStatus,
        deleteUser,
        offers,
        addOffer,
        deleteOffer,
        toggleOfferActive,
        mediaItems,
        addMediaItem,
        deleteMediaItem,
        settings,
        updateSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

