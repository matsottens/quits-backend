import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { SubscriptionData, PriceChange } from '../types/subscription';

// Flag to enable mock auth for local development - explicitly set to false
const USE_MOCK_AUTH = false;

// Mock user for local development
const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'mock-user@example.com',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: ''
};

// Mock session for local development
const MOCK_SESSION: Session = {
  access_token: 'mock-access-token.with.periods',
  refresh_token: 'mock-refresh-token',
  provider_token: 'mock-provider-token',
  provider_refresh_token: null,
  user: MOCK_USER,
  expires_at: Date.now() + 3600,
  token_type: 'bearer',
  expires_in: 3600
};

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
  scanEmails: () => Promise<any>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }: any) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: USE_MOCK_AUTH ? MOCK_USER : null,
    session: USE_MOCK_AUTH ? MOCK_SESSION : null,
    isLoading: !USE_MOCK_AUTH,
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
    if (USE_MOCK_AUTH) {
      console.log('Using mock authentication, skipping session refresh');
      return;
    }
    
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
    if (USE_MOCK_AUTH) {
      console.log('Using mock authentication, auto-signing in');
      setAuthState({
        user: MOCK_USER,
        session: MOCK_SESSION,
        isLoading: false,
        error: null
      });
      return;
    }
    
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
    if (USE_MOCK_AUTH) {
      console.log('Using mock authentication, auto-signing in with Google');
      setAuthState({
        user: MOCK_USER,
        session: MOCK_SESSION,
        isLoading: false,
        error: null
      });
      return;
    }
    
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
    if (USE_MOCK_AUTH) {
      console.log('Using mock authentication, auto-signing up');
      setAuthState({
        user: MOCK_USER,
        session: MOCK_SESSION,
        isLoading: false,
        error: null
      });
      return;
    }
    
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
    if (USE_MOCK_AUTH) {
      console.log('Using mock authentication, signing out');
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null
      });
      return;
    }
    
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
      
      // Import the apiService
      const { apiService } = await import('../services/api');
      const response = await apiService.scanEmails();

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to scan emails: No data received');
      }

      const { subscriptions = [], priceChanges = null } = response.data;

      // Save to localStorage for persistence
      localStorage.setItem('last_scan_count', String(subscriptions.length));
      localStorage.setItem('last_subscriptions', JSON.stringify(subscriptions));
      localStorage.setItem('last_scan_time', new Date().toISOString());
      
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        subscriptions: subscriptions || [],
        priceChanges: priceChanges || null,
        lastScanTime: new Date().toISOString()
      }));

      // Return the scan results for direct use if needed
      return {
        subscriptions,
        count: subscriptions.length,
        priceChanges
      };
    } catch (error) {
      console.error('Error scanning emails:', error);
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to scan emails'
      }));
      throw error; // Re-throw to allow proper error handling in components
    }
  };

  useEffect(() => {
    if (USE_MOCK_AUTH) {
      console.log('Using mock authentication, skipping auth initialization');
      return;
    }
    
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

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        refreshSession,
        clearError,
        scanEmails,
        subscriptionState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 