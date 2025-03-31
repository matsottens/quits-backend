import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Box, CircularProgress, Typography } from '@mui/material';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          console.error('No authorization code found in URL');
          navigate('/login');
          return;
        }

        // Exchange the code for a session with Supabase
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('Error exchanging code for session:', error);
          throw error;
        }

        if (data?.session) {
          console.log('Successfully authenticated with Supabase');
          // Store Gmail token if available
          const gmailToken = data.session.provider_token;
          if (gmailToken) {
            sessionStorage.setItem('gmail_access_token', gmailToken);
          }
          
          // Navigate to scanning page
          navigate('/scanning');
        } else {
          throw new Error('No session data received');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

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