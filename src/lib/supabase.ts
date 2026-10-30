import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(
  url &&
    key &&
    url !== 'https://your-project.supabase.co' &&
    key !== 'your-anon-key-here'
);

const resolvedUrl = url ?? 'https://placeholder.supabase.co';
const resolvedKey = key ?? 'placeholder-key';

export const supabase = hasSupabaseConfig
  ? createClient(resolvedUrl, resolvedKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      'Missing Supabase environment variables. Copy .env.example to .env.local and add your project values.'
    );
  }

  return supabase;
};
