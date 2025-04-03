import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { SubscriptionData, PriceChange } from '../services/api';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

interface SubscriptionState {
  isLoading: boolean;
  error: string | null;
  subscriptions: SubscriptionData[];
  priceChanges: PriceChange[] | null;
  lastScanTime: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  scanEmails: () => Promise<void>;
  subscriptionState: SubscriptionState;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null
  });

  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    isLoading: false,
    error: null,
    subscriptions: [],
    priceChanges: null,
    lastScanTime: null
  });

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const handleAuthError = (error: Error) => {
    console.error('Auth error:', error);
    setAuthState(prev => ({
      ...prev,
      error: error.message,
      isLoading: false
    }));
  };

  const refreshSession = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }

      if (session?.provider_token) {
        sessionStorage.setItem('gmail_access_token', session.provider_token);
      }

      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      handleAuthError(error instanceof Error ? error : new Error('Failed to refresh session'));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        session,
        user,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      handleAuthError(error instanceof Error ? error : new Error('Failed to sign in'));
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      handleAuthError(error instanceof Error ? error : new Error('Failed to sign in with Google'));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { data: { session, user }, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        session,
        user,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      handleAuthError(error instanceof Error ? error : new Error('Failed to sign up'));
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      sessionStorage.removeItem('gmail_access_token');
      
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      handleAuthError(error instanceof Error ? error : new Error('Failed to sign out'));
    }
  };

  const scanEmails = async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch('/api/scan-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.session?.access_token}`,
          'X-User-ID': authState.user?.id || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to scan emails');
      }

      const data = await response.json();
      
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        subscriptions: data.subscriptions || [],
        priceChanges: data.priceChanges || null,
        lastScanTime: new Date().toISOString()
      }));
    } catch (error) {
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to scan emails'
      }));
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.provider_token) {
          sessionStorage.setItem('gmail_access_token', session.provider_token);
        }

        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isLoading: false
        }));
      } catch (error) {
        handleAuthError(error instanceof Error ? error : new Error('Failed to initialize auth'));
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.provider_token) {
        sessionStorage.setItem('gmail_access_token', session.provider_token);
      }

      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    ...authState,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshSession,
    clearError,
    scanEmails,
    subscriptionState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 