import React, { useState } from 'react';
import { NotificationCenter } from '../components/NotificationCenter';
import { SubscriptionAnalytics } from '../components/SubscriptionAnalytics';
import { NotificationSettings } from '../components/NotificationSettings';
import { SubscriptionScanner } from '../components/SubscriptionScanner';

export const Dashboard: React.FC = () => {
  const [scanCount, setScanCount] = useState<number | null>(null);

  const handleScanComplete = (count: number) => {
    setScanCount(count);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Analytics & Scanner */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Scanner */}
          <SubscriptionScanner onScanComplete={handleScanComplete} />
          
          {/* Analytics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <SubscriptionAnalytics scanCount={scanCount} />
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