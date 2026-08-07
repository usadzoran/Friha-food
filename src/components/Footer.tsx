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
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-700 flex items-center justify-center transition-colors duration-200 shadow-xs"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-700 flex items-center justify-center transition-colors duration-200 shadow-xs"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-700 flex items-center justify-center transition-colors duration-200 shadow-xs"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href="https://whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-700 flex items-center justify-center transition-colors duration-200 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>

        {/* PRIVACY POLICY LINK */}
        <div className="order-2 md:order-3">
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="text-xs sm:text-sm font-semibold text-stone-600 hover:text-emerald-700 transition-colors duration-200 cursor-pointer underline decoration-stone-300 underline-offset-4 hover:decoration-emerald-500"
          >
            سياسة الخصوصية
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
