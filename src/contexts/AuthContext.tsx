import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { SubscriptionData, PriceChange } from '../types/subscription';
import { ApiService } from '../services/api';

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
      console.log('Initiating Google sign-in with OAuth...');
      
      // Use the correct redirect URL - make sure it matches what's set in Supabase
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Using redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      } else {
        console.log('Google sign-in initiated successfully, redirecting...');
      }
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
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
    if (!authState.session?.provider_token) {
      console.error('No Gmail token found in session');
      // Check if we have a token in session storage
      const storedToken = sessionStorage.getItem('gmail_access_token');
      
      if (!storedToken) {
        console.log('No Gmail token found, redirecting to Google auth');
        await signInWithGoogle();
        return { success: false, error: 'Gmail token not found. Redirecting to Google auth...' };
      }
    }
    
    // Continue with scan as before
    setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get the API service instance - use the directly imported ApiService
      console.log('Getting ApiService instance...');
      const apiService = ApiService.getInstance();
      
      // Call the scan emails API
      console.log('Calling scanEmails API...');
      const response = await apiService.scanEmails();
      console.log('ScanEmails API response:', response);
      
      if (response.success && response.data) {
        setSubscriptionState(prev => ({
          ...prev,
          subscriptions: response.data.subscriptions || [],
          priceChanges: response.data.priceChanges,
          lastScanTime: new Date().toISOString(),
          isLoading: false,
          error: null
        }));
        return response;
      } else {
        // Check if the error is related to Gmail token
        if (response.error?.includes('Gmail token') || 
            response.error?.includes('token expired') || 
            response.details?.includes('401')) {
          console.log('Gmail token issue detected, redirecting to Google auth');
          await signInWithGoogle();
          return { success: false, error: 'Gmail token expired. Redirecting to Google auth...' };
        }
        
        setSubscriptionState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to scan emails'
        }));
        return response;
      }
    } catch (error) {
      console.error('Error scanning emails:', error);
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred while scanning emails'
      }));
      return { 
        success: false, 
        error: 'Failed to scan emails', 
        details: error instanceof Error ? error.message : String(error)
      };
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