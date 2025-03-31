const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
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
      'https://quits.cc',
      'https://www.quits.cc',
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://apis.google.com',
      'https://*.googleapis.com'
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
  const requestId = Math.random().toString(36).substring(7);

  // Enhanced request logging
  console.log(`[${requestId}] CORS Request:`, {
    timestamp: new Date().toISOString(),
    origin,
    method: req.method,
    path: req.path,
    headers: {
      ...req.headers,
      // Redact sensitive data
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      'x-gmail-token': req.headers['x-gmail-token'] ? '[REDACTED]' : undefined
    },
    ip: req.ip,
    originalUrl: req.originalUrl
  });

  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) {
    console.log(`[${requestId}] CORS: Allowing request with no origin`);
    return next();
  }

  const allowedDomains = [
    'quits.cc',
    'www.quits.cc',
    'api.quits.cc'
  ];

  // Check if the origin's domain matches any allowed domain
  const isAllowed = allowedDomains.some(domain => {
    const originDomain = origin.toLowerCase().replace(/^https?:\/\//, '');
    const matches = originDomain === domain || 
                   originDomain === 'www.' + domain ||
                   domain === 'www.' + originDomain;
    
    console.log(`[${requestId}] CORS Domain Check:`, {
      originDomain,
      allowedDomain: domain,
      matches
    });
    
    return matches;
  });

  if (isAllowed) {
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Gmail-Token, X-User-ID',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    };

    // Log headers being set
    console.log(`[${requestId}] Setting CORS headers:`, corsHeaders);

    // Set all CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Log response after headers are set
    res.on('finish', () => {
      console.log(`[${requestId}] Response completed:`, {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        timing: `${Date.now() - req._startTime}ms`
      });
    });

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log(`[${requestId}] Handling OPTIONS preflight request`);
      res.status(204).end();
      return;
    }
  } else {
    console.log(`[${requestId}] CORS: Blocked origin:`, {
      origin,
      allowedDomains
    });
  }

  // Store requestId for use in other middleware
  req.requestId = requestId;
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

// Export the middleware
module.exports = {
  customCorsMiddleware,
  authenticateRequest,
  cspMiddleware,
  supabase
}; 