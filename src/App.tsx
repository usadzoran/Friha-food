import React, { useState, useEffect } from 'react';
import { Product, Order, CartItem, CustomerInfo } from './types';
import { 
  seedProductsIfEmpty, 
  subscribeToProducts, 
  subscribeToOrders, 
  createOrder 
} from './services/storeService';

import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartModal } from './components/CartModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

import { 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Search, 
  ShoppingBag, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

export default function App() {

  // Real-time Firestore state
  const [products, setProducts] = useState<Product[]>([]);
  const [allProductsAdmin, setAllProductsAdmin] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cart & Modals state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [completedOrderNum, setCompletedOrderNum] = useState<string | null>(null);

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'store' | 'admin'>('store');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  // 1. Initialize DB and Real-time listeners
  useEffect(() => {
    // Seed initial products if db is empty
    seedProductsIfEmpty();

    // Subscribe to active products for customers
    const unsubscribeProducts = subscribeToProducts((prodList) => {
      setProducts(prodList);
      setIsLoading(false);
    }, false);

    // Subscribe to ALL products (including inactive) for admin
    const unsubscribeAllProducts = subscribeToProducts((prodList) => {
      setAllProductsAdmin(prodList);
    }, true);

    // Subscribe to orders for admin
    const unsubscribeOrders = subscribeToOrders((orderList) => {
      setOrders(orderList);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeAllProducts();
      unsubscribeOrders();
    };
  }, []);

  // Cart helper functions
  const handleAddToCart = (product: Product, quantity = 1) => {
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

  // Submit Order to Firestore
  const handleSubmitOrder = async (customer: CustomerInfo) => {
    if (cartItems.length === 0) return;
    setIsSubmittingOrder(true);
    try {
      const { displayOrderNum } = await createOrder(customer, cartItems);
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

  // Filtered product catalog for customers
  const filteredProducts = products.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  const cartTotalCount = cartItems.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900" dir="rtl">
      
      {/* Navigation Header */}
      <Header
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setActiveView(activeView === 'admin' ? 'store' : 'admin');
          } else {
            setIsAdminModalOpen(true);
          }
        }}
        isAdmin={isAdminLoggedIn && activeView === 'admin'}
        onLogoutAdmin={() => {
          setIsAdminLoggedIn(false);
          setActiveView('store');
        }}
      />

      {/* Main Content View Switcher */}
      {isAdminLoggedIn && activeView === 'admin' ? (
        <AdminDashboard
          products={allProductsAdmin}
          orders={orders}
        />
      ) : (
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-8 pb-20">
          
          {/* Store Hero Banner */}
          <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg overflow-hidden border border-emerald-600/30">
            <div className="relative z-10 max-w-xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>التوصيل متوفر لجميع الولايات الجزائرية</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                اشري واطلب مباشرة من دارك بسلاسة وسرعة!
              </h2>

              <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
                اقتنِ أفضل المنتجات بأفضل الأسعار بالدينار الجزائري. اختر منتجاتك، أدخل معلوماتك، وسيتصل بك فريقنا فوراً لتأكيد التوصيل حتى باب منزلك.
              </p>

              {/* Feature Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs font-bold text-emerald-100">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>توصيل سريع</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>الدفع عند الاستلام</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>منتجات مضمونة</span>
                </div>
              </div>
            </div>

            {/* Subtle background element */}
            <div className="absolute left-[-5%] bottom-[-20%] w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Search bar & Products Header */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span>المنتجات المتوفرة للطلب</span>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {filteredProducts.length} منتج
                  </span>
                </h3>
                <p className="text-xs text-slate-500">اختر المنتج الذي ترغب فيه واضغط على أضف إلى الطلب</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
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

            {/* Product Catalog Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                    <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-base">لا توجد منتجات مطابقة لمفتاح البحث</h4>
                <p className="text-xs text-slate-500">جرب كتابة كلمة أخرى أو تصفح القائمة الكاملة.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors"
                >
                  إعادة عرض جميع المنتجات
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {filteredProducts.map((prod) => (
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
          <div className="pt-2">
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setActiveView(activeView === 'admin' ? 'store' : 'admin');
                } else {
                  setIsAdminModalOpen(true);
                }
              }}
              className="text-[11px] text-slate-500 hover:text-emerald-400 underline transition-colors"
            >
              {isAdminLoggedIn ? 'الانتقال إلى لوحة التحكم' : 'دخول مدير المتجر (الادمن)'}
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
      />

      <OrderSuccessModal
        orderNumber={completedOrderNum}
        onClose={() => setCompletedOrderNum(null)}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setActiveView('admin');
        }}
      />

    </div>
  );
}
