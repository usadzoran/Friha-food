import React, { useState } from 'react';
import { Store, SectionType, Category } from '../../types';
import { storageService } from '../../services/storage';
import { Plus, Edit2, Trash2, Store as StoreIcon, Clock, Phone, MapPin, Check, X, Image as ImageIcon } from 'lucide-react';

interface StoresManagerProps {
  stores: Store[];
  categories: Category[];
  onRefresh: () => void;
}

export const StoresManager: React.FC<StoresManagerProps> = ({ stores, categories, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [section, setSection] = useState<SectionType>('food');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);

  const resetForm = () => {
    setName('');
    setImage('');
    setDescription('');
    setSection('food');
    setWhatsapp('');
    setAddress('');
    setIsOpen(true);
    setSelectedCatIds([]);
    setIsAdding(false);
    setEditingStore(null);
  };

  const startEdit = (store: Store) => {
    setEditingStore(store);
    setName(store.name);
    setImage(store.image);
    setDescription(store.description);
    setSection(store.section);
    setWhatsapp(store.whatsapp);
    setAddress(store.address);
    setIsOpen(store.is_open);
    setSelectedCatIds(store.category_ids || []);
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
    if (!name.trim()) return;

    storageService.saveStore({
      id: editingStore ? editingStore.id : undefined,
      name: name.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      description: description.trim(),
      section,
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      is_open: isOpen,
      category_ids: selectedCatIds,
    });

    resetForm();
    onRefresh();
  };

  const handleDelete = (id: string, storeName: string) => {
    if (window.confirm(`هل أنت تأكد من حذف متجر "${storeName}"؟ سيتم حذف جميع منتجاته أيضاً.`)) {
      storageService.deleteStore(id);
      onRefresh();
    }
  };

  const toggleCategorySelect = (catId: string) => {
    if (selectedCatIds.includes(catId)) {
      setSelectedCatIds(selectedCatIds.filter((id) => id !== catId));
    } else {
      setSelectedCatIds([...selectedCatIds, catId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ADD BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div>
          <h3 className="text-xl font-bold font-cairo text-stone-900 flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-amber-600" />
            <span>إدارة المتاجر والمحلات ({stores.length})</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            إضافة مطاعم أو محلات جديدة وتعديل معلوماتها أو حالة عملها (مفتوح / مغلق)
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
            <span>إضافة متجر جديد</span>
          </button>
        )}
      </div>

      {/* ADD / EDIT STORE FORM MODAL OR INLINE CARD */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-amber-300 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h4 className="text-lg font-bold font-cairo text-stone-900">
              {editingStore ? `تعديل متجر "${editingStore.name}"` : 'إضافة متجر جديد'}
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
              <label className="block text-xs font-bold text-stone-700 mb-1">اسم المتجر / المطعم *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مطعم السعادة"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* SECTION */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">القسم الرئيسي</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as SectionType)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="food">🍔 مطعم / مأكولات</option>
                <option value="drinks">🥤 متجر مشروبات</option>
                <option value="both">🏪 مأكولات ومشروبات معا (سوبرماركت)</option>
              </select>
            </div>

            {/* WHATSAPP */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">رقم الواتساب لاستلام الطلبات *</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="مثال: 213661234567"
                dir="ltr"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono text-right focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">العنوان الكامل *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: شارع الاستقلال، مقابل البريد المركز"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* IMAGE URL OR UPLOAD */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>رابط الصورة / رفع صورة المتجر</span>
                <span className="text-[11px] text-stone-400">يمكن وضع رابط مباشر أو اختيار صورة</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <label className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 cursor-pointer flex items-center gap-1.5 shrink-0">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>رفع صورة</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">نبذة قصيرة عن المتجر</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر لما يقدمه المتجر..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* CATEGORIES SELECTION */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">التصنيفات المرتبطة بهذا المتجر</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isChecked = selectedCatIds.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategorySelect(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-amber-100 border-amber-400 text-amber-900'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      <span>{cat.icon} {cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OPEN STATUS SWITCH */}
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <label className="text-xs font-bold text-stone-700">حالة المتجر الآن:</label>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  isOpen
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-800 text-stone-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{isOpen ? 'مفتوح للطلبات' : 'مغلق حالياً'}</span>
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
              {editingStore ? 'حفظ التعديلات' : 'إضافة المتجر'}
            </button>
          </div>
        </form>
      )}

      {/* STORES TABLE / CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-100"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-base text-stone-900 font-cairo truncate">
                    {store.name}
                  </h4>
                  <p className="text-xs text-stone-500 truncate mt-0.5">{store.address}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        store.is_open ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {store.is_open ? 'مفتوح' : 'مغلق'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono" dir="ltr">
                      {store.whatsapp}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2">{store.description}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => startEdit(store)}
                className="p-2 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
              <button
                onClick={() => handleDelete(store.id, store.name)}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
