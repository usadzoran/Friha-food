import React, { useState, useMemo } from 'react';
import { DepartmentManager, Category, Product, Order, OrderStatus } from '../../types';
import { 
  saveProduct, 
  deleteProduct, 
  updateOrderStatus, 
  saveCategoryWhatsappNumber,
  addCategory,
  updateCategory,
  saveDepartmentManager
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
  Send,
  Image as ImageIcon,
  Settings as SettingsIcon,
  ShieldCheck,
  ArrowRight
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
  onUpdateManager?: (manager: DepartmentManager) => void;
}

const PRESET_COVERS = [
  { name: 'تمور وفواكه وأطعمة', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80' },
  { name: 'ألبسة وأزياء وأحذية', url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80' },
  { name: 'عطور ومستحضرات تجميل', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80' },
  { name: 'إلكترونيات وهواتف', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80' },
  { name: 'أواني وأجهزة منزلية', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
  { name: 'منتجات طبيعية وعسل', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
];

export const DepartmentManagerPortal: React.FC<DepartmentManagerPortalProps> = ({
  manager,
  category: propCategory,
  categories = [],
  products = [],
  orders = [],
  onLogout,
  onGoToStore,
  onGoHome,
  onUpdateManager
}) => {
  // 1. Strict Multi-Tenant Department Category Resolution
  // Find the exact category owned by this manager, or linked by ID
  const matchedCategory: Category | null = useMemo(() => {
    if (propCategory) return propCategory;
    if (!manager) return null;

    // A. Match by manager.category_id (if not empty and not 'general')
    if (manager.category_id && manager.category_id !== 'general' && manager.category_id.trim() !== '') {
      const foundById = categories.find(c => c.id === manager.category_id);
      if (foundById) return foundById;
    }

    // B. Match by owner_id === manager.id
    if (manager.id) {
      const foundByOwner = categories.find(c => (c as any).owner_id === manager.id);
      if (foundByOwner) return foundByOwner;
    }

    // C. Match by explicit category name if valid and not empty
    if (manager.category_name && manager.category_name.trim() && manager.category_name !== 'القسم التجاري') {
      const cleanMgrCatName = manager.category_name.trim().toLowerCase();
      const foundByName = categories.find(c => c.name && c.name.trim().toLowerCase() === cleanMgrCatName);
      if (foundByName) return foundByName;
    }

    return null;
  }, [propCategory, manager, categories]);

  const hasDepartment = !!matchedCategory;

  // Active Category descriptor (for display and fallback)
  const category: Category = matchedCategory || {
    id: manager?.category_id || '',
    name: manager?.category_name || 'قسم جديد (قيد الإنشاء)',
    icon: 'Store',
    image_url: '',
    whatsapp_number: manager?.phone || ''
  };

  const handleGoToStore = onGoHome || onGoToStore || (() => {});
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  
  // Department Edit / Setup State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSavingDept, setIsSavingDept] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: matchedCategory?.name || (manager?.category_name !== 'القسم التجاري' ? manager?.category_name : '') || '',
    description: matchedCategory?.description || '',
    image_url: matchedCategory?.image_url || '',
    whatsapp_number: matchedCategory?.whatsapp_number || manager?.phone || '',
    address: matchedCategory?.address || '',
    location: matchedCategory?.location || '',
    working_hours: matchedCategory?.working_hours || 'يومياً من 08:00 إلى 20:00',
    icon: matchedCategory?.icon || 'Store'
  });
  const [deptImagePreview, setDeptImagePreview] = useState<string>(matchedCategory?.image_url || '');

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
  const [deptWhatsApp, setDeptWhatsApp] = useState(matchedCategory?.whatsapp_number || manager?.phone || '');
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // 2. Strict Scoped Products Filter (Isolated to this department only)
  const deptProducts = useMemo(() => {
    if (!matchedCategory || !matchedCategory.id) {
      return [];
    }
    return products.filter(p => p.category_id === matchedCategory.id);
  }, [products, matchedCategory]);

  // 3. Strict Scoped Orders Filter (Only orders containing products of this department)
  const deptOrders = useMemo(() => {
    if (!matchedCategory || !matchedCategory.id) {
      return [];
    }
    return orders.filter(ord => {
      if (!ord.items || ord.items.length === 0) return false;
      return ord.items.some(item => {
        const prod = products.find(p => p.id === item.product_id);
        return prod && prod.category_id === matchedCategory.id;
      });
    });
  }, [orders, products, matchedCategory]);

  // 4. Department Stats
  const stats = useMemo(() => {
    if (!matchedCategory || !matchedCategory.id) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        pendingCount: 0,
        acceptedCount: 0,
        deliveredCount: 0,
        activeProductsCount: 0
      };
    }

    let totalRevenue = 0;
    let pendingCount = 0;
    let acceptedCount = 0;
    let deliveredCount = 0;

    deptOrders.forEach(ord => {
      // Calculate revenue strictly for items belonging to this manager's department
      const deptItemsTotal = ord.items?.reduce((sum, item) => {
        const prod = products.find(p => p.id === item.product_id);
        if (prod && prod.category_id === matchedCategory.id) {
          return sum + (item.subtotal || (item.price * item.quantity));
        }
        return sum;
      }, 0) || 0;

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
  }, [deptOrders, deptProducts, products, matchedCategory]);

  // Handle Department Setup & Editing
  const handleOpenDeptModal = () => {
    setDeptForm({
      name: matchedCategory?.name || (manager?.category_name !== 'القسم التجاري' ? manager?.category_name : '') || '',
      description: matchedCategory?.description || '',
      image_url: matchedCategory?.image_url || '',
      whatsapp_number: matchedCategory?.whatsapp_number || manager?.phone || '',
      address: matchedCategory?.address || '',
      location: matchedCategory?.location || '',
      working_hours: matchedCategory?.working_hours || 'يومياً من 08:00 إلى 20:00',
      icon: matchedCategory?.icon || 'Store'
    });
    setDeptImagePreview(matchedCategory?.image_url || '');
    setIsDeptModalOpen(true);
  };

  const handleDeptImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDeptImagePreview(result);
      setDeptForm(prev => ({ ...prev, image_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDepartmentForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      alert('يرجى كتابة اسم القسم التجاري.');
      return;
    }

    setIsSavingDept(true);
    try {
      const cleanName = deptForm.name.trim();
      const cleanPhone = deptForm.whatsapp_number.trim() || manager.phone;
      let targetCategoryId = matchedCategory ? matchedCategory.id : '';

      if (matchedCategory && matchedCategory.id && matchedCategory.id !== 'general') {
        // Update existing category in Supabase
        await updateCategory(matchedCategory.id, {
          name: cleanName,
          description: deptForm.description.trim(),
          image_url: deptForm.image_url,
          whatsapp_number: cleanPhone,
          address: deptForm.address.trim(),
          location: deptForm.location.trim(),
          working_hours: deptForm.working_hours.trim(),
          icon: deptForm.icon || 'Store',
          owner_id: manager.id
        });
        targetCategoryId = matchedCategory.id;
      } else {
        // Create brand new isolated category in Supabase linked to manager.id
        const newCat = await addCategory({
          name: cleanName,
          description: deptForm.description.trim(),
          image_url: deptForm.image_url || PRESET_COVERS[0].url,
          whatsapp_number: cleanPhone,
          address: deptForm.address.trim(),
          location: deptForm.location.trim(),
          working_hours: deptForm.working_hours.trim(),
          icon: deptForm.icon || 'Store',
          owner_id: manager.id
        });
        if (newCat) {
          targetCategoryId = newCat;
        }
      }

      // Update manager details with the newly assigned/confirmed category ID and Name
      const updatedManager = await saveDepartmentManager({
        ...manager,
        category_id: targetCategoryId,
        category_name: cleanName,
        phone: cleanPhone || manager.phone
      });

      // Update local state and notify App.tsx
      setDeptWhatsApp(cleanPhone);
      if (onUpdateManager) {
        onUpdateManager(updatedManager);
      }

      setIsDeptModalOpen(false);
      setSaveNotice('تم حفظ وتجهيز بيانات القسم التجاري بنجاح! يظهر قسمك الآن لجميع زوار المتجر.');
      setTimeout(() => setSaveNotice(null), 4000);
    } catch (err: any) {
      console.error('Error saving department:', err);
      alert('حدث خطأ أثناء حفظ بيانات القسم: ' + (err?.message || 'تأكد من الاتصال'));
    } finally {
      setIsSavingDept(false);
    }
  };

  // Handle Product Save
  const handleOpenAddProduct = () => {
    if (!hasDepartment) {
      handleOpenDeptModal();
      return;
    }
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
    if (!matchedCategory) {
      alert('يرجى إنشاء وتجهيز قسمك التجاري أولاً قبل إضافة المنتجات.');
      return;
    }

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
        category_id: matchedCategory.id,
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
    if (!matchedCategory) {
      alert('يرجى إنشاء القسم أولاً.');
      return;
    }
    setIsSavingWhatsApp(true);
    try {
      await saveCategoryWhatsappNumber(matchedCategory.id, deptWhatsApp.trim());
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
    <div className="bg-slate-100 min-h-screen pb-20 w-full overflow-x-clip font-sans text-slate-800">
      
      {/* Top Header Navigation */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800 w-full">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Department Brand & Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-inner shrink-0">
              <Folder className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-white leading-tight truncate max-w-[200px] sm:max-w-xs">
                  {hasDepartment ? `قسم: ${matchedCategory.name}` : 'لوحة مسؤول القسم'}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                  {hasDepartment ? 'صاحب القسم' : 'حساب جديد'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-center gap-1 sm:gap-1.5 truncate mt-0.5">
                <User className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{manager.manager_name}</span>
                <span className="text-slate-600 shrink-0">•</span>
                <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="font-mono text-slate-300 truncate">{matchedCategory?.whatsapp_number || manager.phone}</span>
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleOpenDeptModal}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-xs"
              title="إعداد أو تعديل بيانات القسم"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>{hasDepartment ? 'إعداد القسم' : 'إنشاء القسم'}</span>
            </button>

            <button
              onClick={handleGoToStore}
              className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-[11px] sm:text-xs font-bold rounded-xl transition-colors border border-slate-700"
              title="معاينة المتجر"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">المتجر</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-red-950/70 hover:bg-red-900 active:scale-95 text-red-200 text-[11px] sm:text-xs font-bold rounded-xl transition-colors border border-red-800/50"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>

        </div>

        {/* Tab Selection Bar */}
        <div className="bg-slate-950/80 border-t border-slate-800/80 w-full overflow-hidden">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1.5 sm:py-2 no-scrollbar">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>منتجات القسم ({deptProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap relative ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>طلبات القسم ({deptOrders.length})</span>
              {stats.pendingCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {stats.pendingCount} جديد
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>تخصيص القسم وWhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 w-full">

        {/* Global Notification Toast */}
        {saveNotice && (
          <div className="bg-emerald-600 text-white p-3 sm:p-3.5 rounded-2xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-bold animate-in fade-in w-full">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 shrink-0" />
              <span>{saveNotice}</span>
            </div>
            <button onClick={() => setSaveNotice(null)} className="text-white/80 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* NEW MANAGER ONBOARDING HERO CARD */}
        {!hasDepartment && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-right w-full">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>حساب جديد مسجل بنجاح</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black leading-snug">
                👋 مرحباً بك يا {manager.manager_name}! لم تقم بإنشاء قسمك التجاري بعد
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                لكل مسؤول قسم متجر وقسم مستقل تماماً. اضغط على الزر أدناه لتحديد اسم قسمك التجاري (مثال: قسم التمور، العطور، الأزياء...)، واختيار صورة الغلاف ورقم WhatsApp لاستقبال طلبات الزبائن مباشرة على هاتفك.
              </p>
            </div>
            <button
              onClick={handleOpenDeptModal}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 shrink-0 border border-emerald-400/40"
            >
              <Folder className="w-4 h-4 text-emerald-200" />
              <span>🚀 إنشاء وتجهيز قسمي التجاري الآن</span>
            </button>
          </div>
        )}

        {/* Department Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">إجمالي مبيعات القسم</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base sm:text-2xl font-black text-emerald-700 truncate">
                {stats.totalRevenue.toLocaleString('ar-DZ')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 shrink-0">د.ج</span>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">منتجات القسم المعروضة</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base sm:text-2xl font-black text-slate-900 truncate">
                {stats.activeProductsCount}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 shrink-0">/ {deptProducts.length}</span>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 block truncate">طلبات قيد المراجعة</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base sm:text-2xl font-black text-amber-600 truncate">
                {stats.pendingCount}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 shrink-0">طلب</span>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 block truncate">طلبات تم تأكيدها</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base sm:text-2xl font-black text-blue-600 truncate">
                {stats.acceptedCount + stats.deliveredCount}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 shrink-0">طلب</span>
            </div>
          </div>
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4 w-full">
            
            {/* Action & Filter Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد لهذا القسم</span>
              </button>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 w-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  {!hasDepartment ? 'لم يتم إنشاء القسم بعد' : 'لا توجد منتجات في قسمك حالياً'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {!hasDepartment 
                    ? 'قم بإنشاء وتجهيز بيانات قسمك التجاري أولاً للبدء في إضافة المنتجات.'
                    : 'أضف أول منتج في قسمك مع الصورة والسعر ليظهر فوراً لزبائن المتجر.'}
                </p>
                <button
                  onClick={!hasDepartment ? handleOpenDeptModal : handleOpenAddProduct}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{!hasDepartment ? 'إنشاء وتجهيز القسم الآن' : 'إضافة أول منتج الآن'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                      prod.active ? 'border-slate-200 hover:border-emerald-300' : 'border-slate-200 opacity-70 bg-slate-50'
                    }`}
                  >
                    {/* Image & Status Badge */}
                    <div className="relative h-44 sm:h-48 bg-slate-100 w-full overflow-hidden">
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
                          <span>{prod.active ? 'متوفر وظاهر' : 'مخفي'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-3.5 sm:p-4 space-y-2 grow">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1">{prod.name}</h4>
                        <span className="font-black text-emerald-700 text-xs sm:text-sm shrink-0 whitespace-nowrap">
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
                    <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod)}
                        className="py-2 px-3 bg-white hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-red-200 flex items-center justify-center gap-1 transition-colors"
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
          <div className="space-y-4 w-full">
            
            {/* Filter and Search Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
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

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                {(['all', 'pending', 'accepted', 'delivered', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
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
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 w-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">لا توجد طلبيات تطابق هذا التحديد</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  ستظهر أي طلبية يشتري فيها الزبون منتجات تابعة لقسمك هنا تلقائياً في الوقت الفعلي مع تفاصيل الزبون الكاملة.
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 w-full">
                {filteredOrders.map((ord) => {
                  const displayNum = `DZ-${ord.id.slice(-6).toUpperCase()}`;
                  const orderDate = new Date(ord.created_at);

                  // Extract strictly products belonging to this manager's department
                  const deptItems = ord.items?.filter(item => {
                    const prod = products.find(p => p.id === item.product_id);
                    return prod && matchedCategory && prod.category_id === matchedCategory.id;
                  }) || [];

                  const deptItemsSum = deptItems.reduce((acc, it) => acc + (it.subtotal || (it.price * it.quantity)), 0);

                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs w-full"
                    >
                      {/* Top Order Row */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs shrink-0">
                            {displayNum}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{ord.customer_name}</h4>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                              {orderDate.toLocaleDateString('ar-DZ')} في {orderDate.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {/* Order Status Badge & Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                          <div className="text-right sm:text-left">
                            <span className="text-[9px] sm:text-[10px] text-slate-400 block font-bold">مجموع القسم</span>
                            <span className="font-black text-emerald-700 text-sm sm:text-base whitespace-nowrap">
                              {deptItemsSum.toLocaleString('ar-DZ')} د.ج
                            </span>
                          </div>

                          <span className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-black shrink-0 ${
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold">رقم الزبون:</span>
                            <span className="font-mono font-bold text-slate-900 dir-ltr">{ord.customer_phone}</span>
                          </div>
                          <div className="text-slate-600 break-words">
                            <span className="font-bold">العنوان:</span> {ord.customer_address}
                          </div>
                        </div>

                        {ord.notes && (
                          <div className="text-slate-600 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 break-words">
                            <span className="font-bold text-amber-900 block mb-0.5">ملاحظة الزبون:</span>
                            <p className="text-amber-800">{ord.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Items Ordered for this Department */}
                      <div className="space-y-1.5 w-full">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">منتجات هذا القسم المطلوبة:</span>
                        <div className="space-y-1 bg-white border border-slate-200 rounded-xl p-2 sm:p-2.5">
                          {deptItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {item.quantity}x
                                </span>
                                <span className="font-bold text-slate-800 truncate">{item.product_name}</span>
                              </div>
                              <span className="font-black text-slate-900 shrink-0 whitespace-nowrap">
                                {(item.subtotal || (item.price * item.quantity)).toLocaleString('ar-DZ')} د.ج
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons: WhatsApp & Status Updates */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        
                        {/* WhatsApp Chat Button */}
                        <button
                          onClick={() => handleContactCustomerWhatsApp(ord)}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-200" />
                          <span>تواصل مع الزبون على WhatsApp</span>
                        </button>

                        {/* Status Change Buttons */}
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {ord.status !== 'accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'accepted')}
                              className="flex-1 sm:flex-initial px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors text-center"
                            >
                              قبول الطلبية
                            </button>
                          )}

                          {ord.status !== 'delivered' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                              className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors text-center"
                            >
                              تم التوصيل
                            </button>
                          )}

                          {ord.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'cancelled')}
                              className="flex-1 sm:flex-initial px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors text-center"
                            >
                              إلغاء
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

        {/* TAB 3: SETTINGS & DEPARTMENT CUSTOMIZATION */}
        {activeTab === 'settings' && (
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto w-full">
            
            {/* Department Profile & Visual Identity Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xs w-full">
              <div className="border-b border-slate-100 pb-3 sm:pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                    <Folder className="w-4 h-4" />
                    <span>تخصيص وبيانات القسم التجاري</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    معلومات واجهة قسمك على المتجر
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    يمكنك تعديل اسم القسم، وتعيين صورة الغلاف لتظهر بشكل مميز وجذاب للزوار.
                  </p>
                </div>

                <button
                  onClick={handleOpenDeptModal}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>تعديل بيانات القسم</span>
                </button>
              </div>

              {/* Department Preview Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 shadow-inner">
                  <img
                    src={matchedCategory?.image_url || deptForm.image_url || PRESET_COVERS[0].url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5 grow">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h4 className="text-base sm:text-lg font-black text-slate-900">{category.name}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {hasDepartment ? 'مفعّل في المتجر' : 'قيد الإنشاء'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>رقم WhatsApp: <strong className="font-mono text-slate-900">{matchedCategory?.whatsapp_number || manager.phone}</strong></span>
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      onClick={handleOpenDeptModal}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline"
                    >
                      تغيير صورة الغلاف أو الاسم...
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Setting Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xs w-full">
              <div className="border-b border-slate-100 pb-3 sm:pb-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>إعدادات التواصل واستقبال الطلبات</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
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
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-mono bg-slate-50"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    الرقم بعد التهيئة: <span className="font-mono text-emerald-700 font-bold">{normalizeAlgerianWhatsAppNumber(deptWhatsApp)}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingWhatsApp || !hasDepartment}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
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
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تجربة إرسال رسالة للرقم</span>
                  </button>
                </div>
              </form>

              {/* Account Credentials Card */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">معلومات حساب المسؤول:</span>
                <div className="flex items-center justify-between text-slate-600">
                  <span>اسم المستخدم:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{manager.username}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>القسم المسند:</span>
                  <span className="font-bold text-emerald-700">{hasDepartment ? category.name : 'لم يتم الإنشاء بعد'}</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Department Setup & Creation Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div 
            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-xs sm:text-base">
                  {hasDepartment ? 'تعديل وتخصيص بيانات القسم' : 'إنشاء وتجهيز قسم تجاري جديد'}
                </h3>
              </div>
              <button 
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDepartmentForm} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              
              {/* Department Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم القسم التجاري: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قسم التمور والفواكه المجففة أو قسم العطور"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white font-bold"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم WhatsApp لاستقبال طلبات الزبائن: <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="مثال: 0555123456 أو 0661234567"
                  value={deptForm.whatsapp_number}
                  onChange={(e) => setDeptForm({ ...deptForm, whatsapp_number: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  الرقم المهيأ: <span className="font-mono text-emerald-700 font-bold">{normalizeAlgerianWhatsAppNumber(deptForm.whatsapp_number)}</span>
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  وصف ونشاط القسم التجاري:
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: متجر متخصص في بيع أجود أنواع التمور الطبيعية والعسل والمكسرات الطازجة..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
                />
              </div>

              {/* Address & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    العنوان / المقر:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: شارع الاستقلال، فريحة"
                    value={deptForm.address}
                    onChange={(e) => setDeptForm({ ...deptForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الموقع / الولاية والبلدية:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: تيزي وزو - فريحة"
                    value={deptForm.location}
                    onChange={(e) => setDeptForm({ ...deptForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  أوقات وساعات العمل:
                </label>
                <input
                  type="text"
                  placeholder="مثال: يومياً من 08:00 إلى 20:00"
                  value={deptForm.working_hours}
                  onChange={(e) => setDeptForm({ ...deptForm, working_hours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                />
              </div>

              {/* Cover Image Upload / Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  صورة غلاف / واجهة القسم:
                </label>

                <div className="flex flex-col xs:flex-row items-center gap-3">
                  {deptImagePreview ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-inner">
                      <img src={deptImagePreview} alt="Dept Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0 bg-slate-50">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1.5 w-full">
                    <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-slate-200 w-full sm:w-auto">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة من جهازك</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleDeptImageFileChange} 
                        className="hidden" 
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="أو ضع رابط صورة مباشر..."
                      value={deptForm.image_url.startsWith('data:') ? '' : deptForm.image_url}
                      onChange={(e) => {
                        setDeptForm({ ...deptForm, image_url: e.target.value });
                        setDeptImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50"
                    />
                  </div>
                </div>

                {/* Preset Suggestions */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">أو اختر صورة جاهزة عالية الجودة:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {PRESET_COVERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDeptForm({ ...deptForm, image_url: preset.url });
                          setDeptImagePreview(preset.url);
                        }}
                        className={`p-1.5 rounded-xl border text-[10px] font-bold text-right transition-all flex items-center gap-1.5 ${
                          deptImagePreview === preset.url
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black ring-1 ring-emerald-500'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img src={preset.url} alt="" className="w-6 h-6 rounded-lg object-cover shrink-0" />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingDept}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingDept ? 'جاري الحفظ...' : hasDepartment ? 'حفظ تعديلات القسم' : 'إنشاء القسم وتفعيله'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div 
            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-xs sm:text-base">
                  {editingProduct ? 'تعديل منتج في قسمك' : `إضافة منتج لقسم (${category.name})`}
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
            <form onSubmit={handleSaveProductForm} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              
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
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white font-bold"
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

                <div className="flex flex-col xs:flex-row items-center gap-3">
                  {imagePreview ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0 bg-slate-50">
                      <Package className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1 w-full">
                    <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-slate-200 w-full sm:w-auto">
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
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
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
