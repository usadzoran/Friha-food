import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  subscribeCollection,
  subscribeDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  setDocumentMerge,
  clearAllDatabaseCollections
} from '../services/dbService';
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
import { loadFromStorage, saveToStorage, INITIAL_SETTINGS } from '../lib/store';

interface ToastNotice {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Database state
  isDbConnected: boolean;
  isLoadingData: boolean;
  toast: ToastNotice | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  clearAllData: () => Promise<void>;

  // Admin Auth
  isAdminLoggedIn: boolean;
  adminEmail: string;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Restaurants
  restaurants: Restaurant[];
  addRestaurant: (rest: Omit<Restaurant, 'id'>) => Promise<void>;
  updateRestaurant: (id: string, rest: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  toggleRestaurantActive: (id: string) => Promise<void>;

  // Stores
  stores: Store[];
  addStore: (st: Omit<Store, 'id'>) => Promise<void>;
  updateStore: (id: string, st: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
  toggleStoreActive: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Products
  products: Product[];
  addProduct: (prod: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductAvailable: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;

  // Users
  users: UserAccount[];
  toggleUserStatus: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Offers
  offers: Offer[];
  addOffer: (off: Omit<Offer, 'id'>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  toggleOfferActive: (id: string) => Promise<void>;

  // Media
  mediaItems: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;

  // Site Settings
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: Date.now().toString(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const clearToast = () => setToast(null);

  // Admin Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() =>
    loadFromStorage('is_logged_in', false)
  );
  const [adminEmail, setAdminEmail] = useState<string>(() =>
    loadFromStorage('admin_email', 'admin@eshry.com')
  );

  // App Data State loaded strictly from Firestore
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  // Keep admin login in localStorage
  useEffect(() => saveToStorage('is_logged_in', isAdminLoggedIn), [isAdminLoggedIn]);
  useEffect(() => saveToStorage('admin_email', adminEmail), [adminEmail]);

  // REALTIME FIRESTORE SUBSCRIPTIONS
  useEffect(() => {
    setIsLoadingData(true);

    // 1. Settings listener
    const unsubSettings = subscribeDocument<SiteSettings>(
      'settings',
      'site_config',
      (data) => {
        setIsDbConnected(true);
        if (data) {
          setSettings(data);
        } else {
          setDocumentMerge('settings', 'site_config', INITIAL_SETTINGS).catch(console.error);
        }
      },
      () => setIsDbConnected(false)
    );

    // 2. Restaurants listener
    const unsubRestaurants = subscribeCollection<Restaurant>(
      'restaurants',
      (items) => {
        setIsDbConnected(true);
        setRestaurants(items);
        setIsLoadingData(false);
      },
      () => setIsDbConnected(false)
    );

    // 3. Stores listener
    const unsubStores = subscribeCollection<Store>('stores', (items) => {
      setStores(items);
    });

    // 4. Categories listener
    const unsubCategories = subscribeCollection<Category>('categories', (items) => {
      setCategories(items);
    });

    // 5. Products listener
    const unsubProducts = subscribeCollection<Product>('products', (items) => {
      setProducts(items);
    });

    // 6. Orders listener
    const unsubOrders = subscribeCollection<Order>('orders', (items) => {
      const sorted = [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    });

    // 7. Users listener
    const unsubUsers = subscribeCollection<UserAccount>('users', (items) => {
      setUsers(items);
    });

    // 8. Offers listener
    const unsubOffers = subscribeCollection<Offer>('offers', (items) => {
      setOffers(items);
    });

    // 9. Media listener
    const unsubMedia = subscribeCollection<MediaItem>('media', (items) => {
      setMediaItems(items);
    });

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
    if (
      (email === 'admin@eshry.com' && pass === 'admin123') ||
      (email === 'admin' && pass === 'admin') ||
      pass === 'admin123'
    ) {
      setIsAdminLoggedIn(true);
      setAdminEmail(email || 'admin@eshry.com');
      showToast('تم تسجيل الدخول بنجاح', 'success');
      return true;
    }
    showToast('بيانات الدخول غير صحيحة', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    showToast('تم تسجيل الخروج', 'info');
  };

  const clearAllData = async () => {
    try {
      await clearAllDatabaseCollections();
      showToast('تم مسح جميع البيانات بنجاح من قاعدة البيانات!', 'success');
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ أثناء مسح البيانات', 'error');
    }
  };

  // Restaurant Actions
  const addRestaurant = async (rest: Omit<Restaurant, 'id'>) => {
    const id = `rest-${Date.now()}`;
    const newRest: Restaurant = { ...rest, id };
    try {
      await createDocument('restaurants', newRest);
      showToast('تم إضافة المطعم بنجاح إلى قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل إضافة المطعم إلى قاعدة البيانات', 'error');
    }
  };

  const updateRestaurant = async (id: string, rest: Partial<Restaurant>) => {
    try {
      await updateDocument('restaurants', id, rest);
      showToast('تم تحديث بيانات المطعم بنجاح', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل تحديث البيانات في قاعدة البيانات', 'error');
    }
  };

  const deleteRestaurant = async (id: string) => {
    try {
      await deleteDocument('restaurants', id);
      showToast('تم حذف المطعم من قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل حذف المطعم من قاعدة البيانات', 'error');
    }
  };

  const toggleRestaurantActive = async (id: string) => {
    const target = restaurants.find((r) => r.id === id);
    if (!target) return;
    try {
      await updateDocument('restaurants', id, { active: !target.active });
      showToast('تم تغيير حالة المطعم بنجاح', 'info');
    } catch (e) {
      console.error(e);
      showToast('فشل تغيير الحالة', 'error');
    }
  };

  // Store Actions
  const addStore = async (st: Omit<Store, 'id'>) => {
    const id = `store-${Date.now()}`;
    const newSt: Store = { ...st, id };
    try {
      await createDocument('stores', newSt);
      showToast('تم إضافة المتجر بنجاح إلى قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل إضافة المتجر', 'error');
    }
  };

  const updateStore = async (id: string, st: Partial<Store>) => {
    try {
      await updateDocument('stores', id, st);
      showToast('تم تحديث المتجر بنجاح', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل التحديث', 'error');
    }
  };

  const deleteStore = async (id: string) => {
    try {
      await deleteDocument('stores', id);
      showToast('تم حذف المتجر بنجاح', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل الحذف', 'error');
    }
  };

  const toggleStoreActive = async (id: string) => {
    const target = stores.find((s) => s.id === id);
    if (!target) return;
    try {
      await updateDocument('stores', id, { active: !target.active });
      showToast('تم تغيير حالة المتجر', 'info');
    } catch (e) {
      console.error(e);
      showToast('فشل تغيير حالة المتجر', 'error');
    }
  };

  // Category Actions
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCat: Category = { ...cat, id };
    try {
      await createDocument('categories', newCat);
      showToast('تم إضافة القسم بنجاح إلى قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل إضافة القسم', 'error');
    }
  };

  const updateCategory = async (id: string, cat: Partial<Category>) => {
    try {
      await updateDocument('categories', id, cat);
      showToast('تم تحديث القسم بنجاح', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل تحديث القسم', 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDocument('categories', id);
      showToast('تم حذف القسم بنجاح', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل حذف القسم', 'error');
    }
  };

  // Product Actions
  const addProduct = async (prod: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const newProd: Product = { ...prod, id };
    try {
      await createDocument('products', newProd);
      showToast('تم إضافة المنتج بنجاح إلى قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل إضافة المنتج', 'error');
    }
  };

  const updateProduct = async (id: string, prod: Partial<Product>) => {
    try {
      await updateDocument('products', id, prod);
      showToast('تم تحديث المنتج بنجاح', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل تحديث المنتج', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDocument('products', id);
      showToast('تم حذف المنتج من قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل حذف المنتج', 'error');
    }
  };

  const toggleProductAvailable = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    try {
      await updateDocument('products', id, { isAvailable: !target.isAvailable });
      showToast('تم تعديل توفر المنتج', 'info');
    } catch (e) {
      console.error(e);
      showToast('فشل التعديل', 'error');
    }
  };

  // Order Actions
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateDocument('orders', id, { status });
      showToast('تم تحديث حالة الطلب في قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل تحديث حالة الطلب', 'error');
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await createDocument('orders', newOrder);
      showToast('تم إرسال الطلب وحفظه في قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل إرسال الطلب', 'error');
    }
  };

  // User Actions
  const toggleUserStatus = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'blocked' : 'active';
    try {
      await updateDocument('users', id, { status: newStatus });
      showToast('تم تحديث حالة المستخدم في قاعدة البيانات', 'info');
    } catch (e) {
      console.error(e);
      showToast('فشل التحديث', 'error');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDocument('users', id);
      showToast('تم حذف حساب المستخدم بنجاح', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل حذف المستخدم', 'error');
    }
  };

  // Offer Actions
  const addOffer = async (off: Omit<Offer, 'id'>) => {
    const id = `off-${Date.now()}`;
    const newOffer: Offer = { ...off, id };
    try {
      await createDocument('offers', newOffer);
      showToast('تم إضافة العرض بنجاح إلى قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل إضافة العرض', 'error');
    }
  };

  const deleteOffer = async (id: string) => {
    try {
      await deleteDocument('offers', id);
      showToast('تم حذف العرض بنجاح', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل حذف العرض', 'error');
    }
  };

  const toggleOfferActive = async (id: string) => {
    const target = offers.find((o) => o.id === id);
    if (!target) return;
    try {
      await updateDocument('offers', id, { active: !target.active });
      showToast('تم تغيير حالة العرض', 'info');
    } catch (e) {
      console.error(e);
      showToast('فشل تعديل العرض', 'error');
    }
  };

  // Media Actions
  const addMediaItem = async (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const id = `med-${Date.now()}`;
    const newItem: MediaItem = {
      ...item,
      id,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    try {
      await createDocument('media', newItem);
      showToast('تم حفظ الوسائط في قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل حفظ الوسائط', 'error');
    }
  };

  const deleteMediaItem = async (id: string) => {
    try {
      await deleteDocument('media', id);
      showToast('تم حذف الوسائط من قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل الحذف', 'error');
    }
  };

  // Settings Actions
  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      await setDocumentMerge('settings', 'site_config', newSettings);
      showToast('تم حفظ إعدادات الموقع بنجاح في قاعدة البيانات', 'success');
    } catch (e) {
      console.error(e);
      showToast('فشل حفظ الإعدادات', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        isDbConnected,
        isLoadingData,
        toast,
        showToast,
        clearToast,
        clearAllData,
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
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center justify-between gap-3 text-right dir-rtl ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-800'
                : 'bg-stone-900 text-stone-200 border-stone-700'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={clearToast}
              className="text-stone-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
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
