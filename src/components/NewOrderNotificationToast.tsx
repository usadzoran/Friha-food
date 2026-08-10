import React, { useEffect } from 'react';
import { Order } from '../types';
import { 
  BellRing, 
  X, 
  ShoppingBag, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Volume2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { playOrderNotificationSound, vibrateDevice } from '../utils/notificationSound';

interface NewOrderNotificationToastProps {
  order: Order | null;
  onClose: () => void;
  onOpenAdminOrders?: () => void;
}

export const NewOrderNotificationToast: React.FC<NewOrderNotificationToastProps> = ({
  order,
  onClose,
  onOpenAdminOrders
}) => {
  useEffect(() => {
    if (order) {
      playOrderNotificationSound();
      vibrateDevice();
    }
  }, [order]);

  if (!order) return null;

  const displayNum = `DZ-${order.id.slice(-6).toUpperCase()}`;

  // Clean customer WhatsApp phone
  let cleanPhone = (order.customer_phone || '').replace(/[^\d]/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    cleanPhone = '213' + cleanPhone.substring(1);
  }

  const totalDisplay = (order.total_price || (order as any).total_amount || 0).toLocaleString('ar-DZ');

  const waMessage = encodeURIComponent(
    `مرحباً ${order.customer_name} 👋\n` +
    `نشكرك على طلبك من متجر (اشري من دارك)! 🛍️\n` +
    `رقم الطلب: #${displayNum}\n` +
    `المجموع: ${totalDisplay} د.ج\n` +
    `نريد تأكيد طلبك ومعلومات التوصيل لعنوانك: (${order.customer_address}).`
  );

  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-top-5 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-amber-400 p-4 space-y-3 relative overflow-hidden backdrop-blur-md">
        
        {/* Glow Background Effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black animate-bounce shadow-md">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-amber-300">طلب جديد وصل الآن!</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              </div>
              <p className="text-[11px] font-mono font-bold text-slate-400">
                #{displayNum}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => playOrderNotificationSound()}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-lg transition-colors"
              title="إعادة تشغيل الصوت"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="space-y-2 text-xs relative z-10">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span className="flex items-center gap-1">
                <span>👤</span>
                <span className="text-white font-black">{order.customer_name}</span>
              </span>
              <a 
                href={`tel:${order.customer_phone}`}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                dir="ltr"
              >
                <Phone className="w-3 h-3" />
                <span>{order.customer_phone}</span>
              </a>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{order.customer_address}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-700/60">
              <span className="text-slate-400 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>{order.items?.length || 0} منتجات</span>
              </span>
              <span className="font-black text-amber-300 text-sm">
                {totalDisplay} د.ج
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="grid grid-cols-2 gap-2 pt-1 relative z-10">
          {cleanPhone && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>واتساب الزبون</span>
            </a>
          )}

          {onOpenAdminOrders && (
            <button
              onClick={() => {
                onOpenAdminOrders();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>عرض باللوحة</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
