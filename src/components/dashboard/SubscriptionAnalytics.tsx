import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

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
  totalSubscriptions: number;
  totalMonthlyCost: number;
  averagePriceChange: number;
  upcomingRenewals: number;
  priceChanges: PriceChange[];
  upcomingRenewalsList: UpcomingRenewal[];
}

export const SubscriptionAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const isLocalDev = localStorage.getItem('isLocalDev') === 'true';

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiService.getSubscriptionAnalytics();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch analytics');
      }
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No subscription data available</p>
        <p className="mt-2 text-sm text-gray-400">Start scanning your emails to find subscriptions</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Analytics</h2>
      
      {isLocalDev && (
        <div className="mb-4 p-2 bg-yellow-50 text-yellow-700 rounded-lg text-xs">
          <span className="font-medium">Dev Mode:</span> Using mock analytics data
        </div>
      )}

      {/* Price Changes */}
      {analytics.priceChanges && analytics.priceChanges.length > 0 ? (
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-primary flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
              Recent Price Changes
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {analytics.priceChanges.map((change, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{change.provider}</h4>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    change.percentageChange > 0 
                      ? 'text-red-700 bg-red-50' 
                      : 'text-green-700 bg-green-50'
                  }`}>
                    {change.percentageChange > 0 ? '+' : ''}{change.percentageChange.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  <p>From ${change.oldPrice.toFixed(2)} to ${change.newPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    First detected: {new Date(change.firstDetected).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
          <p className="text-gray-500">No recent price changes detected</p>
        </div>
      )}

      {/* Upcoming Renewals */}
      {analytics.upcomingRenewalsList && analytics.upcomingRenewalsList.length > 0 ? (
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-accent/5 to-accent/10 p-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-accent flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Upcoming Renewals
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {analytics.upcomingRenewalsList.map((renewal, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{renewal.provider}</h4>
                  <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                    {renewal.daysUntilRenewal} days
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  <p>${renewal.price.toFixed(2)} per {renewal.frequency}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Renewal date: {new Date(renewal.renewal_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
          <p className="text-gray-500">No upcoming renewals detected</p>
        </div>
      )}
    </div>
  );
}; 