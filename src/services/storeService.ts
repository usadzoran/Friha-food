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
  syncCategoryWhatsAppFromServer,
  getAdsSupabase,
  saveAdSupabase,
  deleteAdSupabase,
  toggleAdSupabase,
  subscribeToAdsSupabase,
  getDepartmentManagersSupabase,
  saveDepartmentManagerSupabase,
  deleteDepartmentManagerSupabase,
  toggleDepartmentManagerActiveSupabase,
  subscribeToDepartmentManagersSupabase,
  authenticateDepartmentManagerSupabase,
  getJoinRequestsSupabase,
  submitJoinRequestSupabase,
  updateJoinRequestSupabase,
  deleteJoinRequestSupabase,
  subscribeToJoinRequestsSupabase,
  approveAndInviteJoinRequestSupabase,
  DEFAULT_INITIAL_ADS
} from './supabaseService';
import { Category, Product, Order, OrderStatus, CustomerInfo, CartItem, VisitorStats, AdSlot, DepartmentManager, JoinRequest } from '../types';

export const INITIAL_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'المأكولات والتمور', icon: 'Utensils', image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() },
  { name: 'الزيوت والعسل', icon: 'Droplets', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() },
  { name: 'المشروبات والقهوة', icon: 'Coffee', image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() },
  { name: 'الأدوات والتقليديات', icon: 'Package', image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() },
  { name: 'الحلويات والمخبوزات', icon: 'Cake', image_url: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80', created_at: new Date().toISOString() }
];

export const INITIAL_ALGERIAN_PRODUCTS: Omit<Product, 'id'>[] = [
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

// Seed Categories in Supabase if empty
export async function seedCategoriesIfEmpty(): Promise<Category[]> {
  try {
    const cats = await getCategoriesSupabase();
    if (cats.length === 0) {
      const created: Category[] = [];
      for (const cat of INITIAL_CATEGORIES) {
        const res = await addCategorySupabase(cat);
        if (res) created.push(res);
      }
      return created;
    }
    return cats;
  } catch (err) {
    console.error('Error seeding categories in Supabase:', err);
    return [];
  }
}

// Seed Products in Supabase if empty
export async function seedProductsIfEmpty(): Promise<void> {
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
  } catch (err) {
    console.error('Error seeding products in Supabase:', err);
  }
}

// Restore default initial categories and products
export async function restoreDefaultData(): Promise<void> {
  try {
    const currentCats = await getCategoriesSupabase();
    if (currentCats.length === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await addCategorySupabase(cat);
      }
    }
    const prods = await getProductsSupabase();
    const existingNames = new Set(prods.map((p) => p.name));
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
  } catch (err) {
    console.error('Error restoring data in Supabase:', err);
  }
}

// Subscribe to active/all products in real-time from Supabase
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  includeInactive = false
): () => void {
  return subscribeToProductsSupabase((prods) => {
    const filtered = includeInactive ? prods : prods.filter((p) => p.active !== false);
    onUpdate(filtered);
  });
}

// Subscribe to Categories in real-time from Supabase
export function subscribeToCategories(onUpdate: (categories: Category[]) => void): () => void {
  return subscribeToCategoriesSupabase(onUpdate);
}

// Add Category (Admin)
export async function addCategory(category: Omit<Category, 'id'>): Promise<string> {
  const res = await addCategorySupabase(category);
  return res ? res.id : '';
}

// Update Category (Admin)
export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  return updateCategorySupabase(id, updates);
}

// Delete Category (Admin)
export async function deleteCategory(id: string): Promise<void> {
  return deleteCategorySupabase(id);
}

// Add Product (Admin)
export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const res = await addProductSupabase(product);
  return res ? res.id : '';
}

// Update Product (Admin)
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  return updateProductSupabase(id, updates);
}

// Save Product (Add or Update)
export async function saveProduct(product: (Omit<Product, 'id'> & { id?: string }) | Product): Promise<string> {
  if ('id' in product && product.id) {
    await updateProductSupabase(product.id, product);
    return product.id;
  } else {
    const res = await addProductSupabase(product as Omit<Product, 'id'>);
    return res ? res.id : '';
  }
}

// Delete Product (Admin)
export async function deleteProduct(id: string): Promise<void> {
  return deleteProductSupabase(id);
}

// Toggle Product Visibility Active / Hidden
export async function toggleProductActive(id: string, currentActive: boolean): Promise<void> {
  return updateProductSupabase(id, { active: !currentActive });
}

// Create Order (Customer)
export async function createOrder(
  customer: CustomerInfo,
  cartItems: CartItem[]
): Promise<{ orderId: string; displayOrderNum: string }> {
  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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

// Subscribe to Orders in real-time (Admin)
export function subscribeToOrders(onUpdate: (orders: Order[]) => void): () => void {
  return subscribeToOrdersSupabase(onUpdate);
}

// Update Order Status (Admin)
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  return updateOrderStatusSupabase(orderId, status);
}

// Delete a single order (Admin)
export async function deleteOrder(orderId: string): Promise<void> {
  return deleteOrderSupabase(orderId);
}

// Delete all delivered orders (Admin)
export async function deleteDeliveredOrders(): Promise<number> {
  return deleteDeliveredOrdersSupabase();
}

// Analytics & Visitor Tracking
export async function trackSiteVisit(): Promise<void> {
  return trackSiteVisitSupabase();
}

export function subscribeToVisitorStats(onUpdate: (stats: VisitorStats) => void): () => void {
  return subscribeToVisitorStatsSupabase(onUpdate);
}

// Ads Management
export async function getAds(): Promise<AdSlot[]> {
  return getAdsSupabase();
}

export function subscribeToAds(onUpdate: (ads: AdSlot[]) => void): () => void {
  return subscribeToAdsSupabase(onUpdate);
}

export async function saveAdSlot(ad: Omit<AdSlot, 'id'> & { id?: string }): Promise<AdSlot> {
  return saveAdSupabase(ad);
}

export async function deleteAdSlot(id: string): Promise<void> {
  return deleteAdSupabase(id);
}

export async function toggleAdSlot(id: string, is_active: boolean): Promise<void> {
  return toggleAdSupabase(id, is_active);
}

// Department Managers & Authentication
export function subscribeToDepartmentManagers(
  onUpdate: (managers: DepartmentManager[]) => void
): () => void {
  return subscribeToDepartmentManagersSupabase(onUpdate);
}

export async function getDepartmentManagers(): Promise<DepartmentManager[]> {
  return getDepartmentManagersSupabase();
}

export async function saveDepartmentManager(
  manager: Omit<DepartmentManager, 'id' | 'created_at'> & { id?: string; created_at?: string }
): Promise<DepartmentManager> {
  return saveDepartmentManagerSupabase(manager);
}

export async function deleteDepartmentManager(id: string): Promise<void> {
  return deleteDepartmentManagerSupabase(id);
}

export async function toggleDepartmentManagerActive(
  id: string,
  is_active: boolean
): Promise<void> {
  return toggleDepartmentManagerActiveSupabase(id, is_active);
}

export async function authenticateDepartmentManager(
  usernameOrPhone: string,
  passwordOrPin: string
): Promise<DepartmentManager | null> {
  return authenticateDepartmentManagerSupabase(usernameOrPhone, passwordOrPin);
}

// Join Requests Management & Submission
export async function submitJoinRequest(
  request: Omit<JoinRequest, 'id' | 'created_at' | 'status'>
): Promise<JoinRequest> {
  return submitJoinRequestSupabase(request);
}

export async function getJoinRequests(): Promise<JoinRequest[]> {
  return getJoinRequestsSupabase();
}

export function subscribeToJoinRequests(
  onUpdate: (requests: JoinRequest[]) => void
): () => void {
  return subscribeToJoinRequestsSupabase(onUpdate);
}

export async function updateJoinRequest(
  id: string,
  updates: Partial<JoinRequest>
): Promise<JoinRequest | null> {
  return updateJoinRequestSupabase(id, updates);
}

export async function deleteJoinRequest(id: string): Promise<void> {
  return deleteJoinRequestSupabase(id);
}

export async function approveAndInviteJoinRequest(params: {
  requestId: string;
  categoryId: string;
  categoryName: string;
  username: string;
  passwordPlain: string;
  notes?: string;
}) {
  return approveAndInviteJoinRequestSupabase(params);
}

export {
  getWhatsappMessagesSupabase,
  subscribeToWhatsappMessagesSupabase,
  triggerWhatsappOrderDispatch,
  getWhatsappConfigStatus,
  saveWhatsappConfig,
  testWhatsappMessage,
  saveCategoryWhatsappNumber,
  syncCategoryWhatsAppFromServer,
  DEFAULT_INITIAL_ADS
};
