import { supabase } from '../supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Helper function to normalize domain
const normalizeDomain = (url: string) => {
  const withoutWww = url.replace(/^www\./, '');
  return withoutWww.startsWith('http') ? withoutWww : `https://${withoutWww.replace(/^\/+/, '')}`;
};

// API URL with protocol
const API_URL_WITH_PROTOCOL = normalizeDomain(API_URL);

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// Types for subscription data
export interface SubscriptionData {
  provider: string;
  price: number | null;
  frequency: 'monthly' | 'yearly';
  renewal_date: string | null;
  term_months: number | null;
  is_price_increase: boolean;
  lastDetectedDate: string;
}

// Types for API response
interface ScanEmailsResponse {
  success: boolean;
  message: string;
  count: number;
  subscriptions: SubscriptionData[];
  priceChanges: PriceChange[] | null;
}

export interface PriceChange {
  oldPrice: number;
  newPrice: number;
  change: number;
  percentageChange: number;
  term_months: number | null;
  renewal_date: string | null;
  provider: string;
}

class ApiService {
  private static instance: ApiService;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 2;
  
  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Failed to get authentication session');
      }

      if (!session?.access_token) {
        console.error('No access token in session');
        throw new Error('Not authenticated. Please sign in again.');
      }

      // Get Gmail token from session storage
      const gmailToken = sessionStorage.getItem('gmail_access_token');
      if (!gmailToken) {
        console.error('No Gmail token found in session storage');
        throw new Error('No Gmail access token available. Please sign in with Google again.');
      }

      if (!session.user?.id) {
        console.error('No user ID in session');
        throw new Error('No user ID available. Please sign in again.');
      }

      // Log successful header creation (excluding sensitive data)
      console.log('Created auth headers:', {
        hasAccessToken: true,
        hasGmailToken: true,
        hasUserId: true,
        userId: session.user.id
      });

      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'X-Gmail-Token': gmailToken,
        'X-User-ID': session.user.id
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      throw error;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const headers = await this.getAuthHeaders();
      const currentOrigin = window.location.origin;
      
      // Try both www and non-www versions if needed
      const origins = this.retryCount === 0 
        ? [normalizeDomain(currentOrigin)]
        : [currentOrigin, normalizeDomain(currentOrigin)];
      
      const origin = origins[Math.min(this.retryCount, origins.length - 1)];

      console.log('Making API request:', {
        url: `${API_URL_WITH_PROTOCOL}${endpoint}`,
        method: options.method || 'GET',
        origin,
        retryCount: this.retryCount,
        hasAuthToken: !!headers['Authorization'],
        hasGmailToken: !!headers['X-Gmail-Token'],
        hasUserId: !!headers['X-User-ID']
      });

      if (!headers['Authorization']) {
        throw new Error('No authentication token available. Please sign in again.');
      }

      if (!headers['X-Gmail-Token']) {
        throw new Error('No Gmail token available. Please sign in with Google again.');
      }

      if (!headers['X-User-ID']) {
        throw new Error('No user ID available. Please sign in again.');
      }

      const response = await fetch(`${API_URL_WITH_PROTOCOL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
          'Origin': origin
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include',
        referrerPolicy: 'strict-origin-when-cross-origin'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 401) {
          if (errorData?.error === 'Gmail token expired or invalid') {
            sessionStorage.removeItem('gmail_access_token');
            window.location.href = '/auth/google';
            return { success: false, error: 'Gmail token expired. Redirecting to Google auth...' };
          } else {
            await supabase.auth.signOut();
            window.location.href = '/login';
            return { success: false, error: 'Session expired. Please sign in again.' };
          }
        }

        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      // Reset retry count on successful request
      this.retryCount = 0;
      
      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timed out. Please try again.' };
      }

      // Handle CORS errors with retry logic
      if ((error.message.includes('CORS') || error.message.includes('Failed to fetch')) && this.retryCount < this.MAX_RETRIES) {
        console.log(`CORS error, retrying with different origin (attempt ${this.retryCount + 1}/${this.MAX_RETRIES})`);
        this.retryCount++;
        return this.makeRequest(endpoint, options);
      }

      // Reset retry count after max retries or other errors
      this.retryCount = 0;

      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.error('CORS error after all retries:', {
          message: error.message,
          origin: window.location.origin,
          url: `${API_URL_WITH_PROTOCOL}${endpoint}`
        });
        return { 
          success: false, 
          error: 'Unable to access the API. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
      }

      console.error('API request error:', {
        message: error.message,
        type: error.name,
        stack: error.stack,
        url: `${API_URL_WITH_PROTOCOL}${endpoint}`
      });

      return { 
        success: false, 
        error: error.message || 'Failed to make API request',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }

  public async scanEmails(): Promise<ApiResponse<ScanEmailsResponse>> {
    try {
      const response = await this.makeRequest<ScanEmailsResponse>('/api/scan-emails');
      if (response.success && response.data) {
        const data = response.data as ScanEmailsResponse;
        return {
          ...response,
          data: {
            ...data,
            subscriptions: data.subscriptions.map(transformSubscriptionData),
            priceChanges: data.priceChanges?.map(transformPriceChange) || null
          }
        };
      }
      return response as ApiResponse<ScanEmailsResponse>;
    } catch (error) {
      console.error('Error scanning emails:', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        message: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new Error(
        error instanceof Error 
          ? `Failed to scan emails: ${error.message}`
          : 'Failed to scan emails: Unknown error'
      );
    }
  }

  public async getNotifications(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/notifications');
  }

  public async markNotificationAsRead(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/notifications/${id}/read`, {
      method: 'POST'
    });
  }

  public async getNotificationSettings(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/notification-settings');
  }

  public async updateNotificationSettings(settings: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/notification-settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  }

  public async getSubscriptionAnalytics(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/subscription-analytics');
  }

  public async testCors(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/test-cors');
  }
}

// Transform raw subscription data to frontend format
const transformSubscriptionData = (data: SubscriptionData): SubscriptionData => {
  return {
    ...data,
    // Ensure price is a number or null
    price: data.price ? Number(data.price) : null,
    // Ensure renewal_date is in ISO format or null
    renewal_date: data.renewal_date ? new Date(data.renewal_date).toISOString() : null,
    // Default to monthly if frequency is not specified
    frequency: data.frequency || 'monthly',
    // Ensure term_months is a number or null
    term_months: data.term_months ? Number(data.term_months) : null
  };
};

// Transform raw price change data to frontend format
const transformPriceChange = (change: PriceChange): PriceChange => {
  return {
    ...change,
    oldPrice: Number(change.oldPrice),
    newPrice: Number(change.newPrice),
    change: Number(change.change),
    percentageChange: Number(change.percentageChange),
    term_months: change.term_months ? Number(change.term_months) : null,
    renewal_date: change.renewal_date ? new Date(change.renewal_date).toISOString() : null
  };
};

export const apiService = ApiService.getInstance(); 