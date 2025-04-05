import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { Button } from '../components/ui/button';

const SubscriptionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subscriptions, loading, error, deleteSubscription } = useSubscriptions();

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const subscription = subscriptions.find(sub => sub.id === id);

  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Subscription not found</h1>
        <Button
          onClick={() => navigate('/subscriptions')}
          className="bg-[#26457A] text-white"
        >
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      const success = await deleteSubscription(subscription.id);
      if (success) {
        navigate('/subscriptions');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{subscription.provider}</h1>
        <div className="space-x-4">
          <Button
            onClick={() => navigate('/subscriptions')}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Price</h3>
          <p className="mt-1 text-lg">${subscription.price} / {subscription.frequency}</p>
        </div>

        {subscription.renewal_date && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Next Renewal</h3>
            <p className="mt-1 text-lg">
              {new Date(subscription.renewal_date).toLocaleDateString()}
            </p>
          </div>
        )}

        {subscription.term_months && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Term Length</h3>
            <p className="mt-1 text-lg">{subscription.term_months} months</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500">Last Detected</h3>
          <p className="mt-1 text-lg">
            {new Date(subscription.lastDetectedDate).toLocaleDateString()}
          </p>
        </div>

        {subscription.is_price_increase && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
            <h3 className="text-sm font-medium text-yellow-800">Price Increase Detected</h3>
            <p className="mt-1 text-sm text-yellow-700">
              This subscription has had a recent price increase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetailsPage; 