import React, { useState } from 'react';
import { Product, Order, OrderStatus, AdminTab } from '../../types';
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  toggleProductActive, 
  updateOrderStatus 
} from '../../services/storeService';
import { 
  LayoutDashboard, 
  Package, 
  Clock, 
  History, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Phone, 
  MapPin, 
  Search, 
  AlertCircle,
  X,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Product Form state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    active: true
  });

  // History search/filter state
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterStatus, setHistoryFilterStatus] = useState<'all' | 'delivered' | 'cancelled'>('all');

  // Open modal for adding product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({ name: '', description: '', price: '', image_url: '', active: true });
    setIsProductModalOpen(true);
  };

  // Open modal for editing product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price.toString(),
      image_url: prod.image_url || '',
      active: prod.active
    });
    setIsProductModalOpen(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(prodForm.price);
    if (isNaN(priceNum) || priceNum <= 0) return;

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: prodForm.name.trim(),
        description: prodForm.description.trim(),
        price: priceNum,
        image_url: prodForm.image_url.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        active: prodForm.active
      });
    } else {
      await addProduct({
        name: prodForm.name.trim(),
        description: prodForm.description.trim(),
        price: priceNum,
        image_url: prodForm.image_url.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        active: prodForm.active
      });
    }

    setIsProductModalOpen(false);
  };

  // Toggle active product
  const handleToggleActive = async (prod: Product) => {
    await toggleProductActive(prod.id, prod.active);
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('هل أنت تأكد من حذف هذا المنتج نهائياً؟')) {
      await deleteProduct(id);
    }
  };

  // Order status update
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  // Calculated Stats
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');
  const currentOrders = orders.filter(o => o.status === 'pending' || o.status === 'accepted');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  const historicOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  const totalDeliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  // Filtered History
  const filteredHistory = historicOrders.filter(o => {
    const matchesStatus = historyFilterStatus === 'all' || o.status === historyFilterStatus;
    const term = historySearch.toLowerCase();
    const displayNum = `DZ-${o.id.slice(-6).toUpperCase()}`;
    const matchesSearch = 
      o.customer_name.toLowerCase().includes(term) ||
      o.customer_phone.includes(term) ||
      displayNum.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-slate-100 min-h-screen pb-12">
      {/* Admin Subheader Navigation */}
      <div className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-14 z-20">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 py-2">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>المنتجات ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('current_orders')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'current_orders'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>الطلبات الحالية</span>
              {currentOrders.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-black">
                  {currentOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('order_history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'order_history'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>سجل الطلبات ({historicOrders.length})</span>
            </button>

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800">نظرة عامة وإحصائيات المتجر</h2>
                <p className="text-xs text-slate-500">متابعة فورية للطلبات المباشرة والمبيعات بالدينار الجزائري</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-amber-600">
                  <span className="text-xs font-bold">الطلبات الجديدة</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{pendingOrders.length}</div>
                <p className="text-[11px] text-slate-400 font-medium">تنتظر القبول</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-blue-600">
                  <span className="text-xs font-bold">المقبولة</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{acceptedOrders.length}</div>
                <p className="text-[11px] text-slate-400 font-medium">قيد التوصيل</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="text-xs font-bold">الطلبات المسلّمة</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{deliveredOrders.length}</div>
                <p className="text-[11px] text-slate-400 font-medium">تمت بنجاح</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-red-600">
                  <span className="text-xs font-bold">الطلبات الملغاة</span>
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{cancelledOrders.length}</div>
                <p className="text-[11px] text-slate-400 font-medium">غير مكتملة</p>
              </div>

              <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-sm space-y-2 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-emerald-300">
                  <span className="text-xs font-bold">إجمالي المبيعات</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl font-black text-white">
                  {totalDeliveredRevenue.toLocaleString('ar-DZ')} <span className="text-xs text-emerald-300 font-bold">د.ج</span>
                </div>
                <p className="text-[11px] text-emerald-200/80 font-medium">الطلبات المكتملة</p>
              </div>

            </div>

            {/* Quick action card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">لديك {currentOrders.length} طلبات حالية تحتاج لمتابعتك</h3>
                <p className="text-xs text-slate-500 mt-0.5">قم بقبول الطلبات وتحديث حالتها بمجرد توصيلها للزبون.</p>
              </div>
              <button
                onClick={() => setActiveTab('current_orders')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                عرض الطلبات الحالية الآن
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-slate-800">إدارة المنتجات</h2>
                <p className="text-xs text-slate-500">إضافة وتعديل وإخفاء المنتجات المعروضة للزبائن</p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            {/* Products Table/Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className={`bg-white rounded-2xl border ${prod.active ? 'border-slate-200' : 'border-slate-300 opacity-75 bg-slate-50'} p-4 shadow-xs flex flex-col justify-between gap-3`}
                >
                  <div className="flex gap-3">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-16 h-16 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{prod.name}</h3>
                        {!prod.active && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                            مخفي
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{prod.description}</p>
                      <div className="text-emerald-700 font-extrabold text-sm mt-1">
                        {prod.price.toLocaleString('ar-DZ')} د.ج
                      </div>
                    </div>
                  </div>

                  {/* Product action buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                    <button
                      onClick={() => handleToggleActive(prod)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
                        prod.active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {prod.active ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>ظاهر بالمتجر</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>إظهار في المتجر</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل المنتج"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CURRENT ORDERS (PENDING & ACCEPTED) */}
        {activeTab === 'current_orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-800">الطلبات الحالية ({currentOrders.length})</h2>
                <p className="text-xs text-slate-500">الطلبات المعلقة والمقبولة الجارية حالياً في المتجر</p>
              </div>
            </div>

            {currentOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
                <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-base">لا توجد طلبات جديدة حالياً</h3>
                <p className="text-xs text-slate-400">ستظهر جميع الطلبات القادمة من الزبائن فوراً وبشكل آلي هنا.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentOrders.map((order) => {
                  const displayNum = `DZ-${order.id.slice(-6).toUpperCase()}`;
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg text-sm border border-emerald-100">
                            {displayNum}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(order.created_at).toLocaleString('ar-DZ')}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div>
                          {order.status === 'pending' && (
                            <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-200">
                              طلب جديد (معلق)
                            </span>
                          )}
                          {order.status === 'accepted' && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200">
                              مقبول - قيد التوصيل
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Customer Info & Order Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Customer details */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-700">
                          <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-xs">
                            تفاصيل الزبون والعنوان:
                          </h4>
                          <div>
                            <span className="text-slate-400 font-medium">الاسم:</span> {' '}
                            <span className="font-bold text-slate-900">{order.customer_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">رقم الهاتف:</span> {' '}
                            <a 
                              href={`tel:${order.customer_phone}`}
                              className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                              dir="ltr"
                            >
                              <Phone className="w-3 h-3" />
                              {order.customer_phone}
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">العنوان:</span> {' '}
                            <span className="font-medium text-slate-800 leading-relaxed">
                              {order.customer_address}
                            </span>
                          </div>
                          {order.notes && (
                            <div className="pt-1 text-slate-500 italic border-t border-slate-200/60">
                              ملاحظات: {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Items list */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                          <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-xs">
                            المنتجات المطلوبة:
                          </h4>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-slate-800">
                                  <span className="font-medium line-clamp-1">
                                    {item.product_name} × <strong className="text-emerald-700">{item.quantity}</strong>
                                  </span>
                                  <span className="font-bold whitespace-nowrap">
                                    {item.subtotal.toLocaleString('ar-DZ')} د.ج
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-slate-400 text-xs">جاري تحميل المنتجات...</div>
                            )}
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-black text-sm text-emerald-800">
                            <span>المجموع الكلي:</span>
                            <span>{order.total_price.toLocaleString('ar-DZ')} د.ج</span>
                          </div>
                        </div>

                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'accepted')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>قبول الطلب والتوصيل</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تم التسليم بنجاح</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-slate-200 hover:border-red-200 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>إلغاء الطلب</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ORDER HISTORY (DELIVERED & CANCELLED) */}
        {activeTab === 'order_history' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div>
                <h2 className="text-lg font-black text-slate-800">سجل الطلبات الأرشيفي</h2>
                <p className="text-xs text-slate-500">الطلبات المسلّمة والملغاة المحفوظة في قاعدة البيانات</p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="بحث باسم الزبون، رقم الهاتف أو رقم الطلب..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={historyFilterStatus}
                    onChange={(e) => setHistoryFilterStatus(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="delivered">المسلّمة فقط</option>
                    <option value="cancelled">الملغاة فقط</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
                <History className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-base">لا توجد طلبات في السجل تطابق البحث</h3>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">رقم الطلب</th>
                        <th className="p-3">الزبون والهاتف</th>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">المبلغ الإجمالي</th>
                        <th className="p-3">الحالة النهائية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredHistory.map((order) => {
                        const displayNum = `DZ-${order.id.slice(-6).toUpperCase()}`;
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-800">
                              {displayNum}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{order.customer_name}</div>
                              <div className="text-[11px] text-slate-400">{order.customer_phone}</div>
                            </td>
                            <td className="p-3 text-slate-500">
                              {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                            </td>
                            <td className="p-3 font-extrabold text-emerald-700">
                              {order.total_price.toLocaleString('ar-DZ')} د.ج
                            </td>
                            <td className="p-3">
                              {order.status === 'delivered' ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  تم التسليم
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                                  ملغاة
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 hover:bg-emerald-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="مثال: تمر دقلة نور بسكرة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">السعر بالدينار الجزائري (DZD)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={prodForm.price}
                  onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                  placeholder="مثال: 1500"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف المنتج</label>
                <textarea
                  rows={2}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  placeholder="وصف مختصر ومميزات المنتج..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط صورة المنتج (URL)</label>
                <input
                  type="url"
                  value={prodForm.image_url}
                  onChange={(e) => setProdForm({ ...prodForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prodActiveCheck"
                  checked={prodForm.active}
                  onChange={(e) => setProdForm({ ...prodForm, active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="prodActiveCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  عرض المنتج مباشرة بالمتجر
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
