import React, { useState } from 'react';
import { Lock, Shield, ArrowRight, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin password is 'admin123'
    if (password === 'admin123' || password === 'admin') {
      onLoginSuccess();
    } else {
      setError('كلمة المرور غير صحيحة. الكلمة الافتراضية هي: admin123');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-stone-800">
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للموقع</span>
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold font-cairo text-stone-900">
            لوحة إدارة "اشري من دارك"
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            منطقة مخصصة لمدير المنصة لتسيير المتاجر، المنتجات والطلبات
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>كلمة مرور المدير</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="أدخل كلمة المرور (الافتراضية: admin123)"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Lock className="w-4 h-4" />
            <span>تسجيل الدخول للوحة التحكم</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100">
          <p className="text-[11px] text-stone-400">
            كلمة المرور الافتراضية للم تجريب: <span className="font-mono text-stone-700 font-bold">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
};
