import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for verification message in URL
    const params = new URLSearchParams(location.search);
    const verificationMessage = params.get('message');
    if (verificationMessage) {
      setMessage(decodeURIComponent(verificationMessage));
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      // Navigation will be handled by PublicRoute
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      if (err.message.includes('Email not confirmed')) {
        setMessage('Please verify your email before logging in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      await signInWithGoogle();
      // Navigation will be handled by OAuth callback
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/90">
              create a new account
            </Link>
          </p>
        </div>

        {message && (
          <div className="rounded-md bg-blue-50 p-4">
            <div className="text-sm text-blue-700">{message}</div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-input bg-white placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
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
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-input bg-white placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#26457A] hover:bg-[#26457A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26457A]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-input" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26457A]"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 