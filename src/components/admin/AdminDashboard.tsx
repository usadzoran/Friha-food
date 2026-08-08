import React, { useState } from 'react';
import { Product, Order, OrderStatus, AdminTab, Category, VisitorStats } from '../../types';
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  toggleProductActive, 
  updateOrderStatus,
  addCategory,
  updateCategory,
  deleteCategory
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
  Search, 
  X, 
  DollarSign,
  Grid,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Tag,
  FolderPlus,
  Users,
  TrendingUp,
  BarChart2,
  Activity,
  Calendar,
  Globe,
  MousePointerClick
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  visitorStats?: VisitorStats | null;
}

// Preset library of curated product images
const PRESET_IMAGES = [
  { label: 'تمر دقلة نور', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80' },
  { label: 'زيت زيتون', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80' },
  { label: 'عسل حر', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
  { label: 'قهوة محامص', url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80' },
  { label: 'شاي وإبريق', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80' },
  { label: 'حلويات شرقية', url: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80' },
  { label: 'توابل وبقالة', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80' },
  { label: 'فخار وأواني', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
  { label: 'عطور ومستحضرات', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
  { label: 'أجهزة وإلكترونيات', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
  { label: 'ألبسة وقماش', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80' },
  { label: 'صحة وجمال', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  orders,
  visitorStats
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Product Modal & Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [prodForm, setProdForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    image_url: '',
    active: true
  });

  // Category Modal & Form State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catImageMode, setCatImageMode] = useState<'preset' | 'url' | 'upload'>('preset');
  const [catForm, setCatForm] = useState({
    name: '',
    icon: 'Folder',
    image_url: ''
  });

  // Filter state for product tab
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // History search/filter state
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterStatus, setHistoryFilterStatus] = useState<'all' | 'delivered' | 'cancelled'>('all');

  // Open modal for adding product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({ 
      name: '', 
      category_id: categories.length > 0 ? categories[0].id : '', 
      description: '', 
      price: '', 
      image_url: '', 
      active: true 
    });
    setImageInputMode('upload');
    setIsProductModalOpen(true);
  };

  // Open modal for editing product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name,
      category_id: prod.category_id || '',
      description: prod.description || '',
      price: prod.price.toString(),
      image_url: prod.image_url || '',
      active: prod.active
    });
    setImageInputMode('url');
    setIsProductModalOpen(true);
  };

  // File Upload Handler (Convert file to Base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميغابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdForm((prev) => ({ ...prev, image_url: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(prodForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('يرجى إدخال سعر صحيح بالدينار الجزائري');
      return;
    }

    const defaultImg = PRESET_IMAGES[0].url;
    const finalImage = prodForm.image_url.trim() || defaultImg;

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: prodForm.name.trim(),
        category_id: prodForm.category_id,
        description: prodForm.description.trim(),
        price: priceNum,
        image_url: finalImage,
        active: prodForm.active
      });
    } else {
      await addProduct({
        name: prodForm.name.trim(),
        category_id: prodForm.category_id,
        description: prodForm.description.trim(),
        price: priceNum,
        image_url: finalImage,
        active: prodForm.active
      });
    }

    setIsProductModalOpen(false);
  };

  // Category handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatForm({ name: '', icon: 'Folder', image_url: PRESET_IMAGES[0].url });
    setCatImageMode('preset');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({ name: cat.name, icon: cat.icon || 'Folder', image_url: cat.image_url || PRESET_IMAGES[0].url });
    setCatImageMode('url');
    setIsCategoryModalOpen(true);
  };

  const handleCategoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميغابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCatForm((prev) => ({ ...prev, image_url: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    const finalImage = catForm.image_url.trim() || PRESET_IMAGES[0].url;

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: catForm.name.trim(),
        icon: catForm.icon,
        image_url: finalImage
      });
    } else {
      await addCategory({
        name: catForm.name.trim(),
        icon: catForm.icon,
        image_url: finalImage
      });
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`هل أنت تأكد من حذف قسم "${name}"؟`)) {
      await deleteCategory(id);
    }
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

  // Filtered Products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCategory = productCategoryFilter === 'all' || p.category_id === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      {/* Admin Navigation Bar */}
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
              onClick={() => setActiveTab('visitors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'visitors'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>زوار الموقع</span>
              {visitorStats?.today_visits ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {visitorStats.today_visits}
                </span>
              ) : null}
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
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>الأقسام ({categories.length})</span>
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

            {/* Visitor Counter Section Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-700/60 relative overflow-hidden space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">قسم عدد زوار الموقع</h3>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>تتبع حي ومباشر</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      متابعة آنية لعدد الزيارات والزوار الفريدين للمتجر
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('visitors')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>تفاصيل وسجل الزيارات</span>
                </button>
              </div>

              {/* Visitor Quick Numbers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>إجمالي الزيارات</span>
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {(visitorStats?.total_visits || 0).toLocaleString('ar-DZ')}
                  </div>
                  <p className="text-[10px] text-emerald-400/80 font-medium">مشاهدات الصفحة الكلية</p>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>زوار اليوم</span>
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-300">
                    {(visitorStats?.today_visits || 0).toLocaleString('ar-DZ')}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">زيارات اليوم الحالي</p>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>الزوار الفريدون</span>
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-blue-300">
                    {(visitorStats?.unique_visits || 0).toLocaleString('ar-DZ')}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">جلسات مختلفة للمستخدمين</p>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>معدل تحويل الطلبات</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-300">
                    {visitorStats?.unique_visits && visitorStats.unique_visits > 0
                      ? `${((deliveredOrders.length / visitorStats.unique_visits) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">من الزوار إلى طلبات ناجحة</p>
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">إدارة وإضافة المنتجات</h3>
                  <p className="text-xs text-slate-500 mt-0.5">أضف منتجات جديدة، حمّل الصور وعدّل الأسعار</p>
                </div>
                <button
                  onClick={() => { setActiveTab('products'); handleOpenAddProduct(); }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج</span>
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">إنشاء قسم جديد للمتجر</h3>
                  <p className="text-xs text-slate-500 mt-0.5">قسم المنتجات حسب الأنواع لتسهيل التصفح للزبائن</p>
                </div>
                <button
                  onClick={() => { setActiveTab('categories'); handleOpenAddCategory(); }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>قسم جديد</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: VISITORS ANALYTICS */}
        {activeTab === 'visitors' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">إحصائيات وعدد زوار الموقع</h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>تحديث حي وتلقائي</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    تابع تحركات وزيارات متجرك مباشرة لتفهم التفاعل والزيارات بالكامل
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-2.5 rounded-2xl text-xs text-slate-300 flex items-center gap-3 self-start md:self-auto">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <div>
                  <div className="font-bold text-white">حالة التتبع: نشط</div>
                  <div className="text-[10px] text-slate-400">آخر زيارة: {visitorStats?.last_visit_at ? new Date(visitorStats.last_visit_at).toLocaleTimeString('ar-DZ') : 'جديد'}</div>
                </div>
              </div>
            </div>

            {/* Detailed Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-xs font-bold">إجمالي زيارات الموقع</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {(visitorStats?.total_visits || 0).toLocaleString('ar-DZ')}
                </div>
                <p className="text-xs text-slate-500">إجمالي فتح الصفحات من كافّة الأجهزة</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-xs font-bold">زوار اليوم</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-600">
                  {(visitorStats?.today_visits || 0).toLocaleString('ar-DZ')}
                </div>
                <p className="text-xs text-slate-500">عدد الزيارات المسجلة اليوم</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-xs font-bold">الزوار الفريدون</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-600">
                  {(visitorStats?.unique_visits || 0).toLocaleString('ar-DZ')}
                </div>
                <p className="text-xs text-slate-500">مستخدمين أو جلسات متصفح مختلفة</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-xs font-bold">معدل تحويل المبيعات</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-purple-700">
                  {visitorStats?.unique_visits && visitorStats.unique_visits > 0
                    ? `${((deliveredOrders.length / visitorStats.unique_visits) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
                <p className="text-xs text-slate-500">نسبة الشراء من إجمالي الزوار</p>
              </div>
            </div>

            {/* Daily Traffic Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-emerald-600" />
                    <span>السجل اليومي لحركة الزوار (آخر 14 يومًا)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">تفاصيل عدد الزوار يوميًا وملاحظة نمو الحركة</p>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  {visitorStats?.daily_history?.length || 0} أيام مسجلة
                </span>
              </div>

              {visitorStats?.daily_history && visitorStats.daily_history.length > 0 ? (
                <div className="space-y-3">
                  {visitorStats.daily_history.slice().reverse().map((day, idx) => {
                    const maxVisits = Math.max(...(visitorStats.daily_history?.map(d => d.visits) || [1]));
                    const percentage = Math.min(100, Math.round((day.visits / (maxVisits || 1)) * 100));

                    return (
                      <div key={idx} className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-700 font-mono">{day.date}</span>
                          <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                            {day.visits} زيارة
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, percentage)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Activity className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-bold">لا يوجد سجل تاريخي حتى الآن</p>
                  <p className="text-xs text-slate-400">سيظهر السجل تلقائيًا عند تصفح زوار جدد للموقع</p>
                </div>
              )}
            </div>

            {/* Smart E-commerce Recommendations */}
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-emerald-900 text-sm">نصائح لزيادة تحويل الزوار إلى طلبات مؤكدة</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  تأكد من إضافة صور واضحة وجذابة للمنتجات، وكتابة وصف مفصّل بالدينار الجزائري، مع الإشارة إلى سرعة التوصيل والدفع عند الاستلام لزيادة ثقة الزائر.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-slate-800">إدارة وتعديل المنتجات ({products.length})</h2>
                <p className="text-xs text-slate-500">يمكنك إضافة صور جديدة، تعديل الأسعار أو تخصيص القسم لكل منتج</p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="ابحث عن اسم منتج..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-600 shrink-0">القسم:</span>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
                >
                  <option value="all">جميع الأقسام ({products.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-base">لا توجد منتجات مطابقة للفلتر</h3>
                <p className="text-xs text-slate-400">انقر على إضافة منتج جديد للبدء.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((prod) => {
                  const cat = categories.find(c => c.id === prod.category_id);
                  return (
                    <div
                      key={prod.id}
                      className={`bg-white rounded-2xl border ${prod.active ? 'border-slate-200' : 'border-slate-300 opacity-75 bg-slate-50'} p-4 shadow-xs flex flex-col justify-between gap-3`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-20 h-20 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{prod.name}</h3>
                            {!prod.active && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                                مخفي
                              </span>
                            )}
                          </div>
                          {cat && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              <Tag className="w-3 h-3 text-emerald-600" />
                              <span>{cat.name}</span>
                            </div>
                          )}
                          <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>
                          <div className="text-emerald-700 font-extrabold text-sm">
                            {prod.price.toLocaleString('ar-DZ')} د.ج
                          </div>
                        </div>
                      </div>

                      {/* Product Action Buttons */}
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
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-bold text-xs"
                            title="تعديل بيانات أو صورة المنتج"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATEGORIES / SECTIONS MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-slate-800">إدارة أقسام وتصنيفات المتجر</h2>
                <p className="text-xs text-slate-500">أنشئ أقساماً جديدة لتنظيم منتجاتك وسهولة العرض للزبائن</p>
              </div>
              <button
                onClick={handleOpenAddCategory}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء قسم جديد</span>
              </button>
            </div>

            {/* Categories List */}
            {categories.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
                <Grid className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-base">لا توجد أقسام مسجلة حالياً</h3>
                <p className="text-xs text-slate-400">انقر على "إنشاء قسم جديد" لإضافة أقسام المتجر.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const categoryProducts = products.filter(p => p.category_id === cat.id);
                  return (
                    <div
                      key={cat.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                              <Tag className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 text-sm truncate">{cat.name}</h3>
                            <span className="text-[11px] text-slate-500 font-medium">
                              يحتوي على {categoryProducts.length} منتج
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تعديل اسم القسم"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف القسم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Preview mini items */}
                      <div className="text-xs text-slate-500">
                        {categoryProducts.length > 0 ? (
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {categoryProducts.slice(0, 4).map(p => (
                              <img
                                key={p.id}
                                src={p.image_url}
                                alt={p.name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                                title={p.name}
                              />
                            ))}
                            {categoryProducts.length > 4 && (
                              <span className="text-[10px] font-bold text-slate-400">+{categoryProducts.length - 4}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-slate-400">لا توجد منتجات في هذا القسم بعد</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CURRENT ORDERS */}
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

        {/* TAB 5: ORDER HISTORY */}
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
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={historyFilterStatus}
                    onChange={(e) => setHistoryFilterStatus(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100 my-8">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>{editingProduct ? 'تعديل بيانات المنتج والصورة' : 'إضافة منتج جديد'}</span>
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 hover:bg-emerald-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="مثال: تمر دقلة نور الفاخر من بسكرة..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Product Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القسم / الفئة</label>
                  <select
                    value={prodForm.category_id}
                    onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- بدون قسم محدد --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر (د.ج DZD)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    placeholder="1500"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف المنتج والمميزات</label>
                <textarea
                  rows={2}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  placeholder="اكتب وصفاً جذاباً للمنتج ومميزاته..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Product Image Selection Section */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="block text-xs font-bold text-slate-800">
                  صورة المنتج
                </label>

                {/* Mode Selector Tabs */}
                <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                      imageInputMode === 'upload' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>تحميل من الجهاز</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                      imageInputMode === 'url' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>رابط URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageInputMode('preset')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                      imageInputMode === 'preset' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>مكتبة الصور</span>
                  </button>
                </div>

                {/* Mode 1: File Upload */}
                {imageInputMode === 'upload' && (
                  <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      id="productImageFileInput"
                      className="hidden"
                    />
                    <label htmlFor="productImageFileInput" className="cursor-pointer block space-y-1.5">
                      <Upload className="w-7 h-7 text-emerald-600 mx-auto" />
                      <span className="block text-xs font-bold text-slate-700">اضغط هنا لاختيار صورة من حاسوبك أو هاتفك</span>
                      <span className="block text-[10px] text-slate-400">تُقبل صور PNG, JPG, WEBP بحد أقصى 2MB</span>
                    </label>
                  </div>
                )}

                {/* Mode 2: Direct URL */}
                {imageInputMode === 'url' && (
                  <input
                    type="url"
                    value={prodForm.image_url}
                    onChange={(e) => setProdForm({ ...prodForm, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                    dir="ltr"
                  />
                )}

                {/* Mode 3: Stock Presets Gallery */}
                {imageInputMode === 'preset' && (
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                    {PRESET_IMAGES.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setProdForm({ ...prodForm, image_url: img.url })}
                        className={`p-1 rounded-lg border text-center transition-all ${
                          prodForm.image_url === img.url 
                            ? 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-12 object-cover rounded-md" />
                        <span className="text-[10px] font-bold text-slate-700 line-clamp-1 mt-0.5">{img.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Preview */}
                {prodForm.image_url && (
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <img
                      src={prodForm.image_url}
                      alt="معاينة"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
                    />
                    <div className="text-xs space-y-0.5 min-w-0 flex-1">
                      <span className="font-bold text-slate-800 block">معاينة الصورة المختارة</span>
                      <span className="text-[10px] text-slate-400 block truncate">ستظهر للزبائن بهذا الشكل</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="prodActiveCheck"
                  checked={prodForm.active}
                  onChange={(e) => setProdForm({ ...prodForm, active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="prodActiveCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  عرض المنتج فوراً وحالاً في المتجر للزبائن
                </label>
              </div>

              {/* Form Footer Buttons */}
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
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-400" />
                <span>{editingCategory ? 'تعديل القسم وصورته' : 'إنشاء قسم جديد'}</span>
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 hover:bg-slate-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم القسم / التصنيف</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="مثال: تمور وتمور جافة..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              {/* Category Image Options */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">صورة الغلاف للقسم</label>
                <div className="flex rounded-xl bg-slate-100 p-1 mb-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCatImageMode('preset')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${catImageMode === 'preset' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'}`}
                  >
                    صور جاهزة
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatImageMode('upload')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${catImageMode === 'upload' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'}`}
                  >
                    رفع صورة
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatImageMode('url')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${catImageMode === 'url' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'}`}
                  >
                    رابط مباشر
                  </button>
                </div>

                {catImageMode === 'preset' && (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCatForm({ ...catForm, image_url: preset.url })}
                        className={`group relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                          catForm.image_url === preset.url ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {catImageMode === 'upload' && (
                  <div className="p-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryFileUpload}
                      className="hidden"
                      id="catImageFileInput"
                    />
                    <label htmlFor="catImageFileInput" className="cursor-pointer space-y-1 block">
                      <Upload className="w-6 h-6 text-emerald-600 mx-auto" />
                      <span className="text-xs font-bold text-slate-700 block">اختر صورة من جهازك</span>
                    </label>
                  </div>
                )}

                {catImageMode === 'url' && (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={catForm.image_url}
                    onChange={(e) => setCatForm({ ...catForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                )}

                {/* Preview Thumbnail */}
                {catForm.image_url && (
                  <div className="mt-3 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img src={catForm.image_url} alt="معاينة" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                    <span className="text-xs font-bold text-slate-700">معاينة غلاف القسم</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  حفظ القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
