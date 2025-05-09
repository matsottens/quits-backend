require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('cross-fetch');
const FileStore = require('session-file-store')(session);
const redis = require('./config/redis');
const rateLimitMiddleware = require('./middleware/rateLimit');
const corsMiddleware = require('./middleware/cors');
const corsConfig = require('./config/cors');
const cors = require('cors');

const { customCorsMiddleware, authenticateRequest, cspMiddleware, supabase } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 10000;

// Log the environment and port configuration
console.log('Server configuration:', {
  environment: process.env.NODE_ENV || 'development',
  port: PORT,
  isProduction: process.env.NODE_ENV === 'production'
});

const notificationsRouter = require('./routes/notifications');
const analyticsRouter = require('./routes/analytics');
const testRouter = require('./routes/test');
const emailsRouter = require('./routes/emails');

// Add request logging middleware
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
    body: req.body,
    query: req.query,
    params: req.params,
    origin: req.headers.origin,
    host: req.headers.host,
    ip: req.ip,
    ips: req.ips,
    protocol: req.protocol,
    secure: req.secure
  });

  // Log response
  res.on('finish', () => {
    console.log(`[${requestId}] Response:`, {
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
      headers: res.getHeaders()
    });
  });

  next();
});

// Update the CORS options to ensure all origins are handled correctly
const corsOptions = {
  origin: function (origin, callback) {
    // Use our existing isAllowedOrigin function from the CORS config
    if (corsConfig.isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: corsConfig.allowedMethods,
  allowedHeaders: corsConfig.allowedHeaders,
  exposedHeaders: corsConfig.exposedHeaders,
  maxAge: corsConfig.maxAge
};

// Add specific logging for scan-emails endpoint
app.use('/api/scan-emails', (req, res, next) => {
  const origin = req.headers.origin;
  
  console.log(`[SCAN-EMAILS] ${req.method} request from ${origin}`, {
    headers: req.headers,
    method: req.method,
    path: req.path
  });
  
  // Handle preflight request manually for this route
  if (req.method === 'OPTIONS') {
    // Always allow the origin that sent the request
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Gmail-Token, X-User-ID, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).end();
    return;
  }
  
  // For non-OPTIONS requests, set the CORS headers and continue
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

// Apply CORS middleware for other routes
app.use(cors(corsOptions));

// Then apply other middleware
app.use(cspMiddleware);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Apply request tracking after CORS
// app.use(requestTracker); // Commented out undefined middleware

// Test endpoint for CORS
app.get('/api/test-cors', (req, res) => {
  const requestId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  // Log all request details
  console.log(`[CORS TEST ${requestId}]`, {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    request: {
      method: req.method,
      path: req.path,
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      protocol: req.protocol,
      secure: req.secure,
      host: req.hostname,
      ip: req.ip,
      ips: req.ips,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? '[REDACTED]' : undefined,
        cookie: req.headers.cookie ? '[REDACTED]' : undefined
      },
      query: req.query,
      body: req.body,
      cookies: req.cookies,
      signedCookies: req.signedCookies
    },
    cors: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      accept: req.headers.accept
    },
    response: {
      statusCode: res.statusCode,
      headers: res.getHeaders()
    }
  });

  // Send detailed response
  res.json({
    success: true,
    requestId,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    cors: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      allowedOrigins: corsConfig.allowedOrigins,
      isAllowed: corsConfig.isAllowedOrigin(req.headers.origin),
      headers: corsConfig.getCorsHeaders(req.headers.origin)
    },
    request: {
      method: req.method,
      path: req.path,
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      protocol: req.protocol,
      secure: req.secure,
      host: req.hostname,
      ip: req.ip,
      ips: req.ips
    },
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      cookie: req.headers.cookie ? '[REDACTED]' : undefined
    },
    response: {
      statusCode: res.statusCode,
      headers: res.getHeaders()
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
    service: 'quits-api',
    memory: process.memoryUsage(),
    cors: {
      allowedOrigins: corsConfig.allowedOrigins,
      origin: req.headers.origin,
      isAllowed: corsConfig.isAllowedOrigin(req.headers.origin)
    }
  };
  
  console.log('Health check requested:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    origin: req.headers.origin,
    method: req.method,
    ip: req.ip
  });
  
  res.json(healthData);
});

// CORS test endpoint - helpful for debugging CORS issues
app.get('/api/cors-test', corsMiddleware, (req, res) => {
  const origin = req.headers.origin;
  
  console.log('CORS test requested:', {
    timestamp: new Date().toISOString(),
    origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent'],
  });
  
  res.json({
    success: true,
    message: 'CORS is working correctly',
    timestamp: new Date().toISOString(),
    request: {
      origin: origin,
      host: req.hostname,
      method: req.method,
      path: req.path
    },
    cors: {
      allowedOrigins: corsConfig.allowedOrigins,
      isAllowed: corsConfig.isAllowedOrigin(origin),
      headers: res.getHeaders()
    }
  });
});

// Add routes
app.use('/api', testRouter);
app.use('/api', emailsRouter);
app.use('/api/notifications', authenticateRequest, notificationsRouter);
app.use('/api/analytics', authenticateRequest, analyticsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
    service: 'quits-api',
    memory: process.memoryUsage(),
    cors: {
      allowedOrigins: corsConfig.allowedOrigins,
      origin: req.headers.origin,
      isAllowed: corsConfig.isAllowedOrigin(req.headers.origin)
    }
  };
  
  console.log('Health check requested:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    origin: req.headers.origin,
    method: req.method,
    ip: req.ip
  });
  
  res.json(healthData);
});

// Session configuration
app.use(session({
  store: new FileStore({
    path: './sessions',
    ttl: 86400 // 1 day
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google Strategy with explicit scopes
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    accessType: 'offline',
    prompt: 'consent'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Received tokens:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
      // Store tokens and user info
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        accessToken,
        refreshToken,
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'] // Store scopes with user
      };
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Auth routes
app.get('/auth/google',
  (req, res, next) => {
    console.log('Starting Google authentication...');
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'https://api.quits.cc/auth/google/callback';
const CLIENT_URL = process.env.CLIENT_URL || 'https://quits.cc';

// Google OAuth callback endpoint
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new Error('No authorization code provided');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }

    const tokens = await tokenResponse.json();
    console.log('Token exchange successful');

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userResponse.json();
    console.log('User info retrieved:', userInfo.email);

    // Create or update user in Supabase
    const { data: user, error: userError } = await supabase.auth.signUp({
      email: userInfo.email,
      password: tokens.access_token, // Use a secure random password instead
      options: {
        data: {
          google_id: userInfo.id,
          name: userInfo.name,
          picture: userInfo.picture,
          gmail_token: tokens.access_token,
          gmail_refresh_token: tokens.refresh_token,
        }
      }
    });

    if (userError) {
      // If user already exists, try signing in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userInfo.email,
        password: tokens.access_token,
      });

      if (signInError) {
        console.error('Error signing in:', signInError);
        throw new Error('Failed to authenticate user');
      }

      user = signInData;
    }

    // Store tokens in secure session
    req.session.tokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      gmail_token: tokens.access_token
    };

    // Set secure cookies
    res.cookie('gmail_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Redirect to frontend with success and session token
    const redirectUrl = new URL(`${CLIENT_URL}/scanning`);
    redirectUrl.searchParams.append('success', 'true');
    redirectUrl.searchParams.append('session', user.session.access_token);
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error in Google callback:', error);
    res.redirect(`${CLIENT_URL}/auth/error?message=${encodeURIComponent(error.message)}`);
  }
});

// Add a route to handle the frontend callback
app.post('/auth/google/frontend-callback', (req, res) => {
  console.log('Received frontend callback:', req.body);
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'No code provided' });
  }


  // Here you would typically exchange the code for tokens
  // For now, we'll just return success
  res.json({ success: true });
});

app.get('/auth/user', (req, res) => {
  console.log('Checking authentication status:', req.isAuthenticated(), req.user);
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login`);
  });
});

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    origin: req.headers.origin
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      details: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize Supabase client with custom fetch
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

console.log('Initializing Supabase with URL:', supabaseUrl);

// Test Supabase connection on startup
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    // Instead of querying the subscriptions table, let's do a simpler test
    const { data, error } = await supabase.from('subscriptions').select('count').limit(0);
    if (error) {
      if (error.code === '42P01') {
        console.log('Database table not ready yet, will retry on requests');
        return true; // Don't treat this as an error
      }
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return false;
  }
}

// Test connection but don't block server startup
testSupabaseConnection().then(success => {
  if (!success) {
    console.warn('Warning: Could not establish initial Supabase connection. Will retry on requests.');
  }
});

// Improved Supabase connection handling
async function ensureSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('subscriptions').select('count');
    if (error) {
      if (error.code === '42P01') {
        console.log('Database table not ready yet, will retry on requests');
        return true;
      }
      console.error('Database connection error:', error);
      throw new Error(`Database connection error: ${error.message}`);
    }
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error(`Database connection error: ${error.message}`);
  }
}

// Helper function to extract subscription data from email
function extractSubscriptionData(emailBody) {
  const subscriptionPatterns = [
    // Renewal confirmation keywords
    {
      pattern: /renewal confirmation|subscription renewal|your subscription will renew|renewal notice|renewal reminder/i,
      type: 'renewal_confirmation'
    },
    // Price increase keywords
    {
      pattern: /price increase|rate increase|new rate|new price|price change|rate change|price adjustment|rate adjustment/i,
      type: 'price_increase'
    },
    // Price patterns for different currencies
    {
      pattern: /(?:USD|EUR|€|\$)\s*(\d+(?:\.\d{2})?)/i,
      type: 'price'
    },
    // Date patterns for renewal
    {
      pattern: /(?:renewal|next billing|next payment) (?:date|on|at):?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
      type: 'renewal_date'
    },
    // Term/duration patterns
    {
      pattern: /(?:term|duration|period) (?:of)? (\d+)\s*(?:year|month|yr|mo)/i,
      type: 'term'
    }
  ];

  const data = {
    type: null,
    price: null,
    provider: null,
    frequency: 'monthly', // default
    renewal_date: null,
    term_months: null,
    is_price_increase: false,
    lastDetectedDate: new Date().toISOString()
  };

  // Extract provider from email address and subject
  if (emailBody.from) {
    const fromMatch = emailBody.from.toLowerCase().match(/@([^>]+)/);
    if (fromMatch) {
      const domain = fromMatch[1];
      // Extract company name from domain
      data.provider = domain.split('.')[0];
      
      // Handle special cases
      if (domain.includes('spotify')) data.provider = 'spotify';
      if (domain.includes('netflix')) data.provider = 'netflix';
      if (domain.includes('youtube')) data.provider = 'youtube';
      if (domain.includes('amazon')) data.provider = 'amazon';
      if (domain.includes('hbo')) data.provider = 'hbo';
      if (domain.includes('disney')) data.provider = 'disney+';
    }
  }

  // Also check subject for provider name if not found in email
  if (!data.provider && emailBody.subject) {
    const subjectLower = emailBody.subject.toLowerCase();
    if (subjectLower.includes('spotify')) data.provider = 'spotify';
    if (subjectLower.includes('netflix')) data.provider = 'netflix';
    if (subjectLower.includes('youtube')) data.provider = 'youtube';
    if (subjectLower.includes('amazon prime')) data.provider = 'amazon';
    if (subjectLower.includes('hbo')) data.provider = 'hbo';
    if (subjectLower.includes('disney+')) data.provider = 'disney+';
  }

  // Combine subject and snippet for better pattern matching
  const fullText = `${emailBody.subject} ${emailBody.snippet}`.toLowerCase();

  // Extract subscription type, price, and renewal date
  for (const pattern of subscriptionPatterns) {
    const match = fullText.match(pattern.pattern);
    if (match) {
      if (pattern.type === 'price' && match[1]) {
        data.price = parseFloat(match[1]);
      } else if (pattern.type === 'renewal_date' && match[1]) {
        // Parse the date string
        const dateStr = match[1];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          data.renewal_date = date.toISOString();
        }
      } else if (pattern.type === 'term' && match[1]) {
        const term = parseInt(match[1]);
        const unit = match[0].toLowerCase().includes('year') ? 12 : 1;
        data.term_months = term * unit;
      } else if (pattern.type === 'price_increase') {
        data.is_price_increase = true;
      } else if (!data.type) {
        data.type = pattern.type;
      }
    }
  }

  // Determine frequency based on term
  if (data.term_months) {
    data.frequency = data.term_months > 12 ? 'yearly' : 'monthly';
  } else if (fullText.includes('yearly') || fullText.includes('annual')) {
    data.frequency = 'yearly';
  } else if (fullText.includes('monthly')) {
    data.frequency = 'monthly';
  }

  return data;
}

// Helper function to check for price changes
async function checkPriceChange(supabase, subscription, userId) {
  if (!subscription.price || !subscription.is_price_increase) return null;

  // Get the current subscription data
  const { data: currentSub, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', subscription.provider)
    .single();

  if (error) {
    console.error('Error checking current subscription:', error);
    return null;
  }

  // If we have a current subscription and the price is different
  if (currentSub && currentSub.price !== subscription.price) {
    return {
      oldPrice: currentSub.price,
      newPrice: subscription.price,
      change: subscription.price - currentSub.price,
      percentageChange: ((subscription.price - currentSub.price) / currentSub.price) * 100,
      term_months: subscription.term_months || currentSub.term_months,
      renewal_date: subscription.renewal_date
    };
  }

  return null;
}

// Notification settings endpoint
app.get('/api/notification-settings', async (req, res) => {
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

  try {
    // Verify the token with Supabase
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: authError?.message || 'Token validation failed'
      });
    }

    // Get user's notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw settingsError;
    }

    res.json({
      success: true,
      data: settings || {
        user_id: userId,
        email_notifications: true,
        price_change_threshold: 5, // percentage
        renewal_reminder_days: 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({ 
      error: 'Failed to get notification settings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update notification settings
app.post('/api/notification-settings', async (req, res) => {
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

  try {
    // Verify the token with Supabase
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: authError?.message || 'Token validation failed'
      });
    }

    const { email_notifications, price_change_threshold, renewal_reminder_days } = req.body;

    // Update or insert notification settings
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        email_notifications,
        price_change_threshold,
        renewal_reminder_days,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ 
      error: 'Failed to update notification settings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Notification center endpoint
app.get('/api/notifications', async (req, res) => {
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

  try {
    // Verify the token with Supabase
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: authError?.message || 'Token validation failed'
      });
    }

    // Get user's notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (notifError) {
      throw notifError;
    }

    // Get unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ 
      error: 'Failed to get notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark notification as read
app.post('/api/notifications/:id/read', async (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = req.headers['x-user-id'];
  const notificationId = req.params.id;
  
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

  try {
    // Verify the token with Supabase
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: authError?.message || 'Token validation failed'
      });
    }

    // Update notification
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark notification as read',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to send email notifications
async function sendEmailNotification(userId, notification) {
  try {
    // Get user's email
    const { data: userData, error: userError } = await supabase.auth.getUser(userId);
    if (userError || !userData?.user?.email) {
      console.error('Error getting user email:', userError);
      return;
    }

    const userEmail = userData.user.email;
    const emailSubject = notification.type === 'price_increase' 
      ? `Price Increase Alert: ${notification.provider} Subscription`
      : `Upcoming Renewal: ${notification.provider} Subscription`;

    let emailBody = '';
    if (notification.type === 'price_increase') {
      emailBody = `
        Your ${notification.provider} subscription price is increasing.
        Current price: $${notification.oldPrice}
        New price: $${notification.newPrice}
        Increase: ${notification.percentageChange.toFixed(1)}%
        Renewal date: ${new Date(notification.renewal_date).toLocaleDateString()}
        Term: ${notification.term_months} months
      `;
    } else if (notification.type === 'renewal_reminder') {
      emailBody = `
        Your ${notification.provider} subscription is renewing soon.
        Current price: $${notification.price}
        Renewal date: ${new Date(notification.renewal_date).toLocaleDateString()}
        Days until renewal: ${notification.days_until_renewal}
        Frequency: ${notification.frequency}
      `;
    }

    // TODO: Implement email sending logic here
    // For now, just log the email that would be sent
    console.log('Would send email to:', userEmail);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);

    // Store the email notification in the database
    const { error: emailError } = await supabase
      .from('email_notifications')
      .insert({
        user_id: userId,
        notification_id: notification.id,
        email: userEmail,
        subject: emailSubject,
        body: emailBody,
        status: 'pending'
      });

    if (emailError) {
      console.error('Error storing email notification:', emailError);
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// Update the checkAndSendNotifications function
async function checkAndSendNotifications(userId) {
  try {
    // Get user's notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings) {
      console.error('Error getting notification settings:', settingsError);
      return;
    }

    // Get recent price changes
    const { data: recentPriceChanges, error: priceError } = await supabase
      .from('subscription_prices')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false });

    if (priceError) {
      console.error('Error getting recent price changes:', priceError);
      return;
    }

    // Get upcoming renewals
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .not('renewal_date', 'is', null);

    if (subError) {
      console.error('Error getting subscriptions:', subError);
      return;
    }

    const notifications = [];

    // Check price changes
    if (recentPriceChanges) {
      for (const change of recentPriceChanges) {
        if (Math.abs(change.percentageChange) >= settings.price_change_threshold) {
          const notification = {
            type: 'price_increase',
            provider: change.provider,
            oldPrice: change.oldPrice,
            newPrice: change.newPrice,
            percentageChange: change.percentageChange,
            renewal_date: change.renewal_date,
            term_months: change.term_months,
            created_at: change.created_at
          };
          notifications.push(notification);

          // Send email notification if enabled
          if (settings.email_notifications) {
            await sendEmailNotification(userId, notification);
          }
        }
      }
    }

    // Check upcoming renewals
    if (subscriptions) {
      const now = new Date();
      for (const sub of subscriptions) {
        const renewalDate = new Date(sub.renewal_date);
        const daysUntilRenewal = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilRenewal === settings.renewal_reminder_days) {
          const notification = {
            type: 'renewal_reminder',
            provider: sub.provider,
            renewal_date: sub.renewal_date,
            days_until_renewal: daysUntilRenewal,
            price: sub.price,
            frequency: sub.frequency
          };
          notifications.push(notification);

          // Send email notification if enabled
          if (settings.email_notifications) {
            await sendEmailNotification(userId, notification);
          }
        }
      }
    }

    // Store notifications in the database
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications.map(n => ({
          ...n,
          user_id: userId,
          read: false
        })));

      if (notifError) {
        console.error('Error storing notifications:', notifError);
      }
    }
  } catch (error) {
    console.error('Error in notification check:', error);
  }
}

// Circuit breaker state
const circuitBreaker = {
  state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
  failures: 0,
  lastFailure: null,
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
};

// Retry configuration
const retryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  factor: 2, // exponential backoff factor
};

// Helper function for exponential backoff retry
const retry = async (fn, retries = retryConfig.maxRetries) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    const delay = Math.min(
      retryConfig.initialDelay * Math.pow(retryConfig.factor, retryConfig.maxRetries - retries),
      retryConfig.maxDelay
    );
    
    console.log(`Retrying after ${delay}ms, ${retries} retries left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1);
  }
};

// Circuit breaker check
const checkCircuitBreaker = () => {
  if (circuitBreaker.state === 'OPEN') {
    const now = Date.now();
    if (now - circuitBreaker.lastFailure >= circuitBreaker.resetTimeout) {
      console.log('Circuit breaker entering HALF-OPEN state');
      circuitBreaker.state = 'HALF-OPEN';
    } else {
      throw new Error('Circuit breaker is OPEN');
    }
  }
};

// Circuit breaker success handler
const handleSuccess = () => {
  if (circuitBreaker.state === 'HALF-OPEN') {
    console.log('Circuit breaker reset to CLOSED state');
    circuitBreaker.state = 'CLOSED';
    circuitBreaker.failures = 0;
  }
};

// Circuit breaker failure handler
const handleFailure = (error) => {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  
  console.log(`Circuit breaker failure count: ${circuitBreaker.failures}`);
  
  if (circuitBreaker.failures >= circuitBreaker.failureThreshold) {
    console.log('Circuit breaker entering OPEN state');
    circuitBreaker.state = 'OPEN';
  }
  
  throw error;
};

// Gmail API client with retry logic
const createGmailClient = (accessToken) => {
  const auth = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
};

// Retry configuration for Gmail API
const gmailRetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000,
  factor: 2,
  retryableErrors: [429, 500, 502, 503, 504]
};

// Helper function to check if error is retryable
const isRetryableError = (error) => {
  return gmailRetryConfig.retryableErrors.includes(error.code) || 
         error.message.includes('rate limit') ||
         error.message.includes('quota exceeded');
};

// Gmail API call with retry logic
const gmailApiCall = async (fn, retries = gmailRetryConfig.maxRetries) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !isRetryableError(error)) {
      throw error;
    }
    
    const delay = Math.min(
      gmailRetryConfig.initialDelay * Math.pow(gmailRetryConfig.factor, gmailRetryConfig.maxRetries - retries),
      gmailRetryConfig.maxDelay
    );
    
    console.log(`Retrying Gmail API call after ${delay}ms, ${retries} retries left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return gmailApiCall(fn, retries - 1);
  }
};

// Batch processing helper
const processEmailBatch = async (gmail, messages, userId) => {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchPromises = batch.map(message => 
      gmailApiCall(() => 
        gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
        })
      )
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add a small delay between batches to avoid rate limits
    if (i + batchSize < messages.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};

// Token exchange endpoint
app.post('/auth/google/token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Exchanging code for tokens with redirect URI:', redirect_uri);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return res.status(400).json({ error: 'Failed to exchange authorization code for tokens' });
    }

    const tokens = await tokenResponse.json();
    console.log('Token exchange successful:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      hasIdToken: !!tokens.id_token
    });

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userResponse.json();
    console.log('User info retrieved:', {
      email: userInfo.email,
      name: userInfo.name
    });

    // Set CORS headers
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    }

    // Return tokens and user info
    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      id_token: tokens.id_token,
      user: userInfo
    });
  } catch (error) {
    console.error('Error in token exchange:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a session check endpoint
app.get('/auth/check', customCorsMiddleware, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(401).json({ 
      authenticated: false,
      error: 'Session verification failed'
    });
  }
});

// Subscription analytics endpoint
app.get('/api/subscription-analytics', async (req, res) => {
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

  try {
    // Verify the token with Supabase
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: authError?.message || 'Token validation failed'
      });
    }

    // Get all subscriptions for the user
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subError) {
      throw subError;
    }

    // Get price history for all subscriptions
    const { data: priceHistory, error: priceError } = await supabase
      .from('subscription_prices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (priceError) {
      throw priceError;
    }

    // Calculate monthly and yearly totals
    const monthlyTotal = subscriptions.reduce((sum, sub) => {
      if (sub.frequency === 'monthly') return sum + (sub.price || 0);
      return sum;
    }, 0);

    const yearlyTotal = subscriptions.reduce((sum, sub) => {
      if (sub.frequency === 'yearly') return sum + (sub.price || 0);
      return sum + ((sub.price || 0) * 12); // Convert monthly to yearly
    }, 0);

    // Group price history by provider
    const priceHistoryByProvider = priceHistory.reduce((acc, entry) => {
      if (!acc[entry.provider]) {
        acc[entry.provider] = [];
      }
      acc[entry.provider].push(entry);
      return acc;
    }, {});

    // Calculate price changes
    const priceChanges = Object.entries(priceHistoryByProvider).map(([provider, history]) => {
      if (history.length < 2) return null;

      const latest = history[history.length - 1];
      const oldest = history[0];
      
      return {
        provider,
        oldPrice: oldest.newPrice,
        newPrice: latest.newPrice,
        change: latest.newPrice - oldest.newPrice,
        percentageChange: ((latest.newPrice - oldest.newPrice) / oldest.newPrice) * 100,
        firstDetected: oldest.created_at,
        lastUpdated: latest.created_at
      };
    }).filter(Boolean);

    // Get upcoming renewals
    const upcomingRenewals = subscriptions
      .filter(sub => sub.renewal_date)
      .map(sub => ({
        ...sub,
        renewal_date: new Date(sub.renewal_date),
        daysUntilRenewal: Math.ceil((new Date(sub.renewal_date) - new Date()) / (1000 * 60 * 60 * 24))
      }))
      .filter(sub => sub.daysUntilRenewal > 0)
      .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
      .slice(0, 5); // Get next 5 renewals

    res.json({
      success: true, 
      data: {
        subscriptions: subscriptions.length,
        monthlyTotal,
        yearlyTotal,
        priceChanges,
        upcomingRenewals,
        priceHistory: priceHistoryByProvider
      }
    });
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get subscription analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Cache middleware for expensive operations
const cacheMiddleware = async (req, res, next) => {
  const cacheKey = `${req.user.id}:${req.path}`;
  try {
    const cachedData = await redis.getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData });
    }
  } catch (error) {
    console.error('Cache error:', error);
  }
  next();
};

// Example of using cache middleware for subscription analytics
app.get('/api/subscription-analytics', cacheMiddleware, async (req, res) => {
  try {
    // Your existing analytics logic here
    const data = {}; // Your analytics data
    
    // Cache the results
    await redis.setCache(`${req.user.id}:${req.path}`, data, 3600); // Cache for 1 hour
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch subscription analytics' 
    });
  }
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Catch-all route handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path
  });
});

// Add a test route for scan-emails
app.get('/api/scan-emails/test', (req, res) => {
  console.log('Test route hit for /api/scan-emails');
  res.json({
    success: true,
    message: 'Test route working',
    timestamp: new Date().toISOString(),
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      cookie: req.headers.cookie ? '[REDACTED]' : undefined
    }
  });
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
});

// Gmail token test endpoint
app.post('/api/test-gmail-token', corsMiddleware, async (req, res) => {
  try {
    const gmailToken = req.headers['x-gmail-token'];
    const userId = req.headers['x-user-id'];
    
    if (!gmailToken) {
      return res.status(401).json({ error: 'No Gmail token provided' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'No user ID provided' });
    }
    
    // Create Gmail client with token
    const gmail = createGmailClient(gmailToken);
    
    try {
      // Try a simple Gmail API call to check token validity
      const profile = await gmail.users.getProfile({
        userId: 'me'
      });
      
      // Return user profile as validation of token
      res.json({
        success: true,
        message: 'Gmail token is valid',
        profile: {
          email: profile.data.emailAddress,
          messagesTotal: profile.data.messagesTotal,
          threadsTotal: profile.data.threadsTotal
        }
      });
    } catch (gmailError) {
      console.error('Gmail token test failed:', gmailError);
      
      // Check if token is expired
      if (gmailError.response && gmailError.response.data && gmailError.response.data.error === 'invalid_grant') {
        return res.status(401).json({
          error: 'Gmail token expired',
          message: 'Your Gmail authorization has expired. Please authenticate again.',
          details: gmailError.response.data
        });
      }
      
      return res.status(401).json({
        error: 'Gmail API error',
        message: 'Error validating Gmail token',
        details: gmailError.message
      });
    }
  } catch (error) {
    console.error('Error testing Gmail token:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to test Gmail token',
      details: error.message
    });
  }
});

app.get('/', (req, res) => {
  // Check if the request wants HTML (browser) or JSON (API client)
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  
  if (acceptsHtml) {
    // Send HTML for browser access
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quits API</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 { color: #26457A; }
            .card {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .endpoint {
              background: #e9ecef;
              padding: 10px;
              border-radius: 4px;
              margin: 5px 0;
              font-family: monospace;
            }
            .note {
              background: #fff3cd;
              padding: 10px;
              border-radius: 4px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Quits API Server</h1>
          <div class="card">
            <p>This is the API backend for the Quits application.</p>
            <p>Status: <strong>Online</strong></p>
            <p>Environment: <strong>${process.env.NODE_ENV || 'development'}</strong></p>
            <p>Last updated: <strong>${new Date().toLocaleString()}</strong></p>
          </div>
          
          <h2>Available Endpoints</h2>
          <div class="card">
            <div class="endpoint">/health</div>
            <div class="endpoint">/api/test-cors</div>
            <div class="endpoint">/api/scan-emails</div>
          </div>
          
          <div class="note">
            <p><strong>Note:</strong> This is the API server. If you're looking for the Quits application, please visit <a href="https://quits.cc">https://quits.cc</a></p>
          </div>
        </body>
      </html>
    `);
  } else {
    // Send JSON for API clients
    res.json({
      message: 'Quits API server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      endpoints: [
        '/health',
        '/api/test-cors',
        '/api/scan-emails'
      ]
    });
  }
});

// Start the server with more detailed logging
const server = app.listen(PORT, () => {
  console.log('Server configuration:', {
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    isProduction: process.env.NODE_ENV === 'production',
    nodeVersion: process.version,
    startTime: new Date().toISOString()
  });
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 