import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  ShoppingBag,
  Utensils,
  Store as StoreIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Sparkles
} from 'lucide-react';
import { OrderStatus } from '../../types/admin';

interface OverviewTabProps {
  onNavigateTab: (tabId: string) => void;
}

export default function OverviewTab({ onNavigateTab }: OverviewTabProps) {
  const { orders, restaurants, stores, products, updateOrderStatus } = useApp();

  const totalSales = orders.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const pendingOrders = orders.filter(o => o.status === 'new' || o.status === 'preparing');
  const activeRestaurants = restaurants.filter(r => r.active).length;
  const activeStores = stores.filter(s => s.active).length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold">جديد</span>;
      case 'preparing':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-bold">قيد التحضير</span>;
      case 'ready':
        return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full text-xs font-bold">جاهز</span>;
      case 'delivered':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold">تم التسليم</span>;
      case 'cancelled':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full text-xs font-bold">ملغي</span>;
    }
  };

  return (
    <div className="space-y-8 font-cairo dir-rtl text-right">
      
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-emerald-900/80 via-emerald-950 to-stone-900 border border-emerald-800/40 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>لوحة المراقبة الحية والبيانات المباشرة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-kufi">
            مرحباً بك في لوحة تحكم "اشري من دارك"
          </h2>
          <p className="text-stone-300 text-sm max-w-xl leading-relaxed">
            تتضمن هذه الصفحة ملخص الإحصائيات الفورية، حركة المبيعات، ومراقبة حالة الطلبات الواردة مباشرة.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>متابعة الطلبات ({pendingOrders.length})</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: TOTAL SALES */}
        <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">إجمالي المبيعات</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-kufi">
            {totalSales.toLocaleString()} <span className="text-sm font-normal text-emerald-400">د.ج</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.5% مقارنة بالشهر الماضي</span>
          </div>
        </div>

        {/* KPI 2: TOTAL ORDERS */}
        <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">عدد الطلبات الإجمالي</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-kufi">
            {orders.length} <span className="text-sm font-normal text-stone-400">طلب</span>
          </div>
          <div className="text-[11px] text-stone-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{pendingOrders.length} طلبات قيد الانتظار</span>
          </div>
        </div>

        {/* KPI 3: ACTIVE RESTAURANTS & STORES */}
        <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">المطاعم والمتاجر المفعلة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-kufi">
            {activeRestaurants + activeStores} <span className="text-sm font-normal text-stone-400">شركاء</span>
          </div>
          <div className="text-[11px] text-stone-400 flex items-center gap-2">
            <span>{activeRestaurants} مطعم</span>
            <span>•</span>
            <span>{activeStores} متجر</span>
          </div>
        </div>

        {/* KPI 4: TOTAL PRODUCTS */}
        <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400">إجمالي المنتجات المتاحة</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-kufi">
            {products.length} <span className="text-sm font-normal text-stone-400">منتج</span>
          </div>
          <div className="text-[11px] text-stone-400">
            <span>موزعة عبر الأقسام الغذائية</span>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-kufi flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>أحدث الطلبات الواردة</span>
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
          >
            عرض كافة الطلبات ({orders.length}) ←
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 text-xs font-bold">
                <th className="py-3 px-4">رقم الطلب</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">المطعم / المتجر</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">الإجراء السريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-xs">
                    {order.id}
                  </td>
                  <td className="py-3.5 px-4 text-stone-200">
                    <div className="font-bold">{order.customerName}</div>
                    <div className="text-xs text-stone-500">{order.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">
                    {order.vendorName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {order.totalPrice} د.ج
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="new">جديد</option>
                      <option value="preparing">قيد التحضير</option>
                      <option value="ready">جاهز</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
