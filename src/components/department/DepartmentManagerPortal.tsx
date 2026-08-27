import React, { useState, useMemo } from 'react';
import { DepartmentManager, Category, Product, Order, OrderStatus } from '../../types';
import { 
  saveProduct, 
  deleteProduct, 
  updateOrderStatus, 
  saveCategoryWhatsappNumber 
} from '../../services/storeService';
import { normalizeAlgerianWhatsAppNumber } from '../../utils/whatsappOrder';
import { 
  Store, 
  Package, 
  Clock, 
  History, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Phone, 
  MessageCircle, 
  User, 
  LogOut, 
  Folder, 
  Sparkles, 
  AlertCircle, 
  DollarSign, 
  ShoppingBag, 
  Search, 
  Check, 
  X, 
  Upload, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw,
  Send
} from 'lucide-react';

interface DepartmentManagerPortalProps {
  manager: DepartmentManager;
  category?: Category;
  categories?: Category[];
  products?: Product[];
  orders?: Order[];
  onLogout: () => void;
  onGoToStore?: () => void;
  onGoHome?: () => void;
}

export const DepartmentManagerPortal: React.FC<DepartmentManagerPortalProps> = ({
  manager,
  category: propCategory,
  categories = [],
  products = [],
  orders = [],
  onLogout,
  onGoToStore,
  onGoHome
}) => {
  // Derive category if not directly passed
  const category: Category = propCategory || 
    categories.find(c => c.id === manager.category_id || c.name === manager.category_name) || {
      id: manager.category_id || 'general',
      name: manager.category_name || 'القسم التجاري',
      slug: 'general',
      icon: 'Store',
      display_order: 1,
      active: true,
      whatsapp_number: manager.phone || ''
    };

  const handleGoToStore = onGoHome || onGoToStore || (() => {});
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    image_url: '',
    active: true
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  // WhatsApp Setting State
  const [deptWhatsApp, setDeptWhatsApp] = useState(category.whatsapp_number || manager.phone || '');
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Filter products for this manager's department
  const deptProducts = useMemo(() => {
    return products.filter(p => p.category_id === category.id || p.category_id === category.name);
  }, [products, category]);

  // Filter orders that contain items from this department
  const deptOrders = useMemo(() => {
    return orders.filter(ord => {
      if (!ord.items || ord.items.length === 0) return true;
      // Check if any product in order belongs to this category
      return ord.items.some(item => {
        const prod = products.find(p => p.id === item.product_id || p.name === item.product_name);
        return !prod || prod.category_id === category.id || prod.category_id === category.name;
      });
    });
  }, [orders, products, category]);

  // Department Stats
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let pendingCount = 0;
    let acceptedCount = 0;
    let deliveredCount = 0;

    deptOrders.forEach(ord => {
      // Calculate revenue specifically for items in this department
      const deptItemsTotal = ord.items?.reduce((sum, item) => {
        const prod = products.find(p => p.id === item.product_id || p.name === item.product_name);
        if (!prod || prod.category_id === category.id || prod.category_id === category.name) {
          return sum + (item.subtotal || (item.price * item.quantity));
        }
        return sum;
      }, 0) || ord.total_price || (ord as any).total_amount || 0;

      if (ord.status === 'accepted' || ord.status === 'delivered') {
        totalRevenue += deptItemsTotal;
      }
      if (ord.status === 'pending') pendingCount++;
      if (ord.status === 'accepted') acceptedCount++;
      if (ord.status === 'delivered') deliveredCount++;
    });

    return {
      totalRevenue,
      totalOrders: deptOrders.length,
      pendingCount,
      acceptedCount,
      deliveredCount,
      activeProductsCount: deptProducts.filter(p => p.active).length
    };
  }, [deptOrders, deptProducts, products, category]);

  // Handle Product Save
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      description: '',
      image_url: '',
      active: true
    });
    setImagePreview('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: prod.price.toString(),
      description: prod.description || '',
      image_url: prod.image_url || '',
      active: prod.active
    });
    setImagePreview(prod.image_url || '');
    setIsProductModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setProductForm(prev => ({ ...prev, image_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(productForm.price);
    if (!productForm.name.trim() || isNaN(priceNum) || priceNum <= 0) {
      alert('يرجى إدخال اسم المنتج وسعر صالح بالدينار الجزائري.');
      return;
    }

    try {
      await saveProduct({
        id: editingProduct ? editingProduct.id : undefined,
        name: productForm.name.trim(),
        price: priceNum,
        description: productForm.description.trim(),
        image_url: productForm.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
        category_id: category.id,
        active: productForm.active
      });

      setIsProductModalOpen(false);
      setSaveNotice('تم حفظ بيانات المنتج بنجاح!');
      setTimeout(() => setSaveNotice(null), 3000);
    } catch (err: any) {
      alert('حدث خطأ أثناء حفظ المنتج: ' + err?.message);
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف المنتج (${prod.name})؟`)) return;
    try {
      await deleteProduct(prod.id);
      setSaveNotice('تم حذف المنتج بنجاح.');
      setTimeout(() => setSaveNotice(null), 3000);
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err?.message);
    }
  };

  const handleToggleProductActive = async (prod: Product) => {
    try {
      await saveProduct({
        ...prod,
        active: !prod.active
      });
    } catch (err: any) {
      alert('خطأ أثناء تحديث حالة المنتج: ' + err?.message);
    }
  };

  // Handle Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setSaveNotice(`تم تحديث حالة الطلبية إلى: ${newStatus === 'accepted' ? 'مقبولة' : newStatus === 'delivered' ? 'تم التوصيل' : 'ملغاة'}`);
      setTimeout(() => setSaveNotice(null), 3000);
    } catch (err: any) {
      alert('خطأ أثناء تحديث حالة الطلبية: ' + err?.message);
    }
  };

  // Contact Customer via WhatsApp
  const handleContactCustomerWhatsApp = (ord: Order) => {
    const cleanPhone = normalizeAlgerianWhatsAppNumber(ord.customer_phone);
    const displayNum = `DZ-${ord.id.slice(-6).toUpperCase()}`;
    const text = 
      `مرحباً بك زبوننا الكريم *${ord.customer_name}*،\n` +
      `معك مسؤول قسم *${category.name}* في متجر اشري من دارك بخصوص طلبيتك رقم (*${displayNum}*).\n\n` +
      `نحن نعمل على تجهيز طلبيتك وتأكيد تفاصيل التوصيل إلى:\n` +
      `📍 ${ord.customer_address}\n\n` +
      `هل يمكنك تأكيد توفرك لاستلام الطلب؟ شكراً لك! 🌸`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Save Department WhatsApp
  const handleSaveDeptWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWhatsApp(true);
    try {
      await saveCategoryWhatsappNumber(category.id, deptWhatsApp.trim());
      setSaveNotice('تم حفظ وتحديث رقم WhatsApp الخاص بالقسم بنجاح! سيتم إرسال الطلبات الجديدة إليه مباشرة.');
      setTimeout(() => setSaveNotice(null), 4000);
    } catch (err: any) {
      alert('خطأ أثناء حفظ رقم الواتساب: ' + err?.message);
    } finally {
      setIsSavingWhatsApp(false);
    }
  };

  // Filtered Products
  const filteredProducts = deptProducts.filter(p => {
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
  });

  // Filtered Orders
  const filteredOrders = deptOrders.filter(o => {
    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const q = orderSearch.toLowerCase();
    const displayNum = `DZ-${o.id.slice(-6).toUpperCase()}`;
    const matchSearch = 
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      displayNum.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="bg-slate-100 min-h-screen pb-16">
      
      {/* Top Header Navigation */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Department Brand & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-inner">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                  قسم: {category.name}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  صاحب القسم
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>المسؤول: {manager.manager_name}</span>
                <span className="text-slate-600">•</span>
                <Phone className="w-3 h-3 text-slate-500" />
                <span className="font-mono text-slate-300">{category.whatsapp_number || manager.phone}</span>
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToStore}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-700"
              title="معاينة المتجر"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">معاينة المتجر</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-bold rounded-xl transition-colors border border-red-800/50"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>

        </div>

        {/* Tab Selection Bar */}
        <div className="bg-slate-950/70 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>منتجات القسم ({deptProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 relative ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>طلبات القسم ({deptOrders.length})</span>
              {stats.pendingCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {stats.pendingCount} جديد
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>رقم واتساب القسم والإعدادات</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Global Save Notice Toast */}
        {saveNotice && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-200" />
              <span>{saveNotice}</span>
            </div>
            <button onClick={() => setSaveNotice(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Department Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 block">إجمالي مبيعات القسم</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                {stats.totalRevenue.toLocaleString('ar-DZ')}
              </span>
              <span className="text-xs font-bold text-slate-400">د.ج</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 block">منتجات القسم المتوفرة</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {stats.activeProductsCount}
              </span>
              <span className="text-xs font-bold text-slate-400">/ {deptProducts.length}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 block">طلبات قيد المراجعة</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-600">
                {stats.pendingCount}
              </span>
              <span className="text-xs font-bold text-slate-400">طلبية</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-blue-700 block">طلبات تم تأكيدها</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-blue-600">
                {stats.acceptedCount + stats.deliveredCount}
              </span>
              <span className="text-xs font-bold text-slate-400">طلبية</span>
            </div>
          </div>
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Action & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="بحث في منتجات القسم..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد لهذا القسم</span>
              </button>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">لا توجد منتجات في هذا القسم حالياً</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  قم بإضافة أول منتج وتحديد السعر والصورة ليظهر للزبائن مباشرة في واجهة المتجر.
                </p>
                <button
                  onClick={handleOpenAddProduct}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج الآن</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                      prod.active ? 'border-slate-200 hover:border-emerald-300' : 'border-slate-200 opacity-70 bg-slate-50'
                    }`}
                  >
                    {/* Image & Status */}
                    <div className="relative h-44 bg-slate-100">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <button
                          onClick={() => handleToggleProductActive(prod)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-xs flex items-center gap-1 ${
                            prod.active ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {prod.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{prod.active ? 'متوفر وظاهر' : 'غير متوفر / مخفي'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2 grow">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{prod.name}</h4>
                        <span className="font-black text-emerald-700 text-sm shrink-0 whitespace-nowrap">
                          {prod.price.toLocaleString('ar-DZ')} د.ج
                        </span>
                      </div>
                      {prod.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>
                      )}
                    </div>

                    {/* Actions Bottom */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod)}
                        className="py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-red-200 flex items-center justify-center gap-1 transition-colors"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="بحث باسم الزبون أو الهاتف أو رقم الطلب..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(['all', 'pending', 'accepted', 'delivered', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      orderStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' && 'الكل'}
                    {st === 'pending' && 'قيد الانتظار'}
                    {st === 'accepted' && 'مقبولة'}
                    {st === 'delivered' && 'تم التوصيل'}
                    {st === 'cancelled' && 'ملغاة'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">لا توجد طلبيات تطابق هذا التحديد</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  ستظهر أي طلبية يشتري فيها الزبون منتجات من قسم ({category.name}) هنا تلقائياً في الوقت الفعلي.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const displayNum = `DZ-${ord.id.slice(-6).toUpperCase()}`;
                  const orderDate = new Date(ord.created_at);

                  // Calculate total for this department
                  const deptItems = ord.items?.filter(item => {
                    const prod = products.find(p => p.id === item.product_id || p.name === item.product_name);
                    return !prod || prod.category_id === category.id || prod.category_id === category.name;
                  }) || ord.items || [];

                  const deptItemsSum = deptItems.reduce((acc, it) => acc + (it.subtotal || (it.price * it.quantity)), 0) || ord.total_price || 0;

                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs"
                    >
                      {/* Top Order Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                            {displayNum}
                          </span>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{ord.customer_name}</h4>
                            <span className="text-[11px] text-slate-400">
                              {orderDate.toLocaleDateString('ar-DZ')} في {orderDate.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {/* Order Status Badge & Total */}
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <span className="text-[10px] text-slate-400 block font-bold">مجموع القسم</span>
                            <span className="font-black text-emerald-700 text-base sm:text-lg whitespace-nowrap">
                              {deptItemsSum.toLocaleString('ar-DZ')} د.ج
                            </span>
                          </div>

                          <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                            ord.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            ord.status === 'accepted' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {ord.status === 'pending' && '⏳ قيد الانتظار'}
                            {ord.status === 'accepted' && '🔵 تم القبول'}
                            {ord.status === 'delivered' && '✅ تم التوصيل'}
                            {ord.status === 'cancelled' && '❌ ملغاة'}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info & Address */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold">رقم الزبون:</span>
                            <span className="font-mono font-bold text-slate-900 dir-ltr">{ord.customer_phone}</span>
                          </div>
                          <div className="text-slate-600">
                            <span className="font-bold">العنوان:</span> {ord.customer_address}
                          </div>
                        </div>

                        {ord.notes && (
                          <div className="text-slate-600 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60">
                            <span className="font-bold text-amber-900 block mb-0.5">ملاحظة الزبون:</span>
                            <p className="text-amber-800">{ord.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Items Ordered for this Department */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-500 block">منتجات هذا القسم المطلوبة:</span>
                        <div className="space-y-1 bg-white border border-slate-200 rounded-xl p-2.5">
                          {deptItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center font-bold text-[11px]">
                                  {item.quantity}x
                                </span>
                                <span className="font-bold text-slate-800">{item.product_name}</span>
                              </div>
                              <span className="font-black text-slate-900">
                                {(item.subtotal || (item.price * item.quantity)).toLocaleString('ar-DZ')} د.ج
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons: Status Updates & WhatsApp */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        
                        {/* WhatsApp Chat Button */}
                        <button
                          onClick={() => handleContactCustomerWhatsApp(ord)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-200" />
                          <span>تواصل مع الزبون على WhatsApp</span>
                        </button>

                        {/* Status Change Buttons */}
                        <div className="flex items-center gap-1.5">
                          {ord.status !== 'accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'accepted')}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                            >
                              قبول الطلبية
                            </button>
                          )}

                          {ord.status !== 'delivered' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                            >
                              تم التوصيل
                            </button>
                          )}

                          {ord.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'cancelled')}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors"
                            >
                              إلغاء الطلب
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: SETTINGS & WHATSAPP CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                <MessageCircle className="w-4 h-4" />
                <span>إعدادات التواصل واستقبال الطلبات</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                رقم WhatsApp المخصص لاستقبال طلبات قسم: {category.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                عند قيام أي زبون بطلب منتجات من قسمك، يتم توجيه رسالة الطلب مباشرة إلى هذا الرقم على WhatsApp دون الحاجة لتدخل الإدارة.
              </p>
            </div>

            <form onSubmit={handleSaveDeptWhatsApp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم WhatsApp لقسمك:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={deptWhatsApp}
                    onChange={(e) => setDeptWhatsApp(e.target.value)}
                    placeholder="مثال: 0555123456 أو 0661234567"
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-mono bg-slate-50"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  الرقم بعد التهيئة: <span className="font-mono text-emerald-700 font-bold">{normalizeAlgerianWhatsAppNumber(deptWhatsApp)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingWhatsApp}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingWhatsApp ? 'جاري الحفظ...' : 'حفظ وتحديث رقم الواتساب'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const clean = normalizeAlgerianWhatsAppNumber(deptWhatsApp);
                    const testUrl = `https://wa.me/${clean}?text=${encodeURIComponent(`👋 مرحباً، هذه رسالة تجربة لتأكيد عمل رقم WhatsApp لقسم (${category.name}).`)}`;
                    window.open(testUrl, '_blank');
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تجربة إرسال رسالة للرقم</span>
                </button>
              </div>
            </form>

            {/* Account Credentials Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">معلومات حسابك:</span>
              <div className="flex items-center justify-between text-slate-600">
                <span>اسم المستخدم:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{manager.username}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>القسم المسند:</span>
                <span className="font-bold text-emerald-700">{category.name}</span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm sm:text-base">
                  {editingProduct ? 'تعديل منتج في قسمك' : `إضافة منتج جديد لقسم (${category.name})`}
                </h3>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProductForm} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المنتج: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دقلة نور فاخرة 1 كغ"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
                />
              </div>

              {/* Product Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  السعر بالدينار الجزائري (د.ج): <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="مثال: 1200"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-mono font-bold bg-white"
                />
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  وصف المنتج ومميزاته:
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: تمور جزائرية أصلية طازجة من مزارع طولقة ذات جودة عالية..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
                />
              </div>

              {/* Image Selection / Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  صورة المنتج:
                </label>

                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0 bg-slate-50">
                      <Package className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1 grow">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-slate-200">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة من جهازك</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        className="hidden" 
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="أو ضع رابط صورة مباشر (URL)..."
                      value={productForm.image_url.startsWith('data:') ? '' : productForm.image_url}
                      onChange={(e) => {
                        setProductForm({ ...productForm, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={productForm.active}
                    onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    المنتج متوفر وجاهز للطلب الآن في المتجر
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
