require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://quits.cc',
      'https://www.quits.cc',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'X-User-ID', 
    'X-Gmail-Token',
    'Origin'
  ]
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  console.log(`[${requestId}] Incoming request:`, {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      cookie: req.headers.cookie ? '[REDACTED]' : undefined
    },
    origin: req.headers.origin,
    host: req.headers.host,
    ip: req.ip
  });

  // Log response
  res.on('finish', () => {
    console.log(`[${requestId}] Response:`, {
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
    });
  });

  next();
});

// Add a test route
app.get('/api/test', (req, res) => {
  console.log('Test route hit with query:', req.query);
  console.log('Request headers:', req.headers);
  console.log('Client IP:', req.ip);
  
  // Return detailed information about the request
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    headers: req.headers,
    query: req.query,
    ip: req.ip,
    vercelInfo: process.env.VERCEL_URL ? {
      url: process.env.VERCEL_URL,
      region: process.env.VERCEL_REGION
    } : null
  });
});

// Add a test route for scan-emails
app.get('/api/scan-emails/test', (req, res) => {
  console.log('Test route hit for /api/scan-emails');
  res.json({
    success: true,
    message: 'Email scanning test endpoint is working',
    timestamp: new Date().toISOString(),
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      cookie: req.headers.cookie ? '[REDACTED]' : undefined
    }
  });
});

// Scan emails endpoint
app.post('/api/scan-emails', async (req, res) => {
  console.log('Scan emails endpoint hit');
  const authHeader = req.headers.authorization;
  const gmailToken = req.headers['x-gmail-token'];
  const userId = req.headers['x-user-id'];
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Invalid or missing authentication token',
      details: 'Authorization header must start with Bearer'
    });
  }

  if (!gmailToken) {
    return res.status(401).json({ 
      error: 'Missing Gmail token',
      details: 'X-Gmail-Token header is required'
    });
  }

  if (!userId) {
    return res.status(401).json({ 
      error: 'Missing user ID',
      details: 'X-User-ID header is required'
    });
  }

  try {
    // Log the request for debugging
    console.log('Processing email scan request for user:', userId);
    
    // This is just a stub implementation for testing
    // In a real implementation, you would call Gmail API here
    
    res.json({
      success: true,
      message: 'Email scan processed successfully',
      count: 0,
      subscriptions: [],
      priceChanges: []
    });
  } catch (error) {
    console.error('Error scanning emails:', error);
    res.status(500).json({ 
      error: 'Failed to scan emails',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// For Vercel serverless functions
module.exports = app; 