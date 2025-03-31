import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface PriceChange {
  provider: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  percentageChange: number;
  firstDetected: string;
  lastUpdated: string;
}

interface UpcomingRenewal {
  provider: string;
  renewal_date: string;
  daysUntilRenewal: number;
  price: number;
  frequency: string;
}

interface AnalyticsData {
  subscriptions: number;
  monthlyTotal: number;
  yearlyTotal: number;
  priceChanges: PriceChange[];
  upcomingRenewals: UpcomingRenewal[];
  priceHistory: Record<string, any[]>;
}

export const SubscriptionAnalytics: React.FC = () => {
  const { session, apiUrl } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/subscription-analytics`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'x-user-id': session?.user?.id || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchAnalytics();
    }
  }, [session?.access_token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-500 py-4">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500">Total Subscriptions</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{analytics.subscriptions}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500">Monthly Total</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">${analytics.monthlyTotal.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500">Yearly Total</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">${analytics.yearlyTotal.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-500">Price Changes</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold">{analytics.priceChanges.length}</p>
        </div>
      </div>

      {/* Price Changes */}
      {analytics.priceChanges.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Price Changes</h2>
          <div className="space-y-4">
            {analytics.priceChanges.map((change, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{change.provider}</h3>
                  <span className={`text-sm ${
                    change.percentageChange > 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {change.percentageChange > 0 ? '+' : ''}{change.percentageChange.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  <p>From ${change.oldPrice.toFixed(2)} to ${change.newPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    First detected: {new Date(change.firstDetected).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Renewals */}
      {analytics.upcomingRenewals.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Upcoming Renewals
          </h2>
          <div className="space-y-4">
            {analytics.upcomingRenewals.map((renewal, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{renewal.provider}</h3>
                  <span className="text-sm text-blue-500">
                    {renewal.daysUntilRenewal} days
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  <p>${renewal.price.toFixed(2)} per {renewal.frequency}</p>
                  <p className="text-xs text-gray-500">
                    Renewal date: {new Date(renewal.renewal_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 