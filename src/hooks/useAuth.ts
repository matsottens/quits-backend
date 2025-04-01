import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Check authentication status on load
    const checkAuthStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setState({
          user: session?.user ?? null,
          session: session,
          loading: false,
          error: null
        });

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setState({
            user: session?.user ?? null,
            session: session,
            loading: false,
            error: null
          });
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error checking auth status:', error);
        setState({
          user: null,
          session: null,
          loading: false,
          error: 'Failed to check authentication status'
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      setState({ ...state, loading: false, error: 'Login failed' });
      return false;
    }
  };

  const googleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  const signup = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      setState({ ...state, loading: false, error: 'Signup failed' });
      return false;
    }
  };

  const logout = async () => {
    try {
      setState({ ...state, loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      navigate('/login');
      return true;
    } catch (error) {
      setState({ ...state, loading: false, error: 'Logout failed' });
      return false;
    }
  };

  return {
    ...state,
    login,
    googleLogin,
    signup,
    logout,
    apiUrl: process.env.REACT_APP_API_URL || 'https://api.quits.cc'
  };
}; 