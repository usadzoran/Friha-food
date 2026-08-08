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
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Category, Product, Order, OrderItem, OrderStatus, CustomerInfo, CartItem } from '../types';

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

// Seed initial products if db is empty
export async function seedProductsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial products into Firestore...');
      const batch = writeBatch(db);
      for (const prod of INITIAL_ALGERIAN_PRODUCTS) {
        const ref = doc(collection(db, PRODUCTS_COLLECTION));
        batch.set(ref, prod);
      }
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
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const q = includeInactive 
      ? query(colRef, orderBy('created_at', 'desc'))
      : query(colRef, where('active', '==', true));

    return onSnapshot(
      q,
      (snapshot) => {
        const products: Product[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        onUpdate(products);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    return () => {};
  }
}

// Seed initial categories if empty
export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial categories into Firestore...');
      const batch = writeBatch(db);
      for (const cat of INITIAL_CATEGORIES) {
        const ref = doc(collection(db, CATEGORIES_COLLECTION));
        batch.set(ref, cat);
      }
      await batch.commit();
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}

// Subscribe to Categories in real-time
export function subscribeToCategories(onUpdate: (categories: Category[]) => void) {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(colRef, orderBy('created_at', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const categories: Category[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Category));
        onUpdate(categories);
      },
      (error) => {
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
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CATEGORIES_COLLECTION}/${id}`);
  }
}

// Delete Category (Admin)
export async function deleteCategory(id: string): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CATEGORIES_COLLECTION}/${id}`);
  }
}

// Add Product (Admin)
export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
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
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

// Delete Product (Admin)
export async function deleteProduct(id: string): Promise<void> {
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
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('created_at', 'desc'));

    return onSnapshot(
      q,
      async (snapshot) => {
        const ordersList: Order[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Order));

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
