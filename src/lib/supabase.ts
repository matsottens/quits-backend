import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: string;
  billing_cycle: string;
  next_billing: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  provider?: string;
  type?: string;
  price?: number;
  frequency?: string;
  next_renewal_date?: string;
  notes?: string;
}

// Database helper functions
export const db = {
  // User operations
  async createUser(email: string) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Subscription operations
  async createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSubscriptionsByUserId(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateSubscription(id: string, updates: Partial<Subscription>) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSubscription(id: string) {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
}; 