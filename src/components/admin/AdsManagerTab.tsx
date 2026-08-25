import React, { useState } from 'react';
import { AdPlacement, AdSlot } from '../../types';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Code2, 
  Layout, 
  Sparkles, 
  FileCode, 
  Info,
  ExternalLink,
  Layers,
  Copy,
  AlertCircle
} from 'lucide-react';
import { saveAdSlot, deleteAdSlot, toggleAdSlot, DEFAULT_INITIAL_ADS } from '../../services/storeService';
import { AdRenderer } from '../AdRenderer';

interface AdsManagerTabProps {
  ads: AdSlot[];
  onRefresh?: () => void;
}

export const PLACEMENT_INFO: Record<AdPlacement, { label: string; description: string; icon: string }> = {
  header_top: {
    label: 'أعلى الموقع (Header Banner)',
    description: 'يظهر في أعلى الصفحة فوق شريط التصفح لجميع الزوار',
    icon: 'Layout'
  },
  home_banner: {
    label: 'الرئيسية (بين الأقسام والمنتجات)',
    description: 'يظهر في الصفحة الرئيسية كفاصل إعلاني جذاب بعد شبكة الأقسام',
    icon: 'Layers'
  },
  product_grid_middle: {
    label: 'وسط شبكة المنتجات (Products Grid)',
    description: 'يظهر كبطاقة إعلانية بين بطاقات المنتجات أثناء التصفح',
    icon: 'Package'
  },
  product_details_modal: {
    label: 'داخل نافذة تفاصيل المنتج',
    description: 'يظهر للزبون عند النقر على أي منتج لمعاينة تفاصيله',
    icon: 'Eye'
  },
  cart_modal_bottom: {
    label: 'داخل سلة المشتريات (Cart Drawer)',
    description: 'يظهر للزبون في أسفل سلة الشراء قبل إتمام الطلب',
    icon: 'ShoppingCart'
  },
  order_success: {
    label: 'شاشة تأكيد واستلام الطلب',
    description: 'يظهر بعد إرسال وتأكيد الطلبية للزبون بنجاح',
    icon: 'CheckCircle'
  },
  sidebar_or_footer: {
    label: 'أسفل الموقع (قبل الفوتر)',
    description: 'يظهر في أسفل كل الصفحات فوق الفوتر الأساسي',
    icon: 'Layout'
  },
  popup_ad: {
    label: 'إعلان منبثق عائم (Popup Banner)',
    description: 'نافذة عائمة تظهر في زاوية الشاشة مع زر إغلاق سهل',
    icon: 'Sparkles'
  },
  custom_head_script: {
    label: 'كود إعلانات عام (Header / Global Script / AdSense)',
    description: 'تشغيل إعلانات AdSense التلقائية، أكواد تتبع أو إعلانات JS عامة في الخلفية',
    icon: 'FileCode'
  }
};

const HTML_PRESETS = [
  {
    title: 'بانر عروض وتخفيضات احترافي',
    code: `<div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 16px 20px; border-radius: 16px; text-align: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
  <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 900;">🔥 عروض خاصة وتخفيضات حصرية!</h3>
  <p style="margin: 0 0 10px 0; font-size: 13px; opacity: 0.95;">اطلب الآن واستفد من توصيل سريع مع دفع آمن عند الاستلام لجميع الولايات.</p>
  <a href="#products-section" style="display: inline-block; background: #ffffff; color: #065f46; font-weight: 800; font-size: 12px; padding: 6px 16px; border-radius: 8px; text-decoration: none;">تصفح العروض الآن</a>
</div>`
  },
  {
    title: 'بانر صورة مع رابط خارجي',
    code: `<div style="text-align: center;">
  <a href="https://example.com" target="_blank" rel="noopener noreferrer" style="display: block; overflow: hidden; border-radius: 16px;">
    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80" alt="إعلان ترويجي" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 16px;" />
  </a>
</div>`
  },
  {
    title: 'قالب Google AdSense متجاوب',
    code: `<!-- Google AdSense Responsive Unit -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
  },
  {
    title: 'إعلان شريط تنبيه نصي رفيع',
    code: `<div style="background: #fef3c7; border: 1px solid #fde047; color: #92400e; padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: bold; text-align: center;">
  ⚡ تنبيه: خدمة التوصيل متوفرة يومياً إلى 58 ولاية من 8:00 صباحاً حتى 8:00 مساءً.
</div>`
  }
];

export const AdsManagerTab: React.FC<AdsManagerTabProps> = ({ ads, onRefresh }) => {
  const [selectedPlacementFilter, setSelectedPlacementFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdSlot | null>(null);
  const [previewTab, setPreviewTab] = useState<'code' | 'preview'>('preview');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formPlacement, setFormPlacement] = useState<AdPlacement>('home_banner');
  const [formHtml, setFormHtml] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeAdsCount = ads.filter((a) => a.is_active).length;

  const filteredAds = ads.filter((ad) => {
    if (selectedPlacementFilter === 'all') return true;
    return ad.placement === selectedPlacementFilter;
  });

  const handleOpenAddModal = (defaultPlacement?: AdPlacement) => {
    setEditingAd(null);
    setFormTitle('إعلان ترويجي جديد');
    setFormPlacement(defaultPlacement || 'home_banner');
    setFormHtml(HTML_PRESETS[0].code);
    setFormIsActive(true);
    setFormNotes('');
    setPreviewTab('preview');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ad: AdSlot) => {
    setEditingAd(ad);
    setFormTitle(ad.title);
    setFormPlacement(ad.placement);
    setFormHtml(ad.html_code);
    setFormIsActive(ad.is_active);
    setFormNotes(ad.notes || '');
    setPreviewTab('preview');
    setIsModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formHtml.trim()) {
      alert('يرجى كتابة عنوان الإعلان وكود HTML الخاص به.');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveAdSlot({
        id: editingAd?.id,
        title: formTitle.trim(),
        placement: formPlacement,
        html_code: formHtml.trim(),
        is_active: formIsActive,
        notes: formNotes.trim(),
        created_at: editingAd?.created_at
      });

      setActionNotice('تم حفظ الإعلان بنجاح وتحديث أماكن العرض في الموقع مباشرة!');
      setTimeout(() => setActionNotice(null), 4000);
      setIsModalOpen(false);
      onRefresh?.();
    } catch (err: any) {
      console.error('Error saving ad:', err);
      alert('حدث خطأ أثناء حفظ الإعلان: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleAdSlot(id, !currentStatus);
      setActionNotice(!currentStatus ? 'تم تفعيل الإعلان وإظهاره في الموقع.' : 'تم تعطيل الإعلان وإخفاؤه.');
      setTimeout(() => setActionNotice(null), 3000);
      onRefresh?.();
    } catch (err: any) {
      console.error('Error toggling ad:', err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الإعلان "${title}" نهائياً؟`)) {
      try {
        await deleteAdSlot(id);
        setActionNotice('تم حذف الإعلان بنجاح.');
        setTimeout(() => setActionNotice(null), 3000);
        onRefresh?.();
      } catch (err: any) {
        console.error('Error deleting ad:', err);
      }
    }
  };

  const handleRestoreDefaults = async () => {
    if (window.confirm('هل تريد استرجاع قوالب الإعلانات الافتراضية الجاهزة لجميع أماكن الموقع؟')) {
      try {
        for (const defaultAd of DEFAULT_INITIAL_ADS) {
          await saveAdSlot(defaultAd);
        }
        setActionNotice('تم استرجاع جميع قوالب الإعلانات الافتراضية بنجاح!');
        setTimeout(() => setActionNotice(null), 4000);
        onRefresh?.();
      } catch (err: any) {
        console.error('Error restoring default ads:', err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Notice */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-md font-bold text-xs sm:text-sm flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-200 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">إدارة الإعلانات وأكواد HTML</h2>
              <p className="text-xs text-slate-500">
                الصق كود HTML، Google AdSense، أو بانرات ترويجية لعرضها في مختلف أقسام وصفحات الموقع.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestoreDefaults}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            title="استرجاع قوالب الإعلانات الجاهزة"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>قوالب جاهزة</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة إعلان جديد</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">إجمالي المساحات الإعلانية</span>
            <div className="text-2xl font-black text-slate-900">{ads.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Layout className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600">الإعلانات النشطة والمعروضة حالياً</span>
            <div className="text-2xl font-black text-emerald-700">{activeAdsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400">الأماكن المتاحة في المتجر</span>
            <div className="text-2xl font-black text-slate-900">9 أماكن</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Placements Guide & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>تصفية حسب مكان ظهور الإعلان في الموقع:</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedPlacementFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedPlacementFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({ads.length})
          </button>

          {(Object.keys(PLACEMENT_INFO) as AdPlacement[]).map((placementKey) => {
            const count = ads.filter((a) => a.placement === placementKey).length;
            const hasActive = ads.some((a) => a.placement === placementKey && a.is_active);

            return (
              <button
                key={placementKey}
                onClick={() => setSelectedPlacementFilter(placementKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedPlacementFilter === placementKey
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{PLACEMENT_INFO[placementKey].label}</span>
                {count > 0 ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedPlacementFilter === placementKey
                      ? 'bg-emerald-800 text-white'
                      : hasActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ads List Grid */}
      {filteredAds.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">لا توجد إعلانات في هذا القسم حالياً</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              يمكنك إضافة إعلان HTML جديد وتحديد مكانه ليظهر لزوار المتجر مباشرة، أو الضغط على "قوالب جاهزة".
            </p>
          </div>
          <button
            onClick={() => handleOpenAddModal(selectedPlacementFilter !== 'all' ? (selectedPlacementFilter as AdPlacement) : undefined)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة إعلان لهذا المكان</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredAds.map((ad) => {
            const placementDetails = PLACEMENT_INFO[ad.placement] || {
              label: ad.placement,
              description: 'مكان مخصص',
              icon: 'Layout'
            };

            return (
              <div
                key={ad.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  ad.is_active ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200 opacity-80'
                }`}
              >
                {/* Ad Card Header */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      ad.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{ad.title}</h3>
                        <span className="bg-slate-200/80 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                          <span>📍 {placementDetails.label}</span>
                        </span>
                        {ad.is_active ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>نشط ومعروض</span>
                          </span>
                        ) : (
                          <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            معطل
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{placementDetails.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleToggle(ad.id, ad.is_active)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        ad.is_active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={ad.is_active ? 'تعطيل الإعلان' : 'تفعيل الإعلان'}
                    >
                      {ad.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{ad.is_active ? 'معروض' : 'تفعيل'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(ad)}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="تعديل الكود والمكان"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(ad.id, ad.title)}
                      className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="حذف الإعلان"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Preview Container & Code Preview */}
                <div className="p-4 space-y-3">
                  {ad.notes && (
                    <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5 text-[11px] text-amber-800 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>{ad.notes}</span>
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-500">معاينة مباشرة للإعلان كما يظهر للزائر:</span>
                      <span className="text-[10px] font-mono text-slate-400">HTML / JS Render</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 min-h-[60px] flex items-center justify-center">
                      <div className="w-full">
                        <AdRenderer placement={ad.placement} ads={[ad]} />
                      </div>
                    </div>
                  </div>

                  {/* HTML Source Preview Toggle */}
                  <details className="text-xs group">
                    <summary className="cursor-pointer font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 select-none">
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>عرض كود HTML / Script ({ad.html_code.length} حرف)</span>
                    </summary>
                    <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap dir-ltr text-left">
                      {ad.html_code}
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  {editingAd ? 'تعديل بيانات وكود الإعلان' : 'إضافة إعلان HTML جديد'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4">
              {/* Title & Active State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان / اسم الإعلان <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: بانر تخفيضات رمضان"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحالة في الموقع</label>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      formIsActive
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-100 border-slate-300 text-slate-500'
                    }`}
                  >
                    {formIsActive ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    <span>{formIsActive ? 'نشط (معروض)' : 'معطل (مخفي)'}</span>
                  </button>
                </div>
              </div>

              {/* Placement Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مكان الظهور في الموقع <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPlacement}
                  onChange={(e) => setFormPlacement(e.target.value as AdPlacement)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                >
                  {(Object.keys(PLACEMENT_INFO) as AdPlacement[]).map((placementKey) => (
                    <option key={placementKey} value={placementKey}>
                      {PLACEMENT_INFO[placementKey].label} - {PLACEMENT_INFO[placementKey].description}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  📌 {PLACEMENT_INFO[formPlacement]?.description}
                </p>
              </div>

              {/* Ready Presets Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>قوالب HTML جاهزة (اضغط للصق الكود فوراً):</span>
                  </label>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {HTML_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormHtml(preset.code)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
                    >
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* HTML Code Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <span>كود الإعلان (HTML / CSS / JavaScript / Google AdSense) <span className="text-red-500">*</span></span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('code')}
                      className={`px-2 py-0.5 rounded-md ${previewTab === 'code' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                    >
                      كتابة الكود
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('preview')}
                      className={`px-2 py-0.5 rounded-md ${previewTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                    >
                      معاينة مباشرة
                    </button>
                  </div>
                </div>

                {previewTab === 'code' ? (
                  <textarea
                    required
                    rows={8}
                    dir="ltr"
                    placeholder="<div style='...'>\n  <a href='...'><img src='...' /></a>\n</div>"
                    value={formHtml}
                    onChange={(e) => setFormHtml(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-slate-900 text-slate-100 leading-relaxed text-left"
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[140px] max-h-[220px] overflow-y-auto">
                      {formHtml.trim() ? (
                        <div dangerouslySetInnerHTML={{ __html: formHtml }} />
                      ) : (
                        <div className="text-center text-xs text-slate-400 py-8">
                          اكتب كود HTML في خانة الكود لرؤية المعاينة المباشرة هنا.
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('code')}
                      className="text-[11px] text-emerald-600 hover:text-emerald-800 font-bold"
                    >
                      ← اضغط لتعديل الكود المصدري
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات داخلية (اختياري للأدمن)
                </label>
                <input
                  type="text"
                  placeholder="مثال: ينتهي العرض في نهاية الأسبوع"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'جاري الحفظ...' : editingAd ? 'حفظ التعديلات' : 'إضافة الإعلان'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
