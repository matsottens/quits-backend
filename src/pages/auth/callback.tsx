import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await signInWithGoogle();
        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/signin');
      }
    };

    handleCallback();
  }, [navigate, signInWithGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-[#26457A]">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 