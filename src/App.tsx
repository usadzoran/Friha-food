import React, { useState, useEffect, useRef } from 'react';
import { Product, Category, Order, CartItem, CustomerInfo, VisitorStats, AdSlot, DepartmentManager, AuthRole } from './types';
import { 
  seedProductsIfEmpty, 
  seedCategoriesIfEmpty,
  restoreDefaultData,
  subscribeToProducts, 
  subscribeToCategories,
  subscribeToOrders, 
  createOrder,
  trackSiteVisit,
  subscribeToVisitorStats,
  subscribeToAds,
  subscribeToDepartmentManagers
} from './services/storeService';

import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartModal } from './components/CartModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { JoinUsModal } from './components/JoinUsModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DepartmentManagerPortal } from './components/department/DepartmentManagerPortal';
import { PendingOrdersPublicSection } from './components/PendingOrdersPublicSection';
import { NewOrderNotificationToast } from './components/NewOrderNotificationToast';
import { DepartmentConflictModal } from './components/DepartmentConflictModal';
import { AdRenderer } from './components/AdRenderer';
import { buildDepartmentWhatsAppMessage, openWhatsAppDirect, resolveDepartmentWhatsAppNumber } from './utils/whatsappOrder';
import { playOrderNotificationSound, showBrowserNotification } from './utils/notificationSound';

import { 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Search, 
  ShoppingBag, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Grid,
  Package,
  Layers,
  UserPlus
} from 'lucide-react';

export default function App() {

  // Real-time Firestore state
  const [products, setProducts] = useState<Product[]>([]);
  const [allProductsAdmin, setAllProductsAdmin] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [departmentManagers, setDepartmentManagers] = useState<DepartmentManager[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Order Notification Alerts State
  const [latestNewOrder, setLatestNewOrder] = useState<Order | null>(null);
  const [unreadOrdersCount, setUnreadOrdersCount] = useState<number>(0);
  const isInitialOrdersLoaded = useRef<boolean>(false);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const authStatusRef = useRef<{ isAdmin: boolean; isManager: boolean }>({
    isAdmin: false,
    isManager: false,
  });

  // Cart & Modals state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isJoinUsOpen, setIsJoinUsOpen] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [completedOrderNum, setCompletedOrderNum] = useState<string | null>(null);
  const [lastCompletedOrderInfo, setLastCompletedOrderInfo] = useState<{ customer: CustomerInfo; items: CartItem[] } | null>(null);
  const [departmentConflict, setDepartmentConflict] = useState<{
    activeCategoryName: string;
    attemptedCategoryName?: string;
    attemptedProductName?: string;
  } | null>(null);

  // Admin & Department Manager Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [departmentManager, setDepartmentManager] = useState<DepartmentManager | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [initialLoginUsername, setInitialLoginUsername] = useState<string>('');
  const [initialLoginRole, setInitialLoginRole] = useState<'admin' | 'department_manager'>('admin');
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'department_portal'>('store');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  // Navigation & Routing helpers
  const navigateToCategory = (catId: string) => {
    if (catId === 'all') {
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
      setSelectedCategory('all');
      setActiveView('store');
    } else {
      const newPath = `/category/${encodeURIComponent(catId)}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
      setSelectedCategory(catId);
      setActiveView('store');
    }
  };

  const navigateToAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
    setActiveView('admin');
  };

  const navigateToDepartmentPortal = () => {
    if (window.location.pathname !== '/portal') {
      window.history.pushState(null, '', '/portal');
    }
    setActiveView('department_portal');
  };

  const navigateToHome = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    setSelectedCategory('all');
    setActiveView('store');
  };

  const syncRouteFromUrl = () => {
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(search);

    const savedAdminAuth =
      sessionStorage.getItem('admin_logged_in') === 'true' ||
      localStorage.getItem('admin_logged_in') === 'true';

    if (savedAdminAuth) {
      setIsAdminLoggedIn(true);
    }

    // Check Department Manager cached session
    const cachedManagerStr = sessionStorage.getItem('dept_manager_session') || localStorage.getItem('dept_manager_session');
    let loadedManager: DepartmentManager | null = null;
    if (cachedManagerStr) {
      try {
        loadedManager = JSON.parse(cachedManagerStr);
        setDepartmentManager(loadedManager);
      } catch {
        loadedManager = null;
      }
    }

    // Check for WhatsApp Invite URL parameters (e.g. ?dept_user=food_123 or ?invite=... or ?login=manager)
    const deptUserParam = urlParams.get('dept_user') || urlParams.get('user') || urlParams.get('manager');
    const isLoginParam = urlParams.get('login') === 'manager' || urlParams.get('invite') !== null;

    if (deptUserParam || isLoginParam) {
      setInitialLoginUsername(deptUserParam || '');
      setInitialLoginRole('department_manager');
      setIsAdminModalOpen(true);
      return;
    }

    if (pathname.startsWith('/portal') || pathname.startsWith('/department')) {
      if (loadedManager || departmentManager) {
        setActiveView('department_portal');
      } else {
        setInitialLoginRole('department_manager');
        setIsAdminModalOpen(true);
        setActiveView('store');
      }
    } else if (pathname.startsWith('/admin') || search.includes('admin') || hash.includes('admin')) {
      setActiveView('admin');
      if (!savedAdminAuth) {
        setInitialLoginRole('admin');
        setIsAdminModalOpen(true);
      }
    } else if (pathname.startsWith('/category/')) {
      const rawCatId = pathname.replace('/category/', '').split('/')[0];
      const catId = decodeURIComponent(rawCatId);
      if (catId) {
        setSelectedCategory(catId);
        setActiveView('store');
      } else {
        setSelectedCategory('all');
        setActiveView('store');
      }
    } else {
      const catQuery = urlParams.get('category');
      if (catQuery) {
        setSelectedCategory(catQuery);
      } else {
        setSelectedCategory('all');
      }
      setActiveView('store');
    }
  };

  // Keep authStatusRef synchronized
  useEffect(() => {
    authStatusRef.current = {
      isAdmin: isAdminLoggedIn,
      isManager: !!departmentManager,
    };
  }, [isAdminLoggedIn, departmentManager]);

  // 1. Initialize DB and Real-time listeners & route state
  useEffect(() => {
    // Seed initial products and categories if db is empty
    seedProductsIfEmpty();
    seedCategoriesIfEmpty();

    // Initial route sync
    syncRouteFromUrl();

    // Listen to back / forward browser navigation
    const handlePopState = () => {
      syncRouteFromUrl();
    };
    window.addEventListener('popstate', handlePopState);

    // Secret Keyboard shortcut: Ctrl + Shift + A or Alt + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        const savedAdminAuth =
          sessionStorage.getItem('admin_logged_in') === 'true' ||
          localStorage.getItem('admin_logged_in') === 'true';

        if (isAdminLoggedIn || savedAdminAuth) {
          setIsAdminLoggedIn(true);
          if (activeView === 'admin') {
            navigateToHome();
          } else {
            navigateToAdmin();
          }
        } else {
          setIsAdminModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Subscribe to active products for customers
    const unsubscribeProducts = subscribeToProducts((prodList) => {
      setProducts(prodList);
      setIsLoading(false);
      if (prodList.length === 0) {
        restoreDefaultData().catch(console.error);
      }
    }, false);

    // Safety timeout to ensure skeleton loader finishes even if network is slow
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Subscribe to ALL products (including inactive) for admin
    const unsubscribeAllProducts = subscribeToProducts((prodList) => {
      setAllProductsAdmin(prodList);
    }, true);

    // Subscribe to categories
    const unsubscribeCategories = subscribeToCategories((catList) => {
      setCategories(catList);
      if (catList.length === 0) {
        restoreDefaultData().catch(console.error);
      }
    });

    // Subscribe to orders for admin & real-time order alerts
    const unsubscribeOrders = subscribeToOrders((orderList) => {
      setOrders(orderList);

      if (!isInitialOrdersLoaded.current) {
        isInitialOrdersLoaded.current = true;
        orderList.forEach((o) => knownOrderIds.current.add(o.id));
      } else {
        // Detect newly arrived orders in real time
        const newlyArrived = orderList.filter((o) => !knownOrderIds.current.has(o.id));
        if (newlyArrived.length > 0) {
          newlyArrived.forEach((o) => knownOrderIds.current.add(o.id));
          const newest = newlyArrived[0];

          // Check if current user is an Admin or Merchant/Department Manager
          const isPrivilegedUser =
            authStatusRef.current.isAdmin ||
            authStatusRef.current.isManager ||
            sessionStorage.getItem('admin_logged_in') === 'true' ||
            localStorage.getItem('admin_logged_in') === 'true' ||
            !!sessionStorage.getItem('dept_manager_session') ||
            !!localStorage.getItem('dept_manager_session');

          // Trigger audio & popup notifications ONLY for Admin and Traders/Managers
          if (isPrivilegedUser) {
            setLatestNewOrder(newest);
            setUnreadOrdersCount((prev) => prev + newlyArrived.length);
            playOrderNotificationSound();
            showBrowserNotification(
              `🔔 طلب جديد #DZ-${newest.id.slice(-6).toUpperCase()}!`,
              `الزبون: ${newest.customer_name} | المجموع: ${(newest.total_price || (newest as any).total_amount || 0).toLocaleString('ar-DZ')} د.ج`
            );
          }
        }
      }
    });

    // Track site visit
    trackSiteVisit();

    // Subscribe to site visitor statistics
    const unsubscribeVisitorStats = subscribeToVisitorStats((stats) => {
      setVisitorStats(stats);
    });

    // Subscribe to real-time HTML ads
    const unsubscribeAds = subscribeToAds((adList) => {
      setAds(adList);
    });

    // Subscribe to department managers for phone number resolution
    const unsubscribeManagers = subscribeToDepartmentManagers((managerList) => {
      setDepartmentManagers(managerList);
    });

    return () => {
      clearTimeout(loadingTimeout);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      unsubscribeProducts();
      unsubscribeAllProducts();
      unsubscribeCategories();
      unsubscribeOrders();
      unsubscribeVisitorStats();
      unsubscribeAds();
      unsubscribeManagers();
    };
  }, []);

  // Admin Auth Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('admin_logged_in', 'true');
    localStorage.setItem('admin_logged_in', 'true');
    navigateToAdmin();
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_logged_in');
    navigateToHome();
  };

  // Department Manager Auth Handlers
  const handleManagerLoginSuccess = (manager: DepartmentManager) => {
    setDepartmentManager(manager);
    sessionStorage.setItem('dept_manager_session', JSON.stringify(manager));
    localStorage.setItem('dept_manager_session', JSON.stringify(manager));
    navigateToDepartmentPortal();
  };

  const handleManagerLogout = () => {
    setDepartmentManager(null);
    sessionStorage.removeItem('dept_manager_session');
    localStorage.removeItem('dept_manager_session');
    navigateToHome();
  };

  const handleCloseAdminModal = () => {
    setIsAdminModalOpen(false);
    if (!isAdminLoggedIn && !departmentManager && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/portal'))) {
      navigateToHome();
    }
  };

  // Cart helper functions
  const handleAddToCart = (product: Product, quantity = 1) => {
    // 1. Single Department Enforcement:
    // If the cart already has items, verify that the new product is from the same department/category
    if (cartItems.length > 0) {
      const firstCatId = cartItems[0]?.product?.category_id || 'general';
      const activeCat = categories.find(c => c.id === firstCatId || c.name === firstCatId) || {
        id: firstCatId,
        name: firstCatId === 'general' ? 'القسم العام' : firstCatId
      };

      const prodCatId = product.category_id || 'general';
      const prodCat = categories.find(c => c.id === prodCatId || c.name === prodCatId) || {
        id: prodCatId,
        name: prodCatId === 'general' ? 'القسم العام' : prodCatId
      };

      const isSameCategory =
        (activeCat.id && prodCat.id && activeCat.id === prodCat.id) ||
        (activeCat.name && prodCat.name && activeCat.name.trim().toLowerCase() === prodCat.name.trim().toLowerCase());

      if (!isSameCategory) {
        // Block addition, show clear conflict message with "العودة إلى طلبيتي", and DO NOT clear current cart
        setDepartmentConflict({
          activeCategoryName: activeCat.name,
          attemptedCategoryName: prodCat.name,
          attemptedProductName: product.name
        });
        return;
      }
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    // Added visual feedback
    setAddedItemIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Submit Order & Direct WhatsApp Launch
  const handleSubmitOrder = async (customer: CustomerInfo) => {
    if (cartItems.length === 0) return;
    setIsSubmittingOrder(true);
    try {
      const itemsSnapshot = [...cartItems];
      const firstProd = itemsSnapshot[0]?.product;
      const deptCat = categories.find(c => c.id === firstProd?.category_id || c.name === firstProd?.category_id) || {
        id: firstProd?.category_id || 'general',
        name: firstProd?.category_id || 'القسم العام',
        whatsapp_number: ''
      };

      const totalPrice = itemsSnapshot.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      // 1. Save order to database
      const { displayOrderNum } = await createOrder(customer, itemsSnapshot);

      // 2. Resolve department WhatsApp target number (from category or department manager)
      const targetPhone = resolveDepartmentWhatsAppNumber(deptCat, departmentManagers);

      // 3. Generate WhatsApp pre-filled message according to exact format
      const messageText = buildDepartmentWhatsAppMessage({
        orderNumber: displayOrderNum,
        categoryName: deptCat.name,
        customer,
        items: itemsSnapshot,
        totalPrice
      });

      // 4. Open WhatsApp directly on customer device (sent immediately to department manager)
      openWhatsAppDirect(targetPhone, messageText);

      // 5. Update state, clear cart, close cart modal, open confirmation
      setLastCompletedOrderInfo({
        customer: { ...customer },
        items: itemsSnapshot
      });
      setCartItems([]);
      setIsCartOpen(false);
      setCompletedOrderNum(displayOrderNum);
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Currently selected category object
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Home tab state for 'all' view mode
  const [homeTab, setHomeTab] = useState<'categories' | 'all_products'>('categories');

  // Filtered product catalog for current category
  const categoryProducts = products.filter((p) => {
    if (selectedCategory === 'all' || selectedCategory === 'all_products') return true;
    if (selectedCategory === 'general') {
      return !p.category_id || p.category_id === '' || !categories.some(c => c.id === p.category_id || c.name === p.category_id);
    }
    const catObj = categories.find(c => c.id === selectedCategory);
    if (!catObj) return p.category_id === selectedCategory;
    return p.category_id === catObj.id || p.category_id === catObj.name;
  });

  // Filtered products if searching globally
  const searchedProducts = products.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return false;
    return (
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  // Filtered categories if searching in main view
  const filteredCategories = categories.filter((cat) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return cat.name.toLowerCase().includes(term);
  });

  // Fallback cover image for category
  const getCategoryCover = (cat: Category): string => {
    if (cat.image_url) return cat.image_url;
    const matchProd = products.find((p) => p.category_id === cat.id);
    if (matchProd?.image_url) return matchProd.image_url;
    return 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80';
  };

  const cartTotalCount = cartItems.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900" dir="rtl">
      
      {/* Background script injection ad slot */}
      <AdRenderer placement="custom_head_script" ads={ads} />

      {/* Floating Popup Ad Slot */}
      <AdRenderer placement="popup_ad" ads={ads} />

      {/* Navigation Header */}
      <Header
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onGoHome={navigateToHome}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            if (activeView === 'admin') {
              navigateToHome();
            } else {
              navigateToAdmin();
            }
          } else {
            setInitialLoginRole('admin');
            setIsAdminModalOpen(true);
          }
        }}
        isAdmin={isAdminLoggedIn && activeView === 'admin'}
        onLogoutAdmin={handleAdminLogout}
        unreadCount={unreadOrdersCount}
        recentOrders={orders}
        onClearUnread={() => setUnreadOrdersCount(0)}
        onOpenJoinUs={() => setIsJoinUsOpen(true)}
        activeRole={isAdminLoggedIn ? 'admin' : departmentManager ? 'department_manager' : null}
        activeManager={departmentManager}
        onOpenPortal={() => {
          if (activeView === 'department_portal') {
            navigateToHome();
          } else {
            navigateToDepartmentPortal();
          }
        }}
        onLogoutManager={handleManagerLogout}
      />

      {/* Top Banner Ad Slot */}
      <AdRenderer placement="header_top" ads={ads} className="max-w-6xl mx-auto px-4 pt-3" />

      {/* Main Content View Switcher */}
      {departmentManager && activeView === 'department_portal' ? (
        <DepartmentManagerPortal
          manager={departmentManager}
          categories={categories}
          products={allProductsAdmin}
          orders={orders}
          onLogout={handleManagerLogout}
          onGoHome={navigateToHome}
          onGoToStore={navigateToHome}
          onUpdateManager={(updatedMgr) => {
            setDepartmentManager(updatedMgr);
            sessionStorage.setItem('dept_manager_session', JSON.stringify(updatedMgr));
            localStorage.setItem('dept_manager_session', JSON.stringify(updatedMgr));
          }}
        />
      ) : isAdminLoggedIn && activeView === 'admin' ? (
        <AdminDashboard
          products={allProductsAdmin}
          categories={categories}
          orders={orders}
          visitorStats={visitorStats}
          onLoginAsManager={(mgr) => {
            setDepartmentManager(mgr);
            setActiveView('department_portal');
          }}
        />
      ) : (
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-28 sm:pb-20">
          
          {/* Store Hero Banner */}
          <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-4 sm:p-6 shadow-md overflow-hidden border border-emerald-600/30">
            <div className="relative z-10 max-w-lg space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 text-amber-300 rounded-full text-[10px] sm:text-[11px] font-bold border border-amber-400/30 backdrop-blur-xs">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>التوصيل متوفر لجميع الولايات الجزائرية</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black leading-snug tracking-tight">
                اشري واطلب مباشرة من دارك بسلاسة وسرعة!
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                اقتنِ أفضل المنتجات بأفضل الأسعار بالدينار الجزائري. اختر منتجاتك وسيتصل بك فريقنا لتأكيد التوصيل.
              </p>

              {/* Feature Badges */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-white/10 text-[10px] sm:text-[11px] font-bold text-emerald-100">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">توصيل سريع</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">عند الاستلام</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">مضمونة 100%</span>
                </div>
              </div>

              {/* Prominent Hero Join Us CTA Button */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsJoinUsOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border border-amber-200 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>✨ انضم إلى الموقع كتاجر وافتح قسمك التجاري</span>
                </button>
              </div>
            </div>

            {/* Subtle background element */}
            <div className="absolute left-[-5%] bottom-[-20%] w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* Home Banner Ad Slot */}
          <AdRenderer placement="home_banner" ads={ads} className="my-2" />

          {/* VIEW MODE 1: SEARCH ACTIVE ACROSS PRODUCTS */}
          {searchQuery.trim().length > 0 ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span>نتائج البحث عن:</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      "{searchQuery}"
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تم العثور على {searchedProducts.length} منتج
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    إلغاء البحث والعودة
                  </button>
                  <div className="relative w-full sm:w-60">
                    <input
                      type="text"
                      placeholder="ابحث عن منتج..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                </div>
              </div>

              {searchedProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-base">لا توجد منتجات مطابقة لـ "{searchQuery}"</h4>
                  <p className="text-xs text-slate-500">تأكد من كتابة اسم المنتج بشكل صحيح أو اختر قسماً من الأقسام.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      navigateToCategory('all');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors"
                  >
                    عرض الأقسام الرئيسية
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  {searchedProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onSelect={(p) => setSelectedProduct(p)}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      isAdded={addedItemIds.has(prod.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : selectedCategory === 'all' ? (
            
            /* VIEW MODE 2: HOME PAGE - CATEGORIES & ALL PRODUCTS TABS */
            <div className="space-y-6 animate-in fade-in">
              {/* Header Bar with Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                
                {/* View Mode Toggle Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setHomeTab('categories')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        homeTab === 'categories'
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Grid className="w-4 h-4 text-emerald-600" />
                      <span>أقسام المتجر</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                        {categories.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setHomeTab('all_products')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        homeTab === 'all_products'
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>جميع المنتجات</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                        {products.length}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsJoinUsOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs border border-amber-300 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
                    title="طلب فتح قسم جديد وعرض منتجاتك"
                  >
                    <UserPlus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>طلب فتح قسم / انضمام</span>
                  </button>
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="ابحث عن منتج أو قسم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* TAB 1: CATEGORIES GRID DISPLAY */}
              {homeTab === 'categories' ? (
                isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-3">
                        <div className="aspect-16/10 bg-slate-200 rounded-2xl"></div>
                        <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                    <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-base">لا توجد أقسام متوفرة حالياً</h4>
                    <p className="text-xs text-slate-500">يمكنك مشاهدة جميع المنتجات في تبويب "جميع المنتجات" أعلاه أو إنشاء قسم جديد من لوحة التحكم.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {filteredCategories.map((cat) => {
                        const prodCount = products.filter((p) => p.category_id === cat.id || p.category_id === cat.name).length;
                        const coverImg = getCategoryCover(cat);

                        return (
                          <div
                            key={cat.id}
                            onClick={() => navigateToCategory(cat.id)}
                            className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1 active:scale-[0.99]"
                          >
                            {/* Cover Image & Gradient Overlay */}
                            <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                              <img
                                src={coverImg}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

                              {/* Product Count Badge */}
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-slate-800 shadow-xs border border-white/40 flex items-center gap-1">
                                <Package className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{prodCount} منتج متوفر</span>
                              </div>

                              {/* Category Title */}
                              <div className="absolute bottom-3 right-3 left-3 text-white">
                                <h3 className="text-lg sm:text-xl font-black drop-shadow-xs line-clamp-1">
                                  {cat.name}
                                </h3>
                              </div>
                            </div>

                            {/* Card Footer Bar */}
                            <div className="p-3.5 bg-white flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors border-t border-slate-100">
                              <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold">
                                <span>تصفح المنتجات</span>
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                              </span>
                              <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                اضغط للعرض
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Uncategorized products card if any exist */}
                      {products.some(p => !p.category_id || !categories.some(c => c.id === p.category_id || c.name === p.category_id)) && (
                        <div
                          onClick={() => navigateToCategory('general')}
                          className="group relative bg-amber-50/60 rounded-3xl border border-amber-200/90 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1 active:scale-[0.99]"
                        >
                          <div className="relative aspect-16/10 w-full overflow-hidden bg-amber-100 flex items-center justify-center">
                            <Package className="w-16 h-16 text-amber-500/60 group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-slate-800 shadow-xs border border-white/40 flex items-center gap-1">
                              <Package className="w-3.5 h-3.5 text-amber-600" />
                              <span>
                                {products.filter(p => !p.category_id || !categories.some(c => c.id === p.category_id || c.name === p.category_id)).length} منتج
                              </span>
                            </div>

                            <div className="absolute bottom-3 right-3 left-3 text-white">
                              <h3 className="text-lg sm:text-xl font-black drop-shadow-xs">
                                منتجات عامة / غير مصنفة
                              </h3>
                            </div>
                          </div>

                          <div className="p-3.5 bg-white flex items-center justify-between text-xs font-bold text-amber-800 group-hover:text-amber-900 transition-colors border-t border-amber-100">
                            <span className="flex items-center gap-1.5 font-extrabold">
                              <span>عرض المنتجات العامة</span>
                              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            </span>
                            <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                              اضغط للعرض
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Interactive Join Us Card for Merchants */}
                      <div
                        onClick={() => setIsJoinUsOpen(true)}
                        className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl border-2 border-dashed border-amber-400/70 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1 active:scale-[0.99] p-5 sm:p-6"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40 shadow-inner">
                            <UserPlus className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 mb-1.5 shadow-2xs">
                              فرصة للتجار وأصحاب المشاريع
                            </span>
                            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                              هل تريد فتح قسم وعرض منتجاتك؟
                            </h3>
                            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                              انضم إلينا الآن، وسننشئ لك قسماً خاصاً مع لوحة تحكم مخصصة لإدارة منتجاتك ومبيعاتك عبر واتساب.
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                            <span>قدّم طلب انضمامك الآن</span>
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                          </span>
                          <span className="text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/40 px-2.5 py-1 rounded-lg">
                            مجاناً وفوري
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section: Latest Products Showcase on Home Page */}
                    {products.length > 0 && (
                      <div className="pt-6 space-y-4 border-t border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-500" />
                              <span>أحدث المنتجات المتوفرة</span>
                              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                                {products.length} منتج
                              </span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">تصفح واطلب أحدث المنتجات المضافة للمتجر</p>
                          </div>
                          <button
                            onClick={() => setHomeTab('all_products')}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <span>عرض كل المنتجات ({products.length})</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                          {products.slice(0, 8).map((prod) => (
                            <ProductCard
                              key={prod.id}
                              product={prod}
                              onSelect={(p) => setSelectedProduct(p)}
                              onAddToCart={(p) => handleAddToCart(p, 1)}
                              isAdded={addedItemIds.has(prod.id)}
                            />
                          ))}
                        </div>

                        {/* Mid-Grid Ad Slot */}
                        <AdRenderer placement="product_grid_middle" ads={ads} className="my-4" />
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* TAB 2: ALL PRODUCTS DIRECT GRID DISPLAY */
                <div className="space-y-4">
                  {products.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                      <h4 className="font-bold text-slate-800 text-base">لا توجد منتجات متوفرة حالياً</h4>
                      <p className="text-xs text-slate-500">قم بإضافة منتجات جديدة من لوحة التحكم لتظهر فوراً هنا.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                        {products.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onSelect={(p) => setSelectedProduct(p)}
                            onAddToCart={(p) => handleAddToCart(p, 1)}
                            isAdded={addedItemIds.has(prod.id)}
                          />
                        ))}
                      </div>
                      {/* Mid-Grid Ad Slot */}
                      <AdRenderer placement="product_grid_middle" ads={ads} className="my-4" />
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (

            /* VIEW MODE 3: SPECIFIC CATEGORY PRODUCTS PAGE (عرض منتجات القسم) */
            <div className="space-y-6 animate-in fade-in">
              {/* Category Breadcrumb Header */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => navigateToCategory('all')}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-all border border-slate-200"
                  >
                    <ArrowRight className="w-4 h-4 text-emerald-700" />
                    <span>العودة لجميع الأقسام</span>
                  </button>

                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="ابحث داخل هذا القسم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                {/* Selected Category Banner Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    {currentCategoryObj?.image_url && (
                      <img
                        src={currentCategoryObj.image_url}
                        alt={currentCategoryObj.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                          قسم {currentCategoryObj?.name || 'مخصص'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          ({categoryProducts.length} منتج)
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                        {currentCategoryObj?.name}
                      </h2>
                    </div>
                  </div>

                  {/* Horizontal Category Switcher Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
                    <button
                      onClick={() => navigateToCategory('all')}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap"
                    >
                      الأقسام
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigateToCategory(c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                          selectedCategory === c.id
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products in selected category */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                      <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : categoryProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-base">لا توجد منتجات في قسم "{currentCategoryObj?.name}" حالياً</h4>
                  <p className="text-xs text-slate-500">يمكنك العودة إلى الأقسام الرئيسية لتصفح بقية الأقسام المتوفرة.</p>
                  <button
                    onClick={() => navigateToCategory('all')}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors"
                  >
                    تصفح باقي الأقسام
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {categoryProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onSelect={(p) => setSelectedProduct(p)}
                        onAddToCart={(p) => handleAddToCart(p, 1)}
                        isAdded={addedItemIds.has(prod.id)}
                      />
                    ))}
                  </div>
                  {/* Category page ad banner */}
                  <AdRenderer placement="product_grid_middle" ads={ads} className="my-4" />
                </>
              )}
            </div>
          )}

          {/* Join Us Banner Section for Merchants & Sellers */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-700/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>فرصة للتجار وأصحاب الأنشطة</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                هل لديك منتجات وتريد فتح قسمك الخاص على موقعنا؟
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                قدّم طلب انضمامك الآن عبر إدخال اسمك ورقم الواتساب ونوع عملك، وستصلك دعوة فورية ببيانات الدخول ولوحة تحكم مخصصة لإدارة منتجاتك ومبيعاتك.
              </p>
            </div>

            <button
              onClick={() => setIsJoinUsOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all hover:scale-105 shrink-0 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>انضم إلى الموقع الآن</span>
            </button>
          </div>

          {/* Public Pending Orders Section */}
          <PendingOrdersPublicSection orders={orders} />

          {/* Bottom / Sidebar Ad Slot before Footer */}
          <AdRenderer placement="sidebar_or_footer" ads={ads} className="my-4" />

          {/* Floating Cart Quick Bar for Mobile */}
          {cartTotalCount > 0 && (
            <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-emerald-700 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between font-bold text-sm active:scale-98 transition-all border border-emerald-500"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-xs font-black">
                    {cartTotalCount}
                  </span>
                  <span>سلة الطلبات</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>إكمال الطلب</span>
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                </div>
              </button>
            </div>
          )}

        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-bold text-slate-300">
            <span>اشري من دارك</span>
            <span>•</span>
            <span>متجر إلكتروني جزائري مباشر</span>
          </div>
          <p className="text-slate-500">
            جميع الحقوق محفوظة © {new Date().getFullYear()} - التوصيل والدفع عند الاستلام.
          </p>
          {isAdminLoggedIn && (
            <div className="pt-2">
              <button
                onClick={() => {
                  if (activeView === 'admin') {
                    navigateToHome();
                  } else {
                    navigateToAdmin();
                  }
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline transition-colors"
              >
                {activeView === 'admin' ? 'العودة للمتجر' : 'الانتقال إلى لوحة التحكم'}
              </button>
            </div>
          )}
        </div>
      </footer>

      {/* MODALS */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        ads={ads}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
        ads={ads}
      />

      <OrderSuccessModal
        orderNumber={completedOrderNum}
        onClose={() => {
          setCompletedOrderNum(null);
          setLastCompletedOrderInfo(null);
        }}
        customer={lastCompletedOrderInfo?.customer}
        orderedItems={lastCompletedOrderInfo?.items}
        categories={categories}
        managers={departmentManagers}
        ads={ads}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={handleCloseAdminModal}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        onManagerLoginSuccess={handleManagerLoginSuccess}
        onOpenJoinUs={() => setIsJoinUsOpen(true)}
        initialUsername={initialLoginUsername}
        initialRole={initialLoginRole}
      />

      <JoinUsModal
        isOpen={isJoinUsOpen}
        onClose={() => setIsJoinUsOpen(false)}
        categories={categories}
      />

      <DepartmentConflictModal
        isOpen={!!departmentConflict}
        onClose={() => setDepartmentConflict(null)}
        activeCategoryName={departmentConflict?.activeCategoryName || ''}
        attemptedCategoryName={departmentConflict?.attemptedCategoryName}
        attemptedProductName={departmentConflict?.attemptedProductName}
        onOpenCurrentCart={() => {
          setDepartmentConflict(null);
          setIsCartOpen(true);
        }}
      />

      {/* Real-time Order Notification Toast - ONLY visible for Admin and Department Managers */}
      {(isAdminLoggedIn || departmentManager) && (
        <NewOrderNotificationToast
          order={latestNewOrder}
          onClose={() => setLatestNewOrder(null)}
          onOpenAdminOrders={() => {
            if (departmentManager) {
              setActiveView('department_portal');
            } else if (isAdminLoggedIn) {
              navigateToAdmin();
            } else {
              setIsAdminModalOpen(true);
            }
          }}
        />
      )}

      {/* Mobile Sticky Bottom Cart Action Bar */}
      {activeView !== 'admin' && activeView !== 'department_portal' && cartTotalCount > 0 && (
        <div className="fixed bottom-3 inset-x-3 sm:hidden z-40 bg-emerald-800/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-600 animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 bg-emerald-700 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-emerald-800 animate-pulse">
                {cartTotalCount}
              </span>
            </div>
            <div>
              <div className="text-[10px] text-emerald-200 font-bold">سلة طلباتك ({cartTotalCount})</div>
              <div className="text-sm font-black text-white">
                {cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString('ar-DZ')} د.ج
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
          >
            <span>إتمام الطلب</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Join Us Quick Button */}
      {activeView !== 'admin' && activeView !== 'department_portal' && (
        <button
          onClick={() => setIsJoinUsOpen(true)}
          className={`fixed left-3 sm:left-6 z-30 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-black text-[11px] sm:text-sm shadow-xl border-2 border-white flex items-center gap-1.5 sm:gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            cartTotalCount > 0 ? 'bottom-20 sm:bottom-5' : 'bottom-4 sm:bottom-5'
          }`}
          title="انضم إلى الموقع وافتح قسمك التجاري"
        >
          <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-700"></span>
          </span>
          <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 stroke-[2.5]" />
          <span>انضم إلى الموقع</span>
        </button>
      )}

    </div>
  );
}
