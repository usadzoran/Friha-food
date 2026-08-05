import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { storageService } from '../services/storage';
import { X, Send, User, Phone, MapPin, FileText, ShoppingBag } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cartItems,
  onClose,
  onOrderSuccess,
}) => {
  if (!isOpen || cartItems.length === 0) return null;

  const store = cartItems[0].store;
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف التواصل');
      return;
    }
    if (!customerAddress.trim()) {
      setErrorMessage('يرجى إدخال العنوان الكامل بالتفصيل');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. SAVE ORDER TO DATABASE / STORAGE
      const orderItems = cartItems.map((ci) => ({
        product_id: ci.product.id,
        product_name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
      }));

      const newOrder = storageService.createOrder({
        store_id: store.id,
        store_name: store.name,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim(),
        notes: notes.trim(),
        items: orderItems,
        total_amount: totalAmount,
        whatsapp_sent: true,
      });

      // 2. BUILD WHATSAPP MESSAGE (EXACT STRUCTURE FROM USER PROMPT)
      let itemsListText = '';
      cartItems.forEach((ci) => {
        itemsListText += `${ci.product.name} × ${ci.quantity}\n`;
      });

      let whatsappText = `طلب جديد\n\n`;
      whatsappText += `اسم الزبون:\n${customerName.trim()}\n\n`;
      whatsappText += `رقم الهاتف:\n${customerPhone.trim()}\n\n`;
      whatsappText += `العنوان:\n${customerAddress.trim()}\n\n`;
      if (notes.trim()) {
        whatsappText += `ملاحظات إضافية:\n${notes.trim()}\n\n`;
      }
      whatsappText += `---\n\n`;
      whatsappText += `الطلبات:\n\n${itemsListText}\n`;
      whatsappText += `---\n\n`;
      whatsappText += `المجموع:\n${totalAmount} دج\n`;

      // Clean phone number for WhatsApp
      let cleanPhone = store.whatsapp.replace(/[^0-9]/g, '');
      // If starts with 0 (Algerian local format 06, 07, 05), replace leading 0 with 213
      if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
        cleanPhone = '213' + cleanPhone.substring(1);
      }

      const encodedText = encodeURIComponent(whatsappText);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

      // Open WhatsApp link concurrently
      window.open(whatsappUrl, '_blank');

      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    } catch (err) {
      console.error(err);
      setErrorMessage('حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-100 relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-cairo text-stone-900">
              إتمام الطلب
            </h3>
            <p className="text-xs text-stone-500">
              يرجى إدخال معلومات التوصيل لإرسال طلبك مباشرة للمتجر
            </p>
          </div>
        </div>

        {/* ORDER SUMMARY BANNER */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-stone-700 flex items-center justify-between">
          <div>
            <p className="font-bold text-amber-900">{store.name}</p>
            <p className="text-stone-500 mt-0.5">{cartItems.length} منتجات في السلة</p>
          </div>
          <div className="text-left font-mono text-base font-extrabold text-amber-800">
            {totalAmount} دج
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>الاسم الكامل <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: أحمد بن علي"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>رقم الهاتف <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="مثال: 0661234567"
              dir="ltr"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-right font-mono"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>العنوان الكامل للتوصيل <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="مثال: حي السلام، عمارة 12، شقة 4"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>ملاحظات إضافية (اختياري)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات خاصة بالطلب أو معلم قريب للمزل..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? 'جاري معالجة الطلب...' : 'إرسال الطلب عبر الواتساب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
