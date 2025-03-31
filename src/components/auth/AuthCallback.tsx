import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Box, CircularProgress, Typography } from '@mui/material';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }

        if (!session) {
          console.log('No session found, checking for hash parameters');
          // Handle the OAuth callback
          const { error: signInError } = await supabase.auth.getUser();
          if (signInError) {
            throw signInError;
          }
        }

        // Store Gmail token if available
        if (session?.provider_token) {
          console.log('Storing Gmail token');
          sessionStorage.setItem('gmail_access_token', session.provider_token);
        }

        // Navigate to scanning page
        navigate('/scanning');
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