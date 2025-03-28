import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Subscription {
  id: string;
  name: string;
  logoUrl: string;
  timeLeft: string;
  price: number;
  billingCycle: string;
}

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // TODO: Replace with actual data from API
  const subscriptions: Subscription[] = [
    {
      id: '1',
      name: 'Netflix',
      logoUrl: '/images/netflix-logo.png',
      timeLeft: '1 year, 8 months',
      price: 15.99,
      billingCycle: 'monthly',
    },
    {
      id: '2',
      name: 'Spotify',
      logoUrl: '/images/spotify-logo.png',
      timeLeft: '2 years, 3 months',
      price: 9.99,
      billingCycle: 'monthly',
    },
    {
      id: '3',
      name: 'Amazon Prime',
      logoUrl: '/images/amazon-logo.png',
      timeLeft: '6 months',
      price: 14.99,
      billingCycle: 'monthly',
    },
  ];

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || sub.billingCycle === filter;
    return matchesSearch && matchesFilter;
  });

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
            </div>
            <div className="flex items-center">
              <Link
                to="/settings"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Settings</span>
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Your Subscriptions</h1>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Subscription
            </button>
          </div>

          <div className="mb-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Subscriptions</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={subscription.logoUrl}
                      alt={subscription.name}
                    />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {subscription.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ${subscription.price}/{subscription.billingCycle}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Time remaining: {subscription.timeLeft}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 