import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailOAuthConsent } from './EmailOAuthConsent';

export const OAuthRedirect: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Simulate a brief loading state before showing the consent screen
    const timer = setTimeout(() => {
      setShowConsent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!showConsent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-[#26457A]">Redirecting to Email Provider</h2>
          <p className="text-gray-600">Please wait while we redirect you to your email provider...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26457A] mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return <EmailOAuthConsent />;
}; 