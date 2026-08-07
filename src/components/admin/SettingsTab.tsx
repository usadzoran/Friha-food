import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, Power, Globe, Check, Trash2 } from 'lucide-react';

export default function SettingsTab() {
  const { settings, updateSettings, clearAllData, isDbConnected } = useApp();
  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearDatabase = async () => {
    if (confirm('هل أنت متاكد من مسح جميع السجلات المطاعم، المنتجات، الفئات والعروض من قاعدة البيانات للبدء بقائمة فارغة تماماً؟')) {
      setIsClearing(true);
      await clearAllData();
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6 font-cairo dir-rtl text-right">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border border-stone-800">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-2xl font-bold font-kufi text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            <span>إعدادات النظام والموقع العامة</span>
          </h2>
          <p className="text-xs text-stone-400">
            تحديث اسم التطببق، النصوص الرئيسية، أرقام التواصل وروابط شبكات التواصل
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 shrink-0"
        >
          <Save className="w-5 h-5" />
          <span>حفظ التغييرات</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-3 animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>تم حفظ تحديثات إعدادات الموقع بنجاح واستبدال البيانات مباشرة!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* STORE STATUS TOGGLE CARD */}
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-kufi flex items-center gap-2">
                <Power className="w-5 h-5 text-emerald-400" />
                <span>حالة استقبال الطلبات بالموقع</span>
              </h3>
              <p className="text-xs text-stone-400">
                عند إيقاف التشغيل، سيتم تنبيه الزوار بأن استقبال الطلبات متوقف حالياً
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isStoreOpen: !formData.isStoreOpen })}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                formData.isStoreOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{formData.isStoreOpen ? 'المتجر مفتوح (يستقبل الطلبات)' : 'المتجر مغلق حالياً'}</span>
            </button>
          </div>
        </div>

        {/* GENERAL INFO SECTION */}
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white font-kufi border-b border-stone-800 pb-3">
            المعلومات الهيكلية والعنوان
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">اسم التطبيق / الشعار</label>
              <input
                type="text"
                required
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-stone-100 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">العنوان التوضيحي للرئيسية</label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-stone-100 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-300">النص الفرعي الترحيبي</label>
            <textarea
              rows={2}
              value={formData.heroSubtext}
              onChange={(e) => setFormData({ ...formData, heroSubtext: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-stone-100 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* CONTACT & SOCIAL SECTION */}
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white font-kufi border-b border-stone-800 pb-3">
            أرقام التواصل والشبكات الاجتماعية
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">رقم الهاتف للاتصال</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-stone-100 text-sm focus:outline-none dir-ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">رقم واتساب المباشر</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-stone-100 text-sm focus:outline-none dir-ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">فيسبوك</label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-stone-100 text-sm focus:outline-none dir-ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">إنستغرام</label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-stone-100 text-sm focus:outline-none dir-ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">تويتر (X)</label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-stone-100 text-sm focus:outline-none dir-ltr"
              />
            </div>
          </div>
        </div>

        {/* DATABASE OPERATIONS CARD */}
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-kufi flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>إدارة قاعدة البيانات المباشرة (Firebase Firestore)</span>
              </h3>
              <p className="text-xs text-stone-400">
                حالة الاتصال: {isDbConnected ? 'متصل بنجاح 🟢' : 'جاري الاتصال 🟡'} — جميع التغييرات تُقرأ وتُكتب مباشرة في قاعدة البيانات الحقيقية.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearDatabase}
              disabled={isClearing}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isClearing ? 'جاري تفريغ قاعدة البيانات...' : 'مسح وتفريغ كل البيانات القديمة'}</span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-xl shadow-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>حفظ كافة البيانات الإدارية</span>
          </button>
        </div>
      </form>
    </div>
  );
}
