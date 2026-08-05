import React, { useState, useEffect } from 'react';
import { Store, Product, Category, CartItem, Order, CategorySection } from './types';
import { storageService } from './services/storage';

import { Header } from './components/Header';
import { HeroCategoryButtons } from './components/HeroCategoryButtons';
import { SubcategoryNav } from './components/SubcategoryNav';
import { StoreList } from './components/StoreList';
import { StoreProductsView } from './components/StoreProductsView';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { DifferentStoreModal } from './components/DifferentStoreModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ShoppingBag, Shield, Heart, Store as StoreIcon, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'store-products' | 'admin'>('home');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Category & Filter State
  const [selectedSection, setSelectedSection] = useState<CategorySection | 'all'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Multi-Store Cart Conflict Modal
  const [conflictData, setConflictData] = useState<{ newStore: Store; newProduct: Product } | null>(null);

  // Checkout & Success Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Load Data
  const loadAppData = () => {
    setStores(storageService.getStores());
    setCategories(storageService.getCategories());
    setProducts(storageService.getProducts());
  };

  useEffect(() => {
    loadAppData();
    const unsubscribe = storageService.subscribe(loadAppData);
    return () => unsubscribe();
  }, []);

  // ADD TO CART HANDLER WITH DIFFERENT STORE RESTRICTION
  const handleAddToCart = (product: Product, store: Store) => {
    // Check if cart has items from another store
    if (cartItems.length > 0 && cartItems[0].store.id !== store.id) {
      setConflictData({ newStore: store, newProduct: product });
      return;
    }

    // Add or increment
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.product.id === product.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { product, quantity: 1, store }];
      }
    });

    setIsCartOpen(true);
  };

  const handleClearCartAndAdd = () => {
    if (conflictData) {
      setCartItems([
        {
          product: conflictData.newProduct,
          quantity: 1,
          store: conflictData.newStore,
        },
      ]);
      setConflictData(null);
      setIsCartOpen(true);
    }
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((ci) => (ci.product.id === productId ? { ...ci, quantity } : ci))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderSuccess = (order: Order) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCompletedOrder(order);
  };

  // IF ADMIN VIEW
  if (currentView === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAdminLoggedIn(true)}
          onCancel={() => setCurrentView('home')}
        />
      );
    }

    return <AdminDashboard onExitAdmin={() => setCurrentView('home')} />;
  }

  // MAIN PUBLIC UI
  return (
    <div className="min-h-screen bg-stone-50/60 text-stone-800 flex flex-col font-cairo">
      {/* HEADER */}
      <Header
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setCurrentView('admin')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onGoHome={() => {
          setCurrentView('home');
          setSelectedStore(null);
          setSelectedSection('all');
          setSelectedCategoryId(null);
          setSearchQuery('');
        }}
      />

      {/* MAIN VIEW CONTENT */}
      {currentView === 'store-products' && selectedStore ? (
        <StoreProductsView
          store={selectedStore}
          products={products}
          categories={categories}
          cartItems={cartItems}
          onBack={() => {
            setCurrentView('home');
            setSelectedStore(null);
          }}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <main className="flex-1 pb-16">
          {/* HERO TRADITIONAL HEADER BANNER */}
          <div className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pt-8 pb-4 px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>المنصة الأولى لتوصيل طلبات مدينتك مباشرة عبر الواتساب</span>
              </span>

              <h1 className="text-4xl sm:text-6xl font-black font-traditional text-stone-900 tracking-wide leading-tight">
                اشري من دارك
              </h1>

              <p className="text-stone-600 text-xs sm:text-base max-w-xl mx-auto font-medium">
                اطلب أشهى المأكولات، البيتزا، ومستلزمات بقالتك اليومية من أفضل محلات مدينتك وتصلك حتى باب دارك
              </p>
            </div>
          </div>

          {/* MAIN SECTION BUTTONS (FOOD & DRINKS) */}
          <HeroCategoryButtons
            selectedSection={selectedSection}
            onSelectSection={(sec) => {
              setSelectedSection(sec);
              setSelectedCategoryId(null);
            }}
          />

          {/* SUBCATEGORY CHIPS NAV */}
          <SubcategoryNav
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(catId) => setSelectedCategoryId(catId)}
            activeSection={selectedSection}
          />

          {/* STORES LIST GRID */}
          <StoreList
            stores={stores}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            selectedSection={selectedSection}
            searchQuery={searchQuery}
            onSelectStore={(store) => {
              setSelectedStore(store);
              setCurrentView('store-products');
            }}
          />
        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* BRAND */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold font-traditional text-xl">
                  د
                </div>
                <h3 className="text-2xl font-bold font-traditional text-white tracking-wide">
                  اشري من دارك
                </h3>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                منصة إلكترونية تربط الزبائن بالمطاعم ومحلات التغذية العامة مباشرة، مع خاصية توجيه الطلبات الفوري عبر رقم الواتساب الخاص بالمتجر.
              </p>
            </div>

            {/* SECTIONS LINKS */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm font-cairo mb-3">الأقسام المتاحة</h4>
              <ul className="space-y-2 text-stone-400">
                <li
                  onClick={() => {
                    setCurrentView('home');
                    setSelectedSection('food');
                  }}
                  className="hover:text-amber-400 cursor-pointer transition-colors"
                >
                  🍔 قسم المأكولات والوجبات السريعة
                </li>
                <li
                  onClick={() => {
                    setCurrentView('home');
                    setSelectedSection('drinks');
                  }}
                  className="hover:text-amber-400 cursor-pointer transition-colors"
                >
                  🥤 قسم المشروبات والمرعشات
                </li>
                <li
                  onClick={() => setCurrentView('admin')}
                  className="hover:text-amber-400 cursor-pointer transition-colors flex items-center gap-1.5 pt-1 text-amber-500 font-bold"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>دخول لوحة التسيير والإدارة</span>
                </li>
              </ul>
            </div>

            {/* DELIVERY INFO */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm font-cairo mb-3">خدمة التوصيل</h4>
              <p className="text-stone-400 leading-relaxed">
                يتم إرسال كل طلب تلقائياً إلى رقم الواتساب المباشر للمتجر المحدد. يصلك الرد الفوري من صاحب المحل لتأكيد وقت التوصيل والدفع عند الاستلام.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} - منصة اشري من دارك</p>
            <p className="flex items-center gap-1">
              <span>صنع بحب لخدمة مجتمعنا</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING QUICK CART BUTTON (Mobile) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-between shadow-amber-600/30"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>عرض السلة ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
            </div>
            <span className="font-mono text-base">
              {cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0)} دج
            </span>
          </button>
        </div>
      )}

      {/* SLIDE-OVER CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* DIFFERENT STORE CONFLICT MODAL */}
      <DifferentStoreModal
        isOpen={!!conflictData}
        currentStoreName={cartItems.length > 0 ? cartItems[0].store.name : ''}
        newStore={conflictData?.newStore || ({} as Store)}
        newProduct={conflictData?.newProduct || ({} as Product)}
        onClearCartAndAdd={handleClearCartAndAdd}
        onKeepCurrentCart={() => setConflictData(null)}
      />

      {/* CHECKOUT FORM MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        cartItems={cartItems}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* ORDER SUCCESS MODAL */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onGoHome={() => {
          setCompletedOrder(null);
          setCurrentView('home');
          setSelectedStore(null);
        }}
      />
    </div>
  );
}
