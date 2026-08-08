import React, { useState } from 'react';
import { Order } from '../types';
import { Clock, Search, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface PendingOrdersPublicSectionProps {
  orders: Order[];
}

export const PendingOrdersPublicSection: React.FC<PendingOrdersPublicSectionProps> = ({ orders }) => {
  const [searchRef, setSearchRef] = useState<string>('');

  // Filter only pending orders for public status display
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  // Filter by user search if provided
  const filteredOrders = pendingOrders.filter((o) => {
    const displayNum = `DZ-${o.id.slice(-6).toUpperCase()}`;
    return displayNum.toLowerCase().includes(searchRef.toLowerCase().trim());
  });

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <Clock className="w-4 h-4 animate-spin-slow" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              قائمة الطلبيات قيد الانتشار والمعالجة
            </h3>
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200">
              {pendingOrders.length} طلبية
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            تُعرض هنا حالات الطلبات المسجلة حالياً لضمان الشفافية، مع التكتم التام وحماية خصوصية بيانات الزبائن.
          </p>
        </div>

        {/* Privacy assurance pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200/70 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>بياناتك الشخصية محمية ومخفية</span>
        </div>
      </div>

      {/* Quick Search for user's order number */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <span className="text-xs font-bold text-slate-700">
          هل قمت بطلب جديد؟ ابحث برقم طلبك للتأكد من وصوله:
        </span>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="أدخل رقم طلبك (مثال: DZ-1A2B3C)"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
            dir="ltr"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Orders Grid */}
      {pendingOrders.length === 0 ? (
        <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-xs font-bold text-slate-700">لا توجد طلبات قيد الانتظار حالياً</p>
          <p className="text-[11px] text-slate-400">جميع الطلبات جاري معالجتها وتوصيلها للزبائن الكرام.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500">
          لا يوجد طلب يحمل هذا الرقم. يرجى التأكد من كتابة الرقم الصحيح.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredOrders.map((order) => {
            const displayNum = `DZ-${order.id.slice(-6).toUpperCase()}`;
            const timeAgo = formatTimeAgo(order.created_at);

            return (
              <div
                key={order.id}
                className="bg-slate-50 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all space-y-2.5"
              >
                {/* Order Ref & Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800 shadow-2xs">
                      {displayNum}
                    </span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    <span>قيد المعالجة والتأكيد</span>
                  </span>
                </div>

                {/* Details (No personal data!) */}
                <div className="text-xs space-y-1 pt-1 border-t border-slate-200/50 text-slate-600">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>توقيت الطلب:</span>
                    <span className="font-medium text-slate-600">{timeAgo}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>حالة الخصوصية:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      محمي ومخفي 🔒
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

// Helper function to format relative time in Arabic
function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'منذ لحظات';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    return date.toLocaleDateString('ar-DZ');
  } catch {
    return 'مؤخراً';
  }
}
