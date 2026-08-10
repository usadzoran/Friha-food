import React, { useState } from 'react';
import { ShoppingBag, Store, Bell, Volume2, Shield, ExternalLink } from 'lucide-react';
import { Order } from '../types';
import { playOrderNotificationSound, requestBrowserNotificationPermission } from '../utils/notificationSound';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  onGoHome?: () => void;
  unreadCount?: number;
  recentOrders?: Order[];
  onClearUnread?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  isAdmin,
  onLogoutAdmin,
  onGoHome,
  unreadCount = 0,
  recentOrders = [],
  onClearUnread
}) => {
  const [clickCount, setClickCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

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

  const handleToggleNotifMenu = () => {
    if (!isNotifOpen && onClearUnread && unreadCount > 0) {
      onClearUnread();
    }
    setIsNotifOpen(!isNotifOpen);
  };

  const handleEnableBrowserNotifs = async () => {
    const res = await requestBrowserNotificationPermission();
    setNotifPermission(res);
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-700 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between relative">
        
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

          {/* Order Notifications Bell Icon */}
          <div className="relative">
            <button
              onClick={handleToggleNotifMenu}
              className={`relative p-2.5 rounded-xl transition-all border ${
                unreadCount > 0 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md animate-bounce' 
                  : 'bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 border-emerald-600'
              }`}
              title="إشعارات الطلبات الجديدة"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-700 shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu Dropdown */}
            {isNotifOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span className="font-black text-slate-800 text-sm">تنبيهات وإشعارات الطلبات</span>
                  </div>
                  <button
                    onClick={() => playOrderNotificationSound()}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                    title="سماع نغمة الجرس"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>تجربة الصوت</span>
                  </button>
                </div>

                {/* Notification Permissions Banner */}
                {notifPermission !== 'granted' && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between gap-2">
                    <div className="text-[11px] text-amber-800 font-medium">
                      مطلوب تفعيل إشعارات المتصفح للتوصل بالتنبيهات فوراً
                    </div>
                    <button
                      onClick={handleEnableBrowserNotifs}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg shrink-0 shadow-xs"
                    >
                      تفعيل الإشعارات
                    </button>
                  </div>
                )}

                {/* Orders List */}
                {recentOrders.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 space-y-1">
                    <p className="font-bold text-xs text-slate-600">لا توجد طلبات جديدة حتى الآن</p>
                    <p className="text-[11px]">سيتم إصدار صوت جرس وإشعار فور قيام أي زبون بعمل طلبية جديدة.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">أحدث الطلبات الواردة:</span>
                    {recentOrders.slice(0, 5).map((ord) => {
                      const displayNum = `DZ-${ord.id.slice(-6).toUpperCase()}`;
                      return (
                        <div key={ord.id} className="p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200/80 space-y-1 transition-colors">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-900">{ord.customer_name}</span>
                            <span className="font-mono text-emerald-700 text-[11px]">{displayNum}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{ord.customer_phone}</span>
                            <span className="font-black text-slate-900">{(ord.total_price || (ord as any).total_amount || 0).toLocaleString('ar-DZ')} د.ج</span>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-1 flex justify-between items-center border-t border-slate-200/50">
                            <span>{new Date(ord.created_at).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold ${
                              ord.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {ord.status === 'pending' ? 'قيد الانتظار' : 'مقبول'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Admin Quick Link */}
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>الانتقال إلى لوحة التحكم والتأكيد</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </div>

              </div>
            )}
          </div>

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
