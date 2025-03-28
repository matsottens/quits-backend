require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Add CSP headers middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://*.supabase.co https://*.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://*.supabase.co https://*.googleapis.com; " +
    "frame-src 'self' https://*.supabase.co https://*.googleapis.com;"
  );
  next();
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
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

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

app.get('/api/scan-emails', async (req, res) => {
  const authHeader = req.headers.authorization;
  const gmailToken = req.headers['x-gmail-token'];
  const userId = req.headers['x-user-id'];
  
  console.log('Starting email scan, auth header:', authHeader ? 'present' : 'missing', 'gmail token:', gmailToken ? 'present' : 'missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  if (!gmailToken) {
    return res.status(401).json({ error: 'No Gmail token provided' });
  }

  if (!userId) {
    return res.status(401).json({ error: 'No user ID provided' });
  }

  try {
    // Create Gmail API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: gmailToken });
    
    const gmail = google.gmail({ version: 'v1', auth });

    // List emails from inbox
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 100, // Increased to get more potential subscription emails
      q: 'in:inbox subject:(subscription OR payment OR receipt OR invoice)'
    });

    const messages = response.data.messages || [];
    const subscriptions = [];
    const processedEmails = new Set();

    // Get details for each email
    for (const message of messages) {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const headers = details.data.payload.headers;
      const emailData = {
        id: message.id,
        subject: headers.find(h => h.name === 'Subject')?.value || 'No Subject',
        from: headers.find(h => h.name === 'From')?.value || 'Unknown',
        date: headers.find(h => h.name === 'Date')?.value || 'Unknown',
        snippet: details.data.snippet || ''
      };

      // Extract subscription data
      const subscriptionData = extractSubscriptionData(emailData);
      
      // Only add if we have meaningful data and haven't processed this provider
      if (subscriptionData.provider && !processedEmails.has(subscriptionData.provider)) {
        processedEmails.add(subscriptionData.provider);
        subscriptions.push({
          ...subscriptionData,
          user_id: userId,
          email_id: message.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    // Store subscriptions in Supabase
    if (subscriptions.length > 0) {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptions, {
          onConflict: 'user_id,provider',
          returning: true
        });

      if (error) {
        console.error('Error storing subscriptions:', error);
        throw new Error('Failed to store subscription data');
      }
    }

    return res.json({ 
      success: true, 
      message: 'Subscriptions processed and stored successfully',
      subscriptions
    });
  } catch (error) {
    console.error('Error in email scan:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 