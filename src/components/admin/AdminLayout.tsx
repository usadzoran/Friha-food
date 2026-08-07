import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  Store as StoreIcon,
  Layers,
  Package,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Percent,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Bell
} from 'lucide-react';

import OverviewTab from './OverviewTab';
import RestaurantsTab from './RestaurantsTab';
import StoresTab from './StoresTab';
import CategoriesTab from './CategoriesTab';
import ProductsTab from './ProductsTab';
import OrdersTab from './OrdersTab';
import UsersTab from './UsersTab';
import MediaTab from './MediaTab';
import OffersTab from './OffersTab';
import SettingsTab from './SettingsTab';

interface AdminLayoutProps {
  onGoPublicSite?: () => void;
}

export default function AdminLayout({ onGoPublicSite }: AdminLayoutProps) {
  const { logoutAdmin, orders, adminEmail } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingOrdersCount = orders.filter(o => o.status === 'new').length;

  const menuItems = [
    { id: 'overview', label: 'الصفحة الرئيسية', icon: LayoutDashboard },
    { id: 'restaurants', label: 'إدارة المطاعم', icon: Building2 },
    { id: 'stores', label: 'إدارة المتاجر', icon: StoreIcon },
    { id: 'categories', label: 'إدارة الأقسام', icon: Layers },
    { id: 'products', label: 'إدارة المنتجات', icon: Package },
    { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users },
    { id: 'media', label: 'إدارة الصور والوسائط', icon: ImageIcon },
    { id: 'offers', label: 'العروض والتخفيضات', icon: Percent },
    { id: 'settings', label: 'إعدادات الموقع', icon: Settings },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'restaurants':
        return <RestaurantsTab />;
      case 'stores':
        return <StoresTab />;
      case 'categories':
        return <CategoriesTab />;
      case 'products':
        return <ProductsTab />;
      case 'orders':
        return <OrdersTab />;
      case 'users':
        return <UsersTab />;
      case 'media':
        return <MediaTab />;
      case 'offers':
        return <OffersTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex font-cairo dir-rtl selection:bg-emerald-600 selection:text-white">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-stone-900 border-l border-stone-800/80 transition-all duration-300 z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* BRANDING HEADER */}
          <div className="flex items-center justify-between px-2">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/80 font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold font-kufi text-white tracking-wide">
                    لوحة الإدارة
                  </h1>
                  <span className="text-[11px] text-stone-400 block font-medium">
                    اشري من دارك
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
              title="طي / توسيع القائمة"
            >
              <ChevronRight
                className={`w-5 h-5 transition-transform duration-300 ${
                  isSidebarCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* MENU ITEMS */}
          <nav className="space-y-1.5 pt-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/60'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-amber-500 text-stone-950 font-extrabold text-[11px] px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER (ADMIN INFO & LOGOUT) */}
        <div className="p-4 border-t border-stone-800/80 space-y-2">
          {!isSidebarCollapsed && (
            <div className="px-3 py-2 rounded-xl bg-stone-950/60 border border-stone-800 text-xs">
              <span className="text-stone-400 block text-[10px]">المسؤول الحالي:</span>
              <span className="font-bold text-emerald-400 truncate block">{adminEmail}</span>
            </div>
          )}

          <button
            onClick={() => {
              if (confirm('هل ترغب في تسجيل الخروج من لوحة التحكم؟')) {
                logoutAdmin();
              }
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl font-bold text-xs text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-stone-900 border-l border-stone-800 h-full p-5 flex flex-col justify-between space-y-6 text-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span className="font-bold font-kufi text-white">لوحة التحكم</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-amber-500 text-stone-950 font-bold text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={logoutAdmin}
              className="w-full flex items-center gap-3 p-3 rounded-xl font-bold text-xs text-red-400 hover:bg-red-950/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-stone-900/80 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-sm font-bold text-stone-300 font-kufi">
              {menuItems.find((m) => m.id === activeTab)?.label || 'لوحة التحكم'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {pendingOrdersCount > 0 && (
              <button
                onClick={() => setActiveTab('orders')}
                className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{pendingOrdersCount} طلبات جديدة</span>
              </button>
            )}

            {onGoPublicSite && (
              <button
                onClick={onGoPublicSite}
                className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-stone-700"
              >
                <span>معاينة الواجهة العامة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* TAB PAGE CONTENT CONTAINER */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
