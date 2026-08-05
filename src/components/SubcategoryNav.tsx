import React from 'react';
import { Category, CategorySection } from '../types';

interface SubcategoryNavProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  activeSection: CategorySection | 'all';
}

export const SubcategoryNav: React.FC<SubcategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  activeSection,
}) => {
  const filteredCategories = categories.filter((cat) => {
    if (activeSection === 'all') return true;
    return cat.section === activeSection;
  });

  if (filteredCategories.length === 0) return null;

  return (
    <div className="my-4 max-w-7xl mx-auto px-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
        {/* ALL CATEGORIES OPTION */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-2xs ${
            selectedCategoryId === null
              ? 'bg-stone-900 text-white shadow-stone-900/20'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          الكل ✨
        </button>

        {filteredCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-2xs ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-amber-600/20 scale-105'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-amber-50 hover:border-amber-200'
              }`}
            >
              <span>{cat.icon || '🏷️'}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
