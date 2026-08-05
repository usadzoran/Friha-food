import React from 'react';
import { Store } from '../types';
import { MapPin, Phone, ArrowLeft, Clock } from 'lucide-react';

interface StoreCardProps {
  store: Store;
  onSelectStore: (store: Store) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onSelectStore }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* BIG STORE IMAGE */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* OPEN / CLOSED BADGE */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs backdrop-blur-md ${
                store.is_open
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-stone-800/90 text-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {store.is_open ? 'مفتوح الآن' : 'مغلق حالياً'}
            </span>
          </div>

          {/* STORE SECTION TYPE BADGE */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 text-stone-800 backdrop-blur-md shadow-2xs">
              {store.section === 'food'
                ? '🍔 مطعم / أكلات'
                : store.section === 'drinks'
                ? '🥤 متجر مشروبات'
                : '🏪 مأكولات ومشروبات'}
            </span>
          </div>

          {/* STORE NAME OVERLAY */}
          <div className="absolute bottom-3 right-3 left-3 text-white">
            <h3 className="text-xl font-bold font-cairo drop-shadow-md leading-tight">
              {store.name}
            </h3>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="p-4 sm:p-5 space-y-3">
          <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {store.description}
          </p>

          <div className="space-y-1.5 pt-1 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{store.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span dir="ltr" className="font-mono">{store.whatsapp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onSelectStore(store)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors group-hover:shadow-md"
        >
          <span>عرض المنتجات</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>
    </div>
  );
};
