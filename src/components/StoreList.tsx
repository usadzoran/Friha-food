import React from 'react';
import { Store, Category } from '../types';
import { StoreCard } from './StoreCard';
import { Store as StoreIcon } from 'lucide-react';

interface StoreListProps {
  stores: Store[];
  categories: Category[];
  selectedCategoryId: string | null;
  selectedSection: 'food' | 'drinks' | 'all';
  searchQuery: string;
  onSelectStore: (store: Store) => void;
}

export const StoreList: React.FC<StoreListProps> = ({
  stores,
  categories,
  selectedCategoryId,
  selectedSection,
  searchQuery,
  onSelectStore,
}) => {
  // Filter stores
  const filteredStores = stores.filter((store) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = store.name.toLowerCase().includes(q);
      const descMatch = store.description.toLowerCase().includes(q);
      const addressMatch = store.address.toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !addressMatch) return false;
    }

    // Section filter
    if (selectedSection !== 'all') {
      if (store.section !== 'both' && store.section !== selectedSection) {
        return false;
      }
    }

    // Category filter
    if (selectedCategoryId) {
      if (store.category_ids && store.category_ids.length > 0) {
        if (!store.category_ids.includes(selectedCategoryId)) {
          return false;
        }
      }
    }

    return true;
  });

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-cairo flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-amber-600" />
            <span>
              {selectedCategoryObj
                ? `المتاجر التي تقدم "${selectedCategoryObj.name}"`
                : selectedSection === 'food'
                ? 'المطاعم ومحلات المأكولات'
                : selectedSection === 'drinks'
                ? 'محلات المشروبات والمرعشات'
                : 'جميع المتاجر والمحلات'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            اختر متجرك المفضل لتصفح قائمته والطلب مباشرة عبر الواتساب
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-stone-100 text-stone-600 rounded-full">
          {filteredStores.length} متجر
        </span>
      </div>

      {filteredStores.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300 max-w-md mx-auto my-8">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-stone-800">لا توجد نتائج متطابقة</h3>
          <p className="text-xs text-stone-500 mt-1">
            جرب البحث بكلمة أخرى أو اختر تصنيفاً آخر لمشاهدة المتاجر المتاحة
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} onSelectStore={onSelectStore} />
          ))}
        </div>
      )}
    </section>
  );
};
