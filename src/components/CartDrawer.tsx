import React from 'react';
import { CartItem } from '../types';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Store as StoreIcon } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const currentStore = cartItems.length > 0 ? cartItems[0].store : null;
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-stone-50 shadow-2xl flex flex-col justify-between">
          {/* CART HEADER */}
          <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-cairo text-stone-900">
                  سلة التسوق
                </h3>
                {currentStore && (
                  <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                    <StoreIcon className="w-3 h-3" />
                    <span>المتجر: {currentStore.name}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-4xl">
                  🛒
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-800 font-cairo">
                    سلتك فارغة حالياً
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    تصفح المطاعم والمحلات وأضف وجباتك ومستلزماتك المفضلة إلى السلة
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  تصفح المتاجر الآن
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-stone-500 font-medium">
                    المنتجات المحددة ({cartItems.length})
                  </span>
                  <button
                    onClick={onClearCart}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إفراغ السلة</span>
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-2xs flex items-center gap-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100"
                    />

                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-stone-900 font-cairo truncate">
                        {item.product.name}
                      </h5>
                      <p className="text-xs font-bold text-amber-700 font-mono mt-0.5">
                        {item.product.price} <span className="font-cairo text-[10px]">دج</span>
                      </p>

                      {/* QUANTITY CONTROLS */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded-md bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 shadow-2xs transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold font-mono px-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded-md bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 shadow-2xs transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-stone-800 font-mono">
                          {item.product.price * item.quantity} دج
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      title="حذف المنتج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* CART FOOTER */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-stone-800">
                <span className="text-sm font-bold">المجموع الإجمالي:</span>
                <span className="text-xl font-black text-amber-700 font-mono">
                  {totalAmount} <span className="text-sm font-cairo font-bold">دج</span>
                </span>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 active:scale-98 transition-all"
              >
                <span>إتمام الطلب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
