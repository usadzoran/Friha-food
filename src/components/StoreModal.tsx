import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Clock, 
  Bike, 
  MapPin, 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { Store, StoreProduct } from '../types';

interface StoreModalProps {
  store: Store | null;
  onClose: () => void;
  onAddToCart: (product: StoreProduct, store: Store) => void;
  cartItemsCount: number;
  onOpenCart: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  store,
  onClose,
  onAddToCart,
  cartItemsCount,
  onOpenCart,
}) => {
  if (!store) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const filteredProducts = store.products.filter(p => 
    p.name.includes(searchQuery) || p.category.includes(searchQuery)
  );

  const handleAddProduct = (product: StoreProduct) => {
    onAddToCart(product, store);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header Banner */}
        <div className="relative h-48 sm:h-56 bg-stone-900 shrink-0">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-black/30" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Store Logo & Header Meta */}
          <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={store.logo}
                alt={store.name}
                className="w-16 h-16 rounded-2xl border-2 border-white dark:border-stone-800 shadow-md object-cover bg-white shrink-0"
              />
              <div className="text-white">
                <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {store.categoryLabel}
                </span>
                <h2 className="text-xl sm:text-2xl font-black leading-tight">{store.name}</h2>
                <p className="text-xs text-stone-300 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>{store.locationLabel} ({store.distance})</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Store Quick Info Bar */}
        <div className="bg-stone-50 dark:bg-stone-800/80 px-6 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 font-semibold flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-xl">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{store.rating} ({store.reviewsCount} تقييم)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>توصيل: {store.deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bike className="w-4 h-4 text-emerald-600" />
            <span>رسوم التوصيل: {store.deliveryFee === 0 ? 'مجاني' : `${store.deliveryFee} ر.س`}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>الحد الأدنى: {store.minOrder} ر.س</span>
          </div>
        </div>

        {/* Products Search & List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              منتجات ومحتويات المتجر ({store.products.length})
            </h3>

            {/* In-Store Search */}
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="ابحث داخل المتجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-8 pl-3 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 hover:border-emerald-500/50 transition-all"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-16 h-16 rounded-xl object-cover bg-stone-200 dark:bg-stone-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    {prod.category}
                  </span>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                    {prod.name}
                  </h4>
                  <p className="text-xs font-extrabold text-stone-900 dark:text-stone-200 mt-1">
                    {prod.price} <span className="text-[10px] text-stone-400 font-normal">ر.س</span>
                  </p>
                </div>

                <button
                  onClick={() => handleAddProduct(prod)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    addedProductId === prod.id
                      ? 'bg-emerald-600 text-white scale-110'
                      : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white'
                  }`}
                  title="إضافة للسلة"
                >
                  {addedProductId === prod.id ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-stone-400 text-xs">
              لا توجد منتجات تطابق البحث في هذا المتجر.
            </div>
          )}

        </div>

        {/* Modal Footer with Shopping Cart Quick View */}
        <div className="p-4 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between gap-4">
          <div className="text-xs">
            <span className="text-stone-500 dark:text-stone-400 block text-[10px]">حالة السلة الحالية:</span>
            <span className="font-bold text-stone-900 dark:text-white">
              {cartItemsCount > 0 ? `${cartItemsCount} منتجات مضافة` : 'السلة فارغة'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              متابعة التسوق
            </button>
            
            {cartItemsCount > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>عرض السلة والإتمام</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
