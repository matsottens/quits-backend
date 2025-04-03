import { supabase } from '../supabase';

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
  title?: string;
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

// Update the API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    try {
      const headers = await this.getAuthHeaders();
      
      // Ensure endpoint starts with /api
      const path = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      const url = `${API_URL}${path}`;
      
      console.log('Making API request:', {
        url,
        method: options.method || 'GET',
        hasAuthToken: !!headers['Authorization'],
        hasGmailToken: !!headers['X-Gmail-Token'],
        hasUserId: !!headers['X-User-ID'],
        environment: process.env.NODE_ENV
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

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...options.headers
        },
        credentials: 'include'
      });

      // Log detailed response information
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
        type: response.type,
        ok: response.ok,
        redirected: response.redirected,
        redirectType: response.type,
        finalUrl: response.url
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
      
      return { success: true, data };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timed out. Please try again.' };
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
  // Try to extract service name from email title first
  if (data.title && typeof data.title === 'string') {
    console.log('Analyzing email title:', data.title);
    
    // Pattern 1: Service name followed by "Subscription" in title
    const subscriptionTitleMatch = data.title.match(/([A-Za-z0-9\s]+(?:\s[A-Za-z0-9]+)*)\s+Subscription/i);
    if (subscriptionTitleMatch && subscriptionTitleMatch[1]) {
      const serviceName = subscriptionTitleMatch[1].trim();
      console.log(`Found service name in title: "${serviceName}"`);
      data.provider = serviceName;
      return processProviderSpecificInfo(data);
    }
  }
  
  // Early detection for Apple subscription receipts
  if (data.provider && data.provider.toLowerCase().includes('apple')) {
    return processAppleSubscription(data);
  }

  // Process with existing service mapping logic
  return processProviderSpecificInfo(data);
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
  let frequency = 'monthly';
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
          console.log(`Calculated monthly price: ${price} from ${fullAmount}/${period} months`);
        } else {
          price = fullAmount;
        }
        
        // Determine frequency
        if (euroMatch[3].toLowerCase().includes('month')) {
          frequency = period > 1 ? 'monthly' : 'monthly';
        } else {
          frequency = 'yearly';
        }
      } else {
        price = fullAmount;
      }
    }
    
    // Look for renewal date pattern
    const dateMatch = data.provider.match(/(?:starting|renews)\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
    if (dateMatch && dateMatch[1]) {
      try {
        renewalDate = new Date(dateMatch[1]).toISOString();
        console.log(`Found renewal date: ${renewalDate}`);
      } catch (e) {
        console.log('Failed to parse renewal date');
      }
    }
  }
  
  return {
    ...data,
    provider,
    price,
    frequency,
    renewal_date: renewalDate,
    term_months: null,
    is_price_increase: false,
    lastDetectedDate: new Date().toISOString()
  };
}

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

// Export convenience functions for common API calls
export const scanEmails = async () => {
  const response = await apiService.scanEmails();
  if (!response.success) {
    throw new Error(response.error || 'Failed to scan emails');
  }
  return response.data;
};

export const apiService = ApiService.getInstance(); 