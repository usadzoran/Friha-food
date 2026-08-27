import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Phone, 
  Briefcase, 
  MapPin, 
  FileText, 
  Layers,
  ArrowRight,
  Store,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { Category, JoinRequest } from '../types';
import { submitJoinRequest } from '../services/storeService';

interface JoinUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export const JoinUsModal: React.FC<JoinUsModalProps> = ({
  isOpen,
  onClose,
  categories
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [workType, setWorkType] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [wilaya, setWilaya] = useState('01 - أدرار');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<JoinRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('يرجى إدخال الاسم واللقب بشكل صحيح');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage('يرجى إدخال رقم هاتف / واتساب صالح للتواصل معك وإرسال الدعوة');
      return;
    }

    if (!workType.trim()) {
      setErrorMessage('يرجى تحديد نوع العمل أو النشاط التجاري');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
      const categoryNote = selectedCategory ? ` [القسم المرغوب: ${selectedCategory.name}]` : '';
      
      const newReq = await submitJoinRequest({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        work_type: `${workType.trim()}${categoryNote}`,
        wilaya: wilaya.trim(),
        notes: notes.trim()
      });

      setSubmittedData(newReq);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting join request:', err);
      setErrorMessage('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setFirstName('');
    setLastName('');
    setPhone('');
    setWorkType('');
    setSelectedCategoryId('');
    setNotes('');
    setErrorMessage('');
    onClose();
  };

  const ALGERIAN_WILAYAS = [
    '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة',
    '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
    '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو',
    '16 - الجزائر العاصمة', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
    '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة',
    '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
    '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس',
    '36 - الطارف', '37 - تندوف', '38 - تسمسيلت', '39 - الوادي', '40 - خنشلة',
    '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة',
    '46 - عين تموشنت', '47 - غرداية', '48 - غليزان', '49 - تيميمون', '50 - برج باجي مختار',
    '51 - أولاد جلال', '52 - بني عباس', '53 - عين صالح', '54 - عين قزام', '55 - تقرت',
    '56 - جانت', '57 - المغير', '58 - المنيعة'
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
    >
      <div 
        id="join-us-modal-card"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 mb-1">
                فرصة شراكة وعمل 🚀
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                انضم إلى فريق الموقع
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed pr-1">
            كن شريكاً في منصة <span className="font-bold text-white">"اشري من دارك"</span> كمسؤول قسم أو تاجر، وسيقوم المشرف العام بمراجعة بياناتك وإرسال دعوة خاصة لك مع معلومات الدخول عبر الواتساب.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-6 space-y-5 animate-in fade-in slide-in-from-bottom-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-emerald-50 shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800">
                  تم إرسال طلبك بنجاح! 🎉
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  شكراً لك أخي الكريم <span className="font-bold text-emerald-700">{firstName} {lastName}</span>. تم تحويل طلبك مباشرة إلى الإدارة العامة.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-right space-y-2 text-xs sm:text-sm text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>الخطوة القادمة:</span>
                </div>
                <p className="text-xs text-amber-800/90 leading-relaxed">
                  يقوم المشرف العام حالياً بمراجعة طلبك، وسيصلك إشعار ودعوة عبر الواتساب على الرقم (<span className="font-mono font-bold">{phone}</span>) تحتوي على:
                </p>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1 font-medium pr-1">
                  <li>اسم المستخدم الخاص بك (Username)</li>
                  <li>كلمة المرور السرية (Password)</li>
                  <li>رابط الدخول المباشر لإدارة منتجاتك وطلباتك</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg transition-all"
                >
                  العودة للمتجر الرئيسي
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الاسم الأول <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: عبد الوهاب"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>اللقب (اسم العائلة) <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: بن علي"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>رقم الهاتف / الواتساب <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">(لاستقبال دعوة الدخول)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 0661234567 أو 0550123456"
                    className="w-full px-3.5 py-2.5 pl-20 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-left"
                    dir="ltr"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-xs font-bold text-slate-400 border-r border-slate-200 pr-2">
                    🇩🇿 +213
                  </div>
                </div>
              </div>

              {/* Work Type & Profession */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    <span>نوع العمل / النشاط التجاري <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    placeholder="مثال: تاجر تمور، منتج عسل، صانع تقليدي، مورد..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الولاية</span>
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>القسم المقترح لإدارته أو عرض منتجاتك به</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">-- اختر القسم الأقرب لنشاطك (اختياري) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="new_category">✨ اقتراح قسم / تصنيف جديد</option>
                </select>
              </div>

              {/* Notes / Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>نبذة عن المنتجات أو ملاحظات إضافية</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أكتب نبذة مختصرة عن المنتجات التي توفرها، أسعارك، أو أي تفاصيل تساعد الإدارة في قبول طلبك سريعاً..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Guarantees Box */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block text-emerald-800">ضمان الخصوصية والسرعة:</span>
                  بياناتك تُرسل مباشرة وبشكل آمن للوحة تحكم المدير العام. ستتلقى دعوة خاصة تحتوي على بيانات الحساب فور تدقيق المعلومات.
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري إرسال البيانات للادمن...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-emerald-200" />
                      <span>إرسال طلب الانضمام الآن</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
