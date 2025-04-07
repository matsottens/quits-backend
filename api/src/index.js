const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('cross-fetch');

const app = express();
const port = process.env.PORT || 10000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://quits.cc',
  'https://www.quits.cc',
  'https://quits-frontend.vercel.app' // Add Vercel deployment URL
];

// Add OPTIONS handler for preflight requests
app.options('*', cors());

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    // Return the requesting origin instead of hardcoding
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Gmail-Token',
    'X-User-ID',
    'Origin',
    'X-Requested-With',
    'Accept'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Initialize environment variables validation
const requiredEnvVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY,
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'GOOGLE_REDIRECT_URI': process.env.GOOGLE_REDIRECT_URI
};

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

console.log('Environment configuration:', {
  supabaseUrl: process.env.SUPABASE_URL,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Remove any trailing slashes from URL
const cleanSupabaseUrl = supabaseUrl.replace(/\/$/, '');

console.log('Initializing Supabase client with URL:', cleanSupabaseUrl);

const supabase = createClient(cleanSupabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      // Add role claim to bypass RLS
      'apikey': supabaseServiceKey
    },
    fetch: fetch
  }
});

// Validate Supabase connection immediately
(async () => {
  try {
    // First, check if we have multiple subscription tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%subscription%');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Found tables:', tables);
    }

    // Test subscription table access
    const { data, error } = await supabase
      .from('subscriptions')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Failed to connect to Supabase:', error);
      throw error;
    }
    console.log('Successfully connected to Supabase and verified table access');
  } catch (err) {
    console.error('Error validating Supabase connection:', err);
    // Don't throw here, let the server start anyway
  }
})();

app.use(bodyParser.json());

// Basic root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Quits API is running' });
});

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// Protected routes middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  // Validate Bearer token format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authentication format' });
  }

  next();
};

// Email scanning endpoint (protected)
app.post('/api/scan-emails', requireAuth, async (req, res) => {
  try {
    const gmailToken = req.headers['x-gmail-token'];
    const userId = req.headers['x-user-id'];
    const authToken = req.headers.authorization?.split(' ')[1];

    console.log('Scan emails request received:', {
      hasGmailToken: !!gmailToken,
      hasUserId: !!userId,
      hasAuthToken: !!authToken,
      method: req.method
    });

    if (!gmailToken) {
      return res.status(401).json({ error: 'No Gmail token provided' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'No user ID provided' });
    }

    // Verify the user exists in Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser(authToken);
    
    if (userError || !userData.user) {
      console.error('User verification failed:', userError);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    console.log('User verified:', {
      userId: userData.user.id,
      email: userData.user.email
    });

    // For testing - return mock data first to verify the endpoint works
    const mockResponse = {
      success: true,
      message: 'Email scan completed successfully',
      count: 1,
      subscriptions: [
        {
          provider: 'Test Provider',
          price: 9.99,
          frequency: 'monthly',
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          term_months: 1,
          is_price_increase: false,
          lastDetectedDate: new Date().toISOString()
        }
      ],
      priceChanges: null
    };

    // Test Supabase connection and permissions
    try {
      const { data: testData, error: testError } = await supabase
        .from('subscriptions')
        .select('*')
        .limit(1);

      if (testError) {
        console.error('Database test failed:', testError);
        return res.status(500).json({ 
          error: 'Database connection error',
          details: testError.message
        });
      }

      // Return mock data for now
      return res.json(mockResponse);
    } catch (error) {
      console.error('Error in scan-emails endpoint:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error in scan-emails endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  // Log the request
  console.log('CORS test request received:', {
    origin: req.headers.origin,
    method: req.method,
    path: req.path,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
    }
  });
  
  // Return details about the request
  res.json({
    success: true,
    message: 'CORS test successful',
    request: {
      origin: req.headers.origin,
      method: req.method,
      path: req.path,
      host: req.headers.host,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent']
    },
    headers: {
      cors: {
        'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
        'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
        'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers'),
        'access-control-allow-credentials': res.getHeader('Access-Control-Allow-Credentials'),
        'vary': res.getHeader('Vary')
      }
    },
    allowedOrigins
  });
});

// Print registered routes
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`Registered route: ${Object.keys(r.route.methods)} ${r.route.path}`);
  }
});

// Handle all other routes
app.all('*', (req, res) => {
  console.log(`404 - Not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log('Available endpoints:');
  console.log('- GET /');
  console.log('- GET /api/health');
  console.log('- POST /api/scan-emails (protected)');
});

// Export the Express app
module.exports = app; 