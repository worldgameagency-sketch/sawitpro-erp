import { createClient } from '@supabase/supabase-js';

const getEnvOrStored = (key: string, storedKey: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env?.[key];
  if (env && typeof env === 'string') return env;
  try {
    return localStorage.getItem(storedKey) || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnvOrStored('VITE_SUPABASE_URL', 'sawitpro_supabase_url');
const supabaseAnonKey = getEnvOrStored('VITE_SUPABASE_ANON_KEY', 'sawitpro_supabase_key');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
