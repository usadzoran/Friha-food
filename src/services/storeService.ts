import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  getDocs,
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  subscribeToProductsSupabase,
  subscribeToCategoriesSupabase,
  subscribeToOrdersSupabase,
  getCategoriesSupabase,
  getProductsSupabase,
  addCategorySupabase,
  updateCategorySupabase,
  deleteCategorySupabase,
  addProductSupabase,
  updateProductSupabase,
  deleteProductSupabase,
  createOrderSupabase,
  updateOrderStatusSupabase,
  deleteOrderSupabase,
  deleteDeliveredOrdersSupabase,
  getWhatsappMessagesSupabase,
  subscribeToWhatsappMessagesSupabase,
  triggerWhatsappOrderDispatch,
  getWhatsappConfigStatus,
  saveWhatsappConfig,
  testWhatsappMessage,
  trackSiteVisitSupabase,
  subscribeToVisitorStatsSupabase,
  saveCategoryWhatsappNumber,
  syncCategoryWhatsAppFromServer
} from './supabaseService';
import { Category, Product, Order, OrderItem, OrderStatus, CustomerInfo, CartItem, VisitorStats } from '../types';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const ORDERS_COLLECTION = 'orders';
const ORDER_ITEMS_COLLECTION = 'order_items';

const INITIAL_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'المأكولات والتمور', icon: 'Utensils', image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() },
  { name: 'الزيوت والعسل', icon: 'Droplets', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() },
  { name: 'المشروبات والقهوة', icon: 'Coffee', image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() },
  { name: 'الأدوات والتقليديات', icon: 'Package', image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() },
  { name: 'الحلويات والمخبوزات', icon: 'Cake', image_url: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() }
];

// Initial Algerian sample items for initial auto-seeding if database is empty
const INITIAL_ALGERIAN_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'تمر دقلة نور الفاخر - 1 كغ',
    description: 'تمور دقلة نور أصلية ممتازة من بسكرة طازجة وغنية بالفوائد.',
    price: 950,
    image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    name: 'زيت زيتون جرجرة بكر ممتاز - 1 لتر',
    description: 'زيت زيتون طبيعي 100% معصور على البارد من جبال القبايل.',
    price: 1400,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    name: 'عسل السدر الحر الأصلي - 500 غ',
    description: 'عسل حر طبيعي ذو جودة عالية وفوائد صحية ورائحة طيبة.',
    price: 2800,
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    name: 'قهوة مطحونة رفيعة - 250 غ',
    description: 'قهوة محامص جزائرية أصلية بمذاق غني ورائحة زكية.',
    price: 380,
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    name: 'طقم إبريق شاي تقليدي نحاسي',
    description: 'إبريق شاي أصيل مزخرف يدوياً للمناسبات والجلسات العائلية.',
    price: 4200,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    name: 'صينية حلويات تقليدية مشكلة',
    description: 'تشكيلة بقلاوة، مقروض، وتشاراك بحشوة اللوز والعسل.',
    price: 2200,
    image_url: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80',
    active: true,
    created_at: new Date().toISOString()
  }
];

// Restore default initial categories and products if missing or requested
export async function restoreDefaultData(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const currentCats = await getCategoriesSupabase();
      if (currentCats.length === 0) {
        for (const cat of INITIAL_CATEGORIES) {
          await addCategorySupabase(cat);
        }
      }
      const prods = await getProductsSupabase();
      const existingNames = new Set(prods.map(p => p.name));
      const freshCats = await getCategoriesSupabase();
      for (let idx = 0; idx < INITIAL_ALGERIAN_PRODUCTS.length; idx++) {
        const prod = INITIAL_ALGERIAN_PRODUCTS[idx];
        if (!existingNames.has(prod.name)) {
          const catObj = freshCats.length > 0 ? freshCats[idx % freshCats.length] : null;
          await addProductSupabase({
            ...prod,
            category_id: catObj ? catObj.id : ''
          });
        }
      }
      return;
    } catch (err) {
      console.error('Error restoring data in Supabase:', err);
      return;
    }
  }

  try {
    // 1. Check or seed categories
    let currentCats = await seedCategoriesIfEmpty();
    if (currentCats.length === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
          ...cat,
          created_at: new Date().toISOString()
        });
        currentCats.push({ id: docRef.id, ...cat, created_at: new Date().toISOString() });
      }
    }

    // 2. Check existing products
    const prodSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const existingNames = new Set(prodSnap.docs.map(d => d.data().name));

    const batch = writeBatch(db);
    let countAdded = 0;

    INITIAL_ALGERIAN_PRODUCTS.forEach((prod, idx) => {
      if (!existingNames.has(prod.name)) {
        const catObj = currentCats.length > 0 ? currentCats[idx % currentCats.length] : null;
        const ref = doc(collection(db, PRODUCTS_COLLECTION));
        batch.set(ref, {
          ...prod,
          category_id: catObj ? catObj.id : '',
          active: true,
          created_at: new Date().toISOString()
        });
        countAdded++;
      }
    });

    if (countAdded > 0) {
      await batch.commit();
      console.log(`Restored ${countAdded} default products to Firestore.`);
    }
  } catch (error) {
    console.error('Error restoring default data:', error);
    throw error;
  }
}

// Seed initial categories if empty
export async function seedCategoriesIfEmpty(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const cats = await getCategoriesSupabase();
      if (cats.length === 0) {
        const created: Category[] = [];
        for (const cat of INITIAL_CATEGORIES) {
          const res = await addCategorySupabase(cat);
          created.push(res);
        }
        return created;
      }
      return cats;
    } catch (err) {
      console.error('Error seeding categories in Supabase:', err);
      return [];
    }
  }

  try {
    const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial categories into Firestore...');
      const createdCats: Category[] = [];
      for (const cat of INITIAL_CATEGORIES) {
        const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
          ...cat,
          created_at: new Date().toISOString()
        });
        createdCats.push({ id: docRef.id, ...cat, created_at: new Date().toISOString() });
      }
      return createdCats;
    } else {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
    return [];
  }
}

// Seed initial products if db is empty
export async function seedProductsIfEmpty(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const prods = await getProductsSupabase();
      if (prods.length === 0) {
        const cats = await seedCategoriesIfEmpty();
        for (let idx = 0; idx < INITIAL_ALGERIAN_PRODUCTS.length; idx++) {
          const prod = INITIAL_ALGERIAN_PRODUCTS[idx];
          const catObj = cats.length > 0 ? cats[idx % cats.length] : null;
          await addProductSupabase({
            ...prod,
            category_id: catObj ? catObj.id : ''
          });
        }
      }
      return;
    } catch (err) {
      console.error('Error seeding products in Supabase:', err);
      return;
    }
  }

  try {
    const currentCats = await seedCategoriesIfEmpty();
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial products into Firestore...');
      const batch = writeBatch(db);
      INITIAL_ALGERIAN_PRODUCTS.forEach((prod, idx) => {
        const catObj = currentCats.length > 0 ? currentCats[idx % currentCats.length] : null;
        const ref = doc(collection(db, PRODUCTS_COLLECTION));
        batch.set(ref, {
          ...prod,
          category_id: catObj ? catObj.id : '',
          active: true,
          created_at: new Date().toISOString()
        });
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

// Subscribe to active products in real-time for Customers
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  includeInactive = false
) {
  if (isSupabaseConfigured()) {
    return subscribeToProductsSupabase((prods) => {
      const filtered = includeInactive ? prods : prods.filter(p => p.active !== false);
      onUpdate(filtered);
    });
  }

  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);

    return onSnapshot(
      colRef,
      (snapshot) => {
        let products: Product[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            // Ensure active is true unless explicitly false
            active: data.active !== false
          } as Product;
        });

        if (!includeInactive) {
          products = products.filter(p => p.active !== false);
        }

        // Sort in memory safely by created_at desc
        products.sort((a, b) => {
          const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tB - tA;
        });

        onUpdate(products);
      },
      (error) => {
        console.error('Error in subscribeToProducts:', error);
        handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    return () => {};
  }
}

// Subscribe to Categories in real-time
export function subscribeToCategories(onUpdate: (categories: Category[]) => void) {
  if (isSupabaseConfigured()) {
    return subscribeToCategoriesSupabase(onUpdate);
  }

  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);

    return onSnapshot(
      colRef,
      (snapshot) => {
        const categories: Category[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Category));

        // Sort in memory safely by created_at asc
        categories.sort((a, b) => {
          const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tA - tB;
        });

        onUpdate(categories);
      },
      (error) => {
        console.error('Error in subscribeToCategories:', error);
        handleFirestoreError(error, OperationType.GET, CATEGORIES_COLLECTION);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, CATEGORIES_COLLECTION);
    return () => {};
  }
}

// Add Category (Admin)
export async function addCategory(category: Omit<Category, 'id'>): Promise<string> {
  if (isSupabaseConfigured()) {
    const res = await addCategorySupabase(category);
    return res ? res.id : '';
  }

  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...category,
      created_at: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CATEGORIES_COLLECTION);
    throw error;
  }
}

// Update Category (Admin)
export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  if (isSupabaseConfigured()) {
    return updateCategorySupabase(id, updates);
  }

  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CATEGORIES_COLLECTION}/${id}`);
  }
}

// Delete Category (Admin)
export async function deleteCategory(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    return deleteCategorySupabase(id);
  }

  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CATEGORIES_COLLECTION}/${id}`);
  }
}

// Add Product (Admin)
export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  if (isSupabaseConfigured()) {
    const res = await addProductSupabase(product);
    return res ? res.id : '';
  }

  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      created_at: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PRODUCTS_COLLECTION);
    throw error;
  }
}

// Update Product (Admin)
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  if (isSupabaseConfigured()) {
    return updateProductSupabase(id, updates);
  }

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

// Delete Product (Admin)
export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    return deleteProductSupabase(id);
  }

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

// Toggle Product Visibility Active / Hidden
export async function toggleProductActive(id: string, currentActive: boolean): Promise<void> {
  return updateProduct(id, { active: !currentActive });
}

// Create Order (Customer)
export async function createOrder(
  customer: CustomerInfo,
  cartItems: CartItem[]
): Promise<{ orderId: string; displayOrderNum: string }> {
  if (isSupabaseConfigured()) {
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const orderId = await createOrderSupabase(
      {
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_address: customer.address.trim(),
        notes: customer.notes.trim()
      },
      cartItems,
      totalPrice
    );
    const displayOrderNum = `DZ-${orderId.slice(-6).toUpperCase()}`;
    return { orderId, displayOrderNum };
  }

  try {
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const now = new Date().toISOString();

    // 1. Create order document
    const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      customer_address: customer.address.trim(),
      notes: customer.notes.trim() || '',
      total_price: totalPrice,
      status: 'pending' as OrderStatus,
      created_at: now,
      updated_at: now
    });

    const orderId = orderRef.id;
    const displayOrderNum = `DZ-${orderId.slice(-6).toUpperCase()}`;

    // 2. Create order_items documents (preserving price snapshot)
    const batch = writeBatch(db);
    for (const item of cartItems) {
      const itemRef = doc(collection(db, ORDER_ITEMS_COLLECTION));
      batch.set(itemRef, {
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity
      } as Omit<OrderItem, 'id'>);
    }
    await batch.commit();

    return { orderId, displayOrderNum };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ORDERS_COLLECTION);
    throw error;
  }
}

// Subscribe to Orders in real-time (Admin)
export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  if (isSupabaseConfigured()) {
    return subscribeToOrdersSupabase(onUpdate);
  }

  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);

    return onSnapshot(
      ordersRef,
      async (snapshot) => {
        const ordersList: Order[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Order));

        ordersList.sort((a, b) => {
          const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tB - tA;
        });

        // Fetch order items for each order
        try {
          const itemsSnap = await getDocs(collection(db, ORDER_ITEMS_COLLECTION));
          const allItems = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() } as OrderItem));

          const joinedOrders = ordersList.map(order => ({
            ...order,
            items: allItems.filter(item => item.order_id === order.id)
          }));

          onUpdate(joinedOrders);
        } catch {
          onUpdate(ordersList);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    return () => {};
  }
}

// Update Order Status (Admin)
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (isSupabaseConfigured()) {
    return updateOrderStatusSupabase(orderId, status);
  }

  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Delete a single order (Admin)
export async function deleteOrder(orderId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    return deleteOrderSupabase(orderId);
  }

  try {
    // 1. Delete associated order items
    const itemsQuery = query(collection(db, ORDER_ITEMS_COLLECTION), where('order_id', '==', orderId));
    const itemsSnap = await getDocs(itemsQuery);
    const batch = writeBatch(db);
    itemsSnap.docs.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    // 2. Delete order document
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    batch.delete(orderRef);

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COLLECTION}/${orderId}`);
    throw error;
  }
}

// Delete all delivered orders (Admin)
export async function deleteDeliveredOrders(): Promise<number> {
  if (isSupabaseConfigured()) {
    return deleteDeliveredOrdersSupabase();
  }

  try {
    const ordersQuery = query(collection(db, ORDERS_COLLECTION), where('status', '==', 'delivered'));
    const ordersSnap = await getDocs(ordersQuery);
    if (ordersSnap.empty) return 0;

    const orderIds = ordersSnap.docs.map(d => d.id);
    const batch = writeBatch(db);

    for (const docSnap of ordersSnap.docs) {
      batch.delete(docSnap.ref);
    }

    // Delete related items
    for (const ordId of orderIds) {
      const itemsQuery = query(collection(db, ORDER_ITEMS_COLLECTION), where('order_id', '==', ordId));
      const itemsSnap = await getDocs(itemsQuery);
      itemsSnap.docs.forEach(d => batch.delete(d.ref));
    }

    await batch.commit();
    return orderIds.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, ORDERS_COLLECTION);
    throw error;
  }
}

// Analytics & Visitor Tracking
const ANALYTICS_COLLECTION = 'analytics';
const SITE_VISITORS_DOC = 'site_visitors';

export async function trackSiteVisit(): Promise<void> {
  if (isSupabaseConfigured()) {
    return trackSiteVisitSupabase();
  }

  try {
    const docRef = doc(db, ANALYTICS_COLLECTION, SITE_VISITORS_DOC);
    const snap = await getDoc(docRef);

    const isNewSession = !sessionStorage.getItem('dz_visitor_session');
    if (isNewSession) {
      sessionStorage.setItem('dz_visitor_session', 'true');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    if (!snap.exists()) {
      const initialStats: VisitorStats = {
        total_visits: 1,
        unique_visits: 1,
        today_visits: 1,
        last_visit_date: todayStr,
        last_visit_at: nowIso,
        daily_history: [{ date: todayStr, visits: 1 }]
      };
      await setDoc(docRef, initialStats);
      return;
    }

    const data = snap.data() as VisitorStats;
    const currentTotal = data.total_visits || 0;
    const currentUnique = data.unique_visits || 0;
    const lastDate = data.last_visit_date || '';
    
    let newTodayVisits = data.today_visits || 0;
    if (lastDate === todayStr) {
      newTodayVisits += 1;
    } else {
      newTodayVisits = 1;
    }

    // Update daily history (keep last 14 days)
    const history = data.daily_history || [];
    const todayIndex = history.findIndex(item => item.date === todayStr);
    let updatedHistory = [...history];

    if (todayIndex >= 0) {
      updatedHistory[todayIndex] = {
        ...updatedHistory[todayIndex],
        visits: updatedHistory[todayIndex].visits + 1
      };
    } else {
      updatedHistory.push({ date: todayStr, visits: 1 });
    }

    if (updatedHistory.length > 14) {
      updatedHistory = updatedHistory.slice(updatedHistory.length - 14);
    }

    const updates: Partial<VisitorStats> = {
      total_visits: currentTotal + 1,
      unique_visits: isNewSession ? currentUnique + 1 : currentUnique,
      today_visits: newTodayVisits,
      last_visit_date: todayStr,
      last_visit_at: nowIso,
      daily_history: updatedHistory
    };

    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error recording visitor stat:', error);
  }
}

export function subscribeToVisitorStats(onUpdate: (stats: VisitorStats) => void) {
  if (isSupabaseConfigured()) {
    return subscribeToVisitorStatsSupabase(onUpdate);
  }

  try {
    const docRef = doc(db, ANALYTICS_COLLECTION, SITE_VISITORS_DOC);

    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as VisitorStats);
        } else {
          onUpdate({
            total_visits: 0,
            unique_visits: 0,
            today_visits: 0,
            daily_history: []
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `${ANALYTICS_COLLECTION}/${SITE_VISITORS_DOC}`);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ANALYTICS_COLLECTION}/${SITE_VISITORS_DOC}`);
    return () => {};
  }
}

export {
  getWhatsappMessagesSupabase,
  subscribeToWhatsappMessagesSupabase,
  triggerWhatsappOrderDispatch,
  getWhatsappConfigStatus,
  saveWhatsappConfig,
  testWhatsappMessage,
  saveCategoryWhatsappNumber,
  syncCategoryWhatsAppFromServer
};

