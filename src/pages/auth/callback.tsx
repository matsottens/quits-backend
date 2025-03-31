import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL parameters
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const code = params.get('code');
        const state = params.get('state');
        const storedState = sessionStorage.getItem('oauth_state');

        // Log the callback parameters (excluding sensitive data)
        console.log('Auth callback received:', {
          hasError: !!error,
          hasCode: !!code,
          hasState: !!state,
          statesMatch: state === storedState
        });

        // Check for errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Validate state to prevent CSRF
        if (!state || !storedState || state !== storedState) {
          throw new Error('Invalid state parameter');
        }

        // Clear the stored state
        sessionStorage.removeItem('oauth_state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange the code for tokens
        const response = await fetch('/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
          credentials: 'include'
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to exchange code: ${error}`);
        }

        const tokens = await response.json();
        
        // Log successful token exchange (without sensitive data)
        console.log('Token exchange successful:', {
          hasAccessToken: !!tokens.access_token,
          hasIdToken: !!tokens.id_token
        });

        // Complete the login process
        await login(tokens);

        // Redirect to the dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to login page with error
        navigate('/login?error=' + encodeURIComponent(error.message));
      }
    };

    handleCallback();
  }, [login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Processing authentication...</h1>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 