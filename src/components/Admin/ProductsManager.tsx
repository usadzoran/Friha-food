import React, { useState } from 'react';
import { Product, Store, Category } from '../../types';
import { storageService } from '../../services/storage';
import { Plus, Edit2, Trash2, ShoppingBag, Store as StoreIcon, Check, X, Image as ImageIcon } from 'lucide-react';

interface ProductsManagerProps {
  products: Product[];
  stores: Store[];
  categories: Category[];
  onRefresh: () => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  stores,
  categories,
  onRefresh,
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    stores.length > 0 ? stores[0].id : ''
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const activeStoreProducts = products.filter((p) => p.store_id === selectedStoreId);
  const activeStoreObj = stores.find((s) => s.id === selectedStoreId);

  const resetForm = () => {
    setName('');
    setImage('');
    setDescription('');
    setPrice('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setIsAvailable(true);
    setIsAdding(false);
    setEditingProduct(null);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setImage(product.image);
    setDescription(product.description);
    setPrice(product.price);
    setCategoryId(product.category_id);
    setIsAvailable(product.is_available);
    setIsAdding(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedStoreId || price === '') return;

    storageService.saveProduct({
      id: editingProduct ? editingProduct.id : undefined,
      store_id: selectedStoreId,
      category_id: categoryId || (categories.length > 0 ? categories[0].id : ''),
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      is_available: isAvailable,
    });

    resetForm();
    onRefresh();
  };

  const handleDelete = (id: string, productName: string) => {
    if (window.confirm(`هل أنت تأكد من حذف المنتج "${productName}"؟`)) {
      storageService.deleteProduct(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* STORE FILTER HEADER */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold font-cairo text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <span>إدارة قائمة المنتجات</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              اختر المتجر لعرض وإضافة أو تعديل الوجبات والمواد الغذائية الخاصة به
            </p>
          </div>

          {!isAdding && selectedStoreId && (
            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج لهذا المتجر</span>
            </button>
          )}
        </div>

        {/* SELECT STORE SELECTOR */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
          <StoreIcon className="w-4 h-4 text-stone-400 shrink-0" />
          <span className="text-xs font-bold text-stone-700 shrink-0">اختر المتجر:</span>
          <select
            value={selectedStoreId}
            onChange={(e) => {
              setSelectedStoreId(e.target.value);
              resetForm();
            }}
            className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.section === 'food' ? 'مطعم' : 'محل مواد غذائية'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT FORM */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-amber-300 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h4 className="text-lg font-bold font-cairo text-stone-900">
              {editingProduct
                ? `تعديل منتج "${editingProduct.name}"`
                : `إضافة منتج جديد لـ "${activeStoreObj?.name}"`}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NAME */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">اسم المنتج / الوجبة *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: بيتزا مارغريتا أو حليب 1 لتر"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* PRICE */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">السعر بالدينار الجزائري (دج) *</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="مثال: 650"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">التصنيف *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name} ({c.section === 'food' ? 'مأكولات' : 'مشروبات'})
                  </option>
                ))}
              </select>
            </div>

            {/* IMAGE URL OR UPLOAD */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">صورة المنتج</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="رابط الصورة..."
                  className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <label className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 cursor-pointer flex items-center gap-1 shrink-0">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>رفع</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">وصف المنتج والمكونات</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفاصيل ومكونات الوجبة أو المادة الغذائية..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* AVAILABILITY STATUS */}
            <div className="md:col-span-2 flex items-center gap-3">
              <label className="text-xs font-bold text-stone-700">حالة التوفر:</label>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isAvailable ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isAvailable ? 'متوفر للطلب' : 'غير متوفر حالياً'}</span>
              </button>
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
              {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </button>
          </div>
        </form>
      )}

      {/* PRODUCTS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeStoreProducts.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-dashed border-stone-300">
            <p className="text-stone-500 text-sm">لا توجد منتجات مسجلة لهذا المتجر حالياً.</p>
          </div>
        ) : (
          activeStoreProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200 bg-stone-100"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-sm text-stone-900 font-cairo truncate">{prod.name}</h5>
                  <p className="text-xs text-amber-700 font-extrabold font-mono mt-0.5">
                    {prod.price} <span className="font-cairo">دج</span>
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {prod.is_available ? 'متوفر' : 'غير متوفر'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-500 line-clamp-2">{prod.description}</p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => startEdit(prod)}
                  className="p-1.5 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDelete(prod.id, prod.name)}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
