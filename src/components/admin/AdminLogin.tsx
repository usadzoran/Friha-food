import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onGoHome?: () => void;
}

export default function AdminLogin({ onSuccess, onGoHome }: AdminLoginProps) {
  const { loginAdmin } = useApp();
  const [email, setEmail] = useState('admin@eshry.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = loginAdmin(email, password);
      if (success) {
        onSuccess();
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 dir-rtl font-cairo selection:bg-emerald-600 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        
        {/* LOGO & TITLE HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 text-white shadow-xl shadow-emerald-950/50 border border-emerald-400/20">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-kufi text-white tracking-wide">
              لوحة التحكم الإدارية
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              تسجيل الدخول للمسؤولين فقط (اشري من دارك)
            </p>
          </div>
        </div>

        {/* LOGIN FORM CARD */}
        <div className="bg-stone-900 border border-stone-800 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-700" />

          {error && (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800/80 text-red-200 text-sm flex items-center gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-right">
              <label className="block text-xs font-bold text-stone-300">
                البريد الإلكتروني للإدارة
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eshry.com"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3.5 px-4 pr-11 text-stone-100 text-sm placeholder-stone-600 focus:outline-none transition-colors"
                />
                <Mail className="w-5 h-5 text-stone-500 absolute top-3.5 right-3.5" />
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label className="block text-xs font-bold text-stone-300">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl py-3.5 px-4 pr-11 text-stone-100 text-sm placeholder-stone-600 focus:outline-none transition-colors"
                />
                <Lock className="w-5 h-5 text-stone-500 absolute top-3.5 right-3.5" />
              </div>
            </div>

            {/* DEMO CREDENTIALS HINT */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-300/80 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>بيانات التجربة المسبقة:</span>
              </div>
              <code className="bg-stone-950 px-2 py-0.5 rounded border border-emerald-800/50 text-emerald-200 text-[11px] font-mono">
                admin123
              </code>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-950/80 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول إلى النظام</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* GO BACK HOME LINK */}
        {onGoHome && (
          <div className="text-center pt-2">
            <button
              onClick={onGoHome}
              className="text-stone-400 hover:text-emerald-400 text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة إلى الموقع العام</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
