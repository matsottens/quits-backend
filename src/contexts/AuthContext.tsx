import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { apiService } from '../services/api';
import { SubscriptionData, PriceChange } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  scanEmails: () => Promise<void>;
  login: (tokens: any) => Promise<{ user: User; session: Session }>;
  apiUrl: string;
}

interface SubscriptionState {
  isLoading: boolean;
  error: string | null;
  subscriptions: SubscriptionData[];
  priceChanges: PriceChange[] | null;
  lastScanTime: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    isLoading: false,
    error: null,
    subscriptions: [],
    priceChanges: null,
    lastScanTime: null
  });
  const [apiUrl] = useState(process.env.REACT_APP_API_URL || 'http://localhost:3001');

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        // If no session, clear any stale tokens
        if (!session) {
          sessionStorage.removeItem('gmail_access_token');
          setUser(null);
          return;
        }

        setUser(session.user);
        
        // Check and store provider tokens
        if (session.provider_token) {
          sessionStorage.setItem('gmail_access_token', session.provider_token);
          console.log('Stored provider token from session');
        }

        // If we have a user but no Gmail token, we need to re-authenticate
        const hasGmailToken = sessionStorage.getItem('gmail_access_token');
        if (session.user && !hasGmailToken) {
          console.log('No Gmail token found, redirecting to Google auth');
          await signInWithGoogle();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      try {
        console.log('Auth state changed:', event, session?.user?.email);
        console.log('Provider token available:', !!session?.provider_token);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          sessionStorage.removeItem('gmail_access_token');
        } else if (session?.user) {
          setUser(session.user);
          // Store provider token if available
          if (session.provider_token) {
            console.log('Storing provider token from auth change');
            sessionStorage.setItem('gmail_access_token', session.provider_token);
          }
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Clear all stored tokens
      sessionStorage.removeItem('gmail_access_token');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      
      // Clear any cached auth state
      await supabase.auth.refreshSession();
      
      // Force reload the page to clear any remaining state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Clear any existing tokens to ensure fresh auth
      sessionStorage.removeItem('gmail_access_token');
      
      const redirectTo = window.location.host.includes('localhost')
        ? 'http://localhost:3000/auth/callback'
        : `${window.location.origin}/auth/callback`;

      console.log('Starting Google sign-in with redirect:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/gmail.readonly email profile',
            response_type: 'code'
          },
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }

      if (!data.url) {
        throw new Error('No URL returned from Supabase OAuth');
      }

      // Store the state for verification after redirect
      const urlParams = new URLSearchParams(new URL(data.url).search);
      const state = urlParams.get('state');
      if (state) {
        sessionStorage.setItem('oauth_state', state);
      }

      console.log('Redirecting to OAuth URL:', data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating Google sign-in:', error);
      // Redirect to login page on error
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const login = async (tokens: any) => {
    try {
      console.log('Logging in with tokens:', {
        hasAccessToken: !!tokens.access_token,
        hasIdToken: !!tokens.id_token,
        hasUser: !!tokens.user
      });

      // Store the Gmail token in sessionStorage only
      if (tokens.access_token) {
        sessionStorage.setItem('gmail_access_token', tokens.access_token);
        console.log('Stored Gmail access token');
      }

      // Sign in with Supabase using the Google ID token
      if (tokens.id_token) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: tokens.id_token,
          nonce: sessionStorage.getItem('supabase.auth.nonce') || undefined
        });

        if (error) {
          console.error('Supabase sign in error:', error);
          throw error;
        }

        console.log('Supabase sign in successful:', {
          hasSession: !!data.session,
          hasUser: !!data.user,
          hasProviderToken: !!data.session?.provider_token
        });

        // Store provider token if available
        if (data.session?.provider_token) {
          sessionStorage.setItem('gmail_access_token', data.session.provider_token);
        }

        setUser(data.user);
        return data;
      } else {
        throw new Error('No ID token provided');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Redirect to login page on error
      window.location.href = '/login';
      throw error;
    }
  };

  const scanEmails = async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Starting email scan...');
      const response = await apiService.scanEmails();
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to scan emails');
      }

      console.log('Email scan completed:', {
        subscriptionCount: response.data?.subscriptions?.length || 0,
        priceChangesCount: response.data?.priceChanges?.length || 0
      });

      setSubscriptionState({
        isLoading: false,
        error: null,
        subscriptions: response.data?.subscriptions || [],
        priceChanges: response.data?.priceChanges || null,
        lastScanTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error scanning emails:', error);
      
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to scan emails'
      }));

      // If the error is due to expired tokens, trigger a re-authentication
      if (error instanceof Error && 
          (error.message.includes('token expired') || 
           error.message.includes('invalid token'))) {
        console.log('Token expired, initiating re-authentication...');
        await signOut(); // This should redirect to login
      }
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    scanEmails,
    login,
    subscriptionState,
    apiUrl
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 