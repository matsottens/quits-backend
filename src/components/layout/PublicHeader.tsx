import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const PublicHeader: React.FC = () => {
  const location = useLocation();

  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-[#26457A] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">Quits</span>
            </Link>
          </div>
          
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
        </div>
      </div>
    </header>
  );
}; 