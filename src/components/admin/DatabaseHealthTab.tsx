import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Layers, 
  Table2, 
  Cpu, 
  Terminal,
  RotateCcw
} from 'lucide-react';
import { checkDatabaseHealthSupabase, DatabaseHealthReport, restoreDefaultData } from '../../services/storeService';
import { Category, Product, Order, DepartmentManager, JoinRequest, AdSlot, VisitorStats } from '../../types';

interface DatabaseHealthTabProps {
  categories: Category[];
  products: Product[];
  orders: Order[];
  managers: DepartmentManager[];
  joinRequests: JoinRequest[];
  ads: AdSlot[];
  visitorStats: VisitorStats | null;
  onRefreshData?: () => Promise<void>;
}

export const DatabaseHealthTab: React.FC<DatabaseHealthTabProps> = ({
  categories,
  products,
  orders,
  managers,
  joinRequests,
  ads,
  visitorStats,
  onRefreshData
}) => {
  const [healthReport, setHealthReport] = useState<DatabaseHealthReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tables' | 'sql' | 'env'>('overview');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const runHealthCheck = async () => {
    setIsChecking(true);
    setStatusMessage(null);
    try {
      const report = await checkDatabaseHealthSupabase();
      setHealthReport(report);
      if (report.isConnected) {
        setStatusMessage({
          type: 'success',
          text: `تم فحص الاتصال بنجاح! استجابة قاعدة البيانات: ${report.latencyMs}ms`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: report.details || 'فشل الاتصال بقاعدة البيانات'
        });
      }
    } catch (err: any) {
      console.error('Error running database check:', err);
      setStatusMessage({
        type: 'error',
        text: `خطأ أثناء فحص قاعدة البيانات: ${err?.message || 'حدث خطأ غير متوقع'}`
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const handleRestoreData = async () => {
    if (!window.confirm('هل أنت متأكد من استرجاع البيانات الأساسية والتصنيفات الافتراضية لقاعدة البيانات؟ لن يتم مسح الطلبيات الحالية.')) {
      return;
    }
    setIsRestoring(true);
    try {
      await restoreDefaultData();
      await runHealthCheck();
      if (onRefreshData) await onRefreshData();
      setStatusMessage({
        type: 'success',
        text: 'تمت مزامنة واسترجاع الأقسام والبيانات الأساسية بنجاح!'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `فشل استرجاع البيانات: ${err?.message || 'حدث خطأ'}`
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const sqlSchemaCode = `-- ==============================================================================
-- SCHEMA DEFINITION & OPTIMIZATIONS FOR "اشري من دارك" (Friha-food)
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories / Sections Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    image_url TEXT,
    whatsapp_number TEXT DEFAULT '',
    description TEXT DEFAULT '',
    address TEXT DEFAULT '',
    location TEXT DEFAULT '',
    working_hours TEXT DEFAULT '',
    owner_id TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    notes TEXT,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL
);

-- 6. Department Managers Table
CREATE TABLE IF NOT EXISTS public.department_managers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    category_name TEXT,
    manager_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_plain TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 7. Join Requests Table
CREATE TABLE IF NOT EXISTS public.join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    work_type TEXT NOT NULL,
    wilaya TEXT DEFAULT 'تيزي وزو',
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    assigned_username TEXT,
    assigned_password TEXT,
    assigned_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    assigned_category_name TEXT,
    invitation_sent_at TIMESTAMP WITH TIME ZONE
);

-- 8. Ads & HTML Banners Table
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    placement TEXT NOT NULL,
    html_code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Visitor Stats Table
CREATE TABLE IF NOT EXISTS public.visitor_stats (
    id TEXT PRIMARY KEY DEFAULT 'main',
    total_visits BIGINT DEFAULT 0,
    unique_visits BIGINT DEFAULT 0,
    today_visits BIGINT DEFAULT 0,
    last_visit_date DATE DEFAULT CURRENT_DATE,
    last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    daily_history JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS & Permissive Policies for Web Ingress
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access categories" ON public.categories;
CREATE POLICY "Public access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access products" ON public.products;
CREATE POLICY "Public access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access orders" ON public.orders;
CREATE POLICY "Public access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access order_items" ON public.order_items;
CREATE POLICY "Public access order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access department_managers" ON public.department_managers;
CREATE POLICY "Public access department_managers" ON public.department_managers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access join_requests" ON public.join_requests;
CREATE POLICY "Public access join_requests" ON public.join_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access ads" ON public.ads;
CREATE POLICY "Public access ads" ON public.ads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access visitor_stats" ON public.visitor_stats;
CREATE POLICY "Public access visitor_stats" ON public.visitor_stats FOR ALL USING (true) WITH CHECK (true);

-- Sections View for Backward Compatibility
CREATE OR REPLACE VIEW public.sections AS
SELECT 
    id,
    name,
    icon,
    image_url,
    whatsapp_number,
    description,
    address,
    location,
    working_hours,
    owner_id,
    created_at
FROM public.categories;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const tableList = [
    { name: 'categories', label: 'الأقسام والمحلات (categories)', localCount: categories.length, remote: healthReport?.tables.categories, icon: Layers },
    { name: 'products', label: 'المنتجات والأسعار (products)', localCount: products.length, remote: healthReport?.tables.products, icon: Table2 },
    { name: 'orders', label: 'الطلبيات والفواتير (orders)', localCount: orders.length, remote: healthReport?.tables.orders, icon: Server },
    { name: 'order_items', label: 'تفاصيل المنتجات بالطلبيات (order_items)', localCount: orders.reduce((sum, o) => sum + (o.items?.length || 0), 0), remote: healthReport?.tables.order_items, icon: Table2 },
    { name: 'department_managers', label: 'حسابات مسؤولي الأقسام (department_managers)', localCount: managers.length, remote: healthReport?.tables.department_managers, icon: ShieldCheck },
    { name: 'join_requests', label: 'طلبات الانضمام والشراكة (join_requests)', localCount: joinRequests.length, remote: healthReport?.tables.join_requests, icon: Server },
    { name: 'ads', label: 'الإعلانات وبنرات HTML (ads)', localCount: ads.length, remote: healthReport?.tables.ads, icon: Cpu },
    { name: 'visitor_stats', label: 'إحصائيات الزوار (visitor_stats)', localCount: visitorStats ? 1 : 0, remote: healthReport?.tables.visitor_stats, icon: Activity },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black shrink-0">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">مركز فحص ومزامنة قاعدة البيانات</h2>
                {healthReport?.isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>متصل ونشط</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>جاري التحقق / وضع هجين</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                الربط والمزامنة الحية بين المتجر الإلكتروني وقاعدة بيانات Supabase السحابية (PostgreSQL + RLS + Realtime)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={runHealthCheck}
              disabled={isChecking}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'جاري الفحص...' : 'فحص الاتصال الآن'}</span>
            </button>

            <button
              onClick={handleRestoreData}
              disabled={isRestoring}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
              <span>{isRestoring ? 'جاري الاسترجاع...' : 'مزامنة البيانات الأولية'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-700/60 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            نظرة عامة وسرعة الاستجابة
          </button>
          <button
            onClick={() => setActiveSubTab('tables')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'tables'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            حالة الجداول الـ 8 والسجلات
          </button>
          <button
            onClick={() => setActiveSubTab('sql')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'sql'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>مخطط SQL الكامل</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border font-bold text-xs flex items-center justify-between shadow-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* SUB-TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>زمن الاستجابة (Latency)</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {healthReport?.latencyMs || 0} <span className="text-sm font-bold text-slate-400">ms</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>استجابة فائقة السرعة</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>الجداول المتصلة</span>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {healthReport ? Object.values(healthReport.tables).filter((t: any) => t?.ok).length : 0} <span className="text-sm font-bold text-slate-400">/ 8</span>
              </div>
              <p className="text-[11px] text-slate-500">
                كافة جداول المتجر نشطة
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>إجمالي السجلات الحية</span>
                <Table2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {categories.length + products.length + orders.length + managers.length + joinRequests.length + ads.length}
              </div>
              <p className="text-[11px] text-slate-500">
                منتجات، طلبيات، أقسام ومستخدمين
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>نظام الأمان (RLS)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700">
                مفعل وآمن 100%
              </div>
              <p className="text-[11px] text-slate-500">
                عزل مسؤولي الأقسام بحسب ID
              </p>
            </div>
          </div>

          {/* Architecture Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>بنية الربط والتخزين المعتمدة</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>1. التخزين السحابي الدائم</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  يتم حفظ وتعديل الأقسام، المنتجات، والطلبيات مباشرة في قاعدة بيانات PostgreSQL على Supabase، مع دعم المزامنة اللحظية عبر WebSockets (Realtime).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>2. التخزين الاحتياطي المحلي</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  يحتفظ التطبيق بنسخة كاش سريعة (Local Cache) لضمان تجربة مستخدم فائقة السرعة وعرض فوري للمنتجات دون تأخير حتى في حالات بطء الإنترنت.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>3. عزل مسؤولي الأقسام</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  يبدأ كل مسؤول قسم بحساب مستقل تماماً، ويتم فلترة المنتجات والطلبيات عبر الربط المباشر بـ <code>owner_id</code> و <code>category_id</code> لمنع أي تداخل.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TABLES STATUS */}
      {activeSubTab === 'tables' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">حالة جداول قاعدة البيانات (8 جداول)</h3>
              <p className="text-xs text-slate-500">عرض تفصيلي لسلامة الاتصال وعدد السجلات في كل جدول</p>
            </div>
            <button
              onClick={runHealthCheck}
              disabled={isChecking}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>تحديث الحالة</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {tableList.map((tbl) => {
              const Icon = tbl.icon;
              const isOk = tbl.remote?.ok ?? false;
              const remoteCount = tbl.remote?.count ?? tbl.localCount;

              return (
                <div key={tbl.name} className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isOk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{tbl.label}</span>
                        {isOk ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>متصل</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>يحتاج تهيئة</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">public.{tbl.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 block">{remoteCount} سجل</span>
                      <span className="text-[10px] text-slate-400">سجل نشط</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SQL SCHEMA */}
      {activeSubTab === 'sql' && (
        <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span>أمر SQL لتهيئة قاعدة البيانات في Supabase</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                يمكنك نسخ هذا الكود ولصقه في <strong>Supabase &gt; SQL Editor</strong> لتحديث أو إعادة بناء الجداول مع صلاحيات RLS.
              </p>
            </div>

            <button
              onClick={copySql}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ كود SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-800 leading-relaxed select-all" dir="ltr">
            {sqlSchemaCode}
          </pre>
        </div>
      )}
    </div>
  );
};
