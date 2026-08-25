import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Category, Product, Order, OrderItem, OrderStatus, WhatsappOrderMessage, WhatsappConfigStatus, VisitorStats, AdSlot } from '../types';

// Category WhatsApp Numbers local & server synchronization cache
const CATEGORY_WHATSAPP_STORAGE_KEY = 'dz_category_whatsapp_store';
let categoryWhatsAppCache: Record<string, string> = {};

function initCategoryWhatsAppCache(): Record<string, string> {
  try {
    const saved = localStorage.getItem(CATEGORY_WHATSAPP_STORAGE_KEY);
    if (saved) {
      categoryWhatsAppCache = { ...categoryWhatsAppCache, ...JSON.parse(saved) };
    }
  } catch {}
  return categoryWhatsAppCache;
}

// Fetch latest category WhatsApp map from server
export async function syncCategoryWhatsAppFromServer(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/category-whatsapp');
    if (res.ok) {
      const json = await res.json();
      if (json.numbers) {
        categoryWhatsAppCache = { ...categoryWhatsAppCache, ...json.numbers };
        try {
          localStorage.setItem(CATEGORY_WHATSAPP_STORAGE_KEY, JSON.stringify(categoryWhatsAppCache));
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Could not sync category WhatsApp numbers from server:', err);
  }
  return categoryWhatsAppCache;
}

// Save category WhatsApp number both locally and on server
export async function saveCategoryWhatsappNumber(categoryId: string, phone: string): Promise<void> {
  const cleanPhone = (phone || '').trim();
  categoryWhatsAppCache[categoryId] = cleanPhone;

  try {
    localStorage.setItem(CATEGORY_WHATSAPP_STORAGE_KEY, JSON.stringify(categoryWhatsAppCache));
  } catch {}

  try {
    await fetch('/api/category-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, whatsappNumber: cleanPhone })
    });
  } catch (err) {
    console.error('Failed to post category WhatsApp to server:', err);
  }
}

// Initial sync on module load
initCategoryWhatsAppCache();
syncCategoryWhatsAppFromServer();

// Category operations
export async function getCategoriesSupabase(): Promise<Category[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase error fetching categories:', error);
    return [];
  }

  // Ensure latest numbers are synced
  const cache = categoryWhatsAppCache;
  const categories = (data as Category[]).map(cat => ({
    ...cat,
    whatsapp_number: cache[cat.id] || cache[cat.name] || cat.whatsapp_number || ''
  }));

  return categories;
}

export async function addCategorySupabase(cat: Omit<Category, 'id'>): Promise<Category | null> {
  if (!supabase) return null;
  const newId = 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const whatsappNum = (cat.whatsapp_number || '').trim();

  const payload: any = {
    id: newId,
    name: cat.name,
    icon: cat.icon || 'Folder',
    image_url: cat.image_url || '',
    whatsapp_number: whatsappNum,
    created_at: cat.created_at || new Date().toISOString()
  };

  // Save whatsapp number persistently
  if (whatsappNum) {
    saveCategoryWhatsappNumber(newId, whatsappNum);
    saveCategoryWhatsappNumber(cat.name, whatsappNum);
  }

  let { data, error } = await supabase
    .from('categories')
    .insert([payload])
    .select()
    .single();

  if (error && (error.code === 'PGRST204' || error.message.includes('whatsapp_number'))) {
    console.warn('Column whatsapp_number missing in Supabase, falling back without it.');
    delete payload.whatsapp_number;
    const fallbackRes = await supabase
      .from('categories')
      .insert([payload])
      .select()
      .single();
    data = fallbackRes.data;
    error = fallbackRes.error;
  }

  if (error) {
    console.error('Supabase error adding category:', error);
    throw new Error(error.message);
  }

  return {
    ...(data as Category),
    whatsapp_number: whatsappNum
  };
}

export async function updateCategorySupabase(id: string, updates: Partial<Category>): Promise<void> {
  if (!supabase) return;
  const payload: any = { ...updates };
  
  if (updates.whatsapp_number !== undefined) {
    const whatsappNum = (updates.whatsapp_number || '').trim();
    saveCategoryWhatsappNumber(id, whatsappNum);
    if (updates.name) {
      saveCategoryWhatsappNumber(updates.name, whatsappNum);
    }
  }

  let { error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id);

  if (error && (error.code === 'PGRST204' || error.message.includes('whatsapp_number'))) {
    console.warn('Column whatsapp_number missing in Supabase, falling back without it.');
    delete payload.whatsapp_number;
    const fallbackRes = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id);
    error = fallbackRes.error;
  }

  if (error) {
    console.error('Supabase error updating category:', error);
    throw new Error(error.message);
  }
}

export async function deleteCategorySupabase(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase error deleting category:', error);
    throw new Error(error.message);
  }
}

// Product operations
export async function getProductsSupabase(): Promise<Product[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error fetching products:', error);
    return [];
  }
  return data as Product[];
}

export async function addProductSupabase(prod: Omit<Product, 'id'>): Promise<Product | null> {
  if (!supabase) return null;
  const newId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const payload = {
    id: newId,
    name: prod.name,
    description: prod.description || '',
    price: prod.price,
    image_url: prod.image_url || '',
    active: prod.active !== false,
    category_id: prod.category_id || '',
    created_at: prod.created_at || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Supabase error adding product:', error);
    throw new Error(error.message);
  }
  return data as Product;
}

export async function updateProductSupabase(id: string, updates: Partial<Product>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Supabase error updating product:', error);
    throw new Error(error.message);
  }
}

export async function deleteProductSupabase(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase error deleting product:', error);
    throw new Error(error.message);
  }
}

// Order operations
export async function getOrdersSupabase(): Promise<Order[]> {
  if (!supabase) return [];
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Supabase error fetching orders:', ordersError);
    return [];
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select('*');

  if (itemsError) {
    console.error('Supabase error fetching order_items:', itemsError);
  }

  const itemsMap: Record<string, OrderItem[]> = {};
  if (itemsData) {
    itemsData.forEach((item: any) => {
      if (!itemsMap[item.order_id]) {
        itemsMap[item.order_id] = [];
      }
      itemsMap[item.order_id].push({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        subtotal: Number(item.subtotal)
      });
    });
  }

  return (ordersData || []).map((ord: any) => ({
    id: ord.id,
    customer_name: ord.customer_name,
    customer_phone: ord.customer_phone,
    customer_address: ord.customer_address,
    notes: ord.notes || '',
    status: ord.status as OrderStatus,
    total_price: Number(ord.total_price),
    created_at: ord.created_at,
    updated_at: ord.updated_at,
    items: itemsMap[ord.id] || []
  }));
}

export async function createOrderSupabase(
  customer: { customer_name: string; customer_phone: string; customer_address: string; notes?: string },
  cartItems: { product: Product; quantity: number }[],
  totalPrice: number
): Promise<string> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const orderPayload = {
    id: orderId,
    customer_name: customer.customer_name,
    customer_phone: customer.customer_phone,
    customer_address: customer.customer_address,
    notes: customer.notes || '',
    status: 'pending',
    total_price: totalPrice,
    created_at: now,
    updated_at: now
  };

  const { error: orderError } = await supabase
    .from('orders')
    .insert([orderPayload]);

  if (orderError) {
    console.error('Supabase error creating order:', orderError);
    throw new Error(orderError.message);
  }

  const itemsPayload = cartItems.map((ci) => ({
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    order_id: orderId,
    product_id: ci.product.id,
    product_name: ci.product.name,
    price: ci.product.price,
    quantity: ci.quantity,
    subtotal: ci.product.price * ci.quantity
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsPayload);

  if (itemsError) {
    console.error('Supabase error creating order items:', itemsError);
    throw new Error(itemsError.message);
  }

  return orderId;
}

export async function updateOrderStatusSupabase(orderId: string, status: OrderStatus): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) {
    console.error('Supabase error updating order status:', error);
    throw new Error(error.message);
  }
}

export async function deleteOrderSupabase(orderId: string): Promise<void> {
  if (!supabase) return;

  // 1. Delete associated order items
  try {
    await supabase.from('order_items').delete().eq('order_id', orderId);
  } catch (err) {
    console.warn('Error deleting order items:', err);
  }

  // 2. Delete whatsapp logs if any
  try {
    await supabase.from('whatsapp_order_messages').delete().eq('order_id', orderId);
  } catch {}

  // 3. Delete order
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    console.error('Supabase error deleting order:', error);
    throw new Error(error.message);
  }
}

export async function deleteDeliveredOrdersSupabase(): Promise<number> {
  if (!supabase) return 0;

  // 1. Find all delivered order ids
  const { data: delivered, error: fetchErr } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'delivered');

  if (fetchErr || !delivered || delivered.length === 0) {
    return 0;
  }

  const ids = delivered.map((d: any) => d.id);

  // 2. Delete associated items
  try {
    await supabase.from('order_items').delete().in('order_id', ids);
  } catch (err) {
    console.warn('Error deleting items for delivered orders:', err);
  }

  // 3. Delete whatsapp logs
  try {
    await supabase.from('whatsapp_order_messages').delete().in('order_id', ids);
  } catch {}

  // 4. Delete the delivered orders
  const { error: delErr } = await supabase
    .from('orders')
    .delete()
    .in('id', ids);

  if (delErr) {
    console.error('Supabase error deleting delivered orders:', delErr);
    throw new Error(delErr.message);
  }

  return ids.length;
}

// WhatsApp messages tracking and operations
export async function getWhatsappMessagesSupabase(orderId?: string): Promise<WhatsappOrderMessage[]> {
  // Try server endpoint first (which checks Supabase and local store fallback)
  try {
    const url = orderId ? `/api/whatsapp-messages?order_id=${encodeURIComponent(orderId)}` : '/api/whatsapp-messages';
    const res = await fetch(url);
    if (res.ok) {
      const serverData = await res.json();
      if (Array.isArray(serverData) && serverData.length > 0) {
        return serverData;
      }
    }
  } catch {}

  // Direct Supabase query if table exists
  if (!supabase) return [];
  try {
    let query = supabase
      .from('whatsapp_order_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error } = await query;
    if (error) {
      return [];
    }
    return (data || []) as WhatsappOrderMessage[];
  } catch {
    return [];
  }
}

export async function triggerWhatsappOrderDispatch(
  orderId: string,
  categoryId?: string,
  forceRetry = true
): Promise<{ success: boolean; results: any[]; message: string }> {
  try {
    const res = await fetch('/api/send-order-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        category_id: categoryId,
        force_retry: forceRetry
      })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      results: [],
      message: err?.message || 'فشل الاتصال بخادم WhatsApp API'
    };
  }
}

export async function getWhatsappConfigStatus(): Promise<WhatsappConfigStatus> {
  try {
    const res = await fetch('/api/whatsapp-status');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    isConfigured: false,
    hasToken: false,
    phoneNumberId: '',
    wabaId: ''
  };
}

export async function saveWhatsappConfig(config: { phoneNumberId: string; wabaId: string; accessToken: string }) {
  const res = await fetch('/api/whatsapp-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return await res.json();
}

export async function testWhatsappMessage(toPhone: string, message?: string) {
  const res = await fetch('/api/whatsapp-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toPhone, message })
  });
  return await res.json();
}

// Realtime subscriptions
export function subscribeToCategoriesSupabase(callback: (cats: Category[]) => void) {
  if (!supabase) return () => {};
  getCategoriesSupabase().then(callback);

  try {
    const channelId = `public-categories-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        getCategoriesSupabase().then(callback);
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  } catch (err) {
    console.error('Error creating realtime categories subscription:', err);
    return () => {};
  }
}

export function subscribeToProductsSupabase(callback: (prods: Product[]) => void) {
  if (!supabase) return () => {};
  getProductsSupabase().then(callback);

  try {
    const channelId = `public-products-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        getProductsSupabase().then(callback);
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  } catch (err) {
    console.error('Error creating realtime products subscription:', err);
    return () => {};
  }
}

export function subscribeToOrdersSupabase(callback: (orders: Order[]) => void) {
  if (!supabase) return () => {};
  getOrdersSupabase().then(callback);

  try {
    const channelId = `public-orders-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        getOrdersSupabase().then(callback);
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  } catch (err) {
    console.error('Error creating realtime orders subscription:', err);
    return () => {};
  }
}

export function subscribeToWhatsappMessagesSupabase(callback: (messages: WhatsappOrderMessage[]) => void) {
  getWhatsappMessagesSupabase().then(callback);

  if (!supabase) return () => {};

  try {
    const channelId = `public-whatsapp-msgs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_order_messages' }, () => {
        getWhatsappMessagesSupabase().then(callback);
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  } catch (err) {
    console.error('Error creating realtime whatsapp messages subscription:', err);
    return () => {};
  }
}

// Visitor stats tracking with local storage / Supabase fallback
const VISITOR_STORAGE_KEY = 'dz_store_visitor_stats';
const visitorListeners: Set<(stats: VisitorStats) => void> = new Set();

function getStoredVisitorStats(): VisitorStats {
  try {
    const raw = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const todayStr = new Date().toISOString().split('T')[0];
  return {
    total_visits: 124,
    unique_visits: 89,
    today_visits: 14,
    last_visit_date: todayStr,
    last_visit_at: new Date().toISOString(),
    daily_history: [
      { date: todayStr, visits: 14 }
    ]
  };
}

function notifyVisitorListeners(stats: VisitorStats) {
  visitorListeners.forEach((listener) => {
    try {
      listener(stats);
    } catch {}
  });
}

export async function trackSiteVisitSupabase(): Promise<void> {
  try {
    const isNewSession = !sessionStorage.getItem('dz_visitor_session');
    if (isNewSession) {
      sessionStorage.setItem('dz_visitor_session', 'true');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();
    const current = getStoredVisitorStats();

    const lastDate = current.last_visit_date || '';
    let newTodayVisits = current.today_visits || 0;
    if (lastDate === todayStr) {
      newTodayVisits += 1;
    } else {
      newTodayVisits = 1;
    }

    const history = current.daily_history || [];
    const todayIndex = history.findIndex((h) => h.date === todayStr);
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

    const updatedStats: VisitorStats = {
      total_visits: (current.total_visits || 0) + 1,
      unique_visits: isNewSession ? (current.unique_visits || 0) + 1 : (current.unique_visits || 1),
      today_visits: newTodayVisits,
      last_visit_date: todayStr,
      last_visit_at: nowIso,
      daily_history: updatedHistory
    };

    localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(updatedStats));
    notifyVisitorListeners(updatedStats);
  } catch (err) {
    console.error('Error tracking site visit:', err);
  }
}

export function subscribeToVisitorStatsSupabase(onUpdate: (stats: VisitorStats) => void) {
  const initial = getStoredVisitorStats();
  onUpdate(initial);
  visitorListeners.add(onUpdate);

  return () => {
    visitorListeners.delete(onUpdate);
  };
}

// ----------------------------------------------------
// ADS STORAGE & REALTIME MANAGEMENT (HTML Ad Units)
// ----------------------------------------------------
const ADS_STORAGE_KEY = 'dz_store_custom_ads';
const adListeners: Set<(ads: AdSlot[]) => void> = new Set();

export const DEFAULT_INITIAL_ADS: AdSlot[] = [
  {
    id: 'ad_header_top_1',
    title: 'إعلان بانر أعلى الموقع (Header Banner)',
    placement: 'header_top',
    html_code: `<div style="background: linear-gradient(90deg, #065f46 0%, #047857 100%); color: #ffffff; text-align: center; padding: 10px 16px; border-radius: 12px; font-weight: bold; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;">
  <span>🎉 تخفيضات حصرية وعروض خاصة بمناسبة الموسم! اطلب الآن مع توصيل سريع لجميع الولايات.</span>
</div>`,
    is_active: false,
    notes: 'يظهر في أعلى الصفحة لجميع الزوار',
    created_at: new Date().toISOString()
  },
  {
    id: 'ad_home_middle_2',
    title: 'إعلان رئيسي بين الأقسام والمنتجات (Home Banner)',
    placement: 'home_banner',
    html_code: `<div style="background: #ffffff; border: 1px dashed #10b981; padding: 14px; border-radius: 16px; text-align: center;">
  <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #065f46;">مساحة إعلانية مخصصة</p>
  <p style="margin: 0; font-size: 12px; color: #64748b;">يمكنك الصاق كود إعلانك (Google AdSense أو بانر أو كود HTML) من لوحة تحكم الأدمن في أي وقت.</p>
</div>`,
    is_active: false,
    notes: 'يظهر في الصفحة الرئيسية بين الأقسام وقائمة المنتجات',
    created_at: new Date().toISOString()
  },
  {
    id: 'ad_product_grid_3',
    title: 'إعلان وسط شبكة المنتجات (Product Grid Slot)',
    placement: 'product_grid_middle',
    html_code: `<div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 20px; padding: 20px; text-align: center; display: flex; flex-direction: column; items-center; justify-content: center; min-height: 260px;">
  <span style="font-size: 24px; margin-bottom: 8px;">📢</span>
  <h4 style="margin: 0 0 4px; font-weight: 800; font-size: 14px; color: #334155;">مساحة إعلانية ترويجية</h4>
  <p style="margin: 0; font-size: 11px; color: #64748b;">ضع هنا كود إعلانات AdSense أو راعي ترويجي يظهر وسط المنتجات.</p>
</div>`,
    is_active: false,
    notes: 'يظهر كبطاقة إعلانية جذابة بين بطاقات المنتجات في المتجر',
    created_at: new Date().toISOString()
  },
  {
    id: 'ad_footer_bottom_4',
    title: 'إعلان أسفل الموقع قبل الفوتر (Bottom Banner)',
    placement: 'sidebar_or_footer',
    html_code: `<div style="background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 16px; text-align: center; font-size: 13px;">
  <strong style="color: #34d399;">🚚 توصيل مضمون وسريع</strong> إلى باب منزلك مع إمكانية الدفع عند الاستلام والتأكد من الطلبية.
</div>`,
    is_active: false,
    notes: 'يظهر قبل نهاية الصفحة وفوق الفوتر',
    created_at: new Date().toISOString()
  },
  {
    id: 'ad_cart_modal_5',
    title: 'إعلان داخل نافذة سلة المشتريات (Cart Ad)',
    placement: 'cart_modal_bottom',
    html_code: `<div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 10px; text-align: center; font-size: 12px; color: #065f46; font-weight: bold;">
  💡 ملاحظة: يتم تأكيد الطلبيات بسرعة عبر واتساب مباشرة مع خدمة الزبائن.
</div>`,
    is_active: false,
    notes: 'يظهر للزبون أثناء استعراض سلة المشتريات وإتمام الطلب',
    created_at: new Date().toISOString()
  },
  {
    id: 'ad_order_success_6',
    title: 'إعلان صفحة تأكيد واستلام الطلب (Success Screen Ad)',
    placement: 'order_success',
    html_code: `<div style="background: #f0fdf4; border: 1px dashed #22c55e; border-radius: 14px; padding: 12px; text-align: center; font-size: 12px; color: #15803d;">
  🌟 شكراً لثقتكم بنا! تابعوا عروضنا الأسبوعية المتجددة.
</div>`,
    is_active: false,
    notes: 'يظهر للزبون بعد إرسال وتأكيد الطلبية مباشرة',
    created_at: new Date().toISOString()
  },
  {
    id: 'ad_popup_7',
    title: 'إعلان نافذة منبثقة عائمة (Popup Banner)',
    placement: 'popup_ad',
    html_code: `<div style="text-align: center; padding: 10px;">
  <h3 style="margin: 0 0 6px; font-weight: 800; font-size: 16px; color: #0f172a;">🔥 عرض ترويجي خاص!</h3>
  <p style="margin: 0; font-size: 13px; color: #475569;">احصل على أفضل المنتجات الطبيعية والتقليدية مع توصيل سريع لجميع الولايات.</p>
</div>`,
    is_active: false,
    notes: 'إعلان يطفو في زاوية الشاشة أو كنافذة منبثقة مع زر إغلاق سهل',
    created_at: new Date().toISOString()
  },
  {
    id: 'ad_global_head_8',
    title: 'كود إعلانات عام (Header / Global Script / AdSense Auto)',
    placement: 'custom_head_script',
    html_code: `<!-- الصق هنا كود Google AdSense أو أكواد التتبع والإعلانات التلقائية -->`,
    is_active: false,
    notes: 'كود جافاسكريبت أو HTML عام يعمل في خلفية الموقع',
    created_at: new Date().toISOString()
  }
];

function getStoredAds(): AdSlot[] {
  try {
    const raw = localStorage.getItem(ADS_STORAGE_KEY);
    if (raw) {
      const parsed: AdSlot[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [...DEFAULT_INITIAL_ADS];
}

function notifyAdListeners(ads: AdSlot[]) {
  adListeners.forEach(listener => {
    try {
      listener(ads);
    } catch {}
  });
}

export async function getAdsSupabase(): Promise<AdSlot[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as AdSlot[];
      }
    } catch {}
  }
  return getStoredAds();
}

export async function saveAdSupabase(ad: Omit<AdSlot, 'id'> & { id?: string }): Promise<AdSlot> {
  const current = getStoredAds();
  const id = ad.id || `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  const adSlot: AdSlot = {
    id,
    title: ad.title.trim(),
    placement: ad.placement,
    html_code: ad.html_code || '',
    is_active: Boolean(ad.is_active),
    notes: ad.notes || '',
    created_at: ad.created_at || nowIso,
    updated_at: nowIso
  };

  const existingIdx = current.findIndex(a => a.id === id);
  let updated: AdSlot[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = adSlot;
  } else {
    updated = [...current, adSlot];
  }

  localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(updated));
  notifyAdListeners(updated);

  if (supabase) {
    try {
      await supabase.from('ads').upsert(adSlot);
    } catch {}
  }

  return adSlot;
}

export async function deleteAdSupabase(id: string): Promise<void> {
  const current = getStoredAds();
  const filtered = current.filter(a => a.id !== id);
  localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(filtered));
  notifyAdListeners(filtered);

  if (supabase) {
    try {
      await supabase.from('ads').delete().eq('id', id);
    } catch {}
  }
}

export async function toggleAdSupabase(id: string, is_active: boolean): Promise<void> {
  const current = getStoredAds();
  const updated = current.map(a => a.id === id ? { ...a, is_active, updated_at: new Date().toISOString() } : a);
  localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(updated));
  notifyAdListeners(updated);

  if (supabase) {
    try {
      await supabase.from('ads').update({ is_active }).eq('id', id);
    } catch {}
  }
}

export function subscribeToAdsSupabase(onUpdate: (ads: AdSlot[]) => void) {
  const initial = getStoredAds();
  onUpdate(initial);
  adListeners.add(onUpdate);

  if (supabase) {
    getAdsSupabase().then(onUpdate);
  }

  return () => {
    adListeners.delete(onUpdate);
  };
}


