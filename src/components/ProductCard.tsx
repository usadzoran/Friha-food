import React from 'react';
import { Product, Store, CartItem } from '../types';
import { Plus, Check, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  store: Store;
  cartItems: CartItem[];
  onAddToCart: (product: Product, store: Store) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  store,
  cartItems,
  onAddToCart,
}) => {
  // Check if item is already in cart
  const itemInCart = cartItems.find((ci) => ci.product.id === product.id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* PRODUCT IMAGE */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* AVAILABILITY BADGE */}
          <div className="absolute top-2.5 right-2.5">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-xs ${
                product.is_available
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {product.is_available ? 'متوفر' : 'غير متوفر'}
            </span>
          </div>

          {/* QUANTITY IN CART OVERLAY */}
          {quantity > 0 && (
            <div className="absolute top-2.5 left-2.5 bg-amber-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>في السلة ({quantity})</span>
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base sm:text-lg font-bold text-stone-900 font-cairo leading-snug">
              {product.name}
            </h4>
          </div>

          <p className="text-stone-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {product.description || 'لا يوجد وصف إضافي للمنتج'}
          </p>
        </div>
      </div>

      {/* FOOTER: PRICE & ADD BUTTON */}
      <div className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-stone-400 block">السعر</span>
          <span className="text-lg sm:text-xl font-extrabold text-amber-700 font-mono">
            {product.price} <span className="text-xs font-bold font-cairo">دج</span>
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product, store)}
          disabled={!product.is_available || !store.is_open}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
            !product.is_available || !store.is_open
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : quantity > 0
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
              : 'bg-stone-900 hover:bg-stone-800 text-white active:scale-95'
          }`}
        >
          {!store.is_open ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>المتجر مغلق</span>
            </>
          ) : !product.is_available ? (
            <span>غير متوفر</span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>{quantity > 0 ? 'إضافة المزيد' : 'إضافة للسلة'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
