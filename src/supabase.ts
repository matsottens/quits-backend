import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const siteUrl = process.env.REACT_APP_SITE_URL || 'https://www.quits.cc';

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
    site: window.location.host.includes('localhost') ? 'http://localhost:3000' : siteUrl
  }
}); 