import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  lastBilled: string;
  selected?: boolean;
}

export const SubscriptionSelection: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    const foundSubscriptions = JSON.parse(localStorage.getItem('found_subscriptions') || '[]');
    setSubscriptions(foundSubscriptions.map((sub: Subscription) => ({ ...sub, selected: true })));
  }, []);

  const handleToggleAll = () => {
    setSelectAll(!selectAll);
    setSubscriptions(subscriptions.map(sub => ({ ...sub, selected: !selectAll })));
  };

  const handleToggleSubscription = (id: string) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === id ? { ...sub, selected: !sub.selected } : sub
    ));
    setSelectAll(subscriptions.every(sub => sub.selected));
  };

  const handleConfirm = () => {
    const selectedSubscriptions = subscriptions.filter(sub => sub.selected);
    localStorage.setItem('active_subscriptions', JSON.stringify(selectedSubscriptions));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#26457A]">Found Subscriptions</h2>
          <p className="mt-2 text-gray-600">Select the subscriptions you want to track</p>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleToggleAll}
                className="h-4 w-4 text-[#26457A] focus:ring-[#26457A] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
            </label>
          </div>

          <div className="space-y-4">
            {subscriptions.map(subscription => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={subscription.selected}
                    onChange={() => handleToggleSubscription(subscription.id)}
                    className="h-4 w-4 text-[#26457A] focus:ring-[#26457A] border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{subscription.name}</p>
                    <p className="text-sm text-gray-500">
                      ${subscription.amount} / {subscription.billingCycle}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Last billed: {new Date(subscription.lastBilled).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleConfirm}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26457A] hover:bg-[#26457A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26457A]"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}; 