import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-[#26457A] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {user ? (
              // When user is logged in, logo is not a link
              <span className="text-2xl font-bold text-white">Quits</span>
            ) : (
              // When user is not logged in, logo links to homepage
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-white">Quits</span>
              </Link>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="font-medium text-white/80 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link 
                to="/login" 
                className={`font-medium transition-colors ${
                  isActive('/login') 
                    ? 'text-white border-b-2 border-white' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className={`font-medium transition-colors ${
                  isActive('/signup') 
                    ? 'text-white border-b-2 border-white' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}; 