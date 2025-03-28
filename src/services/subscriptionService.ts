import axios from 'axios';
import { getGoogleAccessToken } from './googleAuth';

const API_URL = process.env.REACT_APP_API_URL;

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  logo?: string;
  emailNotifications: boolean;
  priceChangeNotifications: boolean;
}

export interface SubscriptionCreateInput {
  name: string;
  price: number;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  logo?: string;
  emailNotifications?: boolean;
  priceChangeNotifications?: boolean;
}

export const subscriptionService = {
  async scanEmailSubscriptions(): Promise<Subscription[]> {
    const token = getGoogleAccessToken();
    if (!token) throw new Error('No Google access token found');

    const response = await axios.get(`${API_URL}/subscriptions/scan`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  async getSubscriptions(): Promise<Subscription[]> {
    const response = await axios.get(`${API_URL}/subscriptions`);
    return response.data;
  },

  async createSubscription(subscription: SubscriptionCreateInput): Promise<Subscription> {
    const response = await axios.post(`${API_URL}/subscriptions`, subscription);
    return response.data;
  },

  async updateSubscription(id: string, subscription: Partial<Subscription>): Promise<Subscription> {
    const response = await axios.put(`${API_URL}/subscriptions/${id}`, subscription);
    return response.data;
  },

  async deleteSubscription(id: string): Promise<void> {
    await axios.delete(`${API_URL}/subscriptions/${id}`);
  },

  async getSubscriptionById(id: string): Promise<Subscription> {
    const response = await axios.get(`${API_URL}/subscriptions/${id}`);
    return response.data;
  },

  async searchSubscriptions(query: string): Promise<Subscription[]> {
    const response = await axios.get(`${API_URL}/subscriptions/search`, {
      params: { query },
    });
    return response.data;
  },

  async getUpcomingRenewals(): Promise<Subscription[]> {
    const response = await axios.get(`${API_URL}/subscriptions/upcoming-renewals`);
    return response.data;
  },

  async getPriceChangeAlerts(): Promise<Subscription[]> {
    const response = await axios.get(`${API_URL}/subscriptions/price-changes`);
    return response.data;
  },
}; 