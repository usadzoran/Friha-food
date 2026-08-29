import { CartItem, CustomerInfo, Category, DepartmentManager } from '../types';

/**
 * Normalizes Algerian and international phone numbers for direct WhatsApp link (wa.me)
 * Example: 0555123456 -> 213555123456
 * Example: 0790275147 -> 213790275147
 * Example: +213 790 27 51 47 -> 213790275147
 */
export function normalizeAlgerianWhatsAppNumber(rawPhone?: string): string {
  if (!rawPhone) return '';
  
  // Remove all non-digit characters (+, -, spaces, etc.)
  let digits = rawPhone.replace(/[^\d]/g, '');

  if (!digits) return '';

  // 00213XXXXXXXXX -> 213XXXXXXXXX
  if (digits.startsWith('00213')) {
    digits = digits.substring(2);
  }

  // 0XXXXXXXXX (10 digits starting with 0) -> 213XXXXXXXXX
  if (digits.startsWith('0') && digits.length >= 9) {
    digits = '213' + digits.substring(1);
  }

  // 9 digits starting with 5, 6, 7 (e.g. 790275147) -> 213790275147
  if (digits.length === 9 && (digits.startsWith('5') || digits.startsWith('6') || digits.startsWith('7') || digits.startsWith('2') || digits.startsWith('3') || digits.startsWith('4'))) {
    digits = '213' + digits;
  }

  return digits;
}

/**
 * Resolves the target WhatsApp phone number for a department by checking
 * the Category object and any active Department Manager assigned to it.
 */
export function resolveDepartmentWhatsAppNumber(
  category?: Category | null,
  managers?: DepartmentManager[]
): string {
  if (category?.whatsapp_number && category.whatsapp_number.trim()) {
    return category.whatsapp_number.trim();
  }

  if (category && Array.isArray(managers) && managers.length > 0) {
    const matchedManager = managers.find(
      (m) =>
        (m.is_active !== false) &&
        (m.category_id === category.id ||
         m.category_name?.trim() === category.name?.trim() ||
         (category.id && m.category_id === category.id))
    );
    if (matchedManager?.phone && matchedManager.phone.trim()) {
      return matchedManager.phone.trim();
    }
  }

  return '';
}

/**
 * Generates the clean WhatsApp order text message according to the exact requested format:
 * 🛎️ طلب جديد
 *
 * القسم: Crêperie
 *
 * 👤 الزبون: محمد
 * 📞 الهاتف: 0555123456
 * 📍 العنوان: وهران
 *
 * 🛒 الطلب:
 *
 * • Crêpe Nutella × 2
 * • Crêpe Poulet × 1
 * • Jus × 2
 *
 * 💰 المجموع: 1800 دج
 *
 * رقم الطلب: #12345
 */
export function buildDepartmentWhatsAppMessage(params: {
  orderNumber: string;
  categoryName: string;
  customer: CustomerInfo;
  items: CartItem[];
  totalPrice: number;
}): string {
  const { orderNumber, categoryName, customer, items, totalPrice } = params;

  const itemsList = items
    .map((item) => `• ${item.product.name} × ${item.quantity}`)
    .join('\n');

  const notesSection = customer.notes && customer.notes.trim()
    ? `\n📝 ملاحظات: ${customer.notes.trim()}`
    : '';

  const cleanOrderNum = orderNumber.replace(/^#/, '');

  return (
    `🛎️ طلب جديد\n\n` +
    `القسم: ${categoryName}\n\n` +
    `👤 الزبون: ${customer.name.trim()}\n` +
    `📞 الهاتف: ${customer.phone.trim()}\n` +
    `📍 العنوان: ${customer.address.trim()}` +
    `${notesSection}\n\n` +
    `🛒 الطلب:\n\n` +
    `${itemsList}\n\n` +
    `💰 المجموع: ${totalPrice.toLocaleString('ar-DZ')} دج\n\n` +
    `رقم الطلب: #${cleanOrderNum}`
  );
}

/**
 * Builds the direct WhatsApp URL (wa.me)
 */
export function buildWhatsAppDirectUrl(whatsappNumber: string, message: string): string {
  const cleanPhone = normalizeAlgerianWhatsAppNumber(whatsappNumber);
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}

/**
 * Directly launches WhatsApp on user's device with pre-filled message
 * Automatically sends the order details to the department owner
 */
export function openWhatsAppDirect(whatsappNumber: string, message: string): string {
  const url = buildWhatsAppDirectUrl(whatsappNumber, message);
  if (typeof window !== 'undefined') {
    try {
      // 1. Try window.open first
      const openedWin = window.open(url, '_blank', 'noopener,noreferrer');
      // 2. If blocked or running on mobile webview, trigger location href
      if (!openedWin || openedWin.closed || typeof openedWin.closed === 'undefined') {
        window.location.href = url;
      }
    } catch {
      try {
        window.location.href = url;
      } catch (err) {
        console.warn('WhatsApp launch error:', err);
      }
    }
  }
  return url;
}
