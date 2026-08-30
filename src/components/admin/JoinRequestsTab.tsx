import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Phone, 
  Briefcase, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Key, 
  User, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Eye,
  Sparkles,
  Store
} from 'lucide-react';
import { JoinRequest, Category, DepartmentManager } from '../../types';
import { 
  updateJoinRequest, 
  deleteJoinRequest, 
  approveAndInviteJoinRequest,
  addCategory
} from '../../services/storeService';

interface JoinRequestsTabProps {
  requests: JoinRequest[];
  categories: Category[];
  managers: DepartmentManager[];
  onRefresh?: () => void;
}

export const JoinRequestsTab: React.FC<JoinRequestsTabProps> = ({
  requests,
  categories,
  managers,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  
  // Invitation Form Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);
  const [customNewCategoryName, setCustomNewCategoryName] = useState('');
  const [assignedCategoryId, setAssignedCategoryId] = useState('');
  const [assignedUsername, setAssignedUsername] = useState('');
  const [assignedPassword, setAssignedPassword] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Invitation Success & Sharing Modal State
  const [successModalData, setSuccessModalData] = useState<{
    whatsappUrl: string;
    invitationText: string;
    username: string;
    passwordPlain: string;
    managerName: string;
    categoryName: string;
  } | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      req.first_name.toLowerCase().includes(term) ||
      req.last_name.toLowerCase().includes(term) ||
      req.phone.includes(term) ||
      req.work_type.toLowerCase().includes(term) ||
      (req.wilaya && req.wilaya.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;

  const handleOpenInviteModal = (req: JoinRequest) => {
    setSelectedRequest(req);
    setErrorMsg('');
    
    // Auto-generate username from applicant name + random suffix
    const cleanFirstName = req.first_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'manager';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const suggestedUsername = `${cleanFirstName}_${randomSuffix}`;
    
    // Auto-generate password
    const suggestedPassword = `dz${Math.floor(100000 + Math.random() * 900000)}`;

    setAssignedUsername(suggestedUsername);
    setAssignedPassword(suggestedPassword);
    
    // Suggested custom category name from applicant's work type
    const rawWork = req.work_type.replace(/\[.*\]/, '').trim();
    setCustomNewCategoryName(rawWork || `قسم ${req.first_name}`);
    setIsNewCategoryMode(false);

    // Try to auto-select matching category if present
    if (categories.length > 0) {
      setAssignedCategoryId(categories[0].id);
    } else {
      setAssignedCategoryId('');
      setIsNewCategoryMode(true);
    }

    setInviteNotes('');
    setIsInviteModalOpen(true);
  };

  const handleConfirmApprovalAndInvite = async () => {
    if (!selectedRequest) return;
    setErrorMsg('');

    if (!isNewCategoryMode && !assignedCategoryId) {
      setErrorMsg('يرجى تحديد القسم المخصص لهذا المسؤول');
      return;
    }

    if (isNewCategoryMode && !customNewCategoryName.trim()) {
      setErrorMsg('يرجى إدخال اسم القسم الجديد');
      return;
    }

    if (!assignedUsername.trim()) {
      setErrorMsg('يرجى إدخال اسم مستخدم صحيح');
      return;
    }

    if (!assignedPassword.trim() || assignedPassword.trim().length < 4) {
      setErrorMsg('يرجى إدخال كلمة مرور من 4 أحرف على الأقل');
      return;
    }

    setIsProcessing(true);

    try {
      let targetCategoryId = assignedCategoryId;
      let targetCategoryName = '';

      if (isNewCategoryMode) {
        const cleanCatName = customNewCategoryName.trim();
        const createdCatId = await addCategory({
          name: cleanCatName,
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
          whatsapp_number: selectedRequest.phone.trim(),
          icon: 'Store'
        });
        targetCategoryId = createdCatId || 'general';
        targetCategoryName = cleanCatName;
      } else {
        const targetCategory = categories.find((c) => c.id === assignedCategoryId);
        targetCategoryName = targetCategory ? targetCategory.name : 'عام';
      }

      const result = await approveAndInviteJoinRequest({
        requestId: selectedRequest.id,
        categoryId: targetCategoryId,
        categoryName: targetCategoryName,
        username: assignedUsername.trim().toLowerCase(),
        passwordPlain: assignedPassword.trim(),
        notes: inviteNotes.trim()
      });

      setIsInviteModalOpen(false);
      setSuccessModalData({
        whatsappUrl: result.whatsappUrl,
        invitationText: result.invitationText,
        username: assignedUsername.trim().toLowerCase(),
        passwordPlain: assignedPassword.trim(),
        managerName: `${selectedRequest.first_name} ${selectedRequest.last_name}`,
        categoryName: targetCategoryName
      });

      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Error approving join request:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء إنشاء الحساب وإرسال الدعوة');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (req: JoinRequest) => {
    if (window.confirm(`هل أنت متأكد من رفض طلب الانضمام المقدم من ${req.first_name} ${req.last_name}؟`)) {
      await updateJoinRequest(req.id, { status: 'rejected' });
      if (onRefresh) onRefresh();
    }
  };

  const handleDelete = async (req: JoinRequest) => {
    if (window.confirm(`هل تريد بالتأكيد حذف هذا الطلب نهائياً من النظام؟`)) {
      await deleteJoinRequest(req.id);
      if (onRefresh) onRefresh();
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">طلبات بانتظار المراجعة</span>
            <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">تم قبولهم وإرسال الدعوة</span>
            <div className="text-2xl font-black text-emerald-600">{approvedCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي طلبات الانضمام</span>
            <div className="text-2xl font-black text-slate-800">{requests.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، رقم الواتساب، نوع العمل..."
            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({requests.length})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>قيد الانتظار ({pendingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم قبولهم ({approvedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            المرفوضة
          </button>
        </div>
      </div>

      {/* Requests List Table / Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <UserPlus className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-700">لا توجد طلبات انضمام مطابقة</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            عند قيام أي مستخدم أو تاجر بالضغط على زر "انضم إلى الموقع" وإرسال بياناته، ستظهر تفاصيل طلبه هنا مباشرة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => {
            const fullName = `${req.first_name} ${req.last_name}`;
            const isApproved = req.status === 'approved';
            const isPending = req.status === 'pending';
            const isRejected = req.status === 'rejected';

            // Prepare quick WhatsApp link
            let cleanPhone = req.phone.replace(/[^0-9]/g, '');
            if (cleanPhone.startsWith('0')) cleanPhone = '213' + cleanPhone.substring(1);

            return (
              <div 
                key={req.id} 
                className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs transition-all ${
                  isPending 
                    ? 'border-amber-200 hover:border-amber-400 bg-gradient-to-b from-amber-50/20 to-white' 
                    : isApproved
                    ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/20 to-white'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner ${
                      isPending 
                        ? 'bg-amber-100 text-amber-800' 
                        : isApproved 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                        {fullName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-mono text-emerald-700 font-bold" dir="ltr">
                          <Phone className="w-3 h-3" />
                          {req.phone}
                        </span>
                        {req.wilaya && (
                          <span className="flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">
                            <MapPin className="w-2.5 h-2.5 text-slate-400" />
                            {req.wilaya}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>قيد المراجعة</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>تم قبول الطلب</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3 h-3" />
                        <span>مرفوض</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Body */}
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      <span>نوع العمل / النشاط:</span>
                    </div>
                    <p className="text-slate-800 font-medium pr-5 leading-relaxed">
                      {req.work_type}
                    </p>
                  </div>

                  {req.notes && (
                    <div className="p-3 bg-slate-50/80 rounded-xl space-y-1 border border-slate-100 text-[11px]">
                      <span className="text-slate-500 font-bold block">ملاحظات ونبذة:</span>
                      <p className="text-slate-700 leading-relaxed">{req.notes}</p>
                    </div>
                  )}

                  {/* Approved Credentials Snapshot */}
                  {isApproved && req.assigned_username && (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-emerald-700" />
                          بيانات الدخول المسلّمة:
                        </span>
                        {req.assigned_category_name && (
                          <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-md">
                            قسم: {req.assigned_category_name}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                        <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-100">
                          <span className="text-slate-400 block text-[9px]">اسم المستخدم:</span>
                          <span className="font-bold text-slate-900">{req.assigned_username}</span>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-100">
                          <span className="text-slate-400 block text-[9px]">كلمة المرور:</span>
                          <span className="font-bold text-slate-900">{req.assigned_password}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      تاريخ الطلب: {new Date(req.created_at).toLocaleDateString('ar-DZ')}
                    </span>
                    {req.reviewed_at && (
                      <span>تمت المراجعة: {new Date(req.reviewed_at).toLocaleDateString('ar-DZ')}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleOpenInviteModal(req)}
                        className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>قبول الطلب وإرسال الدعوة</span>
                      </button>

                      <button
                        onClick={() => handleReject(req)}
                        className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors"
                        title="رفض الطلب"
                      >
                        رفض
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => handleOpenInviteModal(req)}
                      className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-600" />
                      <span>تعديل الحساب أو إعادة إرسال الدعوة</span>
                    </button>
                  )}

                  {/* Direct WhatsApp chat button */}
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl border border-green-200 transition-colors"
                    title="محادثة واتساب مباشرة"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(req)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="حذف الطلب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Invite & Credentials Form */}
      {isInviteModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 sm:p-6 relative">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="absolute top-4 left-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    قبول الطلب وتوليد بيانات الدخول
                  </h3>
                  <p className="text-xs text-emerald-100">
                    للمتقدم: <span className="font-bold text-white">{selectedRequest.first_name} {selectedRequest.last_name}</span> ({selectedRequest.phone})
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Department assignment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>القسم المخصص لهذا المسؤول <span className="text-red-500">*</span></span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewCategoryMode(!isNewCategoryMode)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isNewCategoryMode ? 'اختيار من الأقسام الحالية' : '✨ إنشاء قسم جديد بالكامل للمتقدم'}</span>
                  </button>
                </div>

                {isNewCategoryMode ? (
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-2">
                    <label className="block text-xs font-bold text-emerald-950">
                      اسم القسم الجديد المراد إنشاؤه له:
                    </label>
                    <input
                      type="text"
                      value={customNewCategoryName}
                      onChange={(e) => setCustomNewCategoryName(e.target.value)}
                      placeholder="مثال: قسم التمور، قسم الأواني، إلخ..."
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-emerald-800 block">
                      💡 سيتم إنشاء وتجهيز هذا القسم التجاري تلقائياً وربطه مباشرة بهذا المسؤول.
                    </span>
                  </div>
                ) : (
                  <select
                    value={assignedCategoryId}
                    onChange={(e) => setAssignedCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value="">-- اختر القسم --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
                
                <p className="text-[11px] text-slate-400">
                  سيتمكن هذا المسؤول من إدارة وتعديل كامل تفاصيل هذا القسم ومنتجاته وطلبياته عبر لوحة تحكمه.
                </p>
              </div>

              {/* Credentials inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>اسم المستخدم (Username) <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={assignedUsername}
                    onChange={(e) => setAssignedUsername(e.target.value)}
                    placeholder="مثال: wahab_2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>كلمة المرور (Password) <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={assignedPassword}
                    onChange={(e) => setAssignedPassword(e.target.value)}
                    placeholder="مثال: dz938481"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left font-bold"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ملاحظات الإدارة
                </label>
                <textarea
                  rows={2}
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  placeholder="أي تفاصيل أو شروط خاصة متفق عليها..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Automatic Actions Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>ماذا سيحدث عند الضغط على تأكيد؟</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pr-1 text-[11px] text-amber-800/90">
                  <li>سيتم إنشاء حساب مشرف قسم فوري ونشط في النظام بهذه البيانات.</li>
                  <li>سيتم إعداد رسالة دعوة رسمية موجهة ومجهزة للإرسال عبر الواتساب مباشرة.</li>
                </ul>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmApprovalAndInvite}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري إنشاء الحساب...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-emerald-200" />
                      <span>تأكيد وإنشاء الدعوة</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Invitation WhatsApp Dispatcher & Success */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="bg-emerald-800 text-white p-5 sm:p-6 text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border-4 border-emerald-50 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black">
                تم إنشاء حساب المشرف بنجاح! 🚀
              </h3>
              <p className="text-xs text-emerald-100">
                أصبح بإمكان <span className="font-bold text-white">{successModalData.managerName}</span> الدخول الآن إلى لوحة تحكم قسم ({successModalData.categoryName}).
              </p>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Credentials Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-slate-500 block">معلومات الدخول المخصصة:</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono">
                    <span className="text-slate-400 block text-[10px]">اسم المستخدم:</span>
                    <span className="font-bold text-slate-900 text-sm">{successModalData.username}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono">
                    <span className="text-slate-400 block text-[10px]">كلمة المرور:</span>
                    <span className="font-bold text-slate-900 text-sm">{successModalData.passwordPlain}</span>
                  </div>
                </div>
              </div>

              {/* Message preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">نص رسالة الدعوة المجهزة للواتساب:</span>
                <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {successModalData.invitationText}
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2 pt-2">
                {/* Send WhatsApp Button */}
                <a
                  href={successModalData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>فتح تطبيق الواتساب وإرسال الدعوة الآن 📱</span>
                </a>

                {/* Copy Text Button */}
                <button
                  type="button"
                  onClick={() => handleCopyText(successModalData.invitationText)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedInvite ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>تم نسخ نص الدعوة إلى الحافظة!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>نسخ نص الدعوة وبيانات الدخول</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSuccessModalData(null)}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 font-medium text-xs transition-colors text-center"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
