import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category, CategoryType } from '../../types/admin';
import {
  Plus,
  Layers,
  Edit2,
  Trash2,
  Utensils,
  CupSoda,
  X,
  Tag
} from 'lucide-react';

export default function CategoriesTab() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();

  const [activeType, setActiveType] = useState<CategoryType>('food');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    type: 'food',
    iconName: 'Utensils',
    active: true
  });

  const filteredCategories = categories.filter(c => c.type === activeType);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      type: activeType,
      iconName: activeType === 'food' ? 'Pizza' : 'CupSoda',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      type: cat.type,
      iconName: cat.iconName,
      active: cat.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
      updateCategory(editingCat.id, formData);
    } else {
      addCategory(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-cairo dir-rtl text-right">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border border-stone-800">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-2xl font-bold font-kufi text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>إدارة الأقسام والفئات</span>
          </h2>
          <p className="text-xs text-stone-400">
            تجهيز وتصنيف الأقسام الرئيسية والفرعية للمأكولات والمشروبات
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* TYPE SWITCHER BUTTONS */}
      <div className="flex items-center gap-3 bg-stone-900 p-1.5 rounded-2xl border border-stone-800 w-fit">
        <button
          onClick={() => setActiveType('food')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeType === 'food'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>أقسام المأكولات ({categories.filter(c => c.type === 'food').length})</span>
        </button>

        <button
          onClick={() => setActiveType('drinks')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeType === 'drinks'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <CupSoda className="w-4 h-4" />
          <span>أقسام المشروبات ({categories.filter(c => c.type === 'drinks').length})</span>
        </button>
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex items-center justify-between gap-4 hover:border-emerald-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-stone-800 text-emerald-400 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white font-kufi">{cat.name}</h4>
                <span className="text-[11px] text-stone-500 font-mono">ID: {cat.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`هل أنت تأكد من حذف قسم ${cat.name}؟`)) {
                    deleteCategory(cat.id);
                  }
                }}
                className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-6 text-right">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h3 className="text-xl font-bold font-kufi text-white">
                {editingCat ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">اسم القسم</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: بيتزا، عصائر..."
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">نوع التصنيف الرئيسي</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as CategoryType })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="food">مأكولات (Food)</option>
                  <option value="drinks">مشروبات (Drinks)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-stone-800 text-stone-300 font-bold text-sm rounded-xl hover:bg-stone-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
