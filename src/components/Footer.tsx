import React from 'react';
import { Store, Heart, Shield, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white">اشري من دارك</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              منصتك الأولى للوصول لجميع المتاجر، السوبرماركت، المخابز، والصيدليات القريبة من منزلك بأسعارها المباشرة والتوصيل السريع.
            </p>
          </div>

          {/* Quick Categories */}
          <div className="space-y-2 text-xs">
            <h4 className="text-sm font-bold text-white mb-2">أبرز المتاجر</h4>
            <ul className="space-y-2 text-stone-400">
              <li>سوبرماركت ومؤونة منزلية</li>
              <li>مخابز ومعجنات طازجة</li>
              <li>خضار وفواكه عضوي</li>
              <li>مطاعم ومأكولات شائعة</li>
            </ul>
          </div>

          {/* Value Props */}
          <div className="space-y-2 text-xs">
            <h4 className="text-sm font-bold text-white mb-2">خدمة العملاء</h4>
            <ul className="space-y-2 text-stone-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>الدعم الفني: 800-ASHRI-00</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>البريد: support@ashri-darak.app</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>التغطية: جميع الأحياء والمدن الرئيسية</span>
              </li>
            </ul>
          </div>

          {/* App download badge */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white mb-2">تطبيق الهاتف</h4>
            <p className="text-stone-400 text-xs">حمل التطبيق واستمتع بتجربة طلب سهلة وسريعة للغاية.</p>
            <div className="inline-flex items-center gap-2 bg-stone-800 px-3 py-2 rounded-xl border border-stone-700 text-emerald-400 font-bold">
              <Shield className="w-4 h-4" />
              <span>تطبيق آمن ومعتمد 100%</span>
            </div>
          </div>

        </div>

        {/* Copyright Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <p>© {new Date().getFullYear()} تطبيق اشري من دارك. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">
            <span>صنع بكل</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" />
            <span>لخدمة المنازل والمتاجر المحلية</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
