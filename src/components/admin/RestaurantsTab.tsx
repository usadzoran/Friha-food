import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Restaurant } from '../../types/admin';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Truck,
  Check,
  X,
  Building2,
  Power
} from 'lucide-react';

export default function RestaurantsTab() {
  const { restaurants, addRestaurant, updateRestaurant, deleteRestaurant, toggleRestaurantActive } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);

  // Form fields
  const [formData, setFormData] = useState<Omit<Restaurant, 'id'>>({
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    whatsapp: '',
    phone: '',
    workingHours: '10:00 ص - 11:00 م',
    address: '',
    deliveryFee: 150,
    minOrder: 500,
    active: true
  });

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingRest(null);
    setFormData({
      name: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      whatsapp: '+213',
      phone: '+213',
      workingHours: '10:00 ص - 11:00 م',
      address: '',
      deliveryFee: 150,
      minOrder: 500,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rest: Restaurant) => {
    setEditingRest(rest);
    setFormData({
      name: rest.name,
      description: rest.description,
      image: rest.image,
      whatsapp: rest.whatsapp,
      phone: rest.phone,
      workingHours: rest.workingHours,
      address: rest.address,
      deliveryFee: rest.deliveryFee,
      minOrder: rest.minOrder,
      active: rest.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRest) {
      updateRestaurant(editingRest.id, formData);
    } else {
      addRestaurant(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-cairo dir-rtl text-right">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border border-stone-800">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-2xl font-bold font-kufi text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <span>إدارة المطاعم</span>
          </h2>
          <p className="text-xs text-stone-400">
            إضافة، تعديل، حذف وتفعيل المطاعم الشريكة بالنظام
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة مطعم جديد</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن اسم المطعم أو الوصف..."
          className="w-full bg-stone-900 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 pr-11 text-stone-100 text-sm placeholder-stone-500 focus:outline-none transition-colors"
        />
        <Search className="w-5 h-5 text-stone-500 absolute top-3.5 right-3.5" />
      </div>

      {/* RESTAURANTS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((rest) => (
          <div
            key={rest.id}
            className={`bg-stone-900 border ${rest.active ? 'border-stone-800' : 'border-red-900/40 opacity-75'} rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all group`}
          >
            <div>
              {/* IMAGE HEADER WITH ACTIVE BADGE */}
              <div className="relative h-44 w-full overflow-hidden bg-stone-950">
                <img
                  src={rest.image}
                  alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />

                <button
                  onClick={() => toggleRestaurantActive(rest.id)}
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-colors ${
                    rest.active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{rest.active ? 'مفعل' : 'معطل'}</span>
                </button>
              </div>

              {/* CARD DETAILS */}
              <div className="p-5 space-y-3">
                <h3 className="text-xl font-bold text-white font-kufi">
                  {rest.name}
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                  {rest.description}
                </p>

                <div className="pt-2 border-t border-stone-800 space-y-2 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ساعات العمل: {rest.workingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{rest.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      التوصيل: <strong className="text-white">{rest.deliveryFee} د.ج</strong>
                    </span>
                    <span>
                      أدنى طلب: <strong className="text-white">{rest.minOrder} د.ج</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS FOOTER */}
            <div className="p-4 bg-stone-950/60 border-t border-stone-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {rest.whatsapp && (
                  <a
                    href={`https://wa.me/${rest.whatsapp.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/50 transition-colors"
                    title="واتساب"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
                {rest.phone && (
                  <a
                    href={`tel:${rest.phone}`}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                    title="اتصال"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(rest)}
                  className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`هل أنت تأكد من حذف مطعم ${rest.name}؟`)) {
                      deleteRestaurant(rest.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 transition-colors cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT RESTAURANT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h3 className="text-xl font-bold font-kufi text-white">
                {editingRest ? 'تعديل بيانات المطعم' : 'إضافة مطعم جديد'}
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
                <label className="block text-xs font-bold text-stone-300">اسم المطعم</label>
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">رابط صورة المطعم</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none dir-ltr"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">ساعات العمل</label>
                  <input
                    type="text"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">رسوم التوصيل (د.ج)</label>
                  <input
                    type="number"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">الحد الأدنى للطلب (د.ج)</label>
                  <input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
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
