const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('cross-fetch');

const app = express();
const port = process.env.PORT || 10000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    },
    fetch: fetch
  }
});

// Configure CORS
const corsOrigins = process.env.CORS_ORIGIN ? 
  process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
  ['https://quits.cc', 'https://www.quits.cc'];

console.log('Server starting with CORS origins:', corsOrigins);

// CORS pre-flight middleware
app.options('*', cors({
  origin: function(origin, callback) {
    console.log('Pre-flight request from origin:', origin);
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS (pre-flight):', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Gmail-Token',
    'X-User-ID',
    'Origin',
    'Accept'
  ]
}));

// Main CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    console.log('Incoming request from origin:', origin);
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Gmail-Token',
    'X-User-ID',
    'Origin',
    'Accept'
  ]
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

app.use(bodyParser.json());

// Basic root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Quits API is running' });
});

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cors: {
      origins: corsOrigins,
      env: process.env.NODE_ENV
    }
  });
});

// Protected routes middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('Missing authorization header');
    return res.status(401).json({ error: 'No authorization header' });
  }
  next();
};

// Email scanning endpoint (protected)
app.get('/api/scan-emails', requireAuth, async (req, res) => {
  try {
    console.log('Scanning emails - Request headers:', req.headers);
    
    const gmailToken = req.headers['x-gmail-token'];
    const userId = req.headers['x-user-id'];

    if (!gmailToken) {
      console.log('Missing Gmail token');
      return res.status(401).json({ error: 'No Gmail token provided' });
    }

    if (!userId) {
      console.log('Missing user ID');
      return res.status(401).json({ error: 'No user ID provided' });
    }

    // For now, return mock data
    const mockEmail = {
      id: 'mock-email-1',
      subject: 'Test Subscription',
      from: 'test@example.com',
      date: new Date().toISOString(),
      body: 'This is a test subscription email'
    };

    // Store subscription in Supabase
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          provider: 'example.com',
          type: 'test',
          price: 9.99,
          frequency: 'monthly',
          email_id: mockEmail.id,
          last_detected_date: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error storing subscription:', error);
      return res.status(500).json({ error: 'Failed to store subscription data' });
    }

    console.log('Successfully processed email scan for user:', userId);

    res.json({
      success: true,
      message: 'Email scan initiated',
      email: mockEmail,
      subscription: data[0]
    });
  } catch (error) {
    console.error('Error scanning emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  console.log('- GET /api/scan-emails (protected)');
});

// Export the Express app
module.exports = app; 