import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, UserPlus, Sparkles, Shield, Camera } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp, showToast } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoURL(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!email.trim() || !password || !username.trim()) {
          showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password, username.trim(), photoURL.trim(), bio.trim());
      } else {
        if (!email.trim() || !password) {
          showToast('يرجى كتابة البريد الإلكتروني أو اسم المستخدم وكلمة المرور', 'error');
          setLoading(false);
          return;
        }
        await signIn(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'حدث خطأ في التسجيل، حاول مجددًا', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-right animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white font-sans">
              {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE TOGGLE TABS */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              !isRegister
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500'
            }`}
          >
            تسجيل دخول
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              isRegister
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500'
            }`}
          >
            حساب جديد
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* USERNAME FIELD FOR REGISTER */}
          {isRegister && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                اسم المستخدم الفريد (@username) <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: ahmed_2026"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-2.5 px-3.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 dir-ltr"
              />
            </div>
          )}

          {/* EMAIL OR USERNAME FIELD */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              {isRegister ? 'البريد الإلكتروني' : 'البريد الإلكتروني أو اسم المستخدم'} <span className="text-pink-500">*</span>
            </label>
            <input
              type={isRegister ? 'email' : 'text'}
              required
              placeholder={isRegister ? 'name@example.com' : 'ادخل البريد أو @username'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-2.5 px-3.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 dir-ltr"
            />
          </div>

          {/* PASSWORD FIELD */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              كلمة المرور <span className="text-pink-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-2.5 px-3.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 dir-ltr"
            />
          </div>

          {/* BIO & AVATAR FOR REGISTER */}
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  صورة شخصية (اختياري)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'new'}`}
                    alt="معاينة"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/40 shrink-0"
                  />
                  <label className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-2">
                    <Camera className="w-4 h-4 text-pink-500" />
                    <span>اختر صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  نبذة شخصية (Bio)
                </label>
                <input
                  type="text"
                  placeholder="اكتب نبذة قصيرة عن نفسك..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-2.5 px-3.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-xl shadow-pink-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? 'جاري المعالجة...' : isRegister ? 'إنشاء الحساب' : 'دخول'}</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  await signIn('admin@instaclone.com', 'admin123');
                  onClose();
                } catch {
                  try {
                    await signUp('admin@instaclone.com', 'admin123', 'admin', '', 'حساب مسؤول النظام الرئيسي');
                    onClose();
                  } catch (e: any) {
                    showToast(e.message || 'تعذر الدخول كمسؤول', 'error');
                  }
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700"
            >
              <Shield className="w-4 h-4 text-purple-500" />
              <span>تسجيل دخول سريع كمسؤول (Admin Demo)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
