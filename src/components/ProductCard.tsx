import React from 'react';
import { Product } from '../types';
import { Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  isAdded?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isAdded
}) => {
  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 right-2.5 bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
          {product.price.toLocaleString('ar-DZ')} د.ج
        </div>
      </div>

      {/* Product Content */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-2 sm:gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-xs sm:text-base line-clamp-1 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] sm:text-sm text-slate-500 line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed">
            {product.description || 'منتج عالي الجودة متوفر للطلب المباشر.'}
          </p>
        </div>

        {/* Footer info & Add to order button */}
        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-100 gap-1">
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">السعر</span>
            <span className="text-emerald-700 font-extrabold text-xs sm:text-base truncate">
              {product.price.toLocaleString('ar-DZ')} <span className="text-[10px] sm:text-xs font-bold">د.ج</span>
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, e);
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-bold transition-all active:scale-95 shadow-2xs shrink-0 ${
              isAdded
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                <span className="hidden min-[380px]:inline">تمت الإضافة</span>
                <span className="min-[380px]:hidden">تم</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden min-[380px]:inline">أضف للطلب</span>
                <span className="min-[380px]:hidden">طلب</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
