import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'quits_auth_token',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Use production URL in production, localhost in development
    site: process.env.NODE_ENV === 'production' 
      ? 'https://www.quits.cc'
      : 'http://localhost:3000'
  }
}); 