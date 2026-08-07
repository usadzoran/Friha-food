import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col items-center justify-center p-6 text-center font-sans dir-rtl">
      <div className="max-w-md bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          ✨
        </div>
        <h1 className="text-2xl font-bold text-stone-900">مشروع جديد ونظيف</h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          تم تنظيف ومسح كامل للملفات السابقة والقواعد والمكونات والبيانات. التطبيق جاهز تماماً للبدء من جديد وفقاً لتعليماتك القادمة.
        </p>
      </div>
    </div>
  );
}
