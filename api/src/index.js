const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('cross-fetch');

const app = express();
const port = process.env.PORT || 10000;

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

// Configure CORS
const allowedOrigin = 'https://www.quits.cc';

// Handle CORS preflight and main requests
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Only allow the specific origin
  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Gmail-Token, X-User-ID, Content-Type, Accept, Origin');
    res.setHeader('Vary', 'Origin');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      res.status(204).end();
      return;
    }
  }

  next();
});

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
app.get('/api/scan-emails', requireAuth, async (req, res) => {
  try {
    const gmailToken = req.headers['x-gmail-token'];
    const userId = req.headers['x-user-id'];

    if (!gmailToken) {
      return res.status(401).json({ error: 'No Gmail token provided' });
    }

    if (!userId) {
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
      return res.status(500).json({ error: 'Failed to store subscription data' });
    }

    res.json({
      success: true,
      message: 'Email scan initiated',
      email: mockEmail,
      subscription: data[0]
    });
  } catch (error) {
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