import React from 'react';
import { CheckCircle2, ShoppingBag, MessageSquare, ExternalLink, ArrowLeft } from 'lucide-react';
import { CartItem, Category, CustomerInfo, AdSlot } from '../types';
import { 
  buildDepartmentWhatsAppMessage, 
  buildWhatsAppDirectUrl, 
  openWhatsAppDirect 
} from '../utils/whatsappOrder';
import { AdRenderer } from './AdRenderer';

interface OrderSuccessModalProps {
  orderNumber: string | null;
  onClose: () => void;
  customer?: CustomerInfo;
  orderedItems?: CartItem[];
  categories?: Category[];
  ads?: AdSlot[];
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderNumber,
  onClose,
  customer,
  orderedItems = [],
  categories = [],
  ads = []
}) => {
  if (!orderNumber) return null;

  // Single active department for this completed order
  const firstItemCatId = orderedItems[0]?.product?.category_id || 'general';
  const categoryObj = categories.find(c => c.id === firstItemCatId || c.name === firstItemCatId) || {
    id: firstItemCatId,
    name: firstItemCatId === 'general' ? 'قسم عام' : firstItemCatId,
    whatsapp_number: ''
  };

  const categoryName = categoryObj.name || 'المتجر';
  const whatsappNumber = categoryObj.whatsapp_number || '';
  const totalOrderPrice = orderedItems.reduce((sum, it) => sum + (it.product.price * it.quantity), 0);

  const messageText = customer ? buildDepartmentWhatsAppMessage({
    orderNumber,
    categoryName,
    customer,
    items: orderedItems,
    totalPrice: totalOrderPrice
  }) : '';

  const whatsappDirectUrl = customer ? buildWhatsAppDirectUrl(whatsappNumber, messageText) : '';

  const handleOpenWhatsApp = () => {
    if (!customer) return;
    openWhatsAppDirect(whatsappNumber, messageText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-5 sm:p-7 text-center space-y-5 border border-slate-100 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Check Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Title & Key Notice */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            ✅ تم تجهيز طلبك
          </h2>
          
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-right space-y-1.5">
            <p className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>سيتم فتح WhatsApp لإرسال الطلب إلى المطعم.</span>
            </p>
            <p className="text-xs text-emerald-800 font-medium leading-relaxed pr-5">
              اضغط <span className="font-black underline">"إرسال"</span> في تطبيق WhatsApp لتأكيد الإرسال إلى قسم <span className="font-bold">({categoryName})</span>.
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right space-y-2.5">
          <div className="flex justify-between items-center text-xs text-slate-600 font-bold border-b border-slate-200 pb-2">
            <span>رقم الطلب:</span>
            <span className="font-mono text-emerald-700 font-black text-sm bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
              #{orderNumber.replace(/^#/, '')}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>القسم:</span>
            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {categoryName}
            </span>
          </div>

          {customer && (
            <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">الزبون:</span>
                <span className="font-bold text-slate-800">{customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الهاتف:</span>
                <span className="font-bold text-slate-800" dir="ltr">{customer.phone}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-slate-800 font-bold pt-2 border-t border-slate-200">
            <span>المجموع الإجمالي:</span>
            <span className="text-emerald-700 font-black text-sm">
              {totalOrderPrice.toLocaleString('ar-DZ')} د.ج
            </span>
          </div>
        </div>

        {/* Big WhatsApp Launch Button */}
        <div className="space-y-2 pt-1">
          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Also trigger direct helper
              handleOpenWhatsApp();
            }}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-2xl text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-amber-300" />
            <span>فتح WhatsApp وتأكيد الإرسال</span>
            <ExternalLink className="w-4 h-4 text-emerald-200" />
          </a>

          {/* Ad Slot on Order Success */}
          <AdRenderer placement="order_success" ads={ads} className="pt-2" />

          {/* Close / Start New Order */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-slate-500" />
            <span>إنهاء والعودة لإنشاء طلبية جديدة</span>
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

