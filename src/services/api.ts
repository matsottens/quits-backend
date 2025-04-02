import { supabase } from '../supabase';

// Add API URL configuration
const API_URL = process.env.NODE_ENV === 'development' 
  ? '' // Use proxy in development
  : 'https://api.quits.cc'; // Use full URL in production

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
  private originVariations: string[] = [];
  
  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
      console.log('Created new ApiService instance');
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
        userId: session.user.id,
        email: session.user.email
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
      // Clear any invalid tokens
      sessionStorage.removeItem('gmail_access_token');
      throw error;
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const headers = await this.getAuthHeaders();
      const currentOrigin = window.location.origin;

      // Initialize origin variations if not already done
      if (this.originVariations.length === 0) {
        const domain = currentOrigin.replace(/^https?:\/\//, '').replace(/^www\./, '');
        this.originVariations = [
          `https://www.${domain}`,
          `https://${domain}`,
          `http://www.${domain}`,
          `http://${domain}`
        ];
      }

      const requestUrl = `${API_URL}${endpoint}`;
      const method = options.method || 'GET';
      
      console.log('Making API request:', {
        url: requestUrl,
        method,
        origin: currentOrigin,
        retryCount: this.retryCount,
        hasAuthToken: !!headers['Authorization'],
        hasGmailToken: !!headers['X-Gmail-Token'],
        hasUserId: !!headers['X-User-ID'],
        environment: process.env.NODE_ENV,
        headers: Object.keys(headers),
        options: {
          ...options,
          headers: Object.keys(options.headers || {})
        }
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

      const response = await fetch(requestUrl, {
        ...options,
        method, // Explicitly set the method
        headers: {
          ...headers,
          ...options.headers,
          'Origin': currentOrigin,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include',
        referrerPolicy: 'strict-origin-when-cross-origin'
      });

      clearTimeout(timeoutId);

      // Log response status and headers for debugging
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
        type: response.type,
        ok: response.ok
      });

      // Try to get the response text first
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: responseText };
        }
        
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

      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid JSON response from API');
      }

      // Reset retry count and origin variations on successful request
      this.retryCount = 0;
      this.originVariations = [];
      
      return { success: true, data };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timed out. Please try again.' };
      }

      // Handle CORS errors with retry logic
      if ((error.message.includes('CORS') || error.message.includes('Failed to fetch')) && this.retryCount < this.MAX_RETRIES) {
        console.log(`CORS error, retrying with different origin (attempt ${this.retryCount + 1}/${this.MAX_RETRIES})`);
        this.retryCount++;
        
        // Try a different origin variation
        const nextOrigin = this.originVariations[this.retryCount % this.originVariations.length];
        if (nextOrigin) {
          console.log('Retrying with origin:', nextOrigin);
          // Get fresh auth headers for the retry
          const retryHeaders = await this.getAuthHeaders();
          // Create new headers with the next origin
          const newHeaders = {
            ...retryHeaders,
            ...options.headers,
            'Origin': nextOrigin,
            'Content-Type': 'application/json'
          };
          return this.makeRequest(endpoint, { ...options, headers: newHeaders });
        }
      }

      // Reset retry count and origin variations after max retries or other errors
      this.retryCount = 0;
      this.originVariations = [];

      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.error('CORS error after all retries:', {
          message: error.message,
          origin: window.location.origin,
          url: endpoint,
          triedOrigins: this.originVariations,
          environment: process.env.NODE_ENV
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
        url: endpoint,
        environment: process.env.NODE_ENV
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
      console.log('Starting scanEmails request...');
      const response = await this.makeRequest<ScanEmailsResponse>('/api/scan-emails', {
        method: 'POST'
      });

      if (!response.success) {
        console.error('scanEmails failed:', response.error);
        return response;
      }

      if (!response.data) {
        console.error('scanEmails returned no data');
        return {
          success: false,
          error: 'No data received from scan-emails endpoint'
        };
      }

      // Transform the data using our transform functions
      const transformedData: ScanEmailsResponse = {
        ...response.data,
        subscriptions: response.data.subscriptions.map(transformSubscriptionData),
        priceChanges: response.data.priceChanges?.map(transformPriceChange) || null
      };

      console.log('scanEmails successful:', {
        count: transformedData.count,
        subscriptionsCount: transformedData.subscriptions?.length,
        priceChangesCount: transformedData.priceChanges?.length
      });

      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      console.error('Error in scanEmails:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      };
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