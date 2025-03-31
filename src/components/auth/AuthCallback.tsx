import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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

        // Get the stored API URL
        const apiUrl = sessionStorage.getItem('api_url') || 'https://api.quits.cc';
        
        console.log('Exchanging code for tokens at:', `${apiUrl}/auth/google/token`);
        
        // Exchange the code for tokens
        const response = await fetch(`${apiUrl}/auth/google/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ code, redirect_uri: `${window.location.origin}/auth/callback` }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Token exchange failed: ${error}`);
        }

        const tokens = await response.json();
        console.log('Token exchange successful');

        // Login with the received tokens
        await login(tokens);
        
        // Navigate to the scanning page
        navigate('/scanning');
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}; 