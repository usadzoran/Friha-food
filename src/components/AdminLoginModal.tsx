import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck, KeyRound, User, Folder, LogIn, AlertCircle } from 'lucide-react';
import { DepartmentManager } from '../types';
import { authenticateDepartmentManager } from '../services/storeService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: () => void;
  onManagerLoginSuccess: (manager: DepartmentManager) => void;
  onOpenJoinUs?: () => void;
  initialUsername?: string;
  initialRole?: 'admin' | 'department_manager';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
  onManagerLoginSuccess,
  onOpenJoinUs,
  initialUsername = '',
  initialRole
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'manager'>('admin');
  
  // Super Admin Form
  const [adminPassword, setAdminPassword] = useState<string>('');
  
  // Department Manager Form
  const [managerUsername, setManagerUsername] = useState<string>('');
  const [managerPassword, setManagerPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialUsername) {
      setManagerUsername(initialUsername);
      setActiveTab('manager');
    } else if (initialRole) {
      setActiveTab(initialRole);
    }
  }, [initialUsername, initialRole, isOpen]);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = adminPassword.trim();
    if (cleanPass === 'admin123' || cleanPass === '1234' || cleanPass === 'admin') {
      onAdminLoginSuccess();
      setAdminPassword('');
      setError('');
      onClose();
    } else {
      setError('كلمة مرور الإدارة غير صحيحة. الافتراضية: admin123');
    }
  };

  const handleManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const manager = await authenticateDepartmentManager(managerUsername, managerPassword);
      if (manager) {
        onManagerLoginSuccess(manager);
        setManagerUsername('');
        setManagerPassword('');
        setError('');
        onClose();
      } else {
        setError('بيانات الدخول غير صحيحة. تأكد من اسم المستخدم أو رقم الهاتف وكلمة المرور المسجلة في الدعوة.');
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء التحقق: ' + err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-black">
              {activeTab === 'admin' ? 'تسجيل دخول الإدارة العامة' : 'تسجيل دخول صاحب قسم'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div className="bg-slate-100 p-1.5 border-b border-slate-200 flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('manager'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'manager'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-emerald-600" />
            <span>🏪 صاحب / مسؤول قسم</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>👑 المدير العام (Admin)</span>
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: DEPARTMENT MANAGER LOGIN */}
        {activeTab === 'manager' && (
          <form onSubmit={handleManagerSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="text-center space-y-1 pb-1">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 mb-2 border border-emerald-100">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">مرحباً بك في لوحة تحكم قسمك</h3>
              <p className="text-xs text-slate-500">
                أدخل اسم المستخدم (أو رقم الهاتف) وكلمة المرور المرسلة لك في رسالة الدعوة
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم المستخدم / أو رقم WhatsApp المسجل:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: dept_food_123 أو 0555123456"
                  value={managerUsername}
                  onChange={(e) => setManagerUsername(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50 font-mono"
                  autoFocus
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة المرور / الرمز السري:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="أدخل كلمة المرور..."
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50 font-mono"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري التحقق...' : 'دخول لوحة تحكم القسم'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: SUPER ADMIN LOGIN */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="text-center space-y-1 pb-1">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 mb-2 border border-amber-100">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">لوحة الإدارة العامة للمتجر</h3>
              <p className="text-xs text-slate-500 font-medium">
                يرجى إدخال رمز المرور الرئيسي للوصول إلى كافة إعدادات وأقسام وإعلانات المتجر
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة مرور الإدارة الرئيسية:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="أدخل رمز مرور المدير..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>تسجيل دخول المدير العام</span>
            </button>
          </form>
        )}

        {/* Join Us Helper Footer */}
        {onOpenJoinUs && (
          <div className="bg-amber-50/80 border-t border-amber-200/80 p-3.5 sm:p-4 text-center">
            <p className="text-xs text-amber-950 font-bold mb-1.5">
              هل أنت تاجر أو صاحب مشروع وتريد عرض منتجاتك على موقعنا؟
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenJoinUs();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all hover:scale-105"
            >
              <span>✨ انضم إلى الموقع واطلب فتح قسمك الآن</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
