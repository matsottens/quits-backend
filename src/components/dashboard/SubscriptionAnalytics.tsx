import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { SubscriptionData } from '../../types/subscription';

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
  const [localSubscriptions, setLocalSubscriptions] = useState<SubscriptionData[]>([]);
  const [localMetrics, setLocalMetrics] = useState<{
    totalSubscriptions: number;
    totalMonthlyCost: number;
    upcomingRenewals: UpcomingRenewal[];
    topCategories: {category: string, count: number}[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.quits.cc';

  // Fetch remote analytics if user is available
  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`${apiUrl}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-user-id': user.id
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setApiError('Could not load analytics from server');
      // We'll fall back to local data
    } finally {
      setLoading(false);
    }
  }, [user, apiUrl]);

  // Load local subscription data and calculate basic metrics
  useEffect(() => {
    const loadLocalData = () => {
      const savedSubscriptions = localStorage.getItem('last_subscriptions');
      
      if (savedSubscriptions) {
        try {
          const parsedSubscriptions = JSON.parse(savedSubscriptions);
          
          if (Array.isArray(parsedSubscriptions) && parsedSubscriptions.length > 0) {
            setLocalSubscriptions(parsedSubscriptions);
            
            // Calculate local metrics
            const totalMonthlyCost = parsedSubscriptions.reduce((total, sub) => {
              const price = sub.price || 0;
              if (sub.frequency === 'yearly') {
                return total + (price / 12);
              }
              return total + price;
            }, 0);
            
            // Find upcoming renewals (within 14 days)
            const now = new Date();
            const upcomingRenewals = parsedSubscriptions
              .filter(sub => sub.renewal_date)
              .map(sub => {
                const renewalDate = new Date(sub.renewal_date);
                const diffTime = Math.abs(renewalDate.getTime() - now.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                return {
                  provider: sub.provider || 'Unknown',
                  renewal_date: sub.renewal_date,
                  daysUntilRenewal: diffDays,
                  price: sub.price || 0,
                  frequency: sub.frequency || 'monthly'
                };
              })
              .filter(renewal => renewal.daysUntilRenewal <= 14)
              .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
            
            // Count subscriptions by category
            const categoryCount = parsedSubscriptions.reduce((acc, sub) => {
              const category = sub.category || 'Other';
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            // Convert to array and sort by count
            const topCategories = Object.entries(categoryCount)
              .map(([category, count]) => ({ category, count }))
              .sort((a, b) => (b.count as number) - (a.count as number))
              .slice(0, 5);
            
            setLocalMetrics({
              totalSubscriptions: parsedSubscriptions.length,
              totalMonthlyCost,
              upcomingRenewals,
              topCategories: topCategories as {category: string, count: number}[]
            });
          }
        } catch (error) {
          console.error('Failed to parse local subscriptions:', error);
        }
      }
    };
    
    loadLocalData();
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Loading state
  if (loading && !localMetrics) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // No data available
  if (!analytics && !localMetrics) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No subscription data available</p>
        <p className="mt-2 text-sm text-gray-400">Start scanning your emails to find subscriptions</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-800">Subscription Analytics</h2>
      
      {apiError && (
        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-700 flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
          <div>
            <p>{apiError}</p>
            <p className="mt-1 text-xs">Showing locally stored subscription data instead</p>
          </div>
        </div>
      )}
      
      {/* Upcoming Renewals */}
      {(analytics?.upcomingRenewalsList && analytics.upcomingRenewalsList.length > 0 || 
        localMetrics?.upcomingRenewals && localMetrics.upcomingRenewals.length > 0) && (
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-accent/5 to-accent/10 p-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-accent flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Upcoming Renewals
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {(analytics?.upcomingRenewalsList || localMetrics?.upcomingRenewals || []).map((renewal, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{renewal.provider}</h4>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    renewal.daysUntilRenewal <= 3 
                      ? 'bg-red-50 text-red-700' 
                      : renewal.daysUntilRenewal <= 7
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-blue-50 text-blue-700'
                  }`}>
                    {renewal.daysUntilRenewal === 0 
                      ? 'Today!' 
                      : renewal.daysUntilRenewal === 1 
                        ? 'Tomorrow' 
                        : `${renewal.daysUntilRenewal} days`}
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
      )}
      
      {/* Price Changes - only show if we have data from API */}
      {analytics?.priceChanges && analytics.priceChanges.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-primary flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
              Recent Price Changes
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {analytics && analytics.priceChanges && analytics.priceChanges.map((change, index) => (
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
      )}
      
      {/* Top Categories - show if we have local data */}
      {localMetrics?.topCategories && localMetrics.topCategories.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-green-700 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Top Subscription Categories
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {localMetrics && localMetrics.topCategories && localMetrics.topCategories.map((category, index) => (
                <div key={index} className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-800">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-gray-600">
                        {category.count} {category.count === 1 ? 'subscription' : 'subscriptions'}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div 
                      style={{ width: `${(category.count / (localMetrics?.totalSubscriptions || 1)) * 100}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 