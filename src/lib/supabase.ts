import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://oauuyyluzlbhttjiehwi.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdXV5eWx1emxiaHR0amllaHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDk4NTYsImV4cCI6MjEwMTUyNTg1Nn0.0s66Vm0m2blDl-LadmB28eBOtf2b2tWq4-n-xVQGt1I';

const getEnvVar = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {}
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY') || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_KEY');
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
