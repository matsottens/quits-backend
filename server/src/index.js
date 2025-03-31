require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('cross-fetch');

const app = express();
const PORT = process.env.PORT || 5000;

const notificationsRouter = require('./routes/notifications');
const analyticsRouter = require('./routes/analytics');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowedOrigins = [
      'https://quits.cc',
      'https://www.quits.cc',
      'https://quits.vercel.app',
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
      callback(null, origin); // Return the actual origin to ensure exact match
    } else {
      console.log('CORS: Blocking origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-gmail-token', 'x-user-id'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Other middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Add routes
app.use('/api/notifications', notificationsRouter);
app.use('/api', analyticsRouter);

// Add a middleware to log all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers
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
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    console.log('Health check request:', {
      method: req.method,
      path: req.path,
      origin: req.headers.origin,
      hasAuthHeader: !!req.headers.authorization,
      headers: req.headers
    });

    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return res.status(401).json({ 
        error: 'Missing or invalid authorization token',
        details: 'Authorization header must start with Bearer'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Invalid or expired token:', error);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: error?.message || 'Token validation failed'
      });
    }

    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Session configuration with better security
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'sessionId', // Don't use default connect.sid
  rolling: true, // Refresh session on each request
  unset: 'destroy' // Remove session when browser closes
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
const CLIENT_URL = process.env.CLIENT_URL || 'https://quits.vercel.app';

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

// Improved email scanning endpoint
app.get('/api/scan-emails', async (req, res) => {
  const authHeader = req.headers.authorization;
  const gmailToken = req.headers['x-gmail-token'];
  const userId = req.headers['x-user-id'];
  
  console.log('Starting email scan', {
    hasAuthHeader: !!authHeader,
    hasGmailToken: !!gmailToken,
    hasUserId: !!userId,
    origin: req.headers.origin
  });
  
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
    // First verify the Supabase token
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: authError?.message || 'Token validation failed'
      });
    }

    // Verify the user ID matches
    if (user.id !== userId) {
      return res.status(401).json({ 
        error: 'User ID mismatch',
        details: 'Provided user ID does not match authenticated user'
      });
    }

    await ensureSupabaseConnection();

    // Initialize Gmail API
    const auth = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: gmailToken });
    const gmail = google.gmail({ version: 'v1', auth });

    // Test Gmail API access
    try {
      const profile = await gmail.users.getProfile({ userId: 'me' });
      console.log('Gmail API access verified for:', profile.data.emailAddress);
    } catch (error) {
      console.error('Gmail API access error:', error);
      if (error.code === 401) {
        return res.status(401).json({ 
          error: 'Gmail token expired or invalid',
          details: 'Please sign in with Google again'
        });
      }
      throw error;
    }

    // List emails with pagination
    let messages = [];
    let nextPageToken = null;
    
    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        pageToken: nextPageToken,
        q: 'in:anywhere (subject:(subscription OR payment OR receipt OR invoice OR billing OR netflix OR spotify OR amazon OR hbo OR disney) OR from:(netflix.com OR spotify.com OR amazon.com OR hbo.com OR youtube.com OR disneyplus.com))'
      });

      if (!response.data.messages) {
        console.log('No messages found');
        break;
      }

      messages = messages.concat(response.data.messages);
      nextPageToken = response.data.nextPageToken;
      
      console.log(`Retrieved ${messages.length} messages so far`);
    } while (nextPageToken && messages.length < 500); // Limit to 500 emails max

    const subscriptions = [];
    const processedEmails = new Set();
    const priceChanges = [];

    // Process emails in batches
    const batchSize = 10;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchPromises = batch.map(message => 
        gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        })
      );

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        try {
          const details = result.data;
          const headers = details.payload.headers;
          const emailData = {
            id: details.id,
            subject: headers.find(h => h.name === 'Subject')?.value || 'No Subject',
            from: headers.find(h => h.name === 'From')?.value || 'Unknown',
            date: headers.find(h => h.name === 'Date')?.value || 'Unknown',
            snippet: details.snippet || ''
          };

          const subscriptionData = extractSubscriptionData(emailData);
          
          if (subscriptionData.provider && !processedEmails.has(subscriptionData.provider)) {
            processedEmails.add(subscriptionData.provider);
            
            // Check for price changes
            const priceChange = await checkPriceChange(supabase, subscriptionData, userId);
            if (priceChange) {
              priceChanges.push({
                ...priceChange,
                provider: subscriptionData.provider,
                user_id: userId,
                created_at: new Date().toISOString()
              });
            }

            subscriptions.push({
              ...subscriptionData,
              user_id: userId,
              email_id: details.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error processing email:', error);
          continue;
        }
      }
    }

    // Store subscriptions and price changes in batches
    if (subscriptions.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < subscriptions.length; i += batchSize) {
        const batch = subscriptions.slice(i, i + batchSize);
        const { error } = await supabase
          .from('subscriptions')
          .upsert(batch, {
            onConflict: 'user_id,provider',
            returning: true
          });

        if (error) {
          console.error('Error storing subscription batch:', error);
          throw new Error('Failed to store subscription data');
        }
      }
    }

    // Store price changes
    if (priceChanges.length > 0) {
      const { error } = await supabase
        .from('subscription_prices')
        .insert(priceChanges);

      if (error) {
        console.error('Error storing price changes:', error);
        throw new Error('Failed to store price change data');
      }
    }

    // After processing emails and storing data
    await checkAndSendNotifications(userId);

    return res.json({ 
      success: true, 
      message: 'Subscriptions processed and stored successfully',
      count: subscriptions.length,
      subscriptions,
      priceChanges: priceChanges.length > 0 ? priceChanges : null
    });
  } catch (error) {
    console.error('Error in email scan:', error);
    return res.status(500).json({ 
      error: 'Failed to scan emails',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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
app.get('/auth/check', cors(corsOptions), async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 