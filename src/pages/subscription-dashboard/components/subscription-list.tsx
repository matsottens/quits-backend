import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import ManageSubscription, { SubscriptionData } from '../../../components/subscription/ManageSubscription';

interface SubscriptionListProps {
  searchQuery?: string;
}

export default function SubscriptionList({ searchQuery }: SubscriptionListProps) {
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionData | null>(null);

  // Sample subscription data
  const subscriptions: SubscriptionData[] = [
    {
      id: "1",
      name: "Netflix",
      amount: "15.99",
      nextBilling: "2024-03-15",
      billingCycle: "monthly",
      category: "entertainment",
      notifyBefore: "7",
      notificationType: "email",
      isActive: true,
      description: "Streaming service",
      provider: "Netflix Inc.",
      type: "Streaming",
      price: "15.99",
      frequency: "monthly",
      next_renewal_date: "2024-03-15",
      status: "active"
    },
    {
      id: "2",
      name: "Spotify",
      amount: "9.99",
      nextBilling: "2024-03-20",
      billingCycle: "monthly",
      category: "entertainment",
      notifyBefore: "7",
      notificationType: "email",
      isActive: true,
      description: "Music streaming",
      provider: "Spotify AB",
      type: "Music",
      price: "9.99",
      frequency: "monthly",
      next_renewal_date: "2024-03-20",
      status: "active"
    },
  ];

  // Filter subscriptions based on search query
  const filteredSubscriptions = searchQuery
    ? subscriptions.filter((sub) => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : subscriptions;

  const handleSubscriptionClick = (subscription: SubscriptionData) => {
    setSelectedSubscription(subscription);
  };

  const handleSaveSubscription = (updatedSubscription: SubscriptionData) => {
    // Here you would typically make an API call to update the subscription
    console.log('Saving subscription:', updatedSubscription);
    // Update the local state
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === updatedSubscription.id ? updatedSubscription : sub
    );
    // You would typically update your state management here
    console.log('Updated subscriptions:', updatedSubscriptions);
  };

  const handleDeleteSubscription = (id: string) => {
    // Here you would typically make an API call to delete the subscription
    console.log('Deleting subscription:', id);
    // You would typically update your state management here
  };

  return (
    <>
      <div className="divide-y divide-gray-200">
        {filteredSubscriptions.map((subscription) => (
          <div 
            key={subscription.id} 
            className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 cursor-pointer"
            onClick={() => handleSubscriptionClick(subscription)}
          >
            <div className="flex items-center">
              <LogoComponent name={subscription.name} logo={subscription.name[0]} />
              <div className="ml-4">
                <span className="text-xl font-medium">{subscription.name}</span>
                <div className="text-sm text-gray-500">Next billing: {subscription.nextBilling}</div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-xl font-medium">€{subscription.amount}</span>
              <button className="p-1">
                <MoreVertical className="h-6 w-6" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedSubscription && (
        <ManageSubscription
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          onSave={handleSaveSubscription}
          onDelete={handleDeleteSubscription}
        />
      )}
    </>
  );
}

// Custom component to display subscription logos
function LogoComponent({ name, logo }: { name: string; logo: string }) {
  // Custom logos for specific subscriptions
  switch (name) {
    case "Volkskrant":
      return <div className="w-10 h-10 flex items-center justify-center font-serif text-2xl font-bold">V</div>
    case "Monday":
      return (
        <div className="w-10 h-10 flex items-center">
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <rect x="2" y="6" width="6" height="12" rx="2" fill="#ff3030" />
            <rect x="9" y="6" width="6" height="12" rx="2" fill="#ffba00" />
            <rect x="16" y="6" width="6" height="12" rx="2" fill="#30c566" />
          </svg>
        </div>
      )
    case "Parool":
      return <div className="w-10 h-10 flex items-center justify-center font-serif text-2xl font-bold">P</div>
    case "Trouw":
      return (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#003b7a] text-white font-bold">
          T
        </div>
      )
    case "Netflix":
      return <div className="w-10 h-10 flex items-center justify-center bg-red-600 text-white font-bold">N</div>
    case "Duolingo":
      return (
        <div className="w-10 h-10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z"
              fill="#58cc02"
            />
            <circle cx="9" cy="9" r="2" fill="white" />
            <circle cx="15" cy="9" r="2" fill="white" />
            <circle cx="9" cy="9" r="1" fill="black" />
            <circle cx="15" cy="9" r="1" fill="black" />
            <path
              d="M12,14C10.5,14 9.2,14.5 8.2,15.4L9.5,17C10.2,16.4 11.1,16 12,16C12.9,16 13.8,16.4 14.5,17L15.8,15.4C14.8,14.5 13.5,14 12,14Z"
              fill="white"
            />
          </svg>
        </div>
      )
    default:
      return <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full font-bold">{logo}</div>
  }
}

