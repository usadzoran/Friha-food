import React, { useState } from 'react';
import { ShoppingBag, Store, Bell, Volume2, Shield, ExternalLink, Folder, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Order, DepartmentManager, AuthRole } from '../types';
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
  onOpenJoinUs?: () => void;
  // Department Manager Auth
  activeRole?: AuthRole | null;
  activeManager?: DepartmentManager | null;
  onOpenPortal?: () => void;
  onLogoutManager?: () => void;
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
  onClearUnread,
  onOpenJoinUs,
  activeRole,
  activeManager,
  onOpenPortal,
  onLogoutManager
}) => {
  const [clickCount, setClickCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Single click goes home, secret triple click on logo opens login modal
  const handleLogoClick = () => {
    if (onGoHome) onGoHome();
    if (isAdmin || activeManager) return;
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
        
        {/* Brand / Logo (Triple-click opens login quietly) */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
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
        <div className="flex items-center gap-1.5 sm:gap-2.5">

          {/* Department Manager Active Badge & Portal Link */}
          {activeManager && (
            <div className="flex items-center gap-1 bg-emerald-900/80 border border-emerald-500/50 p-1 pl-2 rounded-xl text-xs">
              <button
                onClick={onOpenPortal}
                className="flex items-center gap-1.5 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-2xs"
                title="فتح لوحة تحكم القسم"
              >
                <Folder className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">قسم:</span>
                <span className="max-w-[90px] sm:max-w-[120px] truncate">{activeManager.department_name}</span>
              </button>

              <button
                onClick={onLogoutManager}
                className="p-1 text-emerald-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="تسجيل الخروج من القسم"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Super Admin Active Badge */}
          {isAdmin && !activeManager && (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 p-1 pl-2 rounded-xl text-xs">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg transition-colors shadow-2xs"
                title="لوحة الإدارة الرئيسية"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>المدير العام</span>
              </button>

              <button
                onClick={onLogoutAdmin}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="الخروج من الإدارة"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Join Us Button - Always visible & prominent */}
          {onOpenJoinUs && (
            <button
              onClick={onOpenJoinUs}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md border border-amber-200 transition-all hover:scale-105 active:scale-95 shrink-0"
              title="انضم إلى الموقع واعرض منتجاتك وافتح قسمك"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span className="hidden xs:inline">انضم إلى الموقع</span>
              <span className="xs:hidden">انضم إلينا</span>
            </button>
          )}

          {/* Direct Login Button hidden for visitors (Accessible via triple-click on logo or Ctrl+Shift+A or /admin) */}

          {/* Order Notifications Bell Icon */}
          <div className="relative">
            <button
              onClick={handleToggleNotifMenu}
              className={`relative p-2 sm:p-2.5 rounded-xl transition-all border ${
                unreadCount > 0 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md animate-bounce' 
                  : 'bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 border-emerald-600'
              }`}
              title="إشعارات الطلبات الجديدة"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
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

                {/* Admin Quick Link - only visible for logged in admin or manager */}
                {(isAdmin || activeManager) && (
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        if (activeManager) {
                          if (onOpenPortal) onOpenPortal();
                        } else {
                          onOpenAdmin();
                        }
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeManager ? 'الانتقال إلى لوحة تحكم القسم' : 'الانتقال إلى لوحة التحكم'}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 sm:gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-bold px-3 sm:px-3.5 py-2 rounded-xl transition-all shadow-sm"
            aria-label="سلة الطلبات"
          >
            <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-900" />
            <span className="text-xs sm:text-sm hidden xs:inline">الطلبات</span>
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
