import React, { useState, useEffect } from 'react';
import heroImage from './assets/images/grocery_food_hero_1786092590426.jpg';
import { Utensils, CupSoda, AlertTriangle } from 'lucide-react';
import Footer from './components/Footer';
import CategoryList from './components/CategoryList';
import VendorsSection from './components/VendorsSection';
import { AppProvider, useApp } from './context/AppContext';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './components/admin/AdminLogin';

function MainSiteContent() {
  const { settings, isAdminLoggedIn } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'food' | 'drinks' | null>(null);
  const [clickCount, setClickCount] = useState(0);

  const checkIsAdminRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash.startsWith('#admin') ||
      hash.startsWith('#/admin') ||
      search.includes('admin')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleTitleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      setClickCount(0);
      window.history.pushState({}, '', '/admin');
      setIsAdminRoute(true);
    }

    setTimeout(() => {
      setClickCount(0);
    }, 1500);
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  if (isAdminRoute) {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          onSuccess={() => {
            setIsAdminRoute(true);
          }}
          onGoHome={navigateToHome}
        />
      );
    }
    return (
      <AdminLayout
        onGoPublicSite={navigateToHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col justify-between dir-rtl antialiased selection:bg-emerald-600 selection:text-white">
      
      {/* STORE CLOSED NOTICE BANNER */}
      {!settings.isStoreOpen && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-center font-bold text-xs flex items-center justify-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>نأسف، استقبال الطلبات مغلق حالياً وسنعود للخدمة قريباً!</span>
        </div>
      )}

      <main className="max-w-6xl w-full mx-auto flex-grow flex flex-col items-center text-center space-y-8 sm:space-y-12 p-4 sm:p-8 lg:p-12">
        {/* MAIN TITLE - DYNAMIC FROM SETTINGS */}
        <div className="space-y-3 pt-4 sm:pt-6 select-none">
          <h1
            onClick={handleTitleSecretClick}
            className="text-5xl sm:text-7xl lg:text-8xl font-black font-kufi text-emerald-950 tracking-wide leading-tight drop-shadow-xs [text-shadow:_0_3px_15px_rgba(6,78,59,0.12)] cursor-pointer"
            title="انقر 3 مرات سريعة للدخول السري للوحة الإدارة"
          >
            {settings.siteName || 'اشري من دارك'}
          </h1>
          <div className="w-24 sm:w-36 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 mx-auto rounded-full shadow-xs opacity-90" />
          {settings.heroSubtext && (
            <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto pt-1 font-medium">
              {settings.heroSubtext}
            </p>
          )}
        </div>

        {/* CONDITIONALLY RENDER MAIN HERO / BUTTONS OR SUBCATEGORY LIST */}
        {!selectedCategory ? (
          <>
            {/* HERO IMAGE CONTAINER */}
            <div className="w-full relative group transition-all duration-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-emerald-400/20 to-teal-600/20 rounded-[2rem] sm:rounded-[2.5rem] blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden bg-white p-2 sm:p-3 shadow-2xl shadow-emerald-950/10 border border-stone-200/80">
                <img
                  src={settings.heroImageUrl || heroImage}
                  alt={settings.siteName}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[70vh] object-cover rounded-xl sm:rounded-[1.5rem] transform transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
            </div>

            {/* CATEGORY BUTTONS SECTION */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-2xl pt-2">
              {/* BUTTON 1: مأكولات */}
              <button
                onClick={() => setSelectedCategory('food')}
                className="group relative w-full sm:w-1/2 p-5 rounded-2xl font-cairo font-bold text-xl flex items-center justify-between gap-4 transition-all duration-300 cursor-pointer bg-white text-emerald-950 border border-stone-200/90 shadow-md hover:shadow-xl hover:border-emerald-500 hover:-translate-y-1 overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform duration-300">
                    <Utensils className="w-6 h-6 drop-shadow-xs" />
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">مأكولات</span>
                    <span className="block text-xs font-medium text-stone-400 group-hover:text-stone-500">طعام طازج، وجبات ومخبوزات</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shrink-0">
                  <span className="text-sm font-black transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
                </div>
              </button>

              {/* BUTTON 2: مشروبات */}
              <button
                onClick={() => setSelectedCategory('drinks')}
                className="group relative w-full sm:w-1/2 p-5 rounded-2xl font-cairo font-bold text-xl flex items-center justify-between gap-4 transition-all duration-300 cursor-pointer bg-white text-emerald-950 border border-stone-200/90 shadow-md hover:shadow-xl hover:border-cyan-500 hover:-translate-y-1 overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-600/30 group-hover:scale-110 transition-transform duration-300">
                    <CupSoda className="w-6 h-6 drop-shadow-xs" />
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-bold text-emerald-950 group-hover:text-cyan-700 transition-colors">مشروبات</span>
                    <span className="block text-xs font-medium text-stone-400 group-hover:text-stone-500">مياه، عصائر ومشروبات طاقة</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-cyan-50 group-hover:bg-cyan-600 text-cyan-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shrink-0">
                  <span className="text-sm font-black transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
                </div>
              </button>
            </div>

            {/* LIVE VENDORS & RESTAURANTS SECTION */}
            <div className="w-full pt-4">
              <VendorsSection />
            </div>
          </>
        ) : (
          <CategoryList
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainSiteContent />
    </AppProvider>
  );
}
