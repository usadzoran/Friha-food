import React, { useState } from 'react';
import { Product, AdSlot } from '../types';
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { AdRenderer } from './AdRenderer';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  ads?: AdSlot[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  ads = []
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="relative aspect-16/10 max-h-56 sm:max-h-64 w-full bg-slate-100 overflow-hidden">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-slate-900/70 hover:bg-slate-900 text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors shadow-md"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between gap-2.5">
            <h2 className="text-base sm:text-xl font-black text-slate-800 leading-snug">
              {product.name}
            </h2>
            <div className="text-emerald-700 font-black text-base sm:text-lg whitespace-nowrap bg-emerald-50 px-2.5 sm:px-3 py-1 rounded-xl border border-emerald-100">
              {product.price.toLocaleString('ar-DZ')} <span className="text-xs">د.ج</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-100">
            {product.description || 'منتج عالي الجودة متوفر للطلب المباشر والتوصيل السريع للمنزل.'}
          </p>

          {/* Ad slot in product modal */}
          <AdRenderer placement="product_details_modal" ads={ads} />

          {/* Quantity selector */}
          <div className="flex items-center justify-between pt-1 sm:pt-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700">الكمية المطلوبة:</span>
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-100 p-1 sm:p-1.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="إنقاص الكمية"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold shadow-2xs transition-colors"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="w-6 sm:w-8 text-center font-bold text-slate-800 text-sm sm:text-base">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                aria-label="زيادة الكمية"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-medium">المجموع الإجمالي</div>
            <div className="text-base sm:text-lg font-black text-emerald-700">
              {totalPrice.toLocaleString('ar-DZ')} <span className="text-xs">د.ج</span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={added}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-md ${
              added
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
                <span>تمت الإضافة للسلة!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>أضف للطلب الآن</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
