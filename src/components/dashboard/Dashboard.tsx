import React from 'react';
import { NotificationCenter } from './NotificationCenter';
import { SubscriptionAnalytics } from './SubscriptionAnalytics';
import { NotificationSettings } from './NotificationSettings';

export const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Analytics */}
        <div className="lg:col-span-2">
          <SubscriptionAnalytics />
        </div>

        {/* Sidebar - Notifications and Settings */}
        <div className="space-y-8">
          <NotificationCenter />
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
}; 