-- ====================================================================
-- Supabase PostgreSQL Master Schema for Friha-food (اشري من دارك)
-- Safe Migration: Non-destructive, idempotent (no DROP/TRUNCATE)
-- ====================================================================

-- 1. CATEGORIES TABLE (الأقسام والمتاجر)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Store',
    image_url TEXT DEFAULT '',
    whatsapp_number TEXT DEFAULT '',
    owner_id TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Store';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS owner_id TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_categories_owner ON public.categories(owner_id);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC DEFAULT 0,
    image_url TEXT DEFAULT '',
    active BOOLEAN DEFAULT TRUE,
    category_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id TEXT;
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    total_price NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    subtotal NUMERIC DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- 5. DEPARTMENT MANAGERS TABLE (مسؤولو الأقسام)
CREATE TABLE IF NOT EXISTS public.department_managers (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    category_name TEXT DEFAULT '',
    manager_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    username TEXT NOT NULL,
    password_plain TEXT NOT NULL,
    password_hash TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    notes TEXT DEFAULT ''
);
ALTER TABLE public.department_managers ADD COLUMN IF NOT EXISTS category_name TEXT DEFAULT '';
ALTER TABLE public.department_managers ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';
ALTER TABLE public.department_managers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.department_managers ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_managers_category ON public.department_managers(category_id);
CREATE INDEX IF NOT EXISTS idx_managers_username ON public.department_managers(username);
CREATE INDEX IF NOT EXISTS idx_managers_phone ON public.department_managers(phone);

-- 6. JOIN REQUESTS TABLE (طلبات الانضمام والتجار)
CREATE TABLE IF NOT EXISTS public.join_requests (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    work_type TEXT NOT NULL,
    wilaya TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    assigned_username TEXT DEFAULT '',
    assigned_password TEXT DEFAULT '',
    assigned_category_id TEXT DEFAULT '',
    assigned_category_name TEXT DEFAULT '',
    invitation_sent_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.join_requests ADD COLUMN IF NOT EXISTS assigned_username TEXT DEFAULT '';
ALTER TABLE public.join_requests ADD COLUMN IF NOT EXISTS assigned_password TEXT DEFAULT '';
ALTER TABLE public.join_requests ADD COLUMN IF NOT EXISTS assigned_category_id TEXT DEFAULT '';
ALTER TABLE public.join_requests ADD COLUMN IF NOT EXISTS assigned_category_name TEXT DEFAULT '';
ALTER TABLE public.join_requests ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ;
ALTER TABLE public.join_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON public.join_requests(status);
CREATE INDEX IF NOT EXISTS idx_join_requests_phone ON public.join_requests(phone);

-- 7. ADS TABLE (المساحات الإعلانية)
CREATE TABLE IF NOT EXISTS public.ads (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    placement TEXT NOT NULL,
    html_code TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ads_placement ON public.ads(placement);
CREATE INDEX IF NOT EXISTS idx_ads_active ON public.ads(is_active);

-- 8. VISITOR STATS TABLE (إحصائيات الزوار)
CREATE TABLE IF NOT EXISTS public.visitor_stats (
    id TEXT PRIMARY KEY,
    total_visits BIGINT DEFAULT 0,
    unique_visits BIGINT DEFAULT 0,
    today_visits BIGINT DEFAULT 0,
    last_visit_date TEXT DEFAULT '',
    last_visit_at TIMESTAMPTZ DEFAULT NOW(),
    daily_history JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WHATSAPP ORDER MESSAGES TABLE (سجلات رسائل واتساب)
CREATE TABLE IF NOT EXISTS public.whatsapp_order_messages (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_order_id ON public.whatsapp_order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status ON public.whatsapp_order_messages(status);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_order_messages ENABLE ROW LEVEL SECURITY;

-- Helper to safely recreate policies
DO $$
BEGIN
    -- Categories
    DROP POLICY IF EXISTS "Allow all on categories" ON public.categories;
    CREATE POLICY "Allow all on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

    -- Products
    DROP POLICY IF EXISTS "Allow all on products" ON public.products;
    CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

    -- Orders
    DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;
    CREATE POLICY "Allow all on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

    -- Order Items
    DROP POLICY IF EXISTS "Allow all on order_items" ON public.order_items;
    CREATE POLICY "Allow all on order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

    -- Department Managers
    DROP POLICY IF EXISTS "Allow all on department_managers" ON public.department_managers;
    CREATE POLICY "Allow all on department_managers" ON public.department_managers FOR ALL USING (true) WITH CHECK (true);

    -- Join Requests
    DROP POLICY IF EXISTS "Allow all on join_requests" ON public.join_requests;
    CREATE POLICY "Allow all on join_requests" ON public.join_requests FOR ALL USING (true) WITH CHECK (true);

    -- Ads
    DROP POLICY IF EXISTS "Allow all on ads" ON public.ads;
    CREATE POLICY "Allow all on ads" ON public.ads FOR ALL USING (true) WITH CHECK (true);

    -- Visitor Stats
    DROP POLICY IF EXISTS "Allow all on visitor_stats" ON public.visitor_stats;
    CREATE POLICY "Allow all on visitor_stats" ON public.visitor_stats FOR ALL USING (true) WITH CHECK (true);

    -- Whatsapp Order Messages
    DROP POLICY IF EXISTS "Allow all on whatsapp_order_messages" ON public.whatsapp_order_messages;
    CREATE POLICY "Allow all on whatsapp_order_messages" ON public.whatsapp_order_messages FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ====================================================================
-- REALTIME PUBLICATIONS SETUP
-- ====================================================================
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'categories',
        'products',
        'orders',
        'order_items',
        'department_managers',
        'join_requests',
        'ads',
        'visitor_stats',
        'whatsapp_order_messages'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ====================================================================
-- STORAGE BUCKETS & POLICIES (product-images)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access product-images" ON storage.objects;
    CREATE POLICY "Public Access product-images" ON storage.objects
        FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
