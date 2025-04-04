// Mock API Service Worker
// This intercepts API requests during local development and returns mock data

// List of available endpoints and their static JSON responses
const MOCK_ENDPOINTS = {
  '/api/notifications': '/mockapi/notifications.json',
  '/api/notification-settings': '/mockapi/notification-settings.json',
  '/api/analytics': '/mockapi/analytics.json'
};

// Function to get the current origin for consistent URL handling
function getOrigin() {
  return self.location.origin;
}

// Intercept all fetch requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname;
  
  // Check if this is an API request we want to mock
  if (Object.keys(MOCK_ENDPOINTS).some(endpoint => path.startsWith(endpoint))) {
    console.log('[Mock API] Intercepting request:', path);
    
    // Find the matching endpoint
    const matchingEndpoint = Object.keys(MOCK_ENDPOINTS).find(endpoint => 
      path.startsWith(endpoint)
    );
    
    if (matchingEndpoint) {
      const mockDataPath = MOCK_ENDPOINTS[matchingEndpoint];
      const mockDataUrl = getOrigin() + mockDataPath;
      
      console.log('[Mock API] Returning mock data from:', mockDataUrl);
      
      // Return the mock data
      const mockResponse = fetch(mockDataUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load mock data from ${mockDataUrl}`);
          }
          return response.json();
        })
        .then(data => {
          // Add a slight delay to simulate network latency (200-800ms)
          const delay = Math.floor(Math.random() * 600) + 200;
          return new Promise(resolve => {
            setTimeout(() => {
              // Create a new response with appropriate headers
              const headers = new Headers({
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Gmail-Token, X-User-ID',
                'X-Mock-API': 'true'
              });
              
              const response = new Response(JSON.stringify(data), {
                status: 200,
                headers: headers
              });
              
              resolve(response);
            }, delay);
          });
        })
        .catch(error => {
          console.error('[Mock API] Error:', error);
          return new Response(JSON.stringify({ 
            error: 'Mock API error', 
            message: error.message 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      
      event.respondWith(mockResponse);
      return;
    }
  }
  
  // For OPTIONS requests (CORS preflight), respond with appropriate CORS headers
  if (event.request.method === 'OPTIONS') {
    event.respondWith(
      new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Gmail-Token, X-User-ID',
          'Access-Control-Max-Age': '86400'
        }
      })
    );
    return;
  }
  
  // For notifications with ID pattern, handle mark-as-read
  if (path.match(/\/api\/notifications\/[^\/]+\/read/) && event.request.method === 'POST') {
    console.log('[Mock API] Handling mark-as-read for notification');
    
    event.respondWith(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(new Response(JSON.stringify({ 
            success: true, 
            message: 'Notification marked as read'
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }));
        }, 300);
      })
    );
    return;
  }
  
  // For notification settings updates
  if (path === '/api/notification-settings' && event.request.method === 'POST') {
    console.log('[Mock API] Handling notification settings update');
    
    event.respondWith(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(new Response(JSON.stringify({ 
            success: true, 
            message: 'Settings updated successfully'
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }));
        }, 500);
      })
    );
    return;
  }
  
  // For scan-emails endpoint
  if (path === '/api/scan-emails' && event.request.method === 'POST') {
    console.log('[Mock API] Handling scan-emails request');
    
    const mockScanResponse = {
      success: true,
      message: 'Email scan completed successfully',
      count: 5,
      subscriptions: [
        {
          provider: 'Netflix',
          price: 16.99,
          frequency: 'monthly',
          renewal_date: '2025-04-15T00:00:00Z',
          term_months: 1,
          is_price_increase: true,
          lastDetectedDate: '2025-04-01T10:30:00Z'
        },
        {
          provider: 'Spotify',
          price: 10.99,
          frequency: 'monthly',
          renewal_date: '2025-04-10T00:00:00Z',
          term_months: 1,
          is_price_increase: false,
          lastDetectedDate: '2025-04-01T10:30:00Z'
        },
        {
          provider: 'Apple TV+',
          price: 6.99,
          frequency: 'monthly',
          renewal_date: '2025-04-22T00:00:00Z',
          term_months: 1,
          is_price_increase: false,
          lastDetectedDate: '2025-04-01T10:30:00Z'
        },
        {
          provider: 'Disney+',
          price: 8.99,
          frequency: 'monthly',
          renewal_date: '2025-04-18T00:00:00Z',
          term_months: 1,
          is_price_increase: true,
          lastDetectedDate: '2025-04-01T10:30:00Z'
        },
        {
          provider: 'Amazon Prime',
          price: 14.99,
          frequency: 'monthly',
          renewal_date: '2025-04-05T00:00:00Z',
          term_months: 1,
          is_price_increase: false,
          lastDetectedDate: '2025-04-01T10:30:00Z'
        }
      ],
      priceChanges: [
        {
          provider: 'Netflix',
          oldPrice: 14.99,
          newPrice: 16.99,
          change: 2.00,
          percentageChange: 13.3,
          term_months: 1,
          renewal_date: '2025-04-15T00:00:00Z'
        },
        {
          provider: 'Disney+',
          oldPrice: 7.99,
          newPrice: 8.99,
          change: 1.00,
          percentageChange: 12.5,
          term_months: 1,
          renewal_date: '2025-04-18T00:00:00Z'
        }
      ]
    };
    
    event.respondWith(
      new Promise(resolve => {
        // Add a longer delay to simulate email scanning (1.5-3 seconds)
        const delay = Math.floor(Math.random() * 1500) + 1500;
        setTimeout(() => {
          resolve(new Response(JSON.stringify(mockScanResponse), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Gmail-Token, X-User-ID',
              'X-Mock-API': 'true'
            }
          }));
        }, delay);
      })
    );
    return;
  }
  
  // For any other requests, pass through normally
  return;
});

// Listen for the install event
self.addEventListener('install', (event) => {
  console.log('[Mock API] Service Worker installed');
  self.skipWaiting();
});

// Listen for the activate event
self.addEventListener('activate', (event) => {
  console.log('[Mock API] Service Worker activated');
  self.clients.claim();
});

// Log any errors that occur in the Service Worker
self.addEventListener('error', (event) => {
  console.error('[Mock API] Service Worker error:', event.error);
}); 