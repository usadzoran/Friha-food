import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, MessageCircle, ShieldCheck, X } from 'lucide-react';

export default function Footer() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <footer className="w-full bg-white/80 backdrop-blur-md border-t border-stone-200/80 py-6 px-4 sm:px-8 mt-12 transition-all">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right font-cairo">
        
        {/* COPYRIGHT INFORMATION */}
        <div className="text-xs sm:text-sm text-stone-500 font-medium order-3 md:order-1">
          جميع الحقوق محفوظة © {new Date().getFullYear()} <span className="font-bold text-emerald-800">اشري من دارك</span>
        </div>

        {/* SOCIAL MEDIA ICONS (CENTERED ON MOBILE & DESKTOP) */}
        <div className="flex items-center justify-center gap-3 order-1 md:order-2">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-blue-600 text-stone-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-stone-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-rose-500/20 hover:-translate-y-0.5"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-sky-500 text-stone-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-sky-500/20 hover:-translate-y-0.5"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-emerald-600 text-stone-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>

        {/* PRIVACY POLICY & ADMIN LINKS */}
        <div className="order-2 md:order-3 flex items-center justify-center gap-4">
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="text-xs sm:text-sm font-semibold text-stone-600 hover:text-emerald-700 transition-colors duration-200 cursor-pointer underline decoration-stone-300 underline-offset-4 hover:decoration-emerald-500"
          >
            سياسة الخصوصية
          </button>
          <span className="text-stone-300">•</span>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/admin');
              window.dispatchEvent(new Event('popstate'));
            }}
            className="text-xs sm:text-sm font-semibold text-stone-600 hover:text-emerald-700 transition-colors duration-200 cursor-pointer flex items-center gap-1.5 hover:underline"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>لوحة الإدارة</span>
          </button>
        </div>
      </div>

      {/* PRIVACY POLICY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200 font-cairo text-right">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-emerald-800 mb-4">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-xl font-bold">سياسة الخصوصية</h3>
            </div>

            <div className="space-y-3 text-stone-600 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pl-2">
              <p>
                نحن في <strong className="text-stone-800">اشري من دارك</strong> نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية.
              </p>
              <p>
                - يتم استخدام البيانات المدخلة حصراً لتسليم الطلبات والتواصل معك بشأن حالة الشراء.
              </p>
              <p>
                - نقوم بتشفير وحماية كافة الاتصالات وفق أعلى معايير الأمان الرقمي.
              </p>
              <p>
                - لا نقوم بمشاركة أو بيع معلوماتك الشخصية لأي أطراف ثالثة.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
