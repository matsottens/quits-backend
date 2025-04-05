import * as React from 'react';
import { Link } from 'react-router-dom';

export const GetStarted: React.FC = () => {
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
            Welcome to Quits
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your personal subscription manager
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-[#26457A] mb-2">Track Your Subscriptions</h3>
            <p className="text-sm text-gray-600">
              Keep all your subscriptions in one place. Never miss a payment or renewal date.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-[#26457A] mb-2">Monitor Spending</h3>
            <p className="text-sm text-gray-600">
              See your total monthly costs and identify opportunities to save money.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-[#26457A] mb-2">Smart Notifications</h3>
            <p className="text-sm text-gray-600">
              Get reminders before renewals and alerts for price changes.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            to="/signup"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26457A] hover:bg-[#26457A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26457A]"
          >
            Get Started
          </Link>
          
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#26457A] hover:text-[#26457A]/90">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}; 