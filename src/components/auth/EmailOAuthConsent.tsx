/// <reference types="react" />
/// <reference types="react/jsx-runtime" />
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export const EmailOAuthConsent: React.FC = () => {
  const navigate = useNavigate();

  const handleAllow = () => {
    localStorage.setItem('email_access_granted', 'true');
    navigate('/scanning');
  };

  const handleDeny = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {/* Google-style header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 75 24" className="h-8" aria-hidden="true">
              <path fill="#4285F4" d="M14.11 12c0-.63-.05-1.24-.15-1.82H7.2v3.44h3.88c-.17.91-.68 1.68-1.44 2.19v1.82h2.33c1.36-1.26 2.14-3.11 2.14-5.63z"></path>
              <path fill="#34A853" d="M7.2 14.77c-1.95 0-3.6-1.42-4.19-3.32H.68v1.87C2.01 16.14 4.44 18 7.2 18c1.68 0 3.09-.56 4.13-1.51l-2.33-1.82c-.64.43-1.47.69-2.4.69z"></path>
              <path fill="#FBBC05" d="M3.01 11.45c0-.66.12-1.29.32-1.89V7.69H.68C.25 8.69 0 9.81 0 11c0 1.19.25 2.31.68 3.32l2.65-1.87c-.2-.6-.32-1.23-.32-1.89z"></path>
              <path fill="#EA4335" d="M7.2 7.23c1.1 0 2.08.38 2.85 1.12l2.07-2.07C10.96 5.14 9.24 4.5 7.2 4.5 4.44 4.5 2.01 6.36.68 9.18l2.65 1.87c.59-1.9 2.24-3.32 4.19-3.32z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-normal mb-2 text-gray-800">Quits wants to access your Google Account</h2>
          <p className="text-sm text-gray-600">This will allow Quits to:</p>
        </div>

        {/* Permissions list */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mt-0.5 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-gray-900">View and manage your email</h3>
              <p className="text-xs text-gray-500">Read your email messages and settings</p>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mt-0.5 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-gray-900">View subscription information</h3>
              <p className="text-xs text-gray-500">Find and analyze your subscription emails</p>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mb-8">
          <p className="text-sm text-gray-600">
            This will allow Quits to detect your active subscriptions. Quits will not send emails on your behalf or share your data with third parties.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleDeny}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            Cancel
          </button>
          <div className="space-x-2">
            <button
              onClick={handleAllow}
              className="px-6 py-2 text-sm font-medium text-white bg-[#4285F4] hover:bg-[#3367D6] rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]"
            >
              Allow
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            This content is not created or endorsed by Google.
            <br />
            Learn about how Quits handles your data in our{' '}
            <button
              onClick={(e: any) => {
                e.preventDefault();
              }}
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0"
            >
              privacy policy
            </button>.
          </p>
        </div>
      </div>
    </div>
  );
}; 