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
  badge?: string;
}

interface CategoryListProps {
  category: 'food' | 'drinks';
  onBack: () => void;
}

const FOOD_ITEMS: CategoryItem[] = [
  { id: 'pizza', name: 'بيتزا', icon: Pizza, description: 'بيتزا شهية بمختلف النكهات والأحجام' },
  { id: 'snacks', name: 'أكل خفيف', icon: UtensilsCrossed, description: 'ساندويتشات، وجبات سريعة ومقبلات خفيفة' },
  { id: 'groceries', name: 'مواد غذائية', icon: ShoppingBag, description: 'مستلزمات المطبخ والمواد الاستهلاكية اليومية' },
  { id: 'bread', name: 'خبز', icon: Croissant, description: 'خبز طازج، مخبوزات ومعجنات يومية' },
  { id: 'vegetables', name: 'خضر', icon: Carrot, description: 'خضروات طازجة من المزرعة مباشرة' },
  { id: 'fruits', name: 'فواكه', icon: Apple, description: 'فواكه موسمية طازجة وغنية بالفيتامينات' },
];

const DRINK_ITEMS: CategoryItem[] = [
  { id: 'soda', name: 'مشروبات غازية', icon: CupSoda, description: 'مشروبات غازية منعشة بمختلف الأنواع' },
  { id: 'water', name: 'مياه عذبة', icon: Droplet, description: 'مياه شرب نقية وعذبة بمختلف الأحجام' },
  { id: 'energy', name: 'مشروبات الطاقة', icon: Zap, description: 'مشروبات طاقة تمنحك النشاط والحيوية' },
  { id: 'milk', name: 'حليب', icon: Milk, description: 'حليب طازج ومنتجات ألبان عالية الجودة' },
  { id: 'juices', name: 'عصائر', icon: Citrus, description: 'عصائر طبيعية 100% ومنعشة' },
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
              className="group bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/80 transition-all duration-300 flex flex-col justify-between text-right cursor-pointer transform hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-xs">
                  <IconComponent className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700 opacity-80 group-hover:opacity-100">
                <span>تصفح المنتجات</span>
                <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">←</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
