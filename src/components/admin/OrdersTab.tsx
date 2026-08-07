import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types/admin';
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Phone,
  MapPin,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function OrdersTab() {
  const { orders, updateOrderStatus } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">جديد</span>;
      case 'preparing':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold">قيد التحضير</span>;
      case 'ready':
        return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold">جاهز والتوصيل جارٍ</span>;
      case 'delivered':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">تم التسليم</span>;
      case 'cancelled':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold">ملغي</span>;
    }
  };

  return (
    <div className="space-y-6 font-cairo dir-rtl text-right">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border border-stone-800">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-2xl font-bold font-kufi text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <span>إدارة الطلبات والمبيعات</span>
          </h2>
          <p className="text-xs text-stone-400">
            متابعة الطلبات، تغيير حالتها فورياً واستعراض الفواتير والتفاصيل
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold border border-stone-700">
          إجمالي الطلبات: <span className="text-white font-mono">{orders.length}</span>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
            className="w-full bg-stone-900 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 pr-11 text-stone-100 text-sm placeholder-stone-500 focus:outline-none transition-colors"
          />
          <Search className="w-5 h-5 text-stone-500 absolute top-3.5 right-3.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-64 bg-stone-900 border border-stone-800 text-stone-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">كافة الحالات</option>
          <option value="new">طلبات جديدة</option>
          <option value="preparing">قيد التحضير</option>
          <option value="ready">جاهزة للتوصيل</option>
          <option value="delivered">تم التسليم</option>
          <option value="cancelled">ملغية</option>
        </select>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400 text-xs font-bold">
                <th className="py-4 px-5">رقم الطلب</th>
                <th className="py-4 px-5">العميل والتواصل</th>
                <th className="py-4 px-5">الجهة المزودة</th>
                <th className="py-4 px-5">تاريخ الطلب</th>
                <th className="py-4 px-5">المبلغ الإجمالي</th>
                <th className="py-4 px-5">حالة الطلب</th>
                <th className="py-4 px-5">تغيير الحالة</th>
                <th className="py-4 px-5 text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500">
                    لا توجد طلبات تطابق محددات البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-emerald-400 text-xs">
                      {o.id}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-white">{o.customerName}</div>
                      <div className="text-xs text-stone-400 dir-ltr text-right">{o.customerPhone}</div>
                    </td>
                    <td className="py-4 px-5 text-stone-300 font-medium">
                      {o.vendorName}
                    </td>
                    <td className="py-4 px-5 text-xs text-stone-400">
                      {new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-white">
                      {o.totalPrice} د.ج
                    </td>
                    <td className="py-4 px-5">
                      {getStatusBadge(o.status)}
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="new">جديد</option>
                        <option value="preparing">قيد التحضير</option>
                        <option value="ready">جاهز والتوصيل جارٍ</option>
                        <option value="delivered">تم التسليم</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-right font-cairo">
            
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-kufi text-white">
                    فاتورة طلب: <span className="font-mono text-emerald-400">{selectedOrder.id}</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    تاريخ الطلب: {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CUSTOMER & VENDOR DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800/80 space-y-2 text-xs">
                <span className="font-bold text-stone-400 block border-b border-stone-800 pb-1.5">بيانات العميل</span>
                <div className="text-sm font-bold text-white">{selectedOrder.customerName}</div>
                <div className="flex items-center gap-2 text-stone-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{selectedOrder.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-stone-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{selectedOrder.customerAddress}</span>
                </div>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800/80 space-y-2 text-xs">
                <span className="font-bold text-stone-400 block border-b border-stone-800 pb-1.5">حالة الطلب والمزود</span>
                <div className="text-sm font-bold text-emerald-400">{selectedOrder.vendorName}</div>
                <div className="pt-1">
                  {getStatusBadge(selectedOrder.status)}
                </div>
                {selectedOrder.notes && (
                  <div className="pt-2 text-amber-300/90 text-[11px] bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                    ملاحظات: {selectedOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* ORDER ITEMS LIST */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-300">محتويات الطلب:</h4>
              <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden divide-y divide-stone-800/60">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white text-sm block">{item.productName}</span>
                      <span className="text-stone-500">الكمية: {item.quantity}</span>
                    </div>
                    <div className="text-left font-bold text-stone-200">
                      {item.price * item.quantity} د.ج
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOTAL SUM */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-base">
              <span className="font-bold text-stone-200">الإجمالي النهائي للطلب:</span>
              <span className="text-2xl font-black text-emerald-400 font-kufi">{selectedOrder.totalPrice} د.ج</span>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الإيصال</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
