import React, { useState } from 'react';
import { ShoppingBag, Store } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  isAdmin,
  onLogoutAdmin,
  onGoHome
}) => {
  const [clickCount, setClickCount] = useState<number>(0);

  // Single click goes home, secret triple click on logo opens admin modal
  const handleLogoClick = () => {
    if (onGoHome) onGoHome();
    if (isAdmin) return;
    const newCount = clickCount + 1;
    if (newCount >= 3) {
      onOpenAdmin();
      setClickCount(0);
    } else {
      setClickCount(newCount);
      setTimeout(() => setClickCount(0), 1200);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-700 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand / Logo (Triple-click opens admin login quietly) */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
            <Store className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              اشري من دارك
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium">
              التسوق السريع والتوصيل للمنزل
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && (
            <button
              onClick={onLogoutAdmin}
              className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-emerald-100 text-xs sm:text-sm font-medium transition-colors border border-emerald-600"
            >
              الخروج من الادمن
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
            aria-label="سلة الطلبات"
          >
            <ShoppingBag className="w-5 h-5 text-slate-900" />
            <span className="text-sm hidden xs:inline">الطلبات</span>
            {cartCount > 0 && (
              <span className="bg-red-600 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-amber-500 shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
