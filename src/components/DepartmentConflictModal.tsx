import React from 'react';
import { AlertTriangle, ShoppingBag, ArrowLeft, X } from 'lucide-react';

interface DepartmentConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategoryName: string;
  attemptedCategoryName?: string;
  attemptedProductName?: string;
  onOpenCurrentCart: () => void;
}

export const DepartmentConflictModal: React.FC<DepartmentConflictModalProps> = ({
  isOpen,
  onClose,
  activeCategoryName,
  attemptedCategoryName,
  attemptedProductName,
  onOpenCurrentCart
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-amber-200 text-center p-6 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Title & Message */}
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-black text-slate-800">
            تنبيه: سلة الطلب مرتبطة بقسم واحد فقط
          </h3>

          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 text-right space-y-2 text-sm text-slate-700">
            <p className="font-black text-amber-950 text-base flex items-start gap-2">
              <span className="text-amber-600 text-lg leading-none">⚠️</span>
              <span>
                لديك طلبية مفتوحة من قسم <span className="text-emerald-800 underline underline-offset-4">"{activeCategoryName}"</span>.
              </span>
            </p>
            <p className="text-amber-900 font-bold leading-relaxed pr-6 text-sm">
              أنهِي الطلبية الحالية أولًا.
            </p>
            {attemptedCategoryName && (
              <p className="text-xs text-slate-500 pt-1 pr-6">
                (لا يمكن خلط منتجات قسم "{attemptedCategoryName}" مع قسم "{activeCategoryName}" في نفس الطلبية)
              </p>
            )}
          </div>

          {attemptedProductName && (
            <p className="text-xs text-slate-500 italic">
              المنتج الذي حاولت إضافته: "{attemptedProductName}"
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenCurrentCart();
            }}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>العودة إلى طلبيتي</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>متابعة التصفح</span>
          </button>
        </div>
      </div>
    </div>
  );
};
