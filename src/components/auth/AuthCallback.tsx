import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [tokenReceived, setTokenReceived] = useState<boolean>(false);
  const [processingAuth, setProcessingAuth] = useState<boolean>(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback initiated');
        setProcessingAuth(true);
        
        // Get current URL hash and query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        console.log('Auth callback URL:', window.location.href);
        console.log('Has hash parameters:', hashParams.toString() !== '');
        console.log('Has query parameters:', queryParams.toString() !== '');
        
        // Get the session from the URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        // Check if we already have a session
        if (session) {
          console.log('Session found:', !!session);

          // Check for provider token (Gmail access token)
          if (session.provider_token) {
            console.log('Provider token found in session');
            sessionStorage.setItem('gmail_access_token', session.provider_token);
            setTokenReceived(true);
          } else {
            console.warn('No provider token in session - might need to re-authorize');
          }
        } else {
          console.log('No session found, checking for code parameter');
          
          // Exchange authorization code for session (PKCE flow)
          if (queryParams.has('code')) {
            console.log('Found code in query params, exchanging for session');
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
              queryParams.get('code') || ''
            );
            
            if (exchangeError) {
              console.error('Error exchanging code for session:', exchangeError);
              throw exchangeError;
            }
            
            if (!data.session) {
              throw new Error('Failed to get session from code exchange');
            }

            console.log('Successfully exchanged code for session');
            
            // Check for provider token in the new session
            if (data.session.provider_token) {
              console.log('Provider token found after code exchange');
              sessionStorage.setItem('gmail_access_token', data.session.provider_token);
              setTokenReceived(true);
            } else {
              console.warn('No provider token after code exchange - scope issue?');
              throw new Error('Gmail access was not granted. Please allow access to Gmail to use this feature.');
            }
          } else {
            console.warn('No code parameter found in callback URL');
            throw new Error('Authentication callback missing required parameters');
          }
        }

        setProcessingAuth(false);
        
        // Only automatically proceed to scanning if we have the token
        if (tokenReceived) {
          console.log('Authentication successful with Gmail token, proceeding to scan');
          setTimeout(() => {
            navigate('/scanning');
          }, 1500);
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setProcessingAuth(false);
      }
    };

    handleCallback();
  }, [navigate]);

  const handleRetry = () => {
    navigate('/signin');
  };

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          <Typography variant="subtitle1" fontWeight="bold">Authentication Error</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRetry}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!processingAuth && !tokenReceived) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Alert severity="warning" sx={{ mb: 3, maxWidth: 500 }}>
          <Typography variant="subtitle1" fontWeight="bold">Gmail Access Required</Typography>
          <Typography variant="body2">
            We need access to your Gmail account to scan for subscriptions. 
            Please sign in with Google and grant the necessary permissions.
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRetry}
        >
          Sign In with Google
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>
        {tokenReceived 
          ? "Gmail access granted! Proceeding to scan..." 
          : "Completing authentication..."}
      </Typography>
    </Box>
  );
}; 