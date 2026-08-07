import React from 'react';
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
  Utensils
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
  const isFood = category === 'food';
  const title = isFood ? 'قائمة المأكولات' : 'قائمة المشروبات';
  const subtitle = isFood
    ? 'اختر قسمك المفضل من بين أجود المأكولات والمواد الغذائية'
    : 'منعشات، عصائر ومياه نقيّة لتلبية كافة أذواقك';
  const items = isFood ? FOOD_ITEMS : DRINK_ITEMS;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 font-cairo">
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-stone-200/90 shadow-sm text-right">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 font-bold text-sm transition-all duration-200 cursor-pointer border border-stone-200 hover:border-emerald-300 shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للرئيسية</span>
          </button>
          
          <div className="text-right">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-kufi">
              {title}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 self-end sm:self-center">
          {isFood ? <Utensils className="w-4 h-4" /> : <CupSoda className="w-4 h-4" />}
          <span>{items.length} أقسام متوفرة</span>
        </div>
      </div>

      {/* ITEMS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className={`group bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-right cursor-pointer transform hover:-translate-y-1.5 relative overflow-hidden ${item.glowColor}`}
            >
              {/* TOP COLOR ACCENT BAR */}
              <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r ${item.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="space-y-4 pt-1">
                {/* ICON CONTAINER WITH GRADIENT AND GLOW */}
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
    </div>
  );
}
