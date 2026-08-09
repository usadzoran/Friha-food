import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Category, Product, Order, OrderItem, OrderStatus } from '../types';

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
  return data as Category[];
}

export async function addCategorySupabase(cat: Omit<Category, 'id'>): Promise<Category | null> {
  if (!supabase) return null;
  const newId = 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const payload: any = {
    id: newId,
    name: cat.name,
    icon: cat.icon || 'Folder',
    image_url: cat.image_url || '',
    whatsapp_number: cat.whatsapp_number || '',
    created_at: cat.created_at || new Date().toISOString()
  };

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
  return data as Category;
}

export async function updateCategorySupabase(id: string, updates: Partial<Category>): Promise<void> {
  if (!supabase) return;
  const payload: any = { ...updates };
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

// Realtime subscriptions
export function subscribeToCategoriesSupabase(callback: (cats: Category[]) => void) {
  if (!supabase) return () => {};
  getCategoriesSupabase().then(callback);

  const channel = supabase
    .channel('public:categories')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
      getCategoriesSupabase().then(callback);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToProductsSupabase(callback: (prods: Product[]) => void) {
  if (!supabase) return () => {};
  getProductsSupabase().then(callback);

  const channel = supabase
    .channel('public:products')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
      getProductsSupabase().then(callback);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToOrdersSupabase(callback: (orders: Order[]) => void) {
  if (!supabase) return () => {};
  getOrdersSupabase().then(callback);

  const channel = supabase
    .channel('public:orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      getOrdersSupabase().then(callback);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
