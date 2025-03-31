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

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      callback(null, true);
      return;
    }

    const allowedOrigins = [
      'https://quits.cc',
      'https://www.quits.cc',
      'https://api.quits.cc',
      'http://localhost:3000'
    ];

    // Normalize origins for comparison
    const normalizedOrigin = origin.toLowerCase();
    const normalizedAllowedOrigins = allowedOrigins.map(o => o.toLowerCase());

    // Check if the origin matches any allowed origin
    const isAllowed = normalizedAllowedOrigins.some(allowed => 
      allowed === normalizedOrigin || 
      allowed.replace('www.', '') === normalizedOrigin.replace('www.', '')
    );

    if (isAllowed) {
      console.log('CORS: Allowing origin:', origin);
      callback(null, origin);
    } else {
      console.log('CORS: Blocking origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization', 
    'X-Gmail-Token', 
    'X-User-ID'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
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

module.exports = {
  corsOptions,
  logRequest,
  authenticateRequest,
  cspMiddleware,
  supabase
}; 