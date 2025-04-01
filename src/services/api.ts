import { supabase } from '../supabase';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.quits.cc';
const API_URL_WITH_PROTOCOL = API_URL.startsWith('http') 
  ? API_URL 
  : `https://${API_URL.replace(/^\/+/, '')}`;

// Handle both www and non-www domains
const FRONTEND_URL = window.location.origin;
const FRONTEND_URL_WITHOUT_WWW = FRONTEND_URL.replace(/^www\./, '');

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
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Get authentication headers
      const headers = await this.getAuthHeaders();
      const currentOrigin = window.location.origin;
      
      // Log request details (excluding sensitive data)
      console.log('Making API request:', {
        url: `${API_URL_WITH_PROTOCOL}${endpoint}`,
        method: options.method || 'GET',
        origin: currentOrigin,
        hasAuthToken: !!headers['Authorization'],
        hasGmailToken: !!headers['X-Gmail-Token'],
        hasUserId: !!headers['X-User-ID']
      });

      // Ensure we have all required headers
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
          'Origin': currentOrigin
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include',
        referrerPolicy: 'strict-origin-when-cross-origin'
      });

      // Log CORS headers for debugging
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('access-control-allow-origin'),
        'Access-Control-Allow-Methods': response.headers.get('access-control-allow-methods'),
        'Access-Control-Allow-Headers': response.headers.get('access-control-allow-headers'),
        'Access-Control-Allow-Credentials': response.headers.get('access-control-allow-credentials'),
        'Origin': response.headers.get('origin')
      };

      console.log('CORS Headers:', corsHeaders);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        console.error('API error response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: errorData,
          cors: corsHeaders
        });

        if (response.status === 401) {
          if (errorData?.error === 'Gmail token expired or invalid') {
            console.log('Gmail token expired, redirecting to auth...');
            sessionStorage.removeItem('gmail_access_token');
            window.location.href = '/auth/google';
            return { success: false, error: 'Gmail token expired. Redirecting to Google auth...' };
          } else {
            console.log('Session expired, redirecting to login...');
            await supabase.auth.signOut();
            window.location.href = '/login';
            return { success: false, error: 'Session expired. Please sign in again.' };
          }
        }

        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      // Check if it's an AbortError
      if (error.name === 'AbortError') {
        console.error('Request timed out after 30 seconds');
        return { success: false, error: 'Request timed out. Please try again.' };
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