/// <reference types="react" />
/// <reference types="react/jsx-runtime" />
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [priceChangeAlerts, setPriceChangeAlerts] = useState(true);
  const [emailScanning, setEmailScanning] = useState(true);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Quits"
                />
              </div>
              <div className="ml-4 flex items-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Back</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

          <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive updates about your subscriptions</p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    onClick={() => setEmailNotifications(!emailNotifications)}
                  >
                    <span
                      className={`${
                        emailNotifications ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Price Change Alerts</h3>
                    <p className="text-sm text-gray-500">Get notified when subscription prices change</p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      priceChangeAlerts ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    onClick={() => setPriceChangeAlerts(!priceChangeAlerts)}
                  >
                    <span
                      className={`${
                        priceChangeAlerts ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Email Scanning</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Automatic Email Scanning</h3>
                    <p className="text-sm text-gray-500">Allow Quits to scan your emails for subscription receipts</p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      emailScanning ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    onClick={() => setEmailScanning(!emailScanning)}
                  >
                    <span
                      className={`${
                        emailScanning ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account</h2>
              <div className="space-y-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings; 