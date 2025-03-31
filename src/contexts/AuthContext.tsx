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
  login: (tokens: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
            response_type: 'code',
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
          },
          skipBrowserRedirect: false,
          flowType: 'pkce'
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
      setError(error instanceof Error ? error.message : 'Failed to start Google sign-in');
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
      setError(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    }
  };

  const scanEmails = async () => {
    setLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const gmailToken = sessionStorage.getItem('gmail_access_token');
      
      console.log('Scan emails - Session:', {
        hasSession: !!currentSession,
        hasAccessToken: !!currentSession?.access_token,
        hasProviderToken: !!currentSession?.provider_token,
        hasStoredGmailToken: !!gmailToken,
        userId: currentSession?.user?.id
      });
      
      if (!currentSession?.access_token) {
        throw new Error('Not authenticated. Please sign in again.');
      }

      if (!gmailToken) {
        throw new Error('No Gmail access token available. Please sign in with Google again.');
      }

      if (!currentSession.user?.id) {
        throw new Error('No user ID available. Please sign in again.');
      }

      // Use the API URL from environment or fallback to a default
      const apiUrl = process.env.REACT_APP_API_URL || 'https://api.quits.cc';
      const apiUrlWithProtocol = apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl.replace(/^\/+/, '')}`;
      console.log('Scanning emails using API URL:', apiUrlWithProtocol);

      // Common fetch options with improved configuration
      const fetchOptions = {
        credentials: 'include' as RequestCredentials,
        mode: 'cors' as RequestMode,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
          'X-Gmail-Token': gmailToken,
          'X-User-ID': currentSession.user.id
        }
      };

      console.log('Request options:', {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          'Authorization': 'Bearer [REDACTED]',
          'X-Gmail-Token': '[REDACTED]'
        }
      });

      // First, try a health check with retries
      const maxHealthCheckRetries = 3;
      let healthCheckError;

      for (let attempt = 1; attempt <= maxHealthCheckRetries; attempt++) {
        try {
          console.log(`Health check attempt ${attempt} of ${maxHealthCheckRetries}`);
          
          // Create a new AbortController for each attempt
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          console.log('Making health check request to:', `${apiUrlWithProtocol}/health`);
          
          const healthCheck = await fetch(`${apiUrlWithProtocol}/health`, {
            method: 'GET',
            ...fetchOptions,
            signal: controller.signal,
            // Add additional fetch options for CORS
            cache: 'no-cache',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
          });
          
          clearTimeout(timeoutId);

          // Log response details
          console.log('Health check response:', {
            status: healthCheck.status,
            statusText: healthCheck.statusText,
            headers: Object.fromEntries(healthCheck.headers.entries()),
            ok: healthCheck.ok,
            type: healthCheck.type,
            url: healthCheck.url
          });

          if (!healthCheck.ok) {
            const errorData = await healthCheck.json().catch(() => null);
            console.error('Health check failed:', {
              status: healthCheck.status,
              statusText: healthCheck.statusText,
              error: errorData,
              headers: Object.fromEntries(healthCheck.headers.entries())
            });

            // If unauthorized, try to refresh the session
            if (healthCheck.status === 401) {
              console.log('Attempting to refresh session...');
              const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
              if (refreshError || !newSession) {
                console.error('Session refresh failed:', refreshError);
                throw new Error('Session expired. Please sign in again.');
              }
              console.log('Session refreshed successfully');
              // Update the session and retry with new token
              currentSession.access_token = newSession.access_token;
              fetchOptions.headers['Authorization'] = `Bearer ${newSession.access_token}`;
              continue;
            }

            throw new Error(errorData?.error || `Health check failed with status ${healthCheck.status}`);
          }
          
          const healthData = await healthCheck.json();
          console.log('Health check response data:', healthData);
          
          // If we get here, the health check was successful
          break;
        } catch (error: any) {
          healthCheckError = error;
          console.error(`Health check attempt ${attempt} failed:`, {
            error: error.message,
            type: error.name,
            stack: error.stack,
            cause: error.cause
          });
          
          if (attempt === maxHealthCheckRetries) {
            console.error('All health check attempts failed');
            throw new Error('Backend service is not responding. Please try again later.');
          }
          
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // Add retry logic for the main request
      const maxRetries = 3;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt} of ${maxRetries} to scan emails`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          console.log('Making request to:', `${apiUrlWithProtocol}/api/scan-emails`);
          console.log('With headers:', {
            ...fetchOptions.headers,
            'Authorization': 'Bearer [REDACTED]',
            'X-Gmail-Token': '[REDACTED]'
          });

          const response = await fetch(`${apiUrlWithProtocol}/api/scan-emails`, {
            method: 'GET',
            signal: controller.signal,
            ...fetchOptions
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error(`API error (attempt ${attempt}):`, {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
              headers: Object.fromEntries(response.headers.entries())
            });

            // Handle specific error cases
            if (response.status === 401) {
              if (errorData?.error === 'Gmail token expired or invalid') {
                // Clear Gmail tokens and redirect to Google auth
                sessionStorage.removeItem('gmail_access_token');
                await signInWithGoogle();
                return;
              } else {
                // Other auth errors - clear session and redirect to login
                await signOut();
                return;
              }
            }

            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
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
              .eq('user_id', currentSession.user.id);

            if (error) {
              console.error('Error fetching subscriptions:', error);
            } else {
              console.log('Current subscriptions:', existingData);
            }
          }

          return data;
        } catch (error: any) {
          lastError = error;
          console.error(`Error on attempt ${attempt}:`, {
            error: error.message,
            type: error.name,
            stack: error.stack
          });
          
          if (attempt === maxRetries) {
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      throw lastError;
    } catch (error: any) {
      console.error('Error scanning emails:', {
        error: error.message,
        type: error.name,
        stack: error.stack
      });
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