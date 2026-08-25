import React, { useState } from 'react';
import { CartItem, CustomerInfo, AdSlot } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, AlertCircle } from 'lucide-react';
import { AdRenderer } from './AdRenderer';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onSubmitOrder: (customer: CustomerInfo) => Promise<void>;
  isSubmitting: boolean;
  ads?: AdSlot[];
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  isSubmitting,
  ads = []
}) => {
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customer.name.trim()) {
      setErrorMsg('يرجى إدخال الاسم الكامل.');
      return;
    }
    if (!customer.phone.trim() || customer.phone.trim().length < 8) {
      setErrorMsg('يرجى إدخال رقم هاتف صحيح (مثال: 0550123456).');
      return;
    }
    if (!customer.address.trim()) {
      setErrorMsg('يرجى كتابة عنوان التوصيل بالتفصيل (الولاية والبلدية والعنوان).');
      return;
    }

    try {
      await onSubmitOrder(customer);
    } catch {
      setErrorMsg('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg font-bold">سلة الطلبات ({cartItems.reduce((a, b) => a + b.quantity, 0)})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 text-lg">سلة الطلبات فارغة</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                قم بإضافة المنتجات إلى السلة من الصفحة الرئيسية للبدء في إكمال طلبك.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          ) : (
            <>
              {/* Selected Items List */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                  المنتجات المحددة:
                </h3>
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg bg-white border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-emerald-700 font-extrabold mt-0.5">
                        {item.product.price.toLocaleString('ar-DZ')} د.ج × {item.quantity} = {' '}
                        <span className="text-slate-900 font-black">
                          {(item.product.price * item.quantity).toLocaleString('ar-DZ')} د.ج
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="حذف المنتج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Subtotal summary */}
                <div className="flex justify-between items-center p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900 font-bold text-sm sm:text-base">
                  <span>المجموع الكلي للطلب:</span>
                  <span className="text-emerald-700 font-black text-lg">
                    {totalPrice.toLocaleString('ar-DZ')} د.ج
                  </span>
                </div>
              </div>

              {/* Customer Information Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                  معلومات التوصيل والزبون:
                </h3>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد الأمين"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 0550123456 أو 0661987654"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    العنوان بالتفصيل (الولاية والبلدية) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="مثال: الجزائر العاصمة، القبة، شارع الشهداء بوسط المدينة"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="تعليمات خاصة بالتوصيل أو الوقت المفضّل..."
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl text-base shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>جاري فتح WhatsApp لإرسال الطلب...</span>
                    </span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>تأكيد الطلب وإرسال عبر WhatsApp</span>
                    </>
                  )}
                </button>
                {/* Ad in Cart Modal */}
                <AdRenderer placement="cart_modal_bottom" ads={ads} className="pt-2" />
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
