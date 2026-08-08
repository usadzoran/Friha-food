import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Store, StoreProduct } from '../types';

export interface CartItem {
  product: StoreProduct;
  store: Store;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  userAddress: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  userAddress,
}) => {
  if (!isOpen) return null;

  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  // Pick delivery fee from store or default 10
  const deliveryFee = cartItems.length > 0 ? (cartItems[0].store.deliveryFee || 0) : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      onClearCart();
      setOrderPlaced(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-stone-200 dark:border-stone-800 animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">سلة المشتريات</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">{cartItems.length} عناصر مضافة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address Info Bar */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 px-5 py-2.5 border-b border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">التوصيل إلى: <strong>{userAddress}</strong></span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {orderPlaced ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 dark:text-white">تم إرسال طلبك بنجاح! 🎉</h3>
              <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed max-w-xs">
                طلبك الآن قيد التحضير في المتجر وسيتجه السائق مباشرة لعنوانك في <strong>{userAddress}</strong>.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <Truck className="w-4 h-4" />
                  <span>تتبع الطلب مباشر ⚡</span>
                </span>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-3">
              <ShoppingBag className="w-16 h-16 text-stone-300 dark:text-stone-700 stroke-1" />
              <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300">سلتك فارغة حالياً</h4>
              <p className="text-xs">تصفح المتاجر المتاحة واضف المنتجات التي ترغب بشرائها لدارك.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-stone-400 font-semibold block truncate">
                      {item.store.name}
                    </span>
                    <h5 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {item.product.price * item.quantity} ر.س
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-600 text-stone-700 dark:text-stone-200 flex items-center justify-center hover:bg-stone-200 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-stone-900 dark:text-white px-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-500 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Checkout Calculation */}
        {cartItems.length > 0 && !orderPlaced && (
          <div className="p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{subtotal} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>رسوم التوصيل:</span>
                <span className="font-bold">{deliveryFee === 0 ? 'مجاني' : `${deliveryFee} ر.س`}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-stone-700">
                <span>الإجمالي الكلي:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{total} ر.س</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <span>تأكيد الطلب وإرساله لدارك</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
