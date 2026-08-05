import React from 'react';
import { Store, Product } from '../types';
import { AlertTriangle, Trash2, ShoppingBag, X } from 'lucide-react';

interface DifferentStoreModalProps {
  isOpen: boolean;
  currentStoreName: string;
  newStore: Store;
  newProduct: Product;
  onClearCartAndAdd: () => void;
  onKeepCurrentCart: () => void;
}

export const DifferentStoreModal: React.FC<DifferentStoreModalProps> = ({
  isOpen,
  currentStoreName,
  newStore,
  newProduct,
  onClearCartAndAdd,
  onKeepCurrentCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 space-y-5 relative">
        <button
          onClick={onKeepCurrentCart}
          className="absolute top-4 left-4 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* WARNING ICON */}
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold font-cairo text-stone-900">
            تنبيه: الطلب من متجرين مختلفين
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            تحتوي السلة حالياً على طلبات من متجر{' '}
            <span className="font-bold text-amber-700">"{currentStoreName}"</span>.
          </p>
          <p className="text-stone-500 text-xs leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200/80">
            لا يمكن جمع منتجات من متجرين مختلفين في نفس الطلب لتسهيل التوصيل والتواصل المباشر مع المتجر عبر الواتساب.
          </p>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onClearCartAndAdd}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>إفراغ السلة وبدء طلب جديد من "{newStore.name}"</span>
          </button>

          <button
            onClick={onKeepCurrentCart}
            className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-stone-500" />
            <span>الاحتفاظ بالسلة الحالية والإنهاء من "{currentStoreName}"</span>
          </button>
        </div>
      </div>
    </div>
  );
};
