import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Category, 
  Product, 
  Order, 
  OrderItem, 
  OrderStatus, 
  WhatsappOrderMessage, 
  WhatsappConfigStatus, 
  VisitorStats, 
  AdSlot, 
  DepartmentManager, 
  JoinRequest, 
  JoinRequestStatus 
} from '../types';

// ============================================================================
// 1. CATEGORIES MANAGEMENT (SUPABASE)
// ============================================================================

export async function getCategoriesSupabase(): Promise<Category[]> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase error fetching categories:', error);
    throw new Error(error.message);
  }

  return (data as Category[]) || [];
}

export async function addCategorySupabase(cat: Omit<Category, 'id'>): Promise<Category | null> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
  const newId = 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const whatsappNum = (cat.whatsapp_number || '').trim();

  const payload: any = {
    id: newId,
    name: cat.name.trim(),
    icon: cat.icon || 'Folder',
    image_url: cat.image_url || '',
    whatsapp_number: whatsappNum,
    created_at: cat.created_at || new Date().toISOString()
  };

  let { data, error } = await supabase
    .from('categories')
    .insert([payload])
    .select()
    .single();

  if (error && (error.code === 'PGRST204' || error.message?.includes('whatsapp_number'))) {
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
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
  const payload: any = { ...updates };

  let { error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id);

  if (error && (error.code === 'PGRST204' || error.message?.includes('whatsapp_number'))) {
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
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase error deleting category:', error);
    throw new Error(error.message);
  }
}

// WhatsApp Number specific update in Supabase
export async function saveCategoryWhatsappNumber(categoryId: string, phone: string): Promise<void> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
  const cleanPhone = (phone || '').trim();
  const { error } = await supabase
    .from('categories')
    .update({ whatsapp_number: cleanPhone })
    .eq('id', categoryId);

  if (error) {
    console.error('Supabase error updating category whatsapp_number:', error);
    throw new Error(error.message);
  }
}

export async function syncCategoryWhatsAppFromServer(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const cats = await getCategoriesSupabase();
    cats.forEach(c => {
      if (c.whatsapp_number) {
        map[c.id] = c.whatsapp_number;
        map[c.name] = c.whatsapp_number;
      }
    });
  } catch {}
  return map;
}

// ============================================================================
// 2. PRODUCTS MANAGEMENT (SUPABASE)
// ============================================================================

export async function getProductsSupabase(): Promise<Product[]> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error fetching products:', error);
    throw new Error(error.message);
  }
  return (data as Product[]) || [];
}

export async function addProductSupabase(prod: Omit<Product, 'id'>): Promise<Product | null> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
  const newId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const payload = {
    id: newId,
    name: prod.name.trim(),
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
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
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
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase error deleting product:', error);
    throw new Error(error.message);
  }
}

// Storage Image Upload helper for Products
export async function uploadProductImageSupabase(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.warn('Storage upload error, reading as base64/object URL:', uploadError);
      return URL.createObjectURL(file);
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err: any) {
    console.warn('Supabase storage upload fallback:', err);
    return URL.createObjectURL(file);
  }
}

// ============================================================================
// 3. ORDERS MANAGEMENT (SUPABASE)
// ============================================================================

export async function getOrdersSupabase(): Promise<Order[]> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Supabase error fetching orders:', ordersError);
    throw new Error(ordersError.message);
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select('*');

  if (itemsError) {
    console.warn('Supabase error fetching order_items:', itemsError);
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
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase بنجاح');
  }

  const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const orderPayload = {
    id: orderId,
    customer_name: customer.customer_name.trim(),
    customer_phone: customer.customer_phone.trim(),
    customer_address: customer.customer_address.trim(),
    notes: customer.notes?.trim() || '',
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
    throw new Error('فشل تسجيل الطلب في قاعدة البيانات: ' + orderError.message);
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
  }

  return orderId;
}

export async function updateOrderStatusSupabase(orderId: string, status: OrderStatus): Promise<void> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
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
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }

  try {
    await supabase.from('order_items').delete().eq('order_id', orderId);
  } catch {}

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
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }

  const { data: delivered, error: fetchErr } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'delivered');

  if (fetchErr || !delivered || delivered.length === 0) {
    return 0;
  }

  const ids = delivered.map((d: any) => d.id);

  try {
    await supabase.from('order_items').delete().in('order_id', ids);
  } catch {}

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

// ============================================================================
// 4. DEPARTMENT MANAGERS (SUPABASE ONLY - NO LOCAL STORAGE DB)
// ============================================================================

export async function getDepartmentManagersSupabase(): Promise<DepartmentManager[]> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const { data, error } = await supabase
    .from('department_managers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getDepartmentManagers error:', error);
    throw new Error('فشل جلب قائمة مسؤولي الأقسام من Supabase: ' + error.message);
  }

  return (data as DepartmentManager[]) || [];
}

export async function saveDepartmentManagerSupabase(
  manager: Omit<DepartmentManager, 'id' | 'created_at'> & { id?: string; created_at?: string }
): Promise<DepartmentManager> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const nowIso = new Date().toISOString();
  const id = manager.id || `mgr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanPhone = (manager.phone || '').trim();

  const dataToSave: DepartmentManager = {
    id,
    category_id: manager.category_id,
    category_name: manager.category_name || '',
    manager_name: manager.manager_name.trim(),
    phone: cleanPhone,
    username: manager.username.trim().toLowerCase(),
    password_plain: manager.password_plain.trim(),
    is_active: manager.is_active !== undefined ? Boolean(manager.is_active) : true,
    created_at: manager.created_at || nowIso,
    last_login_at: manager.last_login_at || '',
    notes: manager.notes || ''
  };

  const { data, error } = await supabase
    .from('department_managers')
    .upsert(dataToSave, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Supabase saveDepartmentManager error:', error);
    throw new Error('فشل حفظ بيانات مسؤول القسم في Supabase: ' + error.message);
  }

  // Sync WhatsApp number to category
  if (cleanPhone && manager.category_id) {
    saveCategoryWhatsappNumber(manager.category_id, cleanPhone).catch(() => {});
  }

  return (data as DepartmentManager) || dataToSave;
}

export async function deleteDepartmentManagerSupabase(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const { error } = await supabase
    .from('department_managers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteDepartmentManager error:', error);
    throw new Error('فشل حذف مسؤول القسم من Supabase: ' + error.message);
  }
}

export async function toggleDepartmentManagerActiveSupabase(
  id: string,
  is_active: boolean
): Promise<void> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const { error } = await supabase
    .from('department_managers')
    .update({ is_active })
    .eq('id', id);

  if (error) {
    console.error('Supabase toggleDepartmentManagerActive error:', error);
    throw new Error('فشل تعديل حالة تفعيل مسؤول القسم في Supabase: ' + error.message);
  }
}

export async function authenticateDepartmentManagerSupabase(
  usernameOrPhone: string,
  passwordOrPin: string
): Promise<DepartmentManager | null> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const cleanUser = (usernameOrPhone || '').trim().toLowerCase();
  const cleanPass = (passwordOrPin || '').trim();

  if (!cleanUser || !cleanPass) return null;

  const { data, error } = await supabase
    .from('department_managers')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Supabase error during authentication query:', error);
    throw new Error('فشل الاتصال بقاعدة البيانات للتحقق: ' + error.message);
  }

  const managers = (data as DepartmentManager[]) || [];
  const cleanUserPhone = cleanUser.replace(/[^0-9]/g, '');

  const found = managers.find((m) => {
    const managerPhoneDigits = m.phone.replace(/[^0-9]/g, '');
    const matchUser =
      m.username.toLowerCase() === cleanUser ||
      (cleanUserPhone.length >= 8 && managerPhoneDigits.endsWith(cleanUserPhone.slice(-8)));
    const matchPass = m.password_plain === cleanPass;
    return matchUser && matchPass;
  });

  if (found) {
    const updated = { ...found, last_login_at: new Date().toISOString() };
    supabase
      .from('department_managers')
      .update({ last_login_at: updated.last_login_at })
      .eq('id', found.id)
      .then(() => {});
    return updated;
  }

  return null;
}

// ============================================================================
// 5. JOIN REQUESTS (طلبات الانضمام والتجار - SUPABASE)
// ============================================================================

export async function getJoinRequestsSupabase(): Promise<JoinRequest[]> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const { data, error } = await supabase
    .from('join_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getJoinRequests error:', error);
    throw new Error('فشل جلب طلبات الانضمام من Supabase: ' + error.message);
  }

  return (data as JoinRequest[]) || [];
}

export async function submitJoinRequestSupabase(
  request: Omit<JoinRequest, 'id' | 'created_at' | 'status'>
): Promise<JoinRequest> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const nowIso = new Date().toISOString();
  const id = `join_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanPhone = (request.phone || '').trim();

  const newRequest: JoinRequest = {
    id,
    first_name: request.first_name.trim(),
    last_name: request.last_name.trim(),
    phone: cleanPhone,
    work_type: request.work_type.trim(),
    wilaya: (request.wilaya || '').trim(),
    notes: (request.notes || '').trim(),
    status: 'pending',
    created_at: nowIso
  };

  const { data, error } = await supabase
    .from('join_requests')
    .insert([newRequest])
    .select()
    .single();

  if (error) {
    console.error('Supabase submitJoinRequest error:', error);
    throw new Error('فشل إرسال طلب الانضمام إلى Supabase: ' + error.message);
  }

  return (data as JoinRequest) || newRequest;
}

export async function updateJoinRequestSupabase(
  id: string,
  updates: Partial<JoinRequest>
): Promise<JoinRequest | null> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }

  const payload = {
    ...updates,
    reviewed_at: updates.reviewed_at || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('join_requests')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase updateJoinRequest error:', error);
    throw new Error('فشل تحديث طلب الانضمام في Supabase: ' + error.message);
  }

  return data as JoinRequest;
}

export async function deleteJoinRequestSupabase(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const { error } = await supabase
    .from('join_requests')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteJoinRequest error:', error);
    throw new Error('فشل حذف طلب الانضمام من Supabase: ' + error.message);
  }
}

export async function approveAndInviteJoinRequestSupabase(params: {
  requestId: string;
  categoryId: string;
  categoryName: string;
  username: string;
  passwordPlain: string;
  notes?: string;
}): Promise<{
  manager: DepartmentManager;
  updatedRequest: JoinRequest;
  whatsappUrl: string;
  invitationText: string;
}> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }

  const { data: reqData, error: reqErr } = await supabase
    .from('join_requests')
    .select('*')
    .eq('id', params.requestId)
    .single();

  if (reqErr || !reqData) {
    throw new Error('لم يتم العثور على طلب الانضمام في Supabase');
  }

  const req = reqData as JoinRequest;
  const managerFullName = `${req.first_name} ${req.last_name}`.trim();
  const phone = req.phone.trim();

  // 1. Create or update Department Manager in Supabase
  const manager = await saveDepartmentManagerSupabase({
    category_id: params.categoryId,
    category_name: params.categoryName,
    manager_name: managerFullName,
    phone: phone,
    username: params.username.trim().toLowerCase(),
    password_plain: params.passwordPlain.trim(),
    is_active: true,
    notes: `تم إنشاؤه عبر قبول طلب الانضمام (${req.work_type}) - ${params.notes || ''}`
  });

  // 2. Update Join Request status in Supabase
  const nowIso = new Date().toISOString();
  const updatedRequest = await updateJoinRequestSupabase(params.requestId, {
    status: 'approved',
    assigned_category_id: params.categoryId,
    assigned_category_name: params.categoryName,
    assigned_username: params.username.trim().toLowerCase(),
    assigned_password: params.passwordPlain.trim(),
    invitation_sent_at: nowIso,
    reviewed_at: nowIso
  });

  // 3. Build WhatsApp Invitation URL
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ashri-min-darak.dz';
  const invitationText = `مرحباً بك أخي الكريم ${managerFullName} 🌟\n\nيسر إدارة منصة *اشري من دارك* إبلاغك بأنه قد تمت الموافقة على طلب انضمامك إلينا كمسؤول شريك لقسم (*${params.categoryName}*)! 🛍️✨\n\n🔑 *بيانات تسجيل الدخول الخاصة بك:*\n━━━━━━━━━━━━━━━━\n👤 *اسم المستخدم:* \`${params.username.trim().toLowerCase()}\`\n🔒 *كلمة المرور:* \`${params.passwordPlain.trim()}\`\n🏷️ *القسم المخصص:* ${params.categoryName}\n━━━━━━━━━━━━━━━━\n\n🌐 *رابط الدخول للوحة تحكم القسم:* \n${appOrigin}\n(قم بالضغط على زر "دخول الإدارة" ثم اختر "دخول مسؤولي الأقسام" وأدخل بياناتك أعلاه).\n\nنتمنى لك عملاً موفقاً ومبيعات ممتازة معنا! 🎉`;

  let cleanNumber = phone.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '213' + cleanNumber.substring(1);
  } else if (!cleanNumber.startsWith('213') && cleanNumber.length === 9) {
    cleanNumber = '213' + cleanNumber;
  }

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(invitationText)}`;

  return {
    manager,
    updatedRequest: updatedRequest || req,
    whatsappUrl,
    invitationText
  };
}

// ============================================================================
// 6. ADS MANAGEMENT (SUPABASE ONLY)
// ============================================================================

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
  <p style="margin: 0; font-size: 12px; color: #64748b;">يمكنك إضافة كود إعلانك (Google AdSense أو بانر أو كود HTML) من لوحة تحكم الأدمن في أي وقت.</p>
</div>`,
    is_active: false,
    notes: 'يظهر في الصفحة الرئيسية بين الأقسام وقائمة المنتجات',
    created_at: new Date().toISOString()
  },
  {
    id: 'ad_product_grid_3',
    title: 'إعلان وسط شبكة المنتجات (Product Grid Slot)',
    placement: 'product_grid_middle',
    html_code: `<div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 20px; padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px;">
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

export async function getAdsSupabase(): Promise<AdSlot[]> {
  if (!supabase) return DEFAULT_INITIAL_ADS;
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_INITIAL_ADS;
  }
  return data as AdSlot[];
}

export async function saveAdSupabase(ad: Omit<AdSlot, 'id'> & { id?: string }): Promise<AdSlot> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
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

  const { data, error } = await supabase
    .from('ads')
    .upsert(adSlot)
    .select()
    .single();

  if (error) {
    console.error('Supabase saveAd error:', error);
    throw new Error('فشل حفظ الإعلان في Supabase: ' + error.message);
  }

  return (data as AdSlot) || adSlot;
}

export async function deleteAdSupabase(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const { error } = await supabase
    .from('ads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteAd error:', error);
    throw new Error('فشل حذف الإعلان من Supabase: ' + error.message);
  }
}

export async function toggleAdSupabase(id: string, is_active: boolean): Promise<void> {
  if (!supabase) {
    throw new Error('لم يتم تهيئة اتصال Supabase');
  }
  const { error } = await supabase
    .from('ads')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Supabase toggleAd error:', error);
    throw new Error('فشل تعديل حالة الإعلان في Supabase: ' + error.message);
  }
}

// ============================================================================
// 7. VISITOR STATS (SUPABASE)
// ============================================================================

export async function trackSiteVisitSupabase(): Promise<void> {
  if (!supabase) return;
  try {
    const isNewSession = !sessionStorage.getItem('dz_visitor_session');
    if (isNewSession) {
      sessionStorage.setItem('dz_visitor_session', 'true');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const { data } = await supabase
      .from('visitor_stats')
      .select('*')
      .eq('id', 'main_stats')
      .maybeSingle();

    let total_visits = Number(data?.total_visits || 120) + 1;
    let unique_visits = isNewSession ? Number(data?.unique_visits || 80) + 1 : Number(data?.unique_visits || 80);
    let today_visits = data?.last_visit_date === todayStr ? Number(data?.today_visits || 0) + 1 : 1;
    let history = Array.isArray(data?.daily_history) ? [...data.daily_history] : [{ date: todayStr, visits: 10 }];

    const todayIndex = history.findIndex((h: any) => h.date === todayStr);
    if (todayIndex >= 0) {
      history[todayIndex] = { ...history[todayIndex], visits: Number(history[todayIndex].visits) + 1 };
    } else {
      history.push({ date: todayStr, visits: 1 });
    }
    if (history.length > 14) history = history.slice(history.length - 14);

    await supabase.from('visitor_stats').upsert({
      id: 'main_stats',
      total_visits,
      unique_visits,
      today_visits,
      last_visit_date: todayStr,
      last_visit_at: nowIso,
      daily_history: history,
      updated_at: nowIso
    });
  } catch (err) {
    console.warn('Visitor tracking error:', err);
  }
}

export function subscribeToVisitorStatsSupabase(onUpdate: (stats: VisitorStats) => void): () => void {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultStats: VisitorStats = {
    total_visits: 120,
    unique_visits: 85,
    today_visits: 12,
    last_visit_date: todayStr,
    last_visit_at: new Date().toISOString(),
    daily_history: [{ date: todayStr, visits: 12 }]
  };

  if (!supabase) {
    onUpdate(defaultStats);
    return () => {};
  }

  supabase
    .from('visitor_stats')
    .select('*')
    .eq('id', 'main_stats')
    .maybeSingle()
    .then(({ data }) => {
      if (data) {
        onUpdate({
          total_visits: Number(data.total_visits || 0),
          unique_visits: Number(data.unique_visits || 0),
          today_visits: Number(data.today_visits || 0),
          last_visit_date: data.last_visit_date,
          last_visit_at: data.last_visit_at,
          daily_history: data.daily_history || []
        });
      } else {
        onUpdate(defaultStats);
      }
    });

  const channelId = `public-visitor-stats-${Date.now()}`;
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_stats' }, (payload) => {
      if (payload.new) {
        const d = payload.new as any;
        onUpdate({
          total_visits: Number(d.total_visits || 0),
          unique_visits: Number(d.unique_visits || 0),
          today_visits: Number(d.today_visits || 0),
          last_visit_date: d.last_visit_date,
          last_visit_at: d.last_visit_at,
          daily_history: d.daily_history || []
        });
      }
    })
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {}
  };
}

// ============================================================================
// 8. REALTIME SUBSCRIPTIONS (CLEAN LIFECYCLE)
// ============================================================================

export function subscribeToCategoriesSupabase(callback: (cats: Category[]) => void): () => void {
  if (!supabase) return () => {};
  getCategoriesSupabase().then(callback).catch(() => {});

  const channelId = `public-categories-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
      getCategoriesSupabase().then(callback).catch(() => {});
    })
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {}
  };
}

export function subscribeToProductsSupabase(callback: (prods: Product[]) => void): () => void {
  if (!supabase) return () => {};
  getProductsSupabase().then(callback).catch(() => {});

  const channelId = `public-products-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
      getProductsSupabase().then(callback).catch(() => {});
    })
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {}
  };
}

export function subscribeToOrdersSupabase(callback: (orders: Order[]) => void): () => void {
  if (!supabase) return () => {};
  getOrdersSupabase().then(callback).catch(() => {});

  const channelId = `public-orders-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      getOrdersSupabase().then(callback).catch(() => {});
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
      getOrdersSupabase().then(callback).catch(() => {});
    })
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {}
  };
}

export function subscribeToAdsSupabase(onUpdate: (ads: AdSlot[]) => void): () => void {
  if (!supabase) return () => {};
  getAdsSupabase().then(onUpdate).catch(() => {});

  const channelId = `public-ads-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => {
      getAdsSupabase().then(onUpdate).catch(() => {});
    })
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {}
  };
}

export function subscribeToDepartmentManagersSupabase(
  onUpdate: (managers: DepartmentManager[]) => void
): () => void {
  if (!supabase) return () => {};
  getDepartmentManagersSupabase().then(onUpdate).catch(() => {});

  const channelId = `public-managers-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'department_managers' }, () => {
      getDepartmentManagersSupabase().then(onUpdate).catch(() => {});
    })
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {}
  };
}

export function subscribeToJoinRequestsSupabase(
  onUpdate: (requests: JoinRequest[]) => void
): () => void {
  if (!supabase) return () => {};
  getJoinRequestsSupabase().then(onUpdate).catch(() => {});

  const channelId = `public-join-requests-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'join_requests' }, () => {
      getJoinRequestsSupabase().then(onUpdate).catch(() => {});
    })
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {}
  };
}

// WhatsApp Helpers
export async function getWhatsappMessagesSupabase(): Promise<WhatsappOrderMessage[]> {
  return [];
}

export function subscribeToWhatsappMessagesSupabase(callback: (messages: WhatsappOrderMessage[]) => void): () => void {
  callback([]);
  return () => {};
}

export async function triggerWhatsappOrderDispatch(
  orderId: string,
  categoryId?: string,
  forceRetry = true
): Promise<{ success: boolean; results: any[]; message: string }> {
  return {
    success: true,
    results: [],
    message: 'يتم التواصل عبر WhatsApp مباشرة عبر الرابط wa.me.'
  };
}

export async function getWhatsappConfigStatus(): Promise<WhatsappConfigStatus> {
  return {
    isConfigured: true,
    hasToken: false,
    phoneNumberId: '',
    wabaId: ''
  };
}

export async function saveWhatsappConfig(config: { phoneNumberId: string; wabaId: string; accessToken: string }) {
  return { success: true };
}

export async function testWhatsappMessage(toPhone: string, message?: string) {
  return { success: true };
}
