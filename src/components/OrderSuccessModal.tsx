import React from 'react';
import { CheckCircle2, PhoneCall, ShoppingBag, MessageSquare, Bell, ArrowLeft, Send } from 'lucide-react';
import { CartItem, Category, CustomerInfo } from '../types';

interface OrderSuccessModalProps {
  orderNumber: string | null;
  onClose: () => void;
  customer?: CustomerInfo;
  orderedItems?: CartItem[];
  categories?: Category[];
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderNumber,
  onClose,
  customer,
  orderedItems = [],
  categories = []
}) => {
  if (!orderNumber) return null;

  // Group ordered items by category
  const categoryGroups: {
    category: Category | { id: string; name: string; whatsapp_number?: string };
    items: CartItem[];
    subtotal: number;
  }[] = [];

  const catMap = new Map<string, { cat: any; items: CartItem[]; subtotal: number }>();

  orderedItems.forEach(item => {
    const prodCatId = item.product.category_id || 'general';
    const foundCat = categories.find(c => c.id === prodCatId || c.name === prodCatId) || {
      id: prodCatId,
      name: prodCatId === 'general' ? 'القسم العام' : prodCatId,
      whatsapp_number: ''
    };

    const key = foundCat.id || foundCat.name;
    if (!catMap.has(key)) {
      catMap.set(key, { cat: foundCat, items: [], subtotal: 0 });
    }
    const group = catMap.get(key)!;
    group.items.push(item);
    group.subtotal += item.product.price * item.quantity;
  });

  catMap.forEach((val) => {
    categoryGroups.push({
      category: val.cat,
      items: val.items,
      subtotal: val.subtotal
    });
  });

  const totalOrderPrice = orderedItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

  // Helper to open WhatsApp for a specific department
  const handleOpenDepartmentWhatsApp = (deptGroup: typeof categoryGroups[0]) => {
    const rawPhone = (deptGroup.category.whatsapp_number || '').trim();
    let cleanPhone = rawPhone.replace(/[^\d]/g, '');
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 9) {
      cleanPhone = '213' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('00')) {
      cleanPhone = cleanPhone.substring(2);
    }

    const itemsText = deptGroup.items.map((it, idx) => 
      `▫️ ${idx + 1}. *${it.product.name}*\n   الكمية: ${it.quantity} | السعر: ${it.product.price.toLocaleString('ar-DZ')} د.ج`
    ).join('\n\n');

    const customerText = customer ? (
      `👤 *معلومات الزبون:*\n` +
      `• الاسم: ${customer.name}\n` +
      `• الهاتف: ${customer.phone}\n` +
      `• العنوان: ${customer.address}\n` +
      (customer.notes ? `• ملاحظات: ${customer.notes}\n` : '')
    ) : '';

    const message = 
      `🛒 *طلبية جديدة #${orderNumber}*\n` +
      `🏢 *قسم:* ${deptGroup.category.name}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `${customerText}` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 *المنتجات المطلوبة من هذا القسم:*\n\n` +
      `${itemsText}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 *حساب هذا القسم:* *${deptGroup.subtotal.toLocaleString('ar-DZ')} د.ج*\n` +
      `💵 *إجمالي الطلبية:* *${totalOrderPrice.toLocaleString('ar-DZ')} د.ج*\n` +
      `⏰ *الوقت:* ${new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `_تم إرسال الطلب عبر متجر اشري من دارك_`;

    const targetUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 text-center space-y-4 border border-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Check Icon */}
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            تم تسجيل طلبك بنجاح!
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-100 max-w-sm mx-auto">
            <Bell className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم إخطار النظام وتحويل الطلبية إلى الأقسام المعنية فوراً</span>
          </div>
        </div>

        {/* Order Number Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-right space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold border-b border-slate-200 pb-2">
            <span>رقم الطلب الخاص بك:</span>
            <span className="font-mono text-emerald-700 font-black text-sm bg-white px-2.5 py-0.5 rounded border border-slate-200">
              {orderNumber}
            </span>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
            <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>سيتصل بك فريق الخدمة والتوصيل قريباً لتأكيد العنوان والموعد.</span>
          </div>
        </div>

        {/* Department WhatsApp Direct Dispatch Buttons */}
        {categoryGroups.length > 0 && (
          <div className="space-y-2 text-right">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>إرسال وتأكيد الطلبية عبر WhatsApp للأقسام:</span>
              </span>
            </div>

            <div className="space-y-2">
              {categoryGroups.map((grp, idx) => {
                const hasPhone = Boolean((grp.category.whatsapp_number || '').trim());
                return (
                  <div
                    key={idx}
                    className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="text-right">
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>قسم: {grp.category.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({grp.items.length} {grp.items.length === 1 ? 'منتج' : 'منتجات'})
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                        المجموع: {grp.subtotal.toLocaleString('ar-DZ')} د.ج
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDepartmentWhatsApp(grp)}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {hasPhone ? `إرسال لواتساب قسم (${grp.category.name})` : `مشاركة الطلب لواتساب (${grp.category.name})`}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-xl text-sm transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>العودة للمتجر ومتابعة التسوق</span>
        </button>
      </div>
    </div>
  );
};
