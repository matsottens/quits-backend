import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { initiateGoogleAuth } from '../services/googleAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  scanEmails: () => Promise<void>;
  login: (authResponse: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        // Check if we have provider tokens in the session
        if (session?.provider_token) {
          sessionStorage.setItem('gmail_access_token', session.provider_token);
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
            console.log('Storing provider token');
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null); // Immediately clear the user state
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      initiateGoogleAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (authResponse: any) => {
    try {
      setLoading(true);
      console.log('AuthContext - Starting login with response:', {
        hasUser: !!authResponse.user,
        hasAccessToken: !!authResponse.access_token,
        hasRefreshToken: !!authResponse.refresh_token,
        hasIdToken: !!authResponse.id_token
      });

      // Sign in with Supabase using the ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: authResponse.id_token,
      });

      if (error) {
        console.error('AuthContext - Error signing in with ID token:', error);
        throw error;
      }

      console.log('AuthContext - Supabase sign-in successful');
      
      // Store the Gmail access token if available
      if (authResponse.access_token) {
        sessionStorage.setItem('gmail_access_token', authResponse.access_token);
      }

      // Set the user in the context
      setUser(data.user);
    } catch (error) {
      console.error('AuthContext - Error during login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const scanEmails = async () => {
    try {
      setLoading(true);
      
      // Get the current session and Gmail token
      const { data: { session } } = await supabase.auth.getSession();
      const gmailToken = sessionStorage.getItem('gmail_access_token');
      
      console.log('Scan emails - Session:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        hasProviderToken: !!session?.provider_token,
        hasStoredGmailToken: !!gmailToken,
        userId: session?.user?.id
      });
      
      if (!session?.access_token) {
        throw new Error('Not authenticated with Supabase');
      }

      if (!gmailToken) {
        throw new Error('No Gmail access token available. Please sign in with Google again.');
      }

      if (!session.user?.id) {
        throw new Error('No user ID available');
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'https://api.quits.cc';
      console.log('Scanning emails using API URL:', apiUrl);

      // Add retry logic
      const maxRetries = 3;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt} of ${maxRetries} to scan emails`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const response = await fetch(`${apiUrl}/api/scan-emails`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'X-Gmail-Token': gmailToken,
              'X-User-ID': session.user.id,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (attempt ${attempt}):`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Scan emails response:', data);
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to scan emails');
          }

          // Store subscriptions in local state if needed
          if (data.subscriptions) {
            const { data: existingData, error } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', session.user.id);

            if (error) {
              console.error('Error fetching subscriptions:', error);
            } else {
              console.log('Current subscriptions:', existingData);
            }
          }

          return data;
        } catch (error: any) {
          lastError = error;
          console.error(`Error on attempt ${attempt}:`, error);
          
          if (attempt === maxRetries) {
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      throw lastError;
    } catch (error: any) {
      console.error('Error scanning emails:', error);
      throw new Error(error.message || 'Failed to scan emails');
    } finally {
      setLoading(false);
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
    login
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