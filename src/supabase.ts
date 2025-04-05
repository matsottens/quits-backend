import { createClient } from '@supabase/supabase-js';

// Environment variables are set by Vercel or locally via env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pihflemmavointdxjdsx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpaGZsZW1tYXZvaW50ZHhqZHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODgxNzcsImV4cCI6MjA1ODc2NDE3N30.yJqxRrBNLkuiMz1--QOn_EHm8l2A8B-XSV4hEBS4_pY';

// Always log the values being used to help with debugging
console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Supabase Anon Key:', supabaseAnonKey ? (supabaseAnonKey.substring(0, 20) + '...') : 'Not Set');

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
}); 