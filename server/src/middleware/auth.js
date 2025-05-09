const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseClientId = process.env.SUPABASE_CLIENT_ID;
const supabaseClientSecret = process.env.SUPABASE_CLIENT_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    flowType: 'pkce',
    detectSessionInUrl: true,
    client_id: supabaseClientId,
    client_secret: supabaseClientSecret
  }
});

// CSP middleware
const cspMiddleware = (req, res, next) => {
  // Log CSP request
  console.log('Setting CSP headers for:', {
    path: req.path,
    origin: req.headers.origin
  });

  // Define CSP directives
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://apis.google.com',
      'https://*.googleapis.com'
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': [
      "'self'",
      'https://api.quits.cc',
      'https://www.quits.cc',
      'https://quits.cc',
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://apis.google.com',
      'https://*.googleapis.com',
      'https://*.onrender.com',
      'wss://*.onrender.com'
    ],
    'frame-src': ["'self'", 'https://accounts.google.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"]
  };

  // Build CSP string
  const cspString = Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  // Set CSP header
  res.setHeader('Content-Security-Policy', cspString);
  
  next();
};

// Custom CORS middleware
const customCorsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const requestId = req.requestId || Math.random().toString(36).substring(7);

  // Log the request details
  console.log(`[${requestId}] CORS request:`, {
    origin,
    method: req.method,
    path: req.path,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      'x-gmail-token': req.headers['x-gmail-token'] ? '[REDACTED]' : undefined
    }
  });

  // Log request status
  console.log(`[${requestId}] CORS status:`, {
    origin,
    allowedOrigin: res.getHeader('Access-Control-Allow-Origin')
  });

  next();
};

// Request logging middleware
const logRequest = (req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers,
    body: req.body
  });
  
  // Log response headers after they're sent
  res.on('finish', () => {
    console.log('Response sent:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      headers: res.getHeaders()
    });
  });
  
  next();
};

// Authentication middleware
const authenticateRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = req.headers['x-user-id'];
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Invalid or missing authentication token',
        details: 'Authorization header must start with Bearer'
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        error: 'Missing user ID',
        details: 'X-User-ID header is required'
      });
    }

    // Verify the token with Supabase
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: error?.message || 'Token validation failed'
      });
    }

    // Verify the user ID matches
    if (user.id !== userId) {
      return res.status(401).json({ 
        error: 'User ID mismatch',
        details: 'Provided user ID does not match authenticated user'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || Math.random().toString(36).substring(7);
  
  // Log the error with context
  console.error(`[${requestId}] Error:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      'x-gmail-token': req.headers['x-gmail-token'] ? '[REDACTED]' : undefined
    }
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message,
      requestId
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      details: err.message,
      requestId
    });
  }

  if (err.code === 429) {
    return res.status(429).json({
      error: 'Rate Limit Exceeded',
      details: 'Too many requests. Please try again later.',
      requestId,
      retryAfter: err.retryAfter || 60
    });
  }

  if (err.message.includes('Gmail token expired') || err.message.includes('invalid_grant')) {
    return res.status(401).json({
      error: 'Token Expired',
      details: 'Your Gmail token has expired. Please sign in with Google again.',
      requestId
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId
  });
};

// Export the middleware
module.exports = {
  customCorsMiddleware,
  authenticateRequest,
  cspMiddleware,
  supabase,
  errorHandler
}; 