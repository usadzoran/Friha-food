import React from 'react';
import { CheckCircle2, PhoneCall, ShoppingBag } from 'lucide-react';

interface OrderSuccessModalProps {
  orderNumber: string | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderNumber,
  onClose
}) => {
  if (!orderNumber) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center space-y-5 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Check Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">
            تم إرسال طلبك بنجاح!
          </h2>
          <p className="text-sm font-bold text-emerald-700 bg-emerald-50 py-2 px-3 rounded-xl border border-emerald-100 max-w-xs mx-auto">
            سنتواصل معك لتأكيد الطلب.
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold border-b border-slate-200 pb-2">
            <span>رقم الطلب الخاص بك:</span>
            <span className="font-mono text-emerald-700 font-black text-sm bg-white px-2.5 py-0.5 rounded border border-slate-200">
              {orderNumber}
            </span>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
            <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>يرجى إبقاء هاتفك قريباً منك، سيتصل بك فريق الخدمة لتأكيد العنوان وموعد التوصيل.</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>العودة للمتجر ومتابعة التسوق</span>
        </button>
      </div>
    </div>
  );
};
