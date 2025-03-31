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

// CORS configuration
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
});

// Configure CORS based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://quits.cc', 'https://quits.vercel.app', 'https://www.quits.cc']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Gmail-Token', 'X-User-ID', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Add CSP headers middleware
app.use((req, res, next) => {
  const cspHeader = process.env.NODE_ENV === 'production'
    ? "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pihflemmavointdxjdsx.supabase.co https://*.supabase.co; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: https://*.supabase.co https://*.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://quits.vercel.app https://api.quits.cc; " +
      "frame-src 'self' https://*.supabase.co https://*.googleapis.com;"
    : "default-src 'self' 'unsafe-inline' 'unsafe-eval';";
  
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
});

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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

// Callback route
app.get('/auth/google/callback',
  (req, res, next) => {
    console.log('Received Google callback...');
    next();
  },
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login`
  }),
  (req, res) => {
    console.log('Authentication successful, user:', req.user);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/scanning`);
  }
);

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

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
  // This is a basic implementation - you might want to enhance this based on your specific email formats
  const subscriptionPatterns = [
    {
      pattern: /subscription|subscribe|membership/i,
      type: 'general'
    },
    {
      pattern: /monthly payment|recurring payment/i,
      type: 'recurring'
    },
    {
      pattern: /(\$|€)\s*(\d+(\.\d{2})?)/,
      type: 'price'
    }
  ];

  const data = {
    type: null,
    price: null,
    provider: null,
    frequency: 'monthly', // default
    lastDetectedDate: new Date().toISOString()
  };

  // Extract provider from email address
  if (emailBody.from) {
    const fromMatch = emailBody.from.match(/@([^>]+)/);
    if (fromMatch) {
      data.provider = fromMatch[1].split('.')[0];
    }
  }

  // Extract subscription type and price
  const bodyText = emailBody.snippet || '';
  for (const pattern of subscriptionPatterns) {
    const match = bodyText.match(pattern.pattern);
    if (match) {
      if (pattern.type === 'price' && match[2]) {
        data.price = parseFloat(match[2]);
      } else {
        data.type = pattern.type;
      }
    }
  }

  return data;
}

// Improved email scanning endpoint
app.get('/api/scan-emails', async (req, res) => {
  const authHeader = req.headers.authorization;
  const gmailToken = req.headers['x-gmail-token'];
  const userId = req.headers['x-user-id'];
  
  console.log('Starting email scan', {
    hasAuthHeader: !!authHeader,
    hasGmailToken: !!gmailToken,
    hasUserId: !!userId
  });
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid or missing authentication token' });
  }

  if (!gmailToken) {
    return res.status(401).json({ error: 'Missing Gmail token' });
  }

  if (!userId) {
    return res.status(401).json({ error: 'Missing user ID' });
  }

  try {
    await ensureSupabaseConnection();

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: gmailToken });
    
    const gmail = google.gmail({ version: 'v1', auth });

    // List emails with pagination
    let messages = [];
    let nextPageToken = null;
    
    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        pageToken: nextPageToken,
        q: 'in:inbox subject:(subscription OR payment OR receipt OR invoice)'
      });

      messages = messages.concat(response.data.messages || []);
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken && messages.length < 500); // Limit to 500 emails max

    const subscriptions = [];
    const processedEmails = new Set();

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
          subscriptions.push({
            ...subscriptionData,
            user_id: userId,
            email_id: details.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    }

    // Store subscriptions in batches
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

    return res.json({ 
      success: true, 
      message: 'Subscriptions processed and stored successfully',
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    console.error('Error in email scan:', error);
    return res.status(500).json({ 
      error: 'Failed to scan emails',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 