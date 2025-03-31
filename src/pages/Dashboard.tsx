import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

interface Subscription {
  id: string;
  provider: string;
  type: string;
  price: number;
  frequency: string;
  lastDetectedDate: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, scanEmails } = useAuth();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSubscriptions(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      await scanEmails();
      await fetchSubscriptions(); // Refresh the list after scanning
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || sub.frequency === filter;
    return matchesSearch && matchesFilter;
  });

  // Helper function to get provider logo
  const getProviderLogo = (provider: string) => {
    const logos: { [key: string]: string } = {
      netflix: '/images/netflix-logo.png',
      spotify: '/images/spotify-logo.png',
      amazon: '/images/amazon-logo.png',
      youtube: '/images/youtube-logo.png',
      'disney+': '/images/disney-logo.png',
      hbo: '/images/hbo-logo.png'
    };
    return logos[provider.toLowerCase()] || '/images/default-logo.png';
  };

  return (
    <div className="min-h-screen bg-[#FFEDD6]">
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
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26457A]"
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
              onClick={handleScanEmails}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#26457A] hover:bg-[#1a3156] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26457A]"
            >
              {loading ? 'Scanning...' : 'SCAN FOR NEW SUBSCRIPTIONS'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#26457A] focus:ring-[#26457A] sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-[#26457A] focus:ring-[#26457A] sm:text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Subscriptions</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26457A]"></div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No subscriptions found. Click "Scan for New Subscriptions" to find your subscriptions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-contain bg-gray-50"
                        src={getProviderLogo(subscription.provider)}
                        alt={subscription.provider}
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {subscription.provider}
                        </h3>
                        {subscription.price && (
                          <p className="text-sm text-gray-500">
                            ${subscription.price.toFixed(2)}/{subscription.frequency}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        Last detected: {new Date(subscription.lastDetectedDate).toLocaleDateString()}
                      </p>
                      {subscription.type && (
                        <p className="text-sm text-gray-500 mt-1">
                          Type: {subscription.type}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 