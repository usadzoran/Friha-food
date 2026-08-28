-- ====================================================================
-- WhatsApp Department Dispatch Setup for Supabase PostgreSQL
-- Safe Migration: Non-destructive, idempotent (no DROP/TRUNCATE)
-- ====================================================================

-- 1. Ensure whatsapp_number column exists on categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '';

-- 2. Ensure RLS policies on categories allow anon & authenticated users to read/update
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on categories" ON public.categories;
CREATE POLICY "Allow all on categories" 
ON public.categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Create whatsapp_order_messages table for real-time dispatch tracking & deduplication
CREATE TABLE IF NOT EXISTS public.whatsapp_order_messages (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes for fast deduplication checks and real-time lookup
CREATE INDEX IF NOT EXISTS idx_whatsapp_order_cat ON public.whatsapp_order_messages (order_id, category_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_order_id ON public.whatsapp_order_messages (order_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status ON public.whatsapp_order_messages (status);

-- 5. Enable Row Level Security (RLS) & allow public/anon access matching the store schema
ALTER TABLE public.whatsapp_order_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on whatsapp_order_messages" ON public.whatsapp_order_messages;
CREATE POLICY "Allow all on whatsapp_order_messages" 
ON public.whatsapp_order_messages 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 6. Realtime publication for categories & whatsapp_order_messages
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_order_messages;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;
