import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated with the backend
    fetch('http://localhost:5000/auth/user', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(res => res.json())
    .then(data => {
      setIsAuthenticated(data.authenticated);
      setIsLoading(false);
    })
    .catch(err => {
      console.error('Error checking authentication:', err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    // Show loading state
    return <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26457A] mx-auto"></div>
        <p className="mt-4 text-[#26457A]">Loading...</p>
      </div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 