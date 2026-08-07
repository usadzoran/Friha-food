import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Offer } from '../../types/admin';
import { Percent, Plus, Trash2, Power, Tag, Calendar, X } from 'lucide-react';

export default function OffersTab() {
  const { offers, addOffer, deleteOffer, toggleOfferActive } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Offer, 'id'>>({
    title: '',
    code: '',
    discountPercent: 15,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOffer(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-cairo dir-rtl text-right">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border border-stone-800">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-2xl font-bold font-kufi text-white flex items-center gap-2">
            <Percent className="w-6 h-6 text-emerald-400" />
            <span>إدارة العروض والتخفيضات</span>
          </h2>
          <p className="text-xs text-stone-400">
            إنشاء أكوابون التخفيض، العروض الترويجية والبانرات الإعلانية
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة عرض جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`bg-stone-900 border ${offer.active ? 'border-stone-800' : 'border-stone-800/40 opacity-75'} rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                  كوبون: {offer.code}
                </span>
                <button
                  onClick={() => toggleOfferActive(offer.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    offer.active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{offer.active ? 'مفعل' : 'معطل'}</span>
                </button>
              </div>

              <h3 className="text-xl font-bold text-white font-kufi">
                {offer.title}
              </h3>

              <div className="flex items-center justify-between bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs text-stone-300">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  نسبة الخصم: <strong className="text-emerald-400 font-bold">{offer.discountPercent}%</strong>
                </span>
                <span className="flex items-center gap-1 text-stone-400">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  ينتهي في: {offer.endDate}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-end">
              <button
                onClick={() => {
                  if (confirm('هل أنت تأكد من حذف العرض؟')) {
                    deleteOffer(offer.id);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف العرض</span>
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
              <h3 className="text-xl font-bold font-kufi text-white">إضافة عرض ترويجي جديد</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">عنوان العرض</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="خصم الصيف 20%..."
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">رمز الكوبون</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="ESHRY15"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none dir-ltr uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    required
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">تاريخ الانتهاء</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-stone-100 text-sm focus:outline-none"
                />
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
                  حفظ العرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
