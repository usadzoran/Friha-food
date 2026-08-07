import React, { createContext, useContext, useState, useEffect } from 'react';
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
  // Admin Auth
  isAdminLoggedIn: boolean;
  adminEmail: string;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Restaurants
  restaurants: Restaurant[];
  addRestaurant: (rest: Omit<Restaurant, 'id'>) => void;
  updateRestaurant: (id: string, rest: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;
  toggleRestaurantActive: (id: string) => void;

  // Stores
  stores: Store[];
  addStore: (st: Omit<Store, 'id'>) => void;
  updateStore: (id: string, st: Partial<Store>) => void;
  deleteStore: (id: string) => void;
  toggleStoreActive: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Products
  products: Product[];
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailable: (id: string) => void;

  // Orders
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;

  // Users
  users: UserAccount[];
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;

  // Offers
  offers: Offer[];
  addOffer: (off: Omit<Offer, 'id'>) => void;
  deleteOffer: (id: string) => void;
  toggleOfferActive: (id: string) => void;

  // Media
  mediaItems: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => void;
  deleteMediaItem: (id: string) => void;

  // Site Settings
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Sync to Storage
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

  // Auth Methods
  const loginAdmin = (email: string, pass: string) => {
    // Demo credential check
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
  const addRestaurant = (rest: Omit<Restaurant, 'id'>) => {
    const newRest: Restaurant = { ...rest, id: `rest-${Date.now()}` };
    setRestaurants(prev => [newRest, ...prev]);
  };

  const updateRestaurant = (id: string, rest: Partial<Restaurant>) => {
    setRestaurants(prev => prev.map(r => (r.id === id ? { ...r, ...rest } : r)));
  };

  const deleteRestaurant = (id: string) => {
    setRestaurants(prev => prev.filter(r => r.id !== id));
  };

  const toggleRestaurantActive = (id: string) => {
    setRestaurants(prev =>
      prev.map(r => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  // Store Actions
  const addStore = (st: Omit<Store, 'id'>) => {
    const newSt: Store = { ...st, id: `store-${Date.now()}` };
    setStores(prev => [newSt, ...prev]);
  };

  const updateStore = (id: string, st: Partial<Store>) => {
    setStores(prev => prev.map(s => (s.id === id ? { ...s, ...st } : s)));
  };

  const deleteStore = (id: string) => {
    setStores(prev => prev.filter(s => s.id !== id));
  };

  const toggleStoreActive = (id: string) => {
    setStores(prev =>
      prev.map(s => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  // Category Actions
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, cat: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...cat } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Product Actions
  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProd: Product = { ...prod, id: `prod-${Date.now()}` };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (id: string, prod: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...prod } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductAvailable = (id: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  // Order Actions
  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  // User Actions
  const toggleUserStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' }
          : u
      )
    );
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Offer Actions
  const addOffer = (off: Omit<Offer, 'id'>) => {
    const newOffer: Offer = { ...off, id: `off-${Date.now()}` };
    setOffers(prev => [newOffer, ...prev]);
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  const toggleOfferActive = (id: string) => {
    setOffers(prev =>
      prev.map(o => (o.id === id ? { ...o, active: !o.active } : o))
    );
  };

  // Media Actions
  const addMediaItem = (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setMediaItems(prev => [newItem, ...prev]);
  };

  const deleteMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(m => m.id !== id));
  };

  // Settings Actions
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
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
