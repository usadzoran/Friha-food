import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

export interface WhatsAppConfig {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
}

export interface SendResult {
  categoryId: string;
  categoryName: string;
  whatsappNumber: string;
  status: 'sent' | 'failed' | 'skipped';
  messageId?: string;
  errorMessage?: string;
  messageText?: string;
}

// In-memory / disk cache for messages if Supabase table isn't created yet
const LOCAL_MESSAGES_FILE = path.join(process.cwd(), 'whatsapp_messages_store.json');
const LOCAL_CONFIG_FILE = path.join(process.cwd(), 'whatsapp_config.json');
const LOCAL_CATEGORY_WHATSAPP_FILE = path.join(process.cwd(), 'category_whatsapp_store.json');

// Category WhatsApp Numbers Store (Persistent Map)
export function getCategoryWhatsAppNumbers(): Record<string, string> {
  try {
    if (fs.existsSync(LOCAL_CATEGORY_WHATSAPP_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_CATEGORY_WHATSAPP_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading category WhatsApp store:', err);
  }
  return {};
}

export function saveCategoryWhatsAppNumbers(map: Record<string, string>): Record<string, string> {
  const current = getCategoryWhatsAppNumbers();
  const merged = { ...current, ...map };
  try {
    fs.writeFileSync(LOCAL_CATEGORY_WHATSAPP_FILE, JSON.stringify(merged, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving category WhatsApp store:', err);
  }
  return merged;
}

export function saveSingleCategoryWhatsAppNumber(categoryId: string, phone: string): Record<string, string> {
  const current = getCategoryWhatsAppNumbers();
  current[categoryId] = (phone || '').trim();
  try {
    fs.writeFileSync(LOCAL_CATEGORY_WHATSAPP_FILE, JSON.stringify(current, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving single category WhatsApp number:', err);
  }
  return current;
}

function getLocalConfig(): WhatsAppConfig {
  let config: WhatsAppConfig = {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || ''
  };

  try {
    if (fs.existsSync(LOCAL_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_CONFIG_FILE, 'utf8'));
      if (data.phoneNumberId) config.phoneNumberId = data.phoneNumberId;
      if (data.wabaId) config.wabaId = data.wabaId;
      if (data.accessToken) config.accessToken = data.accessToken;
    }
  } catch (err) {
    console.error('Error reading local WhatsApp config:', err);
  }

  return config;
}

export function saveLocalConfig(newConfig: Partial<WhatsAppConfig>): WhatsAppConfig {
  const current = getLocalConfig();
  const updated: WhatsAppConfig = {
    phoneNumberId: (newConfig.phoneNumberId ?? current.phoneNumberId).trim(),
    wabaId: (newConfig.wabaId ?? current.wabaId).trim(),
    accessToken: (newConfig.accessToken ?? current.accessToken).trim()
  };

  try {
    fs.writeFileSync(LOCAL_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local WhatsApp config:', err);
  }

  return updated;
}

export function getPublicConfigStatus() {
  const config = getLocalConfig();
  const hasToken = Boolean(config.accessToken && config.accessToken.length > 10);
  const hasPhoneId = Boolean(config.phoneNumberId && config.phoneNumberId.length > 3);
  
  return {
    isConfigured: Boolean(hasToken && hasPhoneId),
    hasToken,
    phoneNumberId: config.phoneNumberId ? `${config.phoneNumberId.slice(0, 4)}...${config.phoneNumberId.slice(-3)}` : '',
    wabaId: config.wabaId ? `${config.wabaId.slice(0, 4)}...${config.wabaId.slice(-3)}` : ''
  };
}

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://oauuyyluzlbhttjiehwi.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdXV5eWx1emxiaHR0amllaHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDk4NTYsImV4cCI6MjEwMTUyNTg1Nn0.0s66Vm0m2blDl-LadmB28eBOtf2b2tWq4-n-xVQGt1I';
  if (!url || !key) return null;
  return createClient(url, key);
}

// Local messages fallback store
function getLocalMessages(): any[] {
  try {
    if (fs.existsSync(LOCAL_MESSAGES_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_MESSAGES_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function saveLocalMessage(msg: any) {
  try {
    const list = getLocalMessages();
    const existingIdx = list.findIndex(m => m.id === msg.id || (m.order_id === msg.order_id && m.category_id === msg.category_id));
    if (existingIdx >= 0) {
      list[existingIdx] = msg;
    } else {
      list.push(msg);
    }
    fs.writeFileSync(LOCAL_MESSAGES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local WhatsApp message:', err);
  }
}

// Format Phone Number to E.164 (Algerian default: 0550000000 -> 213550000000)
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.replace(/\D/g, ''); // keep only numbers
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('0') && cleaned.length >= 9) {
    // Local Algerian format 05..., 06..., 07...
    cleaned = '213' + cleaned.substring(1);
  }
  return cleaned;
}

// Format WhatsApp Receipt Message in Arabic for a specific department
export function formatDepartmentOrderMessage(
  order: any,
  deptName: string,
  deptItems: Array<{ product_name: string; quantity: number; price: number; subtotal: number }>,
  deptTotal: number
): string {
  const displayNum = `DZ-${order.id.slice(-6).toUpperCase()}`;

  const itemsList = deptItems.map(item => {
    return `▫️ *${item.product_name}*\n   الكمية: ${item.quantity} | السعر: ${item.price.toLocaleString('ar-DZ')} د.ج`;
  }).join('\n\n');

  return (
    `🛒 *طلب جديد #${displayNum}*\n` +
    `🏢 *القسم:* ${deptName}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 *معلومات الزبون:*\n` +
    `• *الاسم:* ${order.customer_name}\n` +
    `• *الهاتف:* ${order.customer_phone}\n` +
    `• *العنوان:* ${order.customer_address}\n` +
    (order.notes ? `• *ملاحظات:* ${order.notes}\n` : '') +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📦 *المنتجات المطلوبة:* \n\n` +
    `${itemsList}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💰 *مجموع قسم (${deptName}):* ${deptTotal.toLocaleString('ar-DZ')} د.ج\n` +
    `💵 *المجموع الإجمالي للطلبية:* ${Number(order.total_price || 0).toLocaleString('ar-DZ')} د.ج\n` +
    `⏰ *الوقت:* ${new Date(order.created_at || Date.now()).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `_تم إرسال هذا الإشعار تلقائياً من نظام إدارة الطلبات (اشري من دارك)_`
  );
}

// Send single message via Meta WhatsApp Cloud API
export async function sendWhatsAppCloudMessage(
  toPhone: string,
  messageText: string,
  config?: WhatsAppConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const cfg = config || getLocalConfig();
  const normalizedPhone = normalizePhoneNumber(toPhone);

  if (!normalizedPhone || normalizedPhone.length < 8) {
    return { success: false, error: 'رقم هاتف الواتساب غير صالح أو فارغ.' };
  }

  if (!cfg.phoneNumberId || !cfg.accessToken) {
    return {
      success: false,
      error: 'لم يتم تكوين إعدادات WhatsApp Cloud API في الخادم (Phone Number ID أو Access Token مفقود). يرجى إدخال البيانات في إعدادات لوحة التحكم.'
    };
  }

  const endpoint = `https://graph.facebook.com/v21.0/${cfg.phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: messageText
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data: any = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.error?.error_user_msg || `Meta API Error (${response.status})`;
      console.error('Meta WhatsApp Cloud API error:', data);
      return { success: false, error: errorMsg };
    }

    const messageId = data?.messages?.[0]?.id || 'wamid_unknown';
    return { success: true, messageId };
  } catch (err: any) {
    console.error('Fetch error sending WhatsApp Cloud API message:', err);
    return { success: false, error: err?.message || 'Network error connecting to Meta WhatsApp API' };
  }
}

// Process and dispatch an entire order split strictly by category
export async function dispatchOrderToWhatsAppDepartments(
  orderId: string,
  options: { targetCategoryId?: string; forceRetry?: boolean } = {}
): Promise<{ success: boolean; results: SendResult[]; message: string }> {
  const supabase = getSupabaseClient();
  const config = getLocalConfig();

  if (!orderId) {
    return { success: false, results: [], message: 'order_id is required' };
  }

  // 1. Fetch Order
  let order: any = null;
  let orderItems: any[] = [];
  let products: any[] = [];
  let categories: any[] = [];

  if (supabase) {
    const { data: ord, error: ordErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (ordErr || !ord) {
      return { success: false, results: [], message: `Order not found in Supabase: ${ordErr?.message || orderId}` };
    }
    order = ord;

    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    orderItems = items || [];

    // Fetch products
    const { data: prods } = await supabase
      .from('products')
      .select('*');
    products = prods || [];

    // Fetch categories
    const { data: cats } = await supabase
      .from('categories')
      .select('*');
    categories = cats || [];
  } else {
    return { success: false, results: [], message: 'Supabase client unavailable' };
  }

  if (orderItems.length === 0) {
    return { success: false, results: [], message: 'Order has no items to dispatch.' };
  }

  // Map products to categories
  const productCategoryMap: Record<string, string> = {};
  products.forEach(p => {
    productCategoryMap[p.id] = p.category_id || 'uncategorized';
  });

  // Group items by category_id
  const categoryItemsMap: Record<string, typeof orderItems> = {};
  orderItems.forEach(item => {
    // Find category ID from product
    const catId = productCategoryMap[item.product_id] || 'uncategorized';
    if (!categoryItemsMap[catId]) {
      categoryItemsMap[catId] = [];
    }
    categoryItemsMap[catId].push(item);
  });

  // Fetch existing dispatched messages for deduplication
  const existingMessagesMap: Record<string, any> = {};
  if (supabase) {
    const { data: existingMsgs } = await supabase
      .from('whatsapp_order_messages')
      .select('*')
      .eq('order_id', orderId);
    if (existingMsgs) {
      existingMsgs.forEach(m => {
        existingMessagesMap[m.category_id] = m;
      });
    }
  }

  // Also check local store fallback
  const localMsgs = getLocalMessages().filter(m => m.order_id === orderId);
  localMsgs.forEach(m => {
    if (!existingMessagesMap[m.category_id]) {
      existingMessagesMap[m.category_id] = m;
    }
  });

  const categoryEntries = Object.entries(categoryItemsMap);
  const results: SendResult[] = [];
  const storedCategoryPhones = getCategoryWhatsAppNumbers();

  for (const [catId, items] of categoryEntries) {
    // If targetCategoryId is specified, filter for that category only
    if (options.targetCategoryId && options.targetCategoryId !== catId) {
      continue;
    }

    const categoryObj = categories.find(c => c.id === catId || c.name === catId);
    const categoryName = categoryObj ? categoryObj.name : (catId === 'uncategorized' ? 'قسم عام' : catId);
    
    // Look up phone from multiple sources (object, id in store, name in store)
    const rawPhone = (
      categoryObj?.whatsapp_number ||
      storedCategoryPhones[catId] ||
      (categoryObj ? storedCategoryPhones[categoryObj.id] : '') ||
      (categoryObj ? storedCategoryPhones[categoryObj.name] : '') ||
      storedCategoryPhones[categoryName] ||
      ''
    ).trim();
    const deptTotal = items.reduce((sum, it) => sum + (Number(it.subtotal) || Number(it.price) * Number(it.quantity)), 0);

    // Deduplication check: Has this category already been successfully sent for this order?
    const existing = existingMessagesMap[catId];
    if (existing && existing.status === 'sent' && !options.forceRetry) {
      results.push({
        categoryId: catId,
        categoryName,
        whatsappNumber: rawPhone,
        status: 'skipped',
        messageId: existing.provider_message_id,
        errorMessage: 'تم إرسال هذا الطلب لهذا القسم سابقاً بنجاح (تم التخطي لمنع التكرار).'
      });
      continue;
    }

    const messageText = formatDepartmentOrderMessage(order, categoryName, items, deptTotal);
    const msgId = 'wamsg_' + orderId + '_' + catId + '_' + Date.now();
    const now = new Date().toISOString();

    if (!rawPhone || !rawPhone.trim()) {
      const errorMsg = `لا يوجد رقم WhatsApp مخصص لقسم "${categoryName}". يرجى إضافة الرقم في لوحة التحكم.`;
      
      const recordPayload = {
        id: msgId,
        order_id: orderId,
        category_id: catId,
        whatsapp_number: '',
        message: messageText,
        status: 'failed',
        error_message: errorMsg,
        created_at: now
      };

      if (supabase) {
        await supabase.from('whatsapp_order_messages').upsert([recordPayload], { onConflict: 'id' }).select();
      }
      saveLocalMessage(recordPayload);

      results.push({
        categoryId: catId,
        categoryName,
        whatsappNumber: '',
        status: 'failed',
        errorMessage: errorMsg,
        messageText
      });
      continue;
    }

    // Call Meta WhatsApp Cloud API
    const apiResult = await sendWhatsAppCloudMessage(rawPhone, messageText, config);

    const recordPayload = {
      id: msgId,
      order_id: orderId,
      category_id: catId,
      whatsapp_number: normalizePhoneNumber(rawPhone),
      message: messageText,
      status: apiResult.success ? 'sent' : 'failed',
      provider_message_id: apiResult.messageId || null,
      error_message: apiResult.error || null,
      sent_at: apiResult.success ? now : null,
      created_at: now
    };

    if (supabase) {
      try {
        await supabase.from('whatsapp_order_messages').upsert([recordPayload], { onConflict: 'id' }).select();
      } catch (dbErr) {
        console.warn('Could not insert to supabase whatsapp_order_messages, saving locally:', dbErr);
      }
    }
    saveLocalMessage(recordPayload);

    results.push({
      categoryId: catId,
      categoryName,
      whatsappNumber: rawPhone,
      status: apiResult.success ? 'sent' : 'failed',
      messageId: apiResult.messageId,
      errorMessage: apiResult.error,
      messageText
    });
  }

  const allSuccess = results.every(r => r.status === 'sent' || r.status === 'skipped');
  return {
    success: allSuccess,
    results,
    message: allSuccess ? 'تم معالجة وإرسال الطلب لجميع الأقسام بنجاح.' : 'تمت المعالجة ولكن تعذر إرسال بعض الأقسام.'
  };
}

export function getAllWhatsappMessages(orderId?: string) {
  const localList = getLocalMessages();
  if (orderId) {
    return localList.filter(m => m.order_id === orderId);
  }
  return localList;
}
