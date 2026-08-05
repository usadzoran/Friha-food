import React from 'react';
import { ShoppingBag, Store, Shield, Search, PhoneCall } from 'lucide-react';
import { CartItem } from '../types';

interface HeaderProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItems,
  onOpenCart,
  onOpenAdmin,
  searchQuery,
  setSearchQuery,
  onGoHome,
}) => {
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* LOGO & TITLE */}
          <div 
            onClick={onGoHome}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-2xl font-bold font-traditional">د</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-traditional tracking-wide text-stone-900 group-hover:text-amber-700 transition-colors">
                اشري من دارك
              </h1>
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium hidden sm:block">
                توصيل الطلبات والمواد الغذائية إلى باب بيتك
              </p>
            </div>
          </div>

          {/* SEARCH BAR (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مطعم، محل، أو منتج..."
              className="w-full pr-10 pl-4 py-2 text-sm bg-stone-100 border border-stone-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* ACTIONS (Admin & Cart) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              title="لوحة التحكم والتسيير"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="hidden xs:inline">لوحة الإدارة</span>
            </button>

            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow-sm transition-all active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">السلة</span>
              {totalItemCount > 0 && (
                <span className="bg-white text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SEARCH BAR (Mobile) */}
        <div className="mt-3 md:hidden relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مطعم، محل، أو منتج..."
            className="w-full pr-10 pl-4 py-2 text-sm bg-stone-100 border border-stone-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </header>
  );
};
