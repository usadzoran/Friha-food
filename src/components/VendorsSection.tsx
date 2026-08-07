import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Restaurant, Store, Product } from '../types/admin';
import {
  Building2,
  Store as StoreIcon,
  Clock,
  MapPin,
  Truck,
  Phone,
  MessageSquare,
  ShoppingBag,
  Utensils,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';

export default function VendorsSection() {
  const { restaurants, stores, products, addOrder, settings, isAdminLoggedIn } = useApp();

  // Active filter
  const [activeVendorTab, setActiveVendorTab] = useState<'restaurants' | 'stores'>('restaurants');

  // Selected vendor menu modal
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Order modal for a product
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

  const activeRestaurants = restaurants.filter(r => r.active !== false);
  const activeStores = stores.filter(s => s.active !== false);

  const handleOpenOrderModal = (prod: Product) => {
    setOrderingProduct(prod);
    setQuantity(1);
    setOrderPlacedSuccess(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingProduct) return;

    const vendorName = selectedRestaurant?.name || selectedStore?.name || 'محل عام';
    const totalPrice = (orderingProduct.discountPrice || orderingProduct.price) * quantity;

    await addOrder({
      customerName,
      customerPhone,
      customerAddress,
      items: [
        {
          productId: orderingProduct.id,
          productName: orderingProduct.name,
          quantity,
          price: orderingProduct.discountPrice || orderingProduct.price
        }
      ],
      totalPrice,
      status: 'new',
      vendorName,
      notes
    });

    setOrderPlacedSuccess(true);
    setTimeout(() => {
      setOrderPlacedSuccess(false);
      setOrderingProduct(null);
      setQuantity(1);
    }, 2500);
  };

  return (
    <section className="w-full space-y-8 py-6 font-cairo dir-rtl text-right">
      
      {/* SECTION TABS HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div className="space-y-1 text-center sm:text-right w-full sm:w-auto">
          <h2 className="text-2xl sm:text-3xl font-black font-kufi text-emerald-950 flex items-center justify-center sm:justify-start gap-2.5">
            <Building2 className="w-7 h-7 text-emerald-600" />
            <span>المطاعم والمتاجر المشاركة</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            بيانات مباشرة وفورية مسجلة في قاعدة البيانات - أطلب مباشرة من المطعم أو المتجر المفضل لديك
          </p>
        </div>

        {/* TOGGLE TABS */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shrink-0">
          <button
            onClick={() => setActiveVendorTab('restaurants')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeVendorTab === 'restaurants'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-600 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>المطاعم ({activeRestaurants.length})</span>
          </button>

          <button
            onClick={() => setActiveVendorTab('stores')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeVendorTab === 'stores'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-600 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <StoreIcon className="w-4 h-4" />
            <span>المتاجر ({activeStores.length})</span>
          </button>
        </div>
      </div>

      {/* RESTAURANTS TAB CONTENT */}
      {activeVendorTab === 'restaurants' && (
        <div>
          {activeRestaurants.length === 0 ? (
            <div className="bg-white p-10 sm:p-14 rounded-3xl border border-stone-200 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-kufi text-stone-800">لا توجد مطاعم مسجلة في قاعدة البيانات حالياً</h3>
                <p className="text-stone-500 text-sm leading-relaxed max-w-md mx-auto">
                  يمكنك إضافة مطاعم جديدة من لوحة التحكم، وسوف تظهر هنا فوراً وبشكل تلقائي لجميع الزوار والمستخدمين.
                </p>
              </div>
              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/admin');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>انتقل إلى لوحة الإدارة لإضافة مطعم</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRestaurants.map((rest) => {
                const restProducts = products.filter(
                  p => p.vendorId === rest.id && p.isAvailable !== false
                );
                return (
                  <div
                    key={rest.id}
                    className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group transform hover:-translate-y-1"
                  >
                    <div>
                      {/* RESTAURANT IMAGE & BADGES */}
                      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                        <img
                          src={rest.image}
                          alt={rest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                        {/* WORKING HOURS BADGE */}
                        <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-md text-stone-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-stone-700/60">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{rest.workingHours}</span>
                        </div>

                        {/* NAME ON IMAGE */}
                        <div className="absolute bottom-3 right-3 left-3 text-white">
                          <h3 className="text-xl font-black font-kufi drop-shadow-md">
                            {rest.name}
                          </h3>
                        </div>
                      </div>

                      {/* CARD DETAILS */}
                      <div className="p-5 space-y-4 text-xs text-stone-600">
                        <p className="text-sm font-medium text-stone-600 line-clamp-2 leading-relaxed">
                          {rest.description}
                        </p>

                        <div className="space-y-2 pt-2 border-t border-stone-100 font-medium">
                          <div className="flex items-center gap-2 text-stone-500">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{rest.address || 'حي الرئيسي، المدينة'}</span>
                          </div>

                          <div className="flex items-center justify-between text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                            <span className="flex items-center gap-1.5 font-bold">
                              <Truck className="w-4 h-4 text-emerald-600" />
                              <span>التوصيل: {rest.deliveryFee} د.ج</span>
                            </span>
                            <span className="text-stone-400">|</span>
                            <span>أدنى طلب: {rest.minOrder} د.ج</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD FOOTER BUTTONS */}
                    <div className="p-5 pt-0 space-y-2">
                      <button
                        onClick={() => setSelectedRestaurant(rest)}
                        className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group-hover:bg-emerald-800"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>عرض قائمة الوجبات ({restProducts.length})</span>
                      </button>

                      <div className="flex items-center gap-2 pt-1">
                        {rest.whatsapp && (
                          <a
                            href={`https://wa.me/${rest.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>واتساب</span>
                          </a>
                        )}

                        {rest.phone && (
                          <a
                            href={`tel:${rest.phone}`}
                            className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-600" />
                            <span>إتصال</span>
                          </a>
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

      {/* STORES TAB CONTENT */}
      {activeVendorTab === 'stores' && (
        <div>
          {activeStores.length === 0 ? (
            <div className="bg-white p-10 sm:p-14 rounded-3xl border border-stone-200 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto border border-cyan-100">
                <StoreIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-kufi text-stone-800">لا توجد متاجر مسجلة حالياً</h3>
                <p className="text-stone-500 text-sm leading-relaxed max-w-md mx-auto">
                  يمكنك إضافة متاجر وسوبرماركت جديدة من لوحة التحكم لإظهارها مباشرة.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeStores.map((st) => {
                const storeProducts = products.filter(
                  p => p.vendorId === st.id && p.isAvailable !== false
                );
                return (
                  <div
                    key={st.id}
                    className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group transform hover:-translate-y-1"
                  >
                    <div>
                      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                        <img
                          src={st.image}
                          alt={st.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                        <div className="absolute bottom-3 right-3 left-3 text-white">
                          <h3 className="text-xl font-black font-kufi drop-shadow-md">
                            {st.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-5 space-y-3 text-xs text-stone-600">
                        <div className="flex items-center gap-2 text-stone-600 font-medium">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{st.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 space-y-2">
                      <button
                        onClick={() => setSelectedStore(st)}
                        className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>تصفح منتجات المتجر ({storeProducts.length})</span>
                      </button>

                      <div className="flex items-center gap-2 pt-1">
                        {st.whatsapp && (
                          <a
                            href={`https://wa.me/${st.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>واتساب</span>
                          </a>
                        )}
                        {st.phone && (
                          <a
                            href={`tel:${st.phone}`}
                            className="flex-1 py-2 px-3 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 flex items-center justify-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-600" />
                            <span>إتصال</span>
                          </a>
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

      {/* RESTAURANT MENU MODAL */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            {/* MODAL HEADER */}
            <div className="relative h-56 w-full bg-stone-900">
              <img
                src={selectedRestaurant.image}
                alt={selectedRestaurant.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

              <button
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-4 left-4 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-5 right-6 left-6 text-white space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 mb-1">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>مطعم معتمد في قاعدة البيانات</span>
                </div>
                <h2 className="text-3xl font-black font-kufi">{selectedRestaurant.name}</h2>
                <p className="text-xs text-stone-300 line-clamp-1">{selectedRestaurant.description}</p>
              </div>
            </div>

            {/* RESTAURANT INFO STRIP */}
            <div className="bg-stone-50 border-b border-stone-200 p-4 px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-stone-700">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>أوقات العمل: {selectedRestaurant.workingHours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>رسوم التوصيل: {selectedRestaurant.deliveryFee} د.ج</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>العنوان: {selectedRestaurant.address}</span>
              </div>
            </div>

            {/* MENU PRODUCTS LIST */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <h3 className="text-xl font-bold font-kufi text-emerald-950 border-r-4 border-emerald-600 pr-3">
                الوجبات وقائمة الطعام المتاحة
              </h3>

              {(() => {
                const vendorProds = products.filter(
                  p => p.vendorId === selectedRestaurant.id && p.isAvailable !== false
                );

                if (vendorProds.length === 0) {
                  return (
                    <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                      <Info className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="text-stone-600 font-bold text-sm">لا توجد وجبات مضافة لهذا المطعم حالياً</p>
                      <p className="text-stone-400 text-xs">يمكن للمدير إضافة أطباق ووجبات مخصصة لهذا المطعم من لوحة الإدارة.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendorProds.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white border border-stone-200 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-4 hover:border-emerald-500 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {prod.images && prod.images[0] && (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-100"
                            />
                          )}
                          <div className="space-y-1 min-w-0">
                            <h4 className="font-bold text-stone-900 truncate text-sm">{prod.name}</h4>
                            <p className="text-xs text-stone-500 line-clamp-1">{prod.description}</p>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-700 text-sm">
                                {prod.discountPrice || prod.price} د.ج
                              </span>
                              {prod.discountPrice && (
                                <span className="text-xs text-stone-400 line-through">
                                  {prod.price} د.ج
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenOrderModal(prod)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                        >
                          اطلب الآن
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="p-4 bg-stone-100 border-t border-stone-200 text-center">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="px-6 py-2.5 bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إغلاق القائمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORE MODAL */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            <div className="relative h-48 w-full bg-stone-900">
              <img
                src={selectedStore.image}
                alt={selectedStore.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

              <button
                onClick={() => setSelectedStore(null)}
                className="absolute top-4 left-4 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-5 right-6 left-6 text-white space-y-1">
                <h2 className="text-3xl font-black font-kufi">{selectedStore.name}</h2>
                <p className="text-xs text-stone-300">{selectedStore.address}</p>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <h3 className="text-xl font-bold font-kufi text-emerald-950 border-r-4 border-emerald-600 pr-3">
                منتجات المتجر المتاحة
              </h3>

              {(() => {
                const storeProds = products.filter(
                  p => p.vendorId === selectedStore.id && p.isAvailable !== false
                );

                if (storeProds.length === 0) {
                  return (
                    <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                      <Info className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="text-stone-600 font-bold text-sm">لا توجد منتجات مضافة لهذا المتجر حالياً</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storeProds.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white border border-stone-200 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-4 hover:border-emerald-500 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {prod.images && prod.images[0] && (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-100"
                            />
                          )}
                          <div className="space-y-1 min-w-0">
                            <h4 className="font-bold text-stone-900 truncate text-sm">{prod.name}</h4>
                            <p className="text-xs text-stone-500 line-clamp-1">{prod.description}</p>
                            <span className="font-bold text-emerald-700 text-sm block">
                              {prod.discountPrice || prod.price} د.ج
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenOrderModal(prod)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          اطلب الآن
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="p-4 bg-stone-100 border-t border-stone-200 text-center">
              <button
                onClick={() => setSelectedStore(null)}
                className="px-6 py-2.5 bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ORDER FORM MODAL */}
      {orderingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200 dir-rtl text-right">
            <div className="p-5 bg-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold font-kufi text-base">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <span>إكمال خيارات الطلب المباشر</span>
              </div>
              <button
                onClick={() => setOrderingProduct(null)}
                className="p-1.5 rounded-full hover:bg-emerald-900 text-stone-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderPlacedSuccess ? (
              <div className="p-8 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black font-kufi text-emerald-950">تم إرسال طلبك بنجاح!</h3>
                <p className="text-stone-600 text-sm">
                  تم تسجيل الطلب في قاعدة البيانات بنجاح وسوف يتواصل معك قسم التوصيل قريباً.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="p-6 space-y-5">
                {/* PRODUCT SUMMARY CARD */}
                <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl flex items-center gap-3">
                  {orderingProduct.images && orderingProduct.images[0] && (
                    <img
                      src={orderingProduct.images[0]}
                      alt={orderingProduct.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="font-bold text-stone-900 text-sm truncate">{orderingProduct.name}</h4>
                    <p className="text-xs text-stone-500 line-clamp-1">{orderingProduct.description}</p>
                    <p className="text-xs font-bold text-emerald-700">
                      السعر الفردي: {orderingProduct.discountPrice || orderingProduct.price} د.ج
                    </p>
                  </div>
                </div>

                {/* QUANTITY PICKER */}
                <div className="flex items-center justify-between bg-stone-100 p-3 rounded-2xl border border-stone-200">
                  <span className="text-xs font-bold text-stone-700">الكمية المطلوبة:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-stone-300 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-200 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-black text-stone-900 text-base w-6 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-stone-300 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-200 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CUSTOMER INPUTS */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: محمد العمري"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">رقم الهاتف *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0550 00 00 00"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">عنوان التوصيل *</label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="الشارع، اسم الحي، ورقم العمارة"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">ملاحظات إضافية (اختياري)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="مثال: بدون بصل، اتصال قبل الوصول..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* TOTAL PRICE & SUBMIT */}
                <div className="pt-3 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between text-base font-black text-stone-900">
                    <span>المبلغ الإجمالي:</span>
                    <span className="text-emerald-700 text-lg">
                      {(orderingProduct.discountPrice || orderingProduct.price) * quantity} د.ج
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>تأكيد وإرسال الطلب لقاعدة البيانات</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
