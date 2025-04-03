import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OAuthRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        await signInWithGoogle();
        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/signin');
      }
    };

    handleOAuthCallback();
  }, [navigate, signInWithGoogle]);

  return <div>Completing sign in...</div>;
};

export default OAuthRedirect; 