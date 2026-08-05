import React from 'react';
import { CategorySection } from '../types';

interface HeroCategoryButtonsProps {
  selectedSection: CategorySection | 'all';
  onSelectSection: (section: CategorySection | 'all') => void;
}

export const HeroCategoryButtons: React.FC<HeroCategoryButtonsProps> = ({
  selectedSection,
  onSelectSection,
}) => {
  return (
    <div className="my-6">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-800 font-cairo">
          اختر نوع الطلب
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          تسوق أشهى الأطباق أو مستلزمات بقالتك اليومية بكل سهولة
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto px-2">
        {/* BUTTON 1: مأكولات */}
        <button
          onClick={() => onSelectSection('food')}
          className={`relative overflow-hidden group p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-right shadow-sm flex flex-col justify-between ${
            selectedSection === 'food'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-600 shadow-lg shadow-amber-500/25 scale-[1.02]'
              : 'bg-white hover:bg-amber-50/50 text-stone-800 border-stone-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-200">
              🍔
            </span>
            {selectedSection === 'food' && (
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-cairo">
              مأكولات
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                selectedSection === 'food' ? 'text-amber-100' : 'text-stone-500'
              }`}
            >
              بيتزا، سندويتشات، أكل خفيف
            </p>
          </div>
        </button>

        {/* BUTTON 2: مشروبات */}
        <button
          onClick={() => onSelectSection('drinks')}
          className={`relative overflow-hidden group p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-right shadow-sm flex flex-col justify-between ${
            selectedSection === 'drinks'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/25 scale-[1.02]'
              : 'bg-white hover:bg-emerald-50/50 text-stone-800 border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-200">
              🥤
            </span>
            {selectedSection === 'drinks' && (
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-cairo">
              مشروبات
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                selectedSection === 'drinks' ? 'text-emerald-100' : 'text-stone-500'
              }`}
            >
              مشروبات غازية، عصائر، حليب
            </p>
          </div>
        </button>
      </div>

      {/* Reset Section filter option */}
      {selectedSection !== 'all' && (
        <div className="text-center mt-3">
          <button
            onClick={() => onSelectSection('all')}
            className="text-xs text-amber-700 underline underline-offset-4 hover:text-amber-800 font-medium"
          >
            عرض كافة المتاجر والمحلات
          </button>
        </div>
      )}
    </div>
  );
};
