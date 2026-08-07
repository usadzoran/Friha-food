import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, VendorType } from '../../types/admin';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Star,
  Sparkles,
  X,
  Check,
  EyeOff,
  Building2,
  Store as StoreIcon
} from 'lucide-react';

export default function ProductsTab() {
  const {
    products,
    categories,
    restaurants,
    stores,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailable
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 500,
    discountPrice: undefined,
    categoryId: categories[0]?.id || 'pizza',
    vendorId: restaurants[0]?.id || 'rest-1',
    vendorType: 'restaurant',
    images: ['https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80'],
    isAvailable: true,
    isBestSeller: false,
    isNew: true
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 500,
      discountPrice: undefined,
      categoryId: categories[0]?.id || 'pizza',
      vendorId: restaurants[0]?.id || 'rest-1',
      vendorType: 'restaurant',
      images: ['https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80'],
      isAvailable: true,
      isBestSeller: false,
      isNew: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice,
      categoryId: p.categoryId,
      vendorId: p.vendorId,
      vendorType: p.vendorType,
      images: p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80'],
      isAvailable: p.isAvailable,
      isBestSeller: p.isBestSeller,
      isNew: p.isNew
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  const getVendorName = (vendorId: string, vendorType: VendorType) => {
    if (vendorType === 'restaurant') {
      const r = restaurants.find(res => res.id === vendorId);
      return r ? r.name : 'مطعم غير محدد';
    } else {
      const s = stores.find(st => st.id === vendorId);
      return s ? s.name : 'متجر غير محدد';
    }
  };

  const getCategoryName = (catId: string) => {
    const c = categories.find(cat => cat.id === catId);
    return c ? c.name : catId;
  };

  return (
    <div className="space-y-6 font-cairo dir-rtl text-right">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border border-stone-800">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-2xl font-bold font-kufi text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>إدارة المنتجات وقائمة الطعام</span>
          </h2>
          <p className="text-xs text-stone-400">
            إضافة وتعديل أسعار، تخفيضات وصور وجبات المأكولات والمشروبات
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المنتج أو الوصف..."
            className="w-full bg-stone-900 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 pr-11 text-stone-100 text-sm placeholder-stone-500 focus:outline-none transition-colors"
          />
          <Search className="w-5 h-5 text-stone-500 absolute top-3.5 right-3.5" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-64 bg-stone-900 border border-stone-800 text-stone-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">كافة الأقسام ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* PRODUCTS TABLE / GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className={`bg-stone-900 border ${p.isAvailable ? 'border-stone-800' : 'border-stone-800/40 opacity-70'} rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all group`}
          >
            <div>
              {/* PRODUCT IMAGE & BADGES */}
              <div className="relative h-48 w-full bg-stone-950 overflow-hidden">
                <img
                  src={p.images[0] || 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />

                {/* BADGES */}
                <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                  {p.isBestSeller && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[11px] flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-stone-950" /> الأكثر مبيعاً
                    </span>
                  )}
                  {p.isNew && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-stone-950 font-bold text-[11px] flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> جديد
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleProductAvailable(p.id)}
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md cursor-pointer ${
                    p.isAvailable
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800/80 text-stone-400 border border-stone-700'
                  }`}
                >
                  {p.isAvailable ? <Check className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{p.isAvailable ? 'متوفر' : 'غير متوفر'}</span>
                </button>
              </div>

              {/* CARD BODY */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-stone-400">
                  <span className="bg-stone-800 text-emerald-400 px-2.5 py-0.5 rounded-lg font-bold">
                    {getCategoryName(p.categoryId)}
                  </span>
                  <span className="truncate flex items-center gap-1 text-stone-400">
                    {p.vendorType === 'restaurant' ? <Building2 className="w-3.5 h-3.5 text-stone-500" /> : <StoreIcon className="w-3.5 h-3.5 text-stone-500" />}
                    {getVendorName(p.vendorId, p.vendorType)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-kufi">
                  {p.name}
                </h3>

                <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                  {p.description}
                </p>

                {/* PRICE AREA */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    {p.discountPrice ? (
                      <>
                        <span className="text-xl font-extrabold text-emerald-400 font-kufi">{p.discountPrice} د.ج</span>
                        <span className="text-xs text-stone-500 line-through">{p.price} د.ج</span>
                      </>
                    ) : (
                      <span className="text-xl font-extrabold text-white font-kufi">{p.price} د.ج</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="p-4 bg-stone-950/60 border-t border-stone-800 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(p)}
                className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`هل أنت تأكد من حذف المنتج ${p.name}؟`)) {
                    deleteProduct(p.id);
                  }
                }}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 transition-colors cursor-pointer"
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
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h3 className="text-xl font-bold font-kufi text-white">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
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
                <label className="block text-xs font-bold text-stone-300">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">الوصف التفصيلي</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">السعر الأصلي (د.ج)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">السعر بعد التخفيض (اختياري)</label>
                  <input
                    type="number"
                    value={formData.discountPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPrice: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    placeholder="بدون تخفيض"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">القسم التابع له</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">نوع المزود (مطعم / متجر)</label>
                  <select
                    value={formData.vendorType}
                    onChange={(e) => {
                      const vType = e.target.value as VendorType;
                      const firstId = vType === 'restaurant' ? restaurants[0]?.id || '' : stores[0]?.id || '';
                      setFormData({ ...formData, vendorType: vType, vendorId: firstId });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="restaurant">مطعم</option>
                    <option value="store">متجر / سوبرماركت</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">اختر المزود التابع له</label>
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none cursor-pointer"
                >
                  {formData.vendorType === 'restaurant'
                    ? restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)
                    : stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">رابط صورة المنتج الرئيسية</label>
                <input
                  type="url"
                  required
                  value={formData.images[0] || ''}
                  onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none dir-ltr"
                />
              </div>

              {/* BADGES TOGGLES */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-300">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-950 border-stone-800"
                  />
                  <span>تمييز كـ "الأكثر مبيعاً"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-300">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-950 border-stone-800"
                  />
                  <span>تمييز كـ "جديد"</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
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
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
