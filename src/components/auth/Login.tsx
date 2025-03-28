import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in setup mode from the URL
  const isSetupMode = location.search.includes('setup=true');

  useEffect(() => {
    // Check if user is already authenticated
    fetch('http://localhost:5000/auth/user', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log('Auth check response:', data);
      if (data.authenticated && data.user) {
        // If setup is complete and not in setup mode, redirect to scanning
        if (data.setup_complete && !isSetupMode) {
          navigate('/scanning');
        } else if (isSetupMode) {
          // If in setup mode, check if setup is needed
          setNeedsSetup(true);
        }
      } else {
        // Not authenticated, check if we need setup
        fetch('http://localhost:5000/auth/needs-setup', {
          credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
          setNeedsSetup(data.needs_setup);
        })
        .catch(err => {
          console.error('Error checking setup status:', err);
          setNeedsSetup(true); // Default to needing setup on error
        });
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error('Error checking auth status:', err);
      setIsLoading(false);
    });
  }, [navigate, isSetupMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Regular email/password login would go here
      // For now, redirect to Google OAuth
      handleGoogleLogin();
    } catch (err) {
      setError('Failed to log in. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // If in setup mode or needs setup, add the setup query parameter
    const setupParam = (isSetupMode || needsSetup) ? '?setup=true' : '';
    window.location.href = `http://localhost:5000/auth/google${setupParam}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26457A] mx-auto"></div>
          <p className="mt-4 text-[#26457A]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <img
              src="/quits-logo.svg"
              alt="Quits"
              className="h-20 w-auto mb-6"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#26457A]">
            {isSetupMode ? 'Set up your account' : 'Sign in to your account'}
          </h2>
          {!isSetupMode && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <a href="/signup" className="font-medium text-[#26457A] hover:text-[#1a2f4f]">
                create a new account
              </a>
            </p>
          )}
          {isSetupMode && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Connect your Google account to scan for subscriptions
            </p>
          )}
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26457A]"
        >
          <img
            className="h-5 w-5 mr-2"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
          />
          {isSetupMode ? 'Connect with Google' : 'Continue with Google'}
        </button>

        {!isSetupMode && (
          <>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#26457A] focus:border-[#26457A] focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#26457A] focus:border-[#26457A] focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#26457A] hover:bg-[#1a2f4f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26457A]"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}; 