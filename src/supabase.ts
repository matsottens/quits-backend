import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseClientId = import.meta.env.VITE_SUPABASE_CLIENT_ID || '';
const supabaseClientSecret = import.meta.env.VITE_SUPABASE_CLIENT_SECRET || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'quits-auth',
    flowType: 'pkce',
    detectSessionInUrl: true,
    client_id: supabaseClientId,
    client_secret: supabaseClientSecret
  }
}); 