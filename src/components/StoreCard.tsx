import React from 'react';
import { 
  Star, 
  Clock, 
  MapPin, 
  Bike, 
  Heart, 
  ArrowLeft, 
  Sparkles,
  BadgePercent
} from 'lucide-react';
import { Store } from '../types';

interface StoreCardProps {
  store: Store;
  isFavorite: boolean;
  onToggleFavorite: (storeId: string) => void;
  onSelectStore: (store: Store) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  isFavorite,
  onToggleFavorite,
  onSelectStore,
}) => {
  return (
    <div className="group bg-white dark:bg-stone-800 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Cover Image Container */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(store.id);
          }}
          className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
            isFavorite 
              ? 'bg-rose-500 text-white scale-110' 
              : 'bg-white/80 dark:bg-stone-800/80 backdrop-blur-md text-stone-700 dark:text-stone-200 hover:bg-white'
          }`}
          title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Discount or Status Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {store.discountBadge && (
            <span className="bg-amber-500 text-stone-950 font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <BadgePercent className="w-3.5 h-3.5" />
              <span>{store.discountBadge}</span>
            </span>
          )}

          {store.isFeatured && (
            <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>متجر مميز</span>
            </span>
          )}
        </div>

        {/* Status Badge (Open / Closed) */}
        <div className="absolute bottom-3 right-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-sm ${
            store.isOpen 
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' 
              : 'bg-stone-900/90 text-rose-300 border border-rose-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${store.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>{store.isOpen ? 'مفتوح الآن' : 'مغلق مؤقتاً'}</span>
          </span>
        </div>

        {/* Store Logo Badge (Bottom Left Overlay) */}
        <div className="absolute -bottom-4 left-4 w-14 h-14 rounded-2xl bg-white dark:bg-stone-800 p-1 shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden">
          <img
            src={store.logo}
            alt={store.name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 pt-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category Tag (تصنيف المتجر) */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-block bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
              {store.categoryLabel}
            </span>

            {/* Distance */}
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span>{store.distance}</span>
            </span>
          </div>

          {/* Store Name (اسم المتجر) */}
          <h3 className="text-base font-extrabold text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {store.name}
          </h3>

          {/* Description */}
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 line-clamp-2 font-normal leading-relaxed">
            {store.description}
          </p>
        </div>

        {/* Meta Stats Row (Rating, Delivery, Fees) */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg font-bold border border-amber-200/50 dark:border-amber-800/40">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{store.rating}</span>
              <span className="text-[10px] text-stone-400 font-normal">({store.reviewsCount})</span>
            </div>

            {/* Delivery Time */}
            <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300 font-semibold text-[11px]">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{store.deliveryTime}</span>
            </div>

            {/* Delivery Fee */}
            <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300 font-semibold text-[11px]">
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
              <span>{store.deliveryFee === 0 ? 'توصيل مجاني' : `${store.deliveryFee} ر.س`}</span>
            </div>
          </div>

          {/* Action Button: Open Store */}
          <button
            type="button"
            onClick={() => onSelectStore(store)}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-stone-900 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group-hover:bg-emerald-600 group-hover:text-white"
          >
            <span>استعراض المتجر وتصفح المنتجات</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

      </div>

    </div>
  );
};
