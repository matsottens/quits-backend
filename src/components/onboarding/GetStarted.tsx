import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const GetStarted: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };
  
  const handleSetupAccount = () => {
    navigate('/setup');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFEDD6] p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#26457A] mb-4">Welcome to Quits</h1>
          <p className="text-xl text-gray-700">
            Track, manage, and optimize your subscriptions in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-[#26457A] mb-3">Find Subscriptions</h2>
            <p className="text-gray-700 mb-4">
              Connect your email to automatically discover all your active subscriptions.
            </p>
            <div className="flex justify-center">
              <svg
                className="h-24 w-24 text-[#26457A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-[#26457A] mb-3">Save Money</h2>
            <p className="text-gray-700 mb-4">
              Identify unused services and optimize your spending with personalized recommendations.
            </p>
            <div className="flex justify-center">
              <svg
                className="h-24 w-24 text-[#26457A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-[#26457A] mb-3">Never Miss a Payment</h2>
            <p className="text-gray-700 mb-4">
              Get timely reminders before your subscriptions renew so you're never caught by surprise.
            </p>
            <div className="flex justify-center">
              <svg
                className="h-24 w-24 text-[#26457A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-[#26457A] mb-3">Track Everything</h2>
            <p className="text-gray-700 mb-4">
              View all your subscriptions in one dashboard with detailed analytics and insights.
            </p>
            <div className="flex justify-center">
              <svg
                className="h-24 w-24 text-[#26457A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Button
            variant="contained"
            onClick={handleGetStarted}
            sx={{
              backgroundColor: '#26457A',
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#1a365d',
              },
            }}
          >
            Get Started
          </Button>
          
          <div className="mt-4">
            <button 
              onClick={handleSetupAccount}
              className="font-medium text-[#26457A] hover:underline"
            >
              Already connected? Set up account access
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-600 mt-4">
        <p>Already have an account? <button onClick={() => navigate('/login')} className="text-[#26457A] font-medium hover:underline">Sign in</button></p>
      </div>
    </div>
  );
};

export default GetStarted; 