import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  cost: number;
  nextBilling: Date;
}

const SubscriptionDashboard: React.FC = () => {
  // Sample data - replace with actual data from your backend
  const subscriptions: Subscription[] = [
    {
      id: '1',
      name: 'Netflix',
      cost: 15.99,
      nextBilling: new Date('2024-04-01'),
    },
    {
      id: '2',
      name: 'Spotify',
      cost: 9.99,
      nextBilling: new Date('2024-04-15'),
    },
  ];

  const totalCost = subscriptions.reduce((sum, sub) => sum + sub.cost, 0);
  const upcomingRenewals = subscriptions.filter(
    (sub) => sub.nextBilling.getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Subscription Dashboard</h1>
              <p className="text-primary-foreground/80 mt-1">
                Manage your subscriptions and track expenses
              </p>
            </div>
            <Button variant="secondary" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subscription
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
              <p className="text-xs text-muted-foreground">Active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingRenewals}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
            <Button variant="outline" size="sm">View all</Button>
          </div>
          <div className="grid gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium leading-none">{subscription.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Next billing: {subscription.nextBilling.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium">${subscription.cost.toFixed(2)}</div>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Edit {subscription.name}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M4 12h16" />
                          <path d="M12 4v16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionDashboard; 