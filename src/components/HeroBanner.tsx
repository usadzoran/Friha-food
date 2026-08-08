import React from 'react';
import { Truck, Clock, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white shadow-lg my-6">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Content */}
        <div className="space-y-4 text-center md:text-right max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تسوق مقاضيك من المتاجر الأقرب لدارك</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
            كل طلبات منزلك من <span className="text-amber-300 underline underline-offset-8 decoration-amber-400/50">المتاجر المحلية</span> بضغطة زر 🏠
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm font-normal leading-relaxed">
            استكشف السوبرماركت، المخابز، الخضار الطازج، والمطاعم المجاورة بأسعارها الحقيقية وتوصيل مباشر سريع حتى العتبة.
          </p>

          {/* Value Props Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-medium text-emerald-50">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <Truck className="w-4 h-4 text-amber-300" />
              <span>توصيل سريع خلال دقائق</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>تتبع مباشر للطلب</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>ضمان الجودة والطزاجة</span>
            </div>
          </div>
        </div>

        {/* Right Illustration Badge */}
        <div className="shrink-0 relative hidden sm:flex items-center justify-center">
          <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-4 relative shadow-2xl">
            <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 flex flex-col items-center justify-center text-stone-900 shadow-inner p-3 text-center">
              <ShoppingBag className="w-10 h-10 mb-1 text-stone-900 animate-bounce" />
              <span className="font-extrabold text-xs">أفضل عروض المتاجر</span>
              <span className="text-[10px] text-stone-800 font-bold bg-white/80 px-2 py-0.5 rounded-full mt-1">توصيل مجاني 🛵</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
