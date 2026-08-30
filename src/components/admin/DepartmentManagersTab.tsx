import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  ShieldCheck, 
  Folder, 
  LogIn, 
  KeyRound, 
  User, 
  CheckCircle2, 
  XCircle, 
  X, 
  Check, 
  Copy, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Clock
} from 'lucide-react';
import { DepartmentManager, Category } from '../../types';
import { 
  saveDepartmentManager, 
  deleteDepartmentManager, 
  toggleDepartmentManagerActive 
} from '../../services/storeService';
import { normalizeAlgerianWhatsAppNumber } from '../../utils/whatsappOrder';

interface DepartmentManagersTabProps {
  managers: DepartmentManager[];
  categories: Category[];
  onLoginAsManager?: (manager: DepartmentManager) => void;
}

export const DepartmentManagersTab: React.FC<DepartmentManagersTabProps> = ({
  managers,
  categories,
  onLoginAsManager
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<DepartmentManager | null>(null);
  
  // Form fields
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [passwordPlain, setPasswordPlain] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Open modal for new manager
  const handleOpenAdd = () => {
    setEditingManager(null);
    setManagerName('');
    setPhone('');
    setUsername('');
    setPasswordPlain('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setNotes('');
    setIsActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (mgr: DepartmentManager) => {
    setEditingManager(mgr);
    setManagerName(mgr.manager_name);
    setPhone(mgr.phone);
    setUsername(mgr.username);
    setPasswordPlain(mgr.password_plain);
    setCategoryId(mgr.category_id);
    setNotes(mgr.notes || '');
    setIsActive(mgr.is_active);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Save / Update manager
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName.trim()) {
      setErrorMsg('يرجى إدخال اسم المسؤول.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم هاتف مسؤول القسم.');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('يرجى تحديد اسم مستخدم للدخول.');
      return;
    }
    if (!passwordPlain.trim()) {
      setErrorMsg('يرجى كتابة كلمة المرور.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('يرجى اختيار القسم التابع له.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const selectedCat = categories.find(c => c.id === categoryId);
      await saveDepartmentManager({
        id: editingManager ? editingManager.id : undefined,
        manager_name: managerName.trim(),
        phone: phone.trim(),
        username: username.trim().toLowerCase(),
        password_plain: passwordPlain.trim(),
        category_id: categoryId,
        category_name: selectedCat ? selectedCat.name : '',
        notes: notes.trim(),
        is_active: isActive,
        created_at: editingManager ? editingManager.created_at : undefined,
        last_login_at: editingManager ? editingManager.last_login_at : undefined
      });

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving department manager:', err);
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ مسؤول القسم في Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete manager
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف حساب مسؤول القسم (${name}) نهائياً؟`)) {
      return;
    }
    try {
      await deleteDepartmentManager(id);
    } catch (err: any) {
      alert(err?.message || 'فشل حذف مسؤول القسم.');
    }
  };

  // Toggle active status
  const handleToggleActive = async (mgr: DepartmentManager) => {
    try {
      await toggleDepartmentManagerActive(mgr.id, !mgr.is_active);
    } catch (err: any) {
      alert(err?.message || 'فشل تعديل حالة التفعيل.');
    }
  };

  // Copy credentials
  const handleCopyCredentials = (mgr: DepartmentManager) => {
    const text = `بيانات الدخول للوحة تحكم قسم (${mgr.category_name || 'القسم'}):\nاسم المستخدم: ${mgr.username}\nكلمة المرور: ${mgr.password_plain}`;
    navigator.clipboard.writeText(text);
    setCopiedId(mgr.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered managers
  const filteredManagers = managers.filter(m => {
    const matchSearch = 
      m.manager_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      (m.category_name && m.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCat = selectedCategoryFilter === 'all' || m.category_id === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>مسؤولو وتجار الأقسام المستقلة</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {managers.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة حسابات التجار ومسؤولي الأقسام، ضبط صلاحياتهم، ومتابعة نشاطهم على المتجر.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مسؤول قسم جديد</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، اسم المستخدم، الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">تصفية حسب القسم:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">جميع الأقسام ({managers.length})</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Managers List Grid */}
      {filteredManagers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
            <Users className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-700 mb-1">لا يوجد مسؤولو أقسام حالياً</h4>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            {searchTerm || selectedCategoryFilter !== 'all' 
              ? 'لم يتم العثور على أي نتائج مطابقة لمعايير البحث.' 
              : 'يمكنك إضافة مسؤولي أقسام وتعيينهم للأقسام التجارية لتسهيل إدارة الطلبات والمنتجات.'}
          </p>
          {(searchTerm || selectedCategoryFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategoryFilter('all'); }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredManagers.map((mgr) => {
            const cat = categories.find(c => c.id === mgr.category_id);
            const displayCatName = mgr.category_name || (cat ? cat.name : 'قسم غير محدد');
            const cleanPhone = normalizeAlgerianWhatsAppNumber(mgr.phone);

            return (
              <div 
                key={mgr.id} 
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  mgr.is_active 
                    ? 'border-slate-200/80 hover:shadow-md hover:border-emerald-200' 
                    : 'border-rose-200/60 bg-rose-50/20 opacity-75'
                }`}
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base ${
                        mgr.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                          <span>{mgr.manager_name}</span>
                          {!mgr.is_active && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                              معطل
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold mt-0.5">
                          <Folder className="w-3.5 h-3.5" />
                          <span>{displayCatName}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(mgr)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                        mgr.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                      title={mgr.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                    >
                      {mgr.is_active ? 'مفعل' : 'معطل'}
                    </button>
                  </div>

                  {/* Credentials Box */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">اسم المستخدم:</span>
                      <span className="font-bold text-slate-800 font-mono">@{mgr.username}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">كلمة المرور:</span>
                      <span className="font-bold text-emerald-700 font-mono">{mgr.password_plain}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">رقم الهاتف:</span>
                      <span className="font-bold text-slate-700">{mgr.phone}</span>
                    </div>
                    {mgr.last_login_at && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[11px] text-slate-400 font-sans">
                        <span>آخر دخول:</span>
                        <span>{new Date(mgr.last_login_at).toLocaleDateString('ar-DZ')}</span>
                      </div>
                    )}
                  </div>

                  {mgr.notes && (
                    <p className="text-xs text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100/60 mb-3">
                      📝 {mgr.notes}
                    </p>
                  )}
                </div>

                {/* Actions bottom */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyCredentials(mgr)}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="نسخ بيانات الدخول"
                    >
                      {copiedId === mgr.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`مرحباً أخي ${mgr.manager_name}، رابط لوحة تحكم قسمك: ${window.location.origin}\nاسم المستخدم: ${mgr.username}\nكلمة المرور: ${mgr.password_plain}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="إرسال بيانات الدخول عبر WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    {onLoginAsManager && (
                      <button
                        onClick={() => onLoginAsManager(mgr)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
                        title="دخول فوري كمسؤول هذا القسم"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>دخول كمسؤول</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(mgr)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل البيانات"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mgr.id, mgr.manager_name)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="حذف المسؤول"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 my-8">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{editingManager ? 'تعديل بيانات مسؤول القسم' : 'إضافة مسؤول قسم جديد'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-emerald-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Manager Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المسؤول / التاجر الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عبد الوهاب بلخير"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Category Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  القسم المخصص له <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="" disabled>اختر القسم التجاري</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone & WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم الهاتف و WhatsApp الخاص بالقسم <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="06XXXXXXXX أو 07XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  dir="ltr"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  يُستخدم هذا الرقم لاستقبال طلبيات الزبائن وتأكيدها عبر WhatsApp.
                </span>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم المستخدم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="user_dept"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    كلمة المرور <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pass@1234"
                    value={passwordPlain}
                    onChange={(e) => setPasswordPlain(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات إدارية (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="أي معلومات إضافية عن التاجر أو المتجر..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                  تفعيل حساب المسؤول والسماح له بتسجيل الدخول
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'جارٍ الحفظ في Supabase...' : editingManager ? 'حفظ التعديلات' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
