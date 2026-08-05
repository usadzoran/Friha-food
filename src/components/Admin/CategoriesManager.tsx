import React, { useState } from 'react';
import { Category, CategorySection } from '../../types';
import { storageService } from '../../services/storage';
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react';

interface CategoriesManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({ categories, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form
  const [name, setName] = useState('');
  const [section, setSection] = useState<CategorySection>('food');
  const [icon, setIcon] = useState('🍕');

  const resetForm = () => {
    setName('');
    setSection('food');
    setIcon('🍕');
    setIsAdding(false);
    setEditingCategory(null);
  };

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSection(cat.section);
    setIcon(cat.icon || '🍕');
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    storageService.saveCategory({
      id: editingCategory ? editingCategory.id : undefined,
      name: name.trim(),
      section,
      icon,
    });

    resetForm();
    onRefresh();
  };

  const handleDelete = (id: string, catName: string) => {
    if (window.confirm(`هل أنت تأكد من حذف التصنيف "${catName}"؟`)) {
      storageService.deleteCategory(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div>
          <h3 className="text-xl font-bold font-cairo text-stone-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-600" />
            <span>إدارة التصنيفات ({categories.length})</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            إضافة أو حذف وتعديل أنواع الوجبات والمشروبات (بيتزا، خضر، عصائر، الخ)
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تصنيف جديد</span>
          </button>
        )}
      </div>

      {/* ADD / EDIT FORM */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-amber-300 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h4 className="text-lg font-bold font-cairo text-stone-900">
              {editingCategory ? `تعديل تصنيف "${editingCategory.name}"` : 'إضافة تصنيف جديد'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">اسم التصنيف *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: بيتزا، عصائر طازجة..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">القسم الرئيسي</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as CategorySection)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="food">🍔 مأكولات</option>
                <option value="drinks">🥤 مشروبات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">الأيقونة (Emoji)</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🍕"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-center focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
            >
              {editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}
            </button>
          </div>
        </form>
      )}

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl bg-stone-100 w-12 h-12 rounded-xl flex items-center justify-center">
                {cat.icon || '🏷️'}
              </span>
              <div>
                <h5 className="font-bold text-stone-900 font-cairo text-sm">{cat.name}</h5>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                    cat.section === 'food' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {cat.section === 'food' ? 'مأكولات' : 'مشروبات'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => startEdit(cat)}
                className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
