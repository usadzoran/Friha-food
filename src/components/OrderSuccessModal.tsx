import React from 'react';
import { Order } from '../types';
import { CheckCircle2, MessageSquare, Home, ShoppingBag, MapPin, Phone } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onGoHome: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onGoHome,
}) => {
  if (!order) return null;

  const handleReopenWhatsApp = () => {
    let itemsListText = '';
    order.items.forEach((item) => {
      itemsListText += `${item.product_name} × ${item.quantity}\n`;
    });

    let whatsappText = `طلب جديد\n\n`;
    whatsappText += `اسم الزبون:\n${order.customer_name}\n\n`;
    whatsappText += `رقم الهاتف:\n${order.customer_phone}\n\n`;
    whatsappText += `العنوان:\n${order.customer_address}\n\n`;
    if (order.notes) {
      whatsappText += `ملاحظات إضافية:\n${order.notes}\n\n`;
    }
    whatsappText += `---\n\n`;
    whatsappText += `الطلبات:\n\n${itemsListText}\n`;
    whatsappText += `---\n\n`;
    whatsappText += `المجموع:\n${order.total_amount} دج\n`;

    // Try finding store whatsapp or clean
    const encodedText = encodeURIComponent(whatsappText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 text-center space-y-5">
        {/* SUCCESS CHECKMARK */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            رقم الطلب: {order.id}
          </span>
          <h3 className="text-2xl font-extrabold font-cairo text-stone-900 mt-2">
            تم إرسال طلبك بنجاح!
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
            تم تسجيل طلبك في النظام وتوجيهه مباشرة إلى محادثة الواتساب الخاصة بمتجر{' '}
            <span className="font-bold text-amber-700">"{order.store_name}"</span>.
          </p>
        </div>

        {/* ORDER DETAILS SUMMARY */}
        <div className="bg-stone-50 rounded-2xl p-4 text-right text-xs space-y-2 border border-stone-200/80">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2 font-bold text-stone-800">
            <span>ملخص الطلب</span>
            <span className="font-mono text-amber-700">{order.total_amount} دج</span>
          </div>

          <div className="space-y-1 text-stone-600 pt-1">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
              <span>{order.items.length} منتجات</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span className="truncate">{order.customer_address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span dir="ltr">{order.customer_phone}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleReopenWhatsApp}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>إعادة فتح محادثة الواتساب</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onGoHome();
            }}
            className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4 text-stone-500" />
            <span>العودة للصفحة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
