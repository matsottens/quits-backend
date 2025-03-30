import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleGoogleCallback, GoogleAuthResponse } from '../../services/googleAuth';
import { useAuth } from '../../contexts/AuthContext';

export const OAuthRedirect: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('OAuthRedirect - Starting callback handling');
        console.log('Current location:', location.pathname + location.search);
        
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        console.log('OAuthRedirect - URL parameters:', {
          hasCode: !!code,
          hasError: !!error,
          errorMessage: error
        });

        if (error) {
          console.error('OAuthRedirect - Error from Google:', error);
          setError(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          console.error('OAuthRedirect - No authorization code received');
          setError('No authorization code received');
          return;
        }

        console.log('OAuthRedirect - Exchanging code for tokens');
        const authResponse: GoogleAuthResponse = await handleGoogleCallback(code);
        console.log('OAuthRedirect - Received auth response:', {
          hasUser: !!authResponse.user,
          hasAccessToken: !!authResponse.access_token,
          hasRefreshToken: !!authResponse.refresh_token
        });

        console.log('OAuthRedirect - Logging in user');
        await login(authResponse);
        
        console.log('OAuthRedirect - Login successful, redirecting to scanning');
        navigate('/scanning');
      } catch (err) {
        console.error('OAuthRedirect - Error in callback handling:', err);
        setError('Failed to complete authentication');
      }
    };

    handleCallback();
  }, [location, navigate, login]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-[#26457A] text-white rounded hover:bg-[#1e3c72]"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-[#26457A]">Completing Authentication</h2>
        <p className="text-gray-600">Please wait while we complete your authentication...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26457A] mx-auto"></div>
        </div>
      </div>
    </div>
  );
}; 