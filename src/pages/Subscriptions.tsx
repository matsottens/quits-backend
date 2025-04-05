import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { Button } from '../components/ui/button';

const Subscriptions: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptions, loading, error } = useSubscriptions();

  if (loading) {
    return <div>Loading subscriptions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Subscriptions</h1>
        <Button
          onClick={() => navigate('/add-subscription')}
          className="bg-[#26457A] text-white"
        >
          Add Subscription
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No subscriptions found.</p>
          <p className="mt-2">
            <Button
              onClick={() => navigate('/add-subscription')}
              className="bg-[#26457A] text-white mt-4"
            >
              Add Your First Subscription
            </Button>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/subscriptions/${subscription.id}`)}
            >
              <h3 className="font-semibold text-lg mb-2">
                {subscription.provider}
              </h3>
              <p className="text-gray-600">
                ${subscription.price} / {subscription.frequency}
              </p>
              {subscription.renewal_date && (
                <p className="text-sm text-gray-500 mt-2">
                  Renews: {new Date(subscription.renewal_date).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions; 