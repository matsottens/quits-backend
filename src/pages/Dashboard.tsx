import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NotificationCenter } from '../components/NotificationCenter';
import { SubscriptionAnalytics } from '../components/SubscriptionAnalytics';
import { NotificationSettings } from '../components/NotificationSettings';
import { SubscriptionScanner } from '../components/SubscriptionScanner';

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const [scanCount, setScanCount] = useState<number | null>(null);
  
  // Check for scan results from navigation state
  useEffect(() => {
    // First priority: check location state (from direct navigation)
    if (location.state && 'scanCount' in location.state) {
      setScanCount(Number(location.state.scanCount));
      // Clear the state to avoid showing the same results on refresh
      window.history.replaceState({}, document.title);
      return;
    }
    
    // Second priority: check localStorage (from previous scans)
    const lastScanCount = localStorage.getItem('last_scan_count');
    if (lastScanCount) {
      setScanCount(Number(lastScanCount));
    }
  }, [location.state]);

  const handleScanComplete = (count: number) => {
    setScanCount(count);
    // Also store in localStorage for persistence
    localStorage.setItem('last_scan_count', count.toString());
    localStorage.setItem('last_scan_time', new Date().toISOString());
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