import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'echri_min_darak_sb_url';
const SUPABASE_ANON_KEY = 'echri_min_darak_sb_key';

const DEFAULT_SUPABASE_URL = 'https://oauuyyluzlbhttjiehwi.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdXV5eWx1emxiaHR0amllaHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDk4NTYsImV4cCI6MjEwMTUyNTg1Nn0.0s66Vm0m2blDl-LadmB28eBOtf2b2tWq4-n-xVQGt1I';

export function getSupabaseConfig() {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const url = localStorage.getItem(SUPABASE_URL_KEY) || metaEnv.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem(SUPABASE_ANON_KEY) || metaEnv.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
  return { url, key };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_ANON_KEY, key.trim());
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- kSQL Schema for "اشري من دارك" (Echri Min Darak)
-- PostgreSQL / Supabase Schema Definition & RLS Policies
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
    id TEXT PRIMARY KEY DEFAULT ('store-' || uuid_generate_v4()),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT DEFAULT '',
    section TEXT NOT NULL CHECK (section IN ('food', 'drinks', 'both')),
    whatsapp TEXT NOT NULL,
    address TEXT NOT NULL,
    is_open BOOLEAN DEFAULT true,
    category_ids TEXT[] DEFAULT '{}',
    rating NUMERIC(2,1) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || uuid_generate_v4()),
    name TEXT NOT NULL,
    section TEXT NOT NULL CHECK (section IN ('food', 'drinks')),
    icon TEXT DEFAULT '🍔',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || uuid_generate_v4()),
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    image TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ORD-' || floor(random() * 9000 + 1000)::text),
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    notes TEXT DEFAULT '',
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'delivered', 'cancelled')),
    whatsapp_sent BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- 6. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active stores, categories, and available products
CREATE POLICY "Public stores select" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Public categories select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products select" ON public.products FOR SELECT USING (true);

-- Allow public customers to insert new orders & order items
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Admin policies (Full access for authenticated admins or service roles)
CREATE POLICY "Admin full stores" ON public.stores FOR ALL USING (true);
CREATE POLICY "Admin full categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Admin full products" ON public.products FOR ALL USING (true);
CREATE POLICY "Admin full orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Admin full order_items" ON public.order_items FOR ALL USING (true);

-- STORAGE BUCKET FOR IMAGES
-- Run in Supabase SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('store-assets', 'store-assets', true);
`;
