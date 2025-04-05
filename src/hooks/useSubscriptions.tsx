import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SubscriptionData, PriceChange } from '../types/subscription';

// Define the shape of the context
interface SubscriptionContextType {
  subscriptions: SubscriptionData[];
  priceChanges: PriceChange[];
  loading: boolean;
  error: string | null;
  refreshSubscriptions: () => Promise<void>;
  isLocalDev: boolean;
}

// Create the context with default values
const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptions: [],
  priceChanges: [],
  loading: false,
  error: null,
  refreshSubscriptions: async () => {},
  isLocalDev: false
});

// Provider component
export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we're in a local development environment
  const isLocalDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

  // Function to fetch subscriptions from the API
  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Import the ApiService class directly
      const ApiService = (await import('../services/api')).ApiService;
      const apiService = ApiService.getInstance();
      const response = await apiService.scanEmails();
      
      if (response.success && response.data) {
        setSubscriptions(response.data.subscriptions || []);
        setPriceChanges(response.data.priceChanges || []);
      } else {
        setError(response.error || 'Failed to fetch subscription data');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('An error occurred while fetching subscription data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Provide the context value to consumer components
  const contextValue: SubscriptionContextType = {
    subscriptions,
    priceChanges,
    loading,
    error,
    refreshSubscriptions: fetchSubscriptions,
    isLocalDev
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use the subscription context
export const useSubscriptions = () => useContext(SubscriptionContext);

export default useSubscriptions; 