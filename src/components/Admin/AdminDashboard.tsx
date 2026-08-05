import React, { useState, useEffect } from 'react';
import { Store, Category, Product, Order, AdminStats } from '../../types';
import { storageService } from '../../services/storage';
import { StoresManager } from './StoresManager';
import { ProductsManager } from './ProductsManager';
import { CategoriesManager } from './CategoriesManager';
import { OrdersManager } from './OrdersManager';
import { SupabaseConfigModal } from './SupabaseConfigModal';
import {
  LayoutDashboard,
  Store as StoreIcon,
  ShoppingBag,
  Tag,
  ClipboardList,
  Database,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  const [activeTab, setActiveTab] = useState<
    'stats' | 'stores' | 'products' | 'categories' | 'orders' | 'supabase'
  >('stats');

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    storesCount: 0,
    productsCount: 0,
    ordersCount: 0,
    categoriesCount: 0,
    totalRevenue: 0,
  });

  const loadData = () => {
    setStores(storageService.getStores());
    setCategories(storageService.getCategories());
    setProducts(storageService.getProducts());
    setOrders(storageService.getOrders());
    setStats(storageService.getStats());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const handleResetData = () => {
    if (window.confirm('هل أنت تأكد من استعادة البيانات الافتراضية الأولية للمنصة؟')) {
      storageService.resetToDefault();
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 flex flex-col font-cairo">
      {/* TOP BAR */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold font-traditional text-2xl">
              د
            </div>
            <div>
              <h1 className="text-lg font-bold font-traditional tracking-wide">
                لوحة تسيير "اشري من دارك"
              </h1>
              <p className="text-[11px] text-stone-400">لوحة الإدارة الشاملة للمتاجر والطلبات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="p-2 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-xl text-xs flex items-center gap-1 transition-colors"
              title="استعادة البيانات الافتراضية"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">إعادة ضبط التجربة</span>
            </button>

            <button
              onClick={onExitAdmin}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للمتجر الرئيسي</span>
            </button>
          </div>
        </div>
      </header>

      {/* ADMIN TABS NAV */}
      <div className="bg-white border-b border-stone-200/80 sticky top-[61px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                activeTab === 'stats'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>لوحة التحكم والإحصائيات</span>
            </button>

            <button
              onClick={() => setActiveTab('stores')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                activeTab === 'stores'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <StoreIcon className="w-4 h-4" />
              <span>المتاجر والمحلات ({stats.storesCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                activeTab === 'products'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>المنتجات والوجبات ({stats.productsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                activeTab === 'categories'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>التصنيفات ({stats.categoriesCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                activeTab === 'orders'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>الطلبات الواردة ({stats.ordersCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                activeTab === 'supabase'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>إعدادات Supabase</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN ADMIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'stats' && (
          <div className="space-y-8">
            {/* STATS CARDS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {/* STORES STAT */}
              <div
                onClick={() => setActiveTab('stores')}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-xs font-bold">عدد المتاجر</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-stone-900 font-mono">
                    {stats.storesCount}
                  </span>
                  <span className="text-xs text-stone-400 block mt-0.5">مطعم ومحل متاح</span>
                </div>
              </div>

              {/* PRODUCTS STAT */}
              <div
                onClick={() => setActiveTab('products')}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-xs font-bold">عدد المنتجات</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-stone-900 font-mono">
                    {stats.productsCount}
                  </span>
                  <span className="text-xs text-stone-400 block mt-0.5">وجبة ومادة غذائية</span>
                </div>
              </div>

              {/* ORDERS STAT */}
              <div
                onClick={() => setActiveTab('orders')}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-xs font-bold">عدد الطلبات</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-stone-900 font-mono">
                    {stats.ordersCount}
                  </span>
                  <span className="text-xs text-stone-400 block mt-0.5">طلب مسجل بالمنصة</span>
                </div>
              </div>

              {/* CATEGORIES STAT */}
              <div
                onClick={() => setActiveTab('categories')}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-xs font-bold">عدد التصنيفات</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-stone-900 font-mono">
                    {stats.categoriesCount}
                  </span>
                  <span className="text-xs text-stone-400 block mt-0.5">تصنيف مأكولات ومشروبات</span>
                </div>
              </div>
            </div>

            {/* REVENUE BANNER */}
            <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full border border-amber-500/30">
                  إجمالي حجم المعاملات والطلبات
                </span>
                <h3 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-400">
                  {stats.totalRevenue} <span className="font-cairo text-lg font-bold">دج</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                  مجموع قيم الطلبات المؤكدة والجديدة التي تم توجيهها لأرقام الواتساب المباشرة للمحلات.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all"
                >
                  استعراض جميع الطلبات
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LATEST ORDERS */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h4 className="font-bold text-base text-stone-900">آخر الطلبات الواردة</h4>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-amber-700 hover:underline font-bold"
                  >
                    عرض الكل ←
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 4).map((ord) => (
                    <div key={ord.id} className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{ord.customer_name}</p>
                        <p className="text-stone-500">{ord.store_name}</p>
                      </div>
                      <span className="font-mono font-bold text-amber-700">{ord.total_amount} دج</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* STORES STATUS OVERVIEW */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h4 className="font-bold text-base text-stone-900">حالة عمل المتاجر</h4>
                  <button
                    onClick={() => setActiveTab('stores')}
                    className="text-xs text-amber-700 hover:underline font-bold"
                  >
                    إدارة المتاجر ←
                  </button>
                </div>

                <div className="space-y-3">
                  {stores.map((st) => (
                    <div key={st.id} className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{st.name}</span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          st.is_open ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {st.is_open ? 'مفتوح' : 'مغلق'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <StoresManager stores={stores} categories={categories} onRefresh={loadData} />
        )}

        {activeTab === 'products' && (
          <ProductsManager
            products={products}
            stores={stores}
            categories={categories}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesManager categories={categories} onRefresh={loadData} />
        )}

        {activeTab === 'orders' && (
          <OrdersManager orders={orders} onRefresh={loadData} />
        )}

        {activeTab === 'supabase' && <SupabaseConfigModal />}
      </main>
    </div>
  );
};
