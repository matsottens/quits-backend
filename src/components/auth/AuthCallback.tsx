import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback initiated');
        
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

        if (!session) {
          console.log('No session found, checking for hash parameters');
          
          // Explicitly exchange the code for a session (for PKCE flow)
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
          } else {
            // If no code, manually handle the callback
            const { error: signInError } = await supabase.auth.getUser();
            if (signInError) {
              throw signInError;
            }
          }
        }
        
        // Get updated session after potential code exchange
        const { data: { session: updatedSession } } = await supabase.auth.getSession();

        // Store Gmail token if available
        if (updatedSession?.provider_token) {
          console.log('Storing Gmail token');
          sessionStorage.setItem('gmail_access_token', updatedSession.provider_token);
        } else {
          console.warn('No provider token found in session');
        }

        // Navigate to scanning page
        console.log('Authentication successful, navigating to scanning page');
        navigate('/scanning');
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

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
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
          {error}
        </Alert>
        <Typography>Redirecting to sign in page...</Typography>
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
      <Typography sx={{ mt: 2 }}>Completing sign in...</Typography>
    </Box>
  );
}; 