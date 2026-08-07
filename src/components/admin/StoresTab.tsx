import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Store } from '../../types/admin';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MessageSquare,
  MapPin,
  X,
  Store as StoreIcon,
  Power
} from 'lucide-react';

export default function StoresTab() {
  const { stores, addStore, updateStore, deleteStore, toggleStoreActive } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const [formData, setFormData] = useState<Omit<Store, 'id'>>({
    name: '',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
    address: '',
    whatsapp: '',
    phone: '',
    active: true
  });

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      address: '',
      whatsapp: '+213',
      phone: '+213',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: Store) => {
    setEditingStore(st);
    setFormData({
      name: st.name,
      image: st.image,
      address: st.address,
      whatsapp: st.whatsapp,
      phone: st.phone,
      active: st.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStore) {
      updateStore(editingStore.id, formData);
    } else {
      addStore(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-cairo dir-rtl text-right">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border border-stone-800">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-2xl font-bold font-kufi text-white flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-emerald-400" />
            <span>إدارة المتاجر والمستلزمات</span>
          </h2>
          <p className="text-xs text-stone-400">
            إضافة وتعديل متاجر المواد الغذائية، الفواكه والسوبرماركت
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة متجر جديد</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن اسم المتجر أو العنوان..."
          className="w-full bg-stone-900 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 pr-11 text-stone-100 text-sm placeholder-stone-500 focus:outline-none transition-colors"
        />
        <Search className="w-5 h-5 text-stone-500 absolute top-3.5 right-3.5" />
      </div>

      {/* STORES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((st) => (
          <div
            key={st.id}
            className={`bg-stone-900 border ${st.active ? 'border-stone-800' : 'border-red-900/40 opacity-75'} rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all group`}
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-stone-950">
                <img
                  src={st.image}
                  alt={st.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />

                <button
                  onClick={() => toggleStoreActive(st.id)}
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-colors ${
                    st.active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{st.active ? 'مفعل' : 'معطل'}</span>
                </button>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-xl font-bold text-white font-kufi">
                  {st.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{st.address}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-950/60 border-t border-stone-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {st.whatsapp && (
                  <a
                    href={`https://wa.me/${st.whatsapp.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
                {st.phone && (
                  <a
                    href={`tel:${st.phone}`}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(st)}
                  className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`هل أنت تأكد من حذف متجر ${st.name}؟`)) {
                      deleteStore(st.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-right">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h3 className="text-xl font-bold font-kufi text-white">
                {editingStore ? 'تعديل بيانات المتجر' : 'إضافة متجر جديد'}
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
                <label className="block text-xs font-bold text-stone-300">اسم المتجر</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">رابط صورة المتجر</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none dir-ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">العنوان</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">رقم الهاتف</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none dir-ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">رقم واتساب</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none dir-ltr"
                  />
                </div>
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
