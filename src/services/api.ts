import { supabase } from '../supabase';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.quits.cc';
const API_URL_WITH_PROTOCOL = API_URL.startsWith('http') ? API_URL : `https://${API_URL.replace(/^\/+/, '')}`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    const gmailToken = sessionStorage.getItem('gmail_access_token');

    if (!session?.access_token) {
      throw new Error('Not authenticated. Please sign in again.');
    }

    if (!gmailToken) {
      throw new Error('No Gmail access token available. Please sign in with Google again.');
    }

    if (!session.user?.id) {
      throw new Error('No user ID available. Please sign in again.');
    }

    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'X-Gmail-Token': gmailToken,
      'X-User-ID': session.user.id
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL_WITH_PROTOCOL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
          if (errorData?.error === 'Gmail token expired or invalid') {
            // Clear Gmail tokens and redirect to Google auth
            sessionStorage.removeItem('gmail_access_token');
            window.location.href = '/auth/google';
            return { success: false, error: 'Gmail token expired. Redirecting to Google auth...' };
          } else {
            // Other auth errors - clear session and redirect to login
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
      console.error('API request error:', {
        error: error.message,
        type: error.name,
        stack: error.stack
      });
      return { success: false, error: error.message || 'Failed to make API request' };
    }
  }

  public async scanEmails(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/scan-emails');
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
}

export const apiService = ApiService.getInstance(); 