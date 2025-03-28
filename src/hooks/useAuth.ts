import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Check authentication status on load
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/user', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setState({
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name
            },
            loading: false,
            error: null
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setState({
          user: null,
          loading: false,
          error: 'Failed to check authentication status'
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      
      // In a real implementation, this would make a POST request to the server
      // For now, we're using the Google OAuth flow, so this is just a placeholder
      window.location.href = 'http://localhost:5000/auth/google';
      return true;
    } catch (error) {
      setState({ ...state, loading: false, error: 'Login failed' });
      return false;
    }
  };

  const googleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      // In a real implementation, this would register the user
      // For now, we're using the Google OAuth flow
      window.location.href = 'http://localhost:5000/auth/google';
      return true;
    } catch (error) {
      setState({ ...state, loading: false, error: 'Signup failed' });
      return false;
    }
  };

  const logout = async () => {
    try {
      setState({ ...state, loading: true, error: null });
      
      await fetch('http://localhost:5000/auth/logout', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      setState({ user: null, loading: false, error: null });
      
      // After logout, redirect to login page using React Router
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      setState({ ...state, loading: false, error: 'Logout failed' });
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    googleLogin,
    signup,
    logout,
    isAuthenticated: !!state.user
  };
}; 