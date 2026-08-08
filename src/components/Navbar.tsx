import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  MapPin, 
  ShoppingBag, 
  Heart, 
  X, 
  Sparkles,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { FilterOptions } from '../types';

interface NavbarProps {
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  favoritesCount: number;
  cartCount: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  userAddress: string;
  setUserAddress: (address: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  filterOptions,
  setFilterOptions,
  favoritesCount,
  cartCount,
  onOpenCart,
  onOpenFavorites,
  userAddress,
  setUserAddress,
}) => {
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(userAddress);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAddress.trim()) {
      setUserAddress(tempAddress.trim());
      setIsChangingAddress(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
        <span>تطبيق <strong>اشري من دارك</strong> — جميع مستلزماتك اليومية من أفضل المتاجر المحلية بضغطة زر!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20 transform hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-white flex items-center gap-1.5">
                اشري من دارك
                <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  مباشر 🟢
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">تسوق واطلب من المتاجر المجاورة لبيتك</p>
            </div>
          </div>

          {/* Location Selector (Desktop & Tablet) */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setIsChangingAddress(true)}
              className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-right">
                <span className="block text-[10px] text-stone-400 font-normal">عنوان التوصيل</span>
                <span className="max-w-[150px] truncate block text-xs">{userAddress}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>

          {/* Search Bar in Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="ابحث عن اسم متجر، تصنيف، أو منتج..."
              value={filterOptions.searchQuery}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-10 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {filterOptions.searchQuery && (
              <button 
                onClick={() => setFilterOptions(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Favorites Toggle */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              title="المتاجر المفضلة"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">السلة</span>
              {cartCount > 0 && (
                <span className="bg-white text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Search Bar Mobile */}
        <div className="mt-3 lg:hidden relative">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="ابحث عن متجر، سوبرماركت، مخبز..."
            value={filterOptions.searchQuery}
            onChange={(e) => setFilterOptions(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-10 py-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          {filterOptions.searchQuery && (
            <button 
              onClick={() => setFilterOptions(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Address Edit Modal */}
      {isChangingAddress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-800 rounded-3xl max-w-sm w-full p-6 shadow-xl border border-stone-200 dark:border-stone-700 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                تغيير عنوان التوصيل
              </h3>
              <button 
                onClick={() => setIsChangingAddress(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1.5">
                  اسم الحي أو المنطقة
                </label>
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="مثال: المنزل - حي الروضة"
                  className="w-full px-3.5 py-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingAddress(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  حفظ العنوان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
