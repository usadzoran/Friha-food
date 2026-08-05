import React, { useState } from 'react';
import { Store, Product, Category, CartItem } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight, MapPin, Phone, Clock, Store as StoreIcon, ShieldAlert } from 'lucide-react';

interface StoreProductsViewProps {
  store: Store;
  products: Product[];
  categories: Category[];
  cartItems: CartItem[];
  onBack: () => void;
  onAddToCart: (product: Product, store: Store) => void;
}

export const StoreProductsView: React.FC<StoreProductsViewProps> = ({
  store,
  products,
  categories,
  cartItems,
  onBack,
  onAddToCart,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  // Store's products
  const storeProducts = products.filter((p) => p.store_id === store.id);

  // Filtered by store category
  const displayedProducts = storeProducts.filter((p) => {
    if (!selectedCatId) return true;
    return p.category_id === selectedCatId;
  });

  // Unique categories for products present in this store
  const storeCategoryIds = Array.from(new Set(storeProducts.map((p) => p.category_id)));
  const storeCategories = categories.filter((c) => storeCategoryIds.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* NAVIGATION BACK BUTTON */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-stone-700 hover:text-amber-700 bg-white hover:bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة لجميع المتاجر</span>
      </button>

      {/* STORE HEADER HERO CARD */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="relative h-56 sm:h-72 w-full bg-stone-900">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

          {/* STORE STATUS */}
          <div className="absolute top-4 right-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold backdrop-blur-md shadow-sm ${
                store.is_open
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-rose-600/90 text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              {store.is_open ? 'مفتوح للطلبات الآن' : 'مغلق حالياً'}
            </span>
          </div>

          {/* STORE HERO CONTENT */}
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-500 text-stone-900 font-extrabold text-xs rounded-lg shadow-2xs">
                {store.section === 'food'
                  ? 'مطعم مأكولات'
                  : store.section === 'drinks'
                  ? 'محل مشروبات'
                  : 'مأكولات ومشروبات'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-cairo drop-shadow-md">
              {store.name}
            </h1>

            <p className="text-stone-200 text-xs sm:text-sm max-w-2xl line-clamp-2">
              {store.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-300 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span dir="ltr" className="font-mono">{store.whatsapp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CLOSED ALERT WARNING IF STORE IS CLOSED */}
        {!store.is_open && (
          <div className="bg-rose-50 border-t border-rose-200 p-4 flex items-center gap-3 text-rose-800 text-xs sm:text-sm font-medium">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              تنبيه: هذا المتجر مغلق حالياً. يمكنك تصفح المنتجات ولكن لن تتكن من إرسال طلبات جديدة حتى إعادة فتحه.
            </span>
          </div>
        )}
      </div>

      {/* CATEGORY TABS FOR THIS STORE */}
      {storeCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCatId(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
              selectedCatId === null
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            جميع قائمة المنتجات ({storeProducts.length})
          </button>

          {storeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                selectedCatId === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-amber-50'
              }`}
            >
              <span>{cat.icon || '🏷️'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* PRODUCTS GRID */}
      <div>
        <h3 className="text-xl font-bold text-stone-900 font-cairo mb-4 flex items-center gap-2">
          <StoreIcon className="w-5 h-5 text-amber-600" />
          <span>المنتجات المتاحة ({displayedProducts.length})</span>
        </h3>

        {displayedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300 my-6">
            <div className="text-4xl mb-2">🍽️</div>
            <h4 className="text-base font-bold text-stone-800">لا توجد منتجات متوفرة</h4>
            <p className="text-xs text-stone-500 mt-1">
              لم يتم إضافة منتجات بعد لهذا التصنيف في هذا المتجر.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                store={store}
                cartItems={cartItems}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
