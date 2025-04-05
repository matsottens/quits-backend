import * as React from 'react';
import { Button } from '../components/ui/button';

const SubscriptionDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-lg font-semibold">Subscription Dashboard</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline">Settings</Button>
            <Button>Profile</Button>
          </div>
        </div>
      </header>
      <main className="container py-6">
        <div className="grid gap-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Your Subscriptions</h2>
            <div className="space-y-4">
              {/* Subscription list will go here */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionDashboard; 