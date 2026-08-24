import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Category, Product, Order, OrderItem, OrderStatus, WhatsappOrderMessage, WhatsappConfigStatus, VisitorStats } from '../types';

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

  // AUTOMATED WHATSAPP DISPATCH (Server-Side)
  // Automatically split order by category and dispatch to WhatsApp Cloud API without manual intervention
  try {
    fetch('/api/send-order-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Automated WhatsApp order dispatch result:', data);
      })
      .catch((err) => {
        console.warn('Background WhatsApp automated dispatch error:', err);
      });
  } catch (err) {
    console.warn('Could not trigger background WhatsApp dispatch:', err);
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

