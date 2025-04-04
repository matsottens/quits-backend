// Mock Service Worker for dev environment
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Map of API endpoints to mock response files
const API_MOCKS = {
  '/api/scan-emails': '/mockapi/scan-emails.json',
  '/api/subscription-analytics': '/mockapi/subscription-analytics.json',
  '/api/notification-settings': '/mockapi/notification-settings.json',
  '/api/notifications': '/mockapi/notifications.json'
};

// Check if the given URL is an API endpoint that we should mock
function shouldMockAPI(url) {
  const parsedUrl = new URL(url);
  const path = parsedUrl.pathname;
  return Object.keys(API_MOCKS).some(endpoint => path.startsWith(endpoint));
}

// Get the mock response file path for a given API endpoint
function getMockFilePath(url) {
  const parsedUrl = new URL(url);
  const path = parsedUrl.pathname;
  
  // Find matching endpoint
  for (const [endpoint, mockPath] of Object.entries(API_MOCKS)) {
    if (path.startsWith(endpoint)) {
      return mockPath;
    }
  }
  
  // If no exact match, look for a prefix match
  for (const [endpoint, mockPath] of Object.entries(API_MOCKS)) {
    if (path.startsWith(endpoint.split('?')[0])) {
      return mockPath;
    }
  }
  
  return null;
}

// Handle fetch events
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  if (shouldMockAPI(url)) {
    const mockFilePath = getMockFilePath(url);
    
    if (mockFilePath) {
      console.log(`[Mock Service Worker] Intercepting API call to ${url}`);
      console.log(`[Mock Service Worker] Returning mock data from ${mockFilePath}`);
      
      // Return the mock response
      event.respondWith(
        fetch(mockFilePath)
          .then(response => {
            // Add CORS headers and simulate a delay
            return new Promise(resolve => {
              setTimeout(() => {
                const newHeaders = new Headers(response.headers);
                newHeaders.set('Content-Type', 'application/json');
                resolve(
                  new Response(response.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: newHeaders
                  })
                );
              }, 300); // Add a small delay to simulate network latency
            });
          })
          .catch(error => {
            console.error('[Mock Service Worker] Error serving mock response', error);
            return new Response(JSON.stringify({
              success: false,
              error: 'Mock API error',
              message: 'Failed to serve mock response'
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          })
      );
    }
  }
}); 