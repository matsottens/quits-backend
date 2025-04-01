const corsConfig = {
  // List of all allowed origins
  allowedOrigins: [
    'https://www.quits.cc',
    'https://quits.cc',
    'https://api.quits.cc',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://quits-frontend.vercel.app'
  ],

  // Allowed HTTP methods
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],

  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Gmail-Token',
    'X-User-ID',
    'X-API-Key',
    'X-Request-ID'
  ],

  // Exposed headers
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Request-ID'
  ],

  // Whether to allow credentials
  credentials: true,

  // Max age for preflight requests (24 hours)
  maxAge: 86400,

  // Function to check if an origin is allowed
  isAllowedOrigin: (origin) => {
    if (!origin) return true; // Allow requests with no origin (e.g., mobile apps)
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode: allowing all origins');
      return true;
    }
    
    // Normalize the origin by removing trailing slashes and converting to lowercase
    const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
    
    // Log the origin check
    console.log('Checking origin:', {
      original: origin,
      normalized: normalizedOrigin,
      allowed: corsConfig.allowedOrigins.some(allowedOrigin => 
        allowedOrigin.toLowerCase().replace(/\/$/, '') === normalizedOrigin
      )
    });
    
    // Check if the origin is in the allowed list
    return corsConfig.allowedOrigins.some(allowedOrigin => 
      allowedOrigin.toLowerCase().replace(/\/$/, '') === normalizedOrigin
    );
  },

  // Function to get CORS headers for a specific origin
  getCorsHeaders: (origin) => {
    if (!corsConfig.isAllowedOrigin(origin)) {
      console.log('Origin not allowed:', origin);
      return null;
    }

    const headers = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': corsConfig.allowedMethods.join(', '),
      'Access-Control-Allow-Headers': corsConfig.allowedHeaders.join(', '),
      'Access-Control-Expose-Headers': corsConfig.exposedHeaders.join(', '),
      'Access-Control-Allow-Credentials': corsConfig.credentials.toString(),
      'Access-Control-Max-Age': corsConfig.maxAge.toString(),
      'Vary': 'Origin'
    };

    console.log('Generated CORS headers:', headers);
    return headers;
  }
};

module.exports = corsConfig; 