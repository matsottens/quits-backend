import { supabase } from '../supabase';
import { Session } from '@supabase/supabase-js';
import { SubscriptionData, PriceChange } from '../types/subscription';

// Other interfaces
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

interface ScanEmailsResponse {
  success: boolean;
  message: string;
  count: number;
  subscriptions: SubscriptionData[];
  priceChanges: PriceChange[] | null;
}

interface ScanEmailsApiResponse {
  subscriptions: SubscriptionData[];
  count: number;
  priceChanges: PriceChange[] | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://quits-api.vercel.app';
// Explicitly disable mock data
const USE_MOCK_DATA = false;

// Mock data for local development
const MOCK_SUBSCRIPTIONS: SubscriptionData[] = [
  {
    id: 'mock-1',
    provider: 'Netflix',
    price: 15.99,
    frequency: 'monthly',
    renewal_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    term_months: 1,
    is_price_increase: false,
    lastDetectedDate: new Date().toISOString(),
    title: 'Netflix Standard'
  },
  {
    id: 'mock-2',
    provider: 'Spotify',
    price: 9.99,
    frequency: 'monthly',
    renewal_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    term_months: 1,
    is_price_increase: false,
    lastDetectedDate: new Date().toISOString(),
    title: 'Spotify Premium'
  },
  {
    id: 'mock-3',
    provider: 'Adobe',
    price: 52.99,
    frequency: 'monthly',
    renewal_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    term_months: 12,
    is_price_increase: true,
    lastDetectedDate: new Date().toISOString(),
    title: 'Adobe Creative Cloud'
  },
  {
    id: 'mock-4',
    provider: 'Disney+',
    price: 7.99,
    frequency: 'monthly',
    renewal_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    term_months: 1,
    is_price_increase: false,
    lastDetectedDate: new Date().toISOString(),
    title: 'Disney+ Basic'
  }
];

const MOCK_PRICE_CHANGES: PriceChange[] = [
  {
    provider: 'Adobe',
    oldPrice: 49.99,
    newPrice: 52.99,
    change: 3.00,
    percentageChange: 6.0,
    term_months: 12,
    renewal_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    provider: 'Netflix',
    oldPrice: 13.99,
    newPrice: 15.99,
    change: 2.00,
    percentageChange: 14.3,
    term_months: 1,
    renewal_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Netflix price increase',
    message: 'Your Netflix subscription price will increase from $13.99 to $15.99 on your next billing cycle.',
    type: 'price_increase',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: '2',
    title: 'Spotify renewal coming up',
    message: 'Your Spotify Premium subscription will renew in 7 days at $9.99.',
    type: 'renewal_reminder',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false
  }
];

class ApiService {
  private static instance: ApiService;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;
  
  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
      console.log('Created new ApiService instance');
    }
    return ApiService.instance;
  }

  private async refreshAuthToken(): Promise<void> {
    if (this.isRefreshing) {
      return this.refreshPromise!;
    }

    this.isRefreshing = true;
    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Token refresh failed:', error);
          throw error;
        }

        if (!session) {
          throw new Error('No session after refresh');
        }

        if (session.provider_token) {
          sessionStorage.setItem('gmail_access_token', session.provider_token);
        }

        resolve();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        sessionStorage.removeItem('gmail_access_token');
        await supabase.auth.signOut();
        window.location.href = '/login';
        reject(error);
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    });

    return this.refreshPromise;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // For local development with mock data, return empty headers
    if (USE_MOCK_DATA) {
      console.log('Using mock data, skipping auth headers');
      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      };
    }
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Failed to get authentication session');
      }

      if (!session) {
        console.error('No session found');
        await this.refreshAuthToken();
        const { data: { session: refreshedSession } } = await supabase.auth.getSession();
        if (!refreshedSession) {
        throw new Error('Not authenticated. Please sign in again.');
        }
        return this.constructHeaders(refreshedSession);
      }

      return this.constructHeaders(session);
    } catch (error) {
      console.error('Error getting auth headers:', error);
      sessionStorage.removeItem('gmail_access_token');
      if (error instanceof Error && 
          (error.message.includes('Not authenticated') || 
           error.message.includes('Invalid token'))) {
        await supabase.auth.signOut();
        window.location.href = '/login';
      }
      throw error;
    }
  }

  private constructHeaders(session: Session): Record<string, string> {
      const gmailToken = sessionStorage.getItem('gmail_access_token');
      if (!gmailToken) {
        throw new Error('No Gmail access token available. Please sign in with Google again.');
      }

      if (!session.user?.id) {
        throw new Error('No user ID available. Please sign in again.');
      }

    const accessToken = session.access_token.trim();
    if (!accessToken.includes('.')) {
      throw new Error('Invalid token format. Please sign in again.');
    }

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
      'Authorization': `Bearer ${accessToken}`,
        'X-Gmail-Token': gmailToken,
      'X-User-ID': session.user.id,
      'Origin': window.location.origin
    };
  }

  public async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // For local development with mock data
    if (USE_MOCK_DATA) {
      console.log('Using mock data for endpoint:', endpoint);
      let mockResponse: any = null;
      
      // Return appropriate mock data based on the endpoint
      if (endpoint === '/scan-emails' || endpoint === '/api/scan-emails') {
        mockResponse = {
          subscriptions: MOCK_SUBSCRIPTIONS,
          count: MOCK_SUBSCRIPTIONS.length,
          priceChanges: MOCK_PRICE_CHANGES
        };
      } else if (endpoint === '/api/notifications') {
        mockResponse = MOCK_NOTIFICATIONS;
      } else if (endpoint.includes('/api/notifications/') && endpoint.includes('/read')) {
        const id = endpoint.split('/')[3];
        MOCK_NOTIFICATIONS.find(n => n.id === id)!.read = true;
        mockResponse = { success: true };
      } else if (endpoint === '/api/notification-settings') {
        mockResponse = {
          emailNotifications: true,
          pushNotifications: false,
          priceChangeAlerts: true,
          renewalReminders: true
        };
      } else if (endpoint === '/api/subscription-analytics') {
        mockResponse = {
          totalSpend: MOCK_SUBSCRIPTIONS.reduce((sum, sub) => sum + (sub.price || 0), 0),
          subscriptionCount: MOCK_SUBSCRIPTIONS.length,
          mostExpensive: MOCK_SUBSCRIPTIONS.reduce((prev, current) => 
            (prev.price || 0) > (current.price || 0) ? prev : current),
          upcomingRenewals: MOCK_SUBSCRIPTIONS.filter(sub => 
            new Date(sub.renewal_date || '') < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        };
      } else if (endpoint === '/api/test-cors') {
        mockResponse = { message: 'CORS test successful', timestamp: new Date().toISOString() };
      }
      
      if (mockResponse) {
        return { success: true, data: mockResponse as T };
      }
      
      return { 
        success: false, 
        error: 'Endpoint not mocked: ' + endpoint
      };
    }
    
    // Real API request logic for production
    try {
      const headers = await this.getAuthHeaders();
      const path = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      const url = `${API_URL}${path}`;
      
      console.log('Making API request:', {
        url,
        method: options.method || 'GET',
        hasAuthToken: !!headers['Authorization'],
        hasGmailToken: !!headers['X-Gmail-Token'],
        hasUserId: !!headers['X-User-ID']
      });

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  public async scanEmails(): Promise<ApiResponse<ScanEmailsApiResponse>> {
    console.log('Starting email scan process...');
    
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Authentication required to scan emails');
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.quits.cc';
      const url = `${apiUrl}/api/scan-emails`;
      console.log(`Scanning emails with API endpoint: ${url}`);

      // Track start time for performance monitoring
      const startTime = new Date().getTime();
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
      });
      
      const endTime = new Date().getTime();
      console.log(`Scan request completed in ${(endTime - startTime) / 1000} seconds`);

      if (!response.ok) {
        // Get status information
        const statusText = response.statusText;
        const status = response.status;
        console.error(`Scan failed with status ${status}: ${statusText}`);
        
        // Try to get more details from the response
        let errorDetails = '';
        try {
          const errorResponse = await response.json();
          errorDetails = errorResponse.message || errorResponse.error || JSON.stringify(errorResponse);
        } catch (e) {
          // If we can't parse the JSON, use the status text
          errorDetails = statusText;
        }
        
        throw new Error(`Email scan failed (${status}): ${errorDetails}`);
      }
      
      const result = await response.json();
      console.log('Scan completed successfully', result);

      // Check for empty results
      if (!result.subscriptions || !Array.isArray(result.subscriptions)) {
        console.warn('No subscription data returned from scan', result);
        
        // In development, use mock data as fallback
        if (import.meta.env.DEV) {
          console.log('Using mock subscription data in development mode');
          return this.getMockScanResults();
        }
        
        throw new Error('No subscription data found in scan results');
      }
      
      // Save results to localStorage for persistence
      localStorage.setItem('last_scan_count', result.subscriptions.length.toString());
      localStorage.setItem('last_subscriptions', JSON.stringify(result.subscriptions));
      
      return result;
    } catch (error) {
      console.error('Error scanning emails:', error);
      
      // In development, use mock data as fallback
      if (import.meta.env.DEV) {
        console.log('Using mock subscription data in development mode due to error');
        return this.getMockScanResults();
      }
      
      throw error;
    }
  }

  // Helper to generate consistent mock data for development
  private getMockScanResults(): ApiResponse<ScanEmailsApiResponse> {
    const mockSubscriptions: SubscriptionData[] = [
      {
        id: 'mock-1',
        provider: 'Netflix',
        title: 'Premium Plan',
        price: 15.99,
        frequency: 'monthly',
        renewal_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        category: 'Entertainment',
        last_payment_date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        term_months: 1,
        is_price_increase: false,
        lastDetectedDate: new Date().toISOString()
      },
      {
        id: 'mock-2',
        provider: 'Spotify',
        title: 'Family Plan',
        price: 14.99,
        frequency: 'monthly',
        renewal_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
        category: 'Entertainment',
        last_payment_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        term_months: 1,
        is_price_increase: false,
        lastDetectedDate: new Date().toISOString()
      },
      {
        id: 'mock-3',
        provider: 'Adobe',
        title: 'Creative Cloud',
        price: 52.99,
        frequency: 'monthly',
        renewal_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        category: 'Productivity',
        last_payment_date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
        term_months: 1,
        is_price_increase: false,
        lastDetectedDate: new Date().toISOString()
      },
      {
        id: 'mock-4',
        provider: 'Notion',
        title: 'Pro Plan',
        price: 48,
        frequency: 'yearly',
        renewal_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
        category: 'Productivity',
        last_payment_date: new Date(Date.now() - 320 * 24 * 60 * 60 * 1000).toISOString(),
        term_months: 12,
        is_price_increase: false,
        lastDetectedDate: new Date().toISOString()
      },
      {
        id: 'mock-5',
        provider: 'Google',
        title: 'Google One Storage',
        price: 29.99,
        frequency: 'yearly',
        renewal_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        category: 'Cloud Storage',
        last_payment_date: new Date(Date.now() - 363 * 24 * 60 * 60 * 1000).toISOString(),
        term_months: 12,
        is_price_increase: false,
        lastDetectedDate: new Date().toISOString()
      },
      {
        id: 'mock-6',
        provider: 'Amazon',
        title: 'Prime Membership',
        price: 139,
        frequency: 'yearly',
        renewal_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days from now
        category: 'Shopping',
        last_payment_date: new Date(Date.now() - 245 * 24 * 60 * 60 * 1000).toISOString(),
        term_months: 12,
        is_price_increase: false,
        lastDetectedDate: new Date().toISOString()
      }
    ];
    
    // Save mock results
    localStorage.setItem('last_scan_count', mockSubscriptions.length.toString());
    localStorage.setItem('last_subscriptions', JSON.stringify(mockSubscriptions));

      return {
        success: true,
      data: {
        subscriptions: mockSubscriptions,
        count: mockSubscriptions.length,
        priceChanges: null
      }
    };
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
const transformSubscriptionData = (data: Partial<SubscriptionData>): SubscriptionData => {
  const frequency = data.frequency === 'yearly' ? 'yearly' : 'monthly';
  return {
    id: data.id || `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    provider: data.provider || 'Unknown',
    price: data.price || null,
    frequency,
    renewal_date: data.renewal_date || null,
    term_months: data.term_months || null,
    is_price_increase: data.is_price_increase || false,
    lastDetectedDate: data.lastDetectedDate || new Date().toISOString(),
    title: data.title
  };
};

// Helper function to process provider-specific information
const processProviderSpecificInfo = (data: SubscriptionData): SubscriptionData => {
  // Hardcoded mapping for common subscription services
  const directServiceMap: Record<string, string> = {
    // Popular streaming services
    'netflix': 'Netflix',
    'spotify': 'Spotify',
    'apple': 'Apple',
    'youtube': 'YouTube Premium',
    'disney': 'Disney+',
    'hbo': 'HBO Max',
    'prime': 'Amazon Prime',
    'amazon': 'Amazon',
    'pandora': 'Pandora',
    'hulu': 'Hulu',
    'crunchyroll': 'Crunchyroll',
    'peacock': 'Peacock',
    'paramount': 'Paramount+',
    'showtime': 'Showtime',
    'starz': 'Starz',
    
    // Sports subscriptions
    'nba': 'NBA League Pass',
    'nfl': 'NFL Game Pass',
    'mlb': 'MLB.tv',
    'ufc': 'UFC Fight Pass',
    'espn': 'ESPN+',
    
    // Language learning services
    'babbel': 'Babbel',
    'duolingo': 'Duolingo',
    'rosetta': 'Rosetta Stone',
    
    // Software services
    'adobe': 'Adobe',
    'office': 'Microsoft Office',
    'microsoft': 'Microsoft',
    'autodesk': 'Autodesk',
    'dropbox': 'Dropbox',
    'github': 'GitHub',
    'slack': 'Slack',
    'zoom': 'Zoom',
    
    // Other popular subscriptions
    'nytimes': 'New York Times',
    'wsj': 'Wall Street Journal',
    'medium': 'Medium',
    'patreon': 'Patreon',
    'onlyfans': 'OnlyFans',
    'substack': 'Substack',
    
    // Utilities
    'domain': 'Domain Registration',
    'hosting': 'Web Hosting',
    'vpn': 'VPN Service',
    'cloud': 'Cloud Storage',
  };
  
  // Extract provider name from input if we haven't already determined it from the title
  let providerName = data.provider || '';
  const rawProvider = providerName.toLowerCase();
  
  // Step 1: Direct match against common services
  for (const [key, value] of Object.entries(directServiceMap)) {
    if (rawProvider.includes(key)) {
      providerName = value;
      console.log(`Direct match found: ${key} → ${value}`);
      break;
    }
  }
  
  // Step 2: Handle email-like formats
  if (providerName === data.provider && providerName.includes('@')) {
    // Extract domain part
    const emailParts = providerName.split('@');
    if (emailParts[1]) {
      const domainPart = emailParts[1].split('.')[0];
      
      // Check if domain matches any known service
      for (const [key, value] of Object.entries(directServiceMap)) {
        if (domainPart.toLowerCase() === key) {
          providerName = value;
          console.log(`Domain match found: ${domainPart} → ${value}`);
          break;
        }
      }
      
      // If still no match, format the domain as the service name
      if (providerName === data.provider) {
        providerName = domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
        console.log(`Using formatted domain: ${providerName}`);
      }
    }
  }
  
  // Step 3: Handle generic "from" or noreply patterns
  if (providerName === data.provider) {
    const lowerProvider = providerName.toLowerCase();
    if (lowerProvider.startsWith('noreply@') || 
        lowerProvider.startsWith('no-reply@') || 
        lowerProvider.startsWith('notify@') || 
        lowerProvider.startsWith('notifications@') || 
        lowerProvider.startsWith('info@') || 
        lowerProvider.startsWith('support@') || 
        lowerProvider.startsWith('billing@')) {
      
      const domain = lowerProvider.split('@')[1]?.split('.')[0];
      if (domain) {
        // Capitalize first letter of each word
        providerName = domain
          .split(/[-_.]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        console.log(`From email pattern: ${providerName}`);
      }
    }
  }
  
  // Step 4: Extract company name from broader context if available
  if (!providerName || providerName === data.provider) {
    // One last attempt - try to extract a valid company name from the provider field
    const extractedName = extractCompanyName(data.provider);
    if (extractedName) {
      providerName = extractedName;
      console.log(`Extracted company name: ${providerName}`);
    } else {
      providerName = "Unknown Service";
      console.log(`Fallback to Unknown Service`);
    }
  }

  // Handle price: use provided price or try to extract from raw data
  let price = 0;
  if (data.price !== null && data.price !== undefined) {
    price = Number(data.price);
  } else if (typeof data.provider === 'string') {
    // Try to extract a price from the provider field if it contains monetary values
    const extractedPrice = extractPriceFromString(data.provider);
    if (extractedPrice !== null) {
      price = extractedPrice;
      console.log(`Extracted price: ${price}`);
    }
  }
  
  return {
    ...data,
    provider: providerName,
    price: price,
    frequency: data.frequency || 'monthly',
    renewal_date: data.renewal_date ? new Date(data.renewal_date).toISOString() : null,
    term_months: data.term_months ? Number(data.term_months) : null,
  };
};

// Helper function to process Apple subscription emails
function processAppleSubscription(data: SubscriptionData): SubscriptionData {
  console.log('Processing Apple subscription');
  let provider = 'Apple Subscription';
  let price = 0;
  let frequency: 'monthly' | 'yearly' = data.frequency === 'yearly' ? 'yearly' : 'monthly';
  let renewalDate = null;
  
  // Look for specific app name pattern
  if (typeof data.provider === 'string') {
    // Extract app name
    const appMatch = data.provider.match(/App\s+(.+?)(?=\s+Subscription|$)/i);
    if (appMatch && appMatch[1]) {
      provider = appMatch[1].trim();
      console.log(`Found app name: ${provider}`);
    }
    
    // Look for Babbel specifically
    if (data.provider.toLowerCase().includes('babbel')) {
      provider = 'Babbel';
      console.log('Detected Babbel subscription');
    }
    
    // Extract renewal price with Euro symbol
    const euroMatch = data.provider.match(/€\s*(\d+[\.,]\d+)(?:\/(\d+)\s*(months|month))?/i);
    if (euroMatch) {
      const fullAmount = parseFloat(euroMatch[1].replace(',', '.'));
      console.log(`Found Euro amount: ${fullAmount}`);
      
      // Check if there's a period mentioned
      if (euroMatch[2] && euroMatch[3]) {
        const period = parseInt(euroMatch[2]);
        // Calculate monthly price
        if (period > 1) {
          price = fullAmount / period;
          console.log(`Extracted price: ${price}`);
        }
      }
    }
  }
  
  return {
    ...data,
    provider: provider,
    price: price,
    frequency: frequency,
    renewal_date: renewalDate,
    term_months: data.term_months ? Number(data.term_months) : null,
  };
}

// Helper function to extract a potential company name from a raw provider string
const extractCompanyName = (str: string): string | null => {
  if (!str) return null;
  
  // Potential company name patterns
  const patterns = [
    // Try to match "Company Name" <email> pattern
    /"([^"]+)"/,
    // Try to match 'Company Name' <email> pattern  
    /'([^']+)'/,
    // Try to match Company Name <email> pattern
    /^([^<]+)</,
    // Try to match words between brackets
    /\[([^\]]+)\]/,
    // Try to match words between parentheses
    /\(([^)]+)\)/,
  ];
  
  for (const pattern of patterns) {
    const matches = str.match(pattern);
    if (matches && matches[1] && matches[1].length > 2) {
      return matches[1].trim();
    }
  }
  
  return null;
};

// Helper function to extract a price from a string (looking for $ or € symbols)
const extractPriceFromString = (str: string): number | null => {
  if (!str) return null;
  
  // Match patterns like $9.99, €10, $13.50
  const matches = str.match(/[\$€£](\d+[.,]?\d*)/);
  if (matches && matches[1]) {
    return parseFloat(matches[1].replace(',', '.'));
  }
  
  // Also try to match numbers followed by currency symbols
  const altMatches = str.match(/(\d+[.,]?\d*)[\$€£]/);
  if (altMatches && altMatches[1]) {
    return parseFloat(altMatches[1].replace(',', '.'));
  }
  
  // Match euro formats with comma decimal separator
  const euroMatches = str.match(/(\d+),(\d+)\s*€/);
  if (euroMatches) {
    return parseFloat(`${euroMatches[1]}.${euroMatches[2]}`);
  }
  
  // Match "X months" patterns
  const periodMatch = str.match(/€\s*(\d+[.,]\d+)\/(\d+)\s*months/i);
  if (periodMatch && periodMatch[1] && periodMatch[2]) {
    const totalAmount = parseFloat(periodMatch[1].replace(',', '.'));
    const months = parseInt(periodMatch[2]);
    if (!isNaN(totalAmount) && !isNaN(months) && months > 0) {
      return totalAmount / months; // Return monthly equivalent
    }
  }
  
  return null;
};

// Export the service and helper functions
export const apiService = ApiService.getInstance(); 

// Scan emails for subscriptions
export const scanEmails = async (): Promise<ApiResponse<ScanEmailsApiResponse>> => {
  try {
    const response = await apiService.makeRequest<ScanEmailsApiResponse>('/scan-emails', {
      method: 'POST'
    });

    if (!response.success || !response.data) {
      throw new Error('No data received from scan-emails endpoint');
    }

    return response;
  } catch (error) {
    console.error('Error scanning emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scan emails'
    };
  }
};
