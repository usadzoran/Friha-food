import React, { useState } from 'react';
import { SUPABASE_SQL_SCHEMA, getSupabaseConfig, saveSupabaseConfig } from '../../services/supabase';
import { Database, Copy, Check, Save, ExternalLink } from 'lucide-react';

export const SupabaseConfigModal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
        <h3 className="text-xl font-bold font-cairo text-stone-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <span>إعدادات قاعدة البيانات Supabase</span>
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          المنصة تعمل فورياً ومباشرة عبر التخزين المحلي. للربط المباشر مع مشروع Supabase حقيقي وقاعدة بيانات PostgreSQL، يمكنك نسخ الكود البرمجي التالي ووضعه في محرّر SQL في Supabase.
        </p>
      </div>

      {/* SUPABASE URL & KEY FORM */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h4 className="text-base font-bold font-cairo text-stone-900 flex items-center gap-2">
          <span>ربط مفاتيح Supabase</span>
        </h4>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
            تم حفظ مفاتيح Supabase بنجاح!
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              dir="ltr"
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Supabase Anon Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              dir="ltr"
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>حفظ المفاتيح</span>
          </button>
        </form>
      </div>

      {/* SQL SCHEMA GENERATOR */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold font-cairo text-stone-900">
              مخطط الهيكلة PostgreSQL SQL (Schema & RLS)
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              يتضمن الجداول المطلوبة: stores, categories, products, orders, order_items, admins مع العلاقات والـ Foreign Keys و RLS.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="bg-stone-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80 border border-stone-800 dir-ltr text-left">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        <div className="pt-2 text-xs text-stone-500 flex items-center justify-between">
          <span>افتح لوحة تحكم Supabase الخاص بك ← اختر SQL Editor ← الصق الكود ثم اضغط Run</span>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-700 hover:underline font-bold flex items-center gap-1"
          >
            <span>لوحة Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
