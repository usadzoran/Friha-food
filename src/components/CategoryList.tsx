import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types/admin';
import {
  Pizza,
  UtensilsCrossed,
  ShoppingBag,
  Croissant,
  Carrot,
  Apple,
  CupSoda,
  Droplet,
  Zap,
  Milk,
  Citrus,
  ArrowRight,
  Utensils,
  ShoppingBasket,
  CheckCircle,
  X,
  Phone,
  MapPin,
  User,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
  iconColor: string;
  glowColor: string;
}

interface CategoryListProps {
  category: 'food' | 'drinks';
  onBack: () => void;
}

const FOOD_ITEMS: CategoryItem[] = [
  {
    id: 'pizza',
    name: 'بيتزا',
    icon: Pizza,
    description: 'بيتزا شهية بمختلف النكهات والأحجام الطازجة',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    iconColor: 'text-amber-500',
    glowColor: 'group-hover:shadow-orange-500/30'
  },
  {
    id: 'snacks',
    name: 'أكل خفيف',
    icon: UtensilsCrossed,
    description: 'ساندويتشات، وجبات سريعة ومقبلات خفيفة',
    gradient: 'from-orange-400 via-amber-500 to-yellow-600',
    iconColor: 'text-orange-500',
    glowColor: 'group-hover:shadow-amber-500/30'
  },
  {
    id: 'groceries',
    name: 'مواد غذائية',
    icon: ShoppingBag,
    description: 'مستلزمات المطبخ والمواد الاستهلاكية اليومية',
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    iconColor: 'text-emerald-600',
    glowColor: 'group-hover:shadow-emerald-500/30'
  },
  {
    id: 'bread',
    name: 'خبز',
    icon: Croissant,
    description: 'خبز طازج، مخبوزات ومعجنات يومية ساخنة',
    gradient: 'from-amber-600 via-yellow-600 to-amber-700',
    iconColor: 'text-amber-700',
    glowColor: 'group-hover:shadow-amber-600/30'
  },
  {
    id: 'vegetables',
    name: 'خضر',
    icon: Carrot,
    description: 'خضروات طازجة ومغذية من المزرعة مباشرة',
    gradient: 'from-emerald-600 via-green-500 to-teal-600',
    iconColor: 'text-green-600',
    glowColor: 'group-hover:shadow-green-500/30'
  },
  {
    id: 'fruits',
    name: 'فواكه',
    icon: Apple,
    description: 'فواكه موسمية طازجة وغنية بالفيتامينات',
    gradient: 'from-rose-500 via-red-500 to-pink-600',
    iconColor: 'text-rose-500',
    glowColor: 'group-hover:shadow-rose-500/30'
  },
];

const DRINK_ITEMS: CategoryItem[] = [
  {
    id: 'soda',
    name: 'مشروبات غازية',
    icon: CupSoda,
    description: 'مشروبات غازية منعشة بمختلف الأنواع والنكهات',
    gradient: 'from-purple-500 via-indigo-600 to-pink-600',
    iconColor: 'text-purple-600',
    glowColor: 'group-hover:shadow-purple-500/30'
  },
  {
    id: 'water',
    name: 'مياه عذبة',
    icon: Droplet,
    description: 'مياه شرب نقية وعذبة بمختلف الأحجام',
    gradient: 'from-sky-400 via-blue-500 to-cyan-600',
    iconColor: 'text-sky-500',
    glowColor: 'group-hover:shadow-sky-500/30'
  },
  {
    id: 'energy',
    name: 'مشروبات الطاقة',
    icon: Zap,
    description: 'مشروبات طاقة تمنحك النشاط والحيوية للذهاب بعيداً',
    gradient: 'from-amber-400 via-orange-500 to-yellow-500',
    iconColor: 'text-amber-500',
    glowColor: 'group-hover:shadow-amber-500/30'
  },
  {
    id: 'milk',
    name: 'حليب',
    icon: Milk,
    description: 'حليب طازج ومنتجات ألبان غنية وعالية الجودة',
    gradient: 'from-blue-400 via-indigo-500 to-sky-600',
    iconColor: 'text-blue-500',
    glowColor: 'group-hover:shadow-blue-500/30'
  },
  {
    id: 'juices',
    name: 'عصائر',
    icon: Citrus,
    description: 'عصائر طبيعية 100% ومنعشة بدون مواد حافظة',
    gradient: 'from-orange-400 via-amber-500 to-red-500',
    iconColor: 'text-orange-500',
    glowColor: 'group-hover:shadow-orange-500/30'
  },
];

export default function CategoryList({ category, onBack }: CategoryListProps) {
  const { products, addOrder, restaurants, stores } = useApp();
  const [selectedSubCat, setSelectedSubCat] = useState<string | null>(null);
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

  const isFood = category === 'food';
  const title = isFood ? 'قائمة المأكولات' : 'قائمة المشروبات';
  const subtitle = isFood
    ? 'اختر قسمك المفضل من بين أجود المأكولات والمواد الغذائية'
    : 'منعشات، عصائر ومياه نقيّة لتلبية كافة أذواقك';
  const items = isFood ? FOOD_ITEMS : DRINK_ITEMS;

  const currentCategoryObj = items.find(i => i.id === selectedSubCat);
  const categoryProducts = selectedSubCat
    ? products.filter(p => p.categoryId === selectedSubCat && p.isAvailable)
    : [];

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingProduct) return;

    const vendorName =
      orderingProduct.vendorType === 'restaurant'
        ? restaurants.find(r => r.id === orderingProduct.vendorId)?.name || 'مطعم شريك'
        : stores.find(s => s.id === orderingProduct.vendorId)?.name || 'متجر شريك';

    const unitPrice = orderingProduct.discountPrice || orderingProduct.price;

    addOrder({
      customerName,
      customerPhone,
      customerAddress,
      items: [
        {
          productId: orderingProduct.id,
          productName: orderingProduct.name,
          quantity,
          price: unitPrice
        }
      ],
      totalPrice: unitPrice * quantity,
      status: 'new',
      vendorName,
      notes: 'طلب مباشر من الموقع'
    });

    setOrderPlacedSuccess(true);
    setTimeout(() => {
      setOrderPlacedSuccess(false);
      setOrderingProduct(null);
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    }, 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 font-cairo">
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-stone-200/90 shadow-sm text-right">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => {
              if (selectedSubCat) {
                setSelectedSubCat(null);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 font-bold text-sm transition-all duration-200 cursor-pointer border border-stone-200 hover:border-emerald-300 shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{selectedSubCat ? 'العودة للأقسام' : 'الرجوع للرئيسية'}</span>
          </button>
          
          <div className="text-right">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-kufi">
              {selectedSubCat && currentCategoryObj ? currentCategoryObj.name : title}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
              {selectedSubCat && currentCategoryObj ? currentCategoryObj.description : subtitle}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 self-end sm:self-center">
          {isFood ? <Utensils className="w-4 h-4" /> : <CupSoda className="w-4 h-4" />}
          <span>{selectedSubCat ? `${categoryProducts.length} منتج متوفر` : `${items.length} أقسام متوفرة`}</span>
        </div>
      </div>

      {/* IF NO SUBCATEGORY SELECTED: SHOW CATEGORIES GRID */}
      {!selectedSubCat ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedSubCat(item.id)}
                className={`group bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-right cursor-pointer transform hover:-translate-y-1.5 relative overflow-hidden ${item.glowColor}`}
              >
                <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r ${item.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} p-0.5 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <div className="w-full h-full bg-white rounded-[0.9rem] flex items-center justify-center transition-colors group-hover:bg-opacity-95">
                        <IconComponent className={`w-8 h-8 ${item.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                      </div>
                    </div>

                    <span className="text-xs font-bold text-stone-400 group-hover:text-emerald-700 bg-stone-100 group-hover:bg-emerald-50 px-3 py-1 rounded-full transition-colors">
                      قسم فرعي
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-emerald-950 group-hover:text-emerald-800 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <span>تصفح المنتجات</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  </span>
                  <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1.5">←</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* PRODUCTS LIST FOR SELECTED SUBCATEGORY */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryProducts.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
              <ShoppingBasket className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-xl font-bold text-stone-700">لا توجد منتجات مسجلة في هذا القسم حالياً</h3>
              <p className="text-stone-400 text-sm">يمكن للمدير إضافة منتجات جديدة لهذا القسم من لوحة التحكم.</p>
            </div>
          ) : (
            categoryProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {prod.isBestSeller && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-bold text-xs shadow-md flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> الأكثر مبيعاً
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3 text-right">
                    <h3 className="text-xl font-bold text-emerald-950 font-kufi">
                      {prod.name}
                    </h3>
                    <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                      {prod.description}
                    </p>

                    <div className="pt-2 flex items-baseline gap-2">
                      {prod.discountPrice ? (
                        <>
                          <span className="text-2xl font-black text-emerald-700 font-kufi">{prod.discountPrice} د.ج</span>
                          <span className="text-xs text-stone-400 line-through">{prod.price} د.ج</span>
                        </>
                      ) : (
                        <span className="text-2xl font-black text-emerald-950 font-kufi">{prod.price} د.ج</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setOrderingProduct(prod);
                      setQuantity(1);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBasket className="w-4 h-4" />
                    <span>أطلب الآن</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ORDER MODAL FOR CUSTOMER */}
      {orderingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-right shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold font-kufi text-emerald-950">
                تأكيد طلب: {orderingProduct.name}
              </h3>
              <button
                onClick={() => setOrderingProduct(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderPlacedSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-emerald-950 font-kufi">تم إرسال طلبك بنجاح!</h4>
                <p className="text-stone-500 text-sm">تم إرسال طلبك مباشرة إلى لوحة التحكم وسيتم التواصل معك للتحضير والتوصيل.</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">الاسم الكامل</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="أدخل اسمك الكريم..."
                      className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 pr-10 text-stone-900 text-sm focus:outline-none"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute top-3 right-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">رقم الهاتف للتواصل</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0550..."
                      className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 pr-10 text-stone-900 text-sm focus:outline-none dir-ltr text-right"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute top-3 right-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">عنوان التوصيل بالكامل</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="الحي، الشارع ورقم المنزل..."
                      className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 pr-10 text-stone-900 text-sm focus:outline-none"
                    />
                    <MapPin className="w-4 h-4 text-stone-400 absolute top-3 right-3" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-stone-700">الكمية المطلوبة:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-stone-200 hover:bg-stone-300 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-base font-mono w-6 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-bold">المبلغ الإجمالي:</span>
                  <span className="text-xl font-extrabold text-emerald-950 font-kufi">
                    {((orderingProduct.discountPrice || orderingProduct.price) * quantity)} د.ج
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg transition-colors cursor-pointer"
                >
                  إرسال الطلب الآن
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

