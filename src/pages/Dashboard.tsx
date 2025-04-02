import React from 'react';
import { NotificationCenter } from '../components/NotificationCenter';
import { SubscriptionAnalytics } from '../components/SubscriptionAnalytics';
import { NotificationSettings } from '../components/NotificationSettings';

export const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Analytics */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <SubscriptionAnalytics />
          </div>
        </div>

        {/* Sidebar - Notifications and Settings */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-lg">
            <NotificationCenter />
          </div>
          <div className="bg-white rounded-lg shadow-lg">
            <NotificationSettings />
          </div>
        </div>
      </div>
    </div>
  );
}; 