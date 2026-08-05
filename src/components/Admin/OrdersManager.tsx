import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { storageService } from '../../services/storage';
import { ShoppingBag, Search, Phone, MapPin, Trash2, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface OrdersManagerProps {
  orders: Order[];
  onRefresh: () => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({ orders, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchPhone = o.customer_phone.includes(q);
      const matchStore = o.store_name.toLowerCase().includes(q);
      const matchId = o.id.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchStore && !matchId) return false;
    }
    return true;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    storageService.updateOrderStatus(orderId, newStatus);
    onRefresh();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('هل أنت تأكد من حذف هذا الطلب نهائياً؟')) {
      storageService.deleteOrder(orderId);
      setSelectedOrder(null);
      onRefresh();
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>جديد</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>جاري التحضير</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم التسليم</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>ملغي</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold font-cairo text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <span>سجل وقائمة الطلبات ({orders.length})</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              استعراض طلبات الزبائن، تغيير حالة الطلب والتواصل معهم
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الزبون، الهاتف، أو رقم الطلب..."
              className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* STATUS TABS */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-600 ml-2">تصفية حسب الحالة:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            الكل ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('new')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'new'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            جديد ({orders.filter((o) => o.status === 'new').length})
          </button>
          <button
            onClick={() => setStatusFilter('preparing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'preparing'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            جاري التحضير ({orders.filter((o) => o.status === 'preparing').length})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'delivered'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            تم التسليم ({orders.filter((o) => o.status === 'delivered').length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'cancelled'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            ملغي ({orders.filter((o) => o.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* ORDERS LIST & DETAIL SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ORDERS LIST */}
        <div className="lg:col-span-2 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-stone-300">
              <p className="text-stone-500 text-sm">لا توجد طلبات مسجلة بهذه المواصفات.</p>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => setSelectedOrder(ord)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs ${
                  selectedOrder?.id === ord.id
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                    : 'border-stone-200/80 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-stone-900">
                      #{ord.id}
                    </span>
                    <span className="text-xs text-stone-500">| {ord.store_name}</span>
                  </div>
                  {getStatusBadge(ord.status)}
                </div>

                <div className="flex items-center justify-between gap-4 mt-3">
                  <div>
                    <h5 className="font-bold text-sm text-stone-900 font-cairo">
                      {ord.customer_name}
                    </h5>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span dir="ltr" className="font-mono">{ord.customer_phone}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span className="truncate max-w-[150px]">{ord.customer_address}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-left font-mono font-extrabold text-base text-amber-700 shrink-0">
                    {ord.total_amount} <span className="font-cairo text-xs">دج</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between pt-2 border-t border-stone-50">
                  <span>{new Date(ord.created_at).toLocaleString('ar-DZ')}</span>
                  <span>{ord.items.length} منتجات</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SELECTED ORDER DETAIL PANEL */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl p-5 border border-amber-300 shadow-md space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-700">#{selectedOrder.id}</span>
                  <h4 className="font-bold font-cairo text-base text-stone-900">
                    تفاصيل الطلب
                  </h4>
                </div>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* CUSTOMER INFO */}
              <div className="space-y-1.5 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <p className="font-bold text-stone-900">{selectedOrder.customer_name}</p>
                <p className="text-stone-600 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span dir="ltr" className="font-mono">{selectedOrder.customer_phone}</span>
                </p>
                <p className="text-stone-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>{selectedOrder.customer_address}</span>
                </p>
                {selectedOrder.notes && (
                  <p className="text-stone-500 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200">
                    ملاحظات: {selectedOrder.notes}
                  </p>
                )}
              </div>

              {/* ITEMS BREAKDOWN */}
              <div>
                <h5 className="text-xs font-bold text-stone-700 mb-2">قائمة المنتجات:</h5>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="font-mono font-bold">{item.price * item.quantity} دج</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between font-extrabold text-sm text-amber-800 pt-2 font-mono">
                  <span>المجموع الإجمالي:</span>
                  <span>{selectedOrder.total_amount} دج</span>
                </div>
              </div>

              {/* CHANGE STATUS CONTROL */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-700">تغيير حالة الطلب:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'new')}
                    className="py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold"
                  >
                    جديد
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')}
                    className="py-1.5 px-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-bold"
                  >
                    جاري التحضير
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                    className="py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold"
                  >
                    تم التسليم
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                    className="py-1.5 px-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold"
                  >
                    إلغاء الطلب
                  </button>
                </div>
              </div>

              {/* ACTIONS: CONTACT CUSTOMER & DELETE */}
              <div className="flex items-center gap-2 pt-2">
                <a
                  href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>تواصل بالواتساب</span>
                </a>
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs"
                  title="حذف الطلب"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-stone-300">
              <p className="text-stone-500 text-xs">اضغط على أي طلب لمشاهدة تفاصيله الكاملة هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
