import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NotificationCenter } from './NotificationCenter';
import { SubscriptionAnalytics } from './SubscriptionAnalytics';
import { NotificationSettings } from './NotificationSettings';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  BellIcon,
  InboxIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { SubscriptionData } from '../../services/api';

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [scanCount, setScanCount] = useState<number | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [totalMonthlyCost, setTotalMonthlyCost] = useState<number>(0);
  
  // Check for scan results from navigation state
  useEffect(() => {
    // First priority: check location state (from direct navigation)
    if (location.state) {
      if ('scanCount' in location.state) {
        setScanCount(Number(location.state.scanCount));
      }
      
      if ('subscriptions' in location.state) {
        setSubscriptions(location.state.subscriptions || []);
        calculateTotalCost(location.state.subscriptions);
      }
      
      // Clear the state to avoid showing the same results on refresh
      window.history.replaceState({}, document.title);
      return;
    }
    
    // Second priority: check localStorage (from previous scans)
    const lastScanCount = localStorage.getItem('last_scan_count');
    if (lastScanCount) {
      setScanCount(Number(lastScanCount));
    }
    
    const savedSubscriptions = localStorage.getItem('last_subscriptions');
    if (savedSubscriptions) {
      try {
        const parsedSubscriptions = JSON.parse(savedSubscriptions);
        setSubscriptions(parsedSubscriptions);
        calculateTotalCost(parsedSubscriptions);
      } catch (error) {
        console.error('Failed to parse saved subscriptions:', error);
      }
    }
  }, [location.state]);
  
  const calculateTotalCost = (subs: SubscriptionData[]) => {
    if (!subs || !subs.length) {
      setTotalMonthlyCost(0);
      return;
    }
    
    const total = subs.reduce((sum, sub) => {
      if (!sub.price) return sum;
      
      // Convert yearly to monthly
      if (sub.frequency === 'yearly') {
        return sum + (sub.price / 12);
      }
      
      return sum + sub.price;
    }, 0);
    
    setTotalMonthlyCost(total);
  };

  return (
    <div className="min-h-screen bg-[#FFEDD6]">
      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 mb-8 shadow-lg text-white">
            <h1 className="text-3xl font-bold">Welcome back, {user?.email?.split('@')[0] || 'User'}</h1>
            <p className="mt-2 opacity-90">Your subscription management dashboard</p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center text-primary">
                    <ChartBarIcon className="h-8 w-8 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Subscriptions</h3>
                      <p className="mt-1 text-2xl font-semibold">{scanCount || "0"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center text-green-600">
                    <CurrencyDollarIcon className="h-8 w-8 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Est. Monthly Cost</h3>
                      <p className="mt-1 text-2xl font-semibold">${totalMonthlyCost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subscriptions List */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-primary flex items-center">
                    <InboxIcon className="h-5 w-5 mr-2" />
                    Your Subscriptions
                  </h2>
                </div>
                
                {subscriptions && subscriptions.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {subscriptions.map((subscription, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-800">
                            {subscription.provider || "Unknown Service"}
                          </h3>
                          <span className="font-medium text-primary">
                            {subscription.price ? `$${subscription.price.toFixed(2)}` : '$0.00'}
                            <span className="text-gray-500 text-sm font-normal ml-1">
                              /{subscription.frequency === 'yearly' ? 'year' : 'month'}
                            </span>
                          </span>
                        </div>
                        
                        {subscription.renewal_date && (
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Next renewal: {new Date(subscription.renewal_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No subscriptions found</p>
                    <p className="mt-2 text-sm text-gray-400">Scan your emails to find your subscriptions</p>
                  </div>
                )}
              </div>
              
              {/* Main Analytics */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <SubscriptionAnalytics />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-8">
              {/* Card with call to action */}
              <div className="bg-accent/10 rounded-xl p-6 shadow-md border border-accent/20">
                <div className="flex items-start">
                  <ArrowTrendingUpIcon className="h-10 w-10 text-accent mr-4" />
                  <div>
                    <h2 className="text-lg font-bold text-accent">Scan Your Emails</h2>
                    <p className="mt-1 text-sm text-gray-600">Find and track your subscriptions automatically.</p>
                    <button 
                      className="mt-4 bg-accent text-white py-2 px-4 rounded-lg hover:bg-accent/90 transition-colors"
                      onClick={() => window.location.href = '/scanning'}
                    >
                      Start Scan
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Notifications */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex items-center">
                  <BellIcon className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <NotificationCenter />
              </div>
              
              {/* Settings */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold">Notification Settings</h3>
                </div>
                <NotificationSettings />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 