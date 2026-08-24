import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://oauuyyluzlbhttjiehwi.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdXV5eWx1emxiaHR0amllaHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDk4NTYsImV4cCI6MjEwMTUyNTg1Nn0.0s66Vm0m2blDl-LadmB28eBOtf2b2tWq4-n-xVQGt1I';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
