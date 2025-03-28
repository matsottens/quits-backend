import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  
  // Check if we're in setup mode from the URL
  const isSetupMode = location.search.includes('setup=true');

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session) {
          // If setup is complete and not in setup mode, redirect to scanning
          if (!isSetupMode) {
            navigate('/scanning');
          } else if (isSetupMode) {
            // If in setup mode, check if setup is needed
            setNeedsSetup(true);
          }
        } else {
          // Not authenticated, check if we need setup
          setNeedsSetup(true);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking auth status:', err);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, isSetupMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      if (isSetupMode || needsSetup) {
        navigate('/scanning?setup=true');
      } else {
        navigate('/scanning');
      }
    } catch (err) {
      setError('Failed to log in. Please try again.');
      setIsLoading(false);
    }
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
              Connect your account to scan for subscriptions
            </p>
          )}
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
      </div>
    </div>
  );
}; 