import React from 'react';
import { 
  Store, 
  ShoppingBag, 
  UtensilsCrossed, 
  Pizza, 
  Apple, 
  Coffee, 
  HeartPulse, 
  Tv 
} from 'lucide-react';
import { CATEGORIES } from '../data/storesData';
import { CategoryType } from '../types';

interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Store': return <Store className="w-4 h-4" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-4 h-4" />;
      case 'Pizza': return <Pizza className="w-4 h-4" />;
      case 'Apple': return <Apple className="w-4 h-4" />;
      case 'Coffee': return <Coffee className="w-4 h-4" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      default: return <Tv className="w-4 h-4" />;
    }
  };

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <span>التصنيفات المتاحة</span>
          <span className="text-[11px] text-stone-500 font-normal">(اختر للتصفية)</span>
        </h3>
      </div>

      {/* Horizontal Scrollable Categories */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer snap-start border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-102'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}>
                {getCategoryIcon(cat.icon)}
              </span>
              <span>{cat.name}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
