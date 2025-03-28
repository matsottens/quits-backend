require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 5000;

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

// Add the email scanning endpoint with better error handling
app.get('/api/scan-emails', async (req, res) => {
  console.log('Starting email scan, auth status:', req.isAuthenticated());
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    console.log('User tokens:', {
      hasAccessToken: !!req.user.accessToken,
      hasRefreshToken: !!req.user.refreshToken,
      scopes: req.user.scope
    });

    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    
    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken,
      scope: req.user.scope
    });

    // Get the user's email address first
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    console.log('User email:', email);

    // Now use the Gmail API to search for messages
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // First, try to get the user's profile
    const profile = await gmail.users.getProfile({
      userId: 'me'
    });
    console.log('Successfully connected to Gmail API for:', profile.data.emailAddress);

    // Search for messages with subscription-related subjects
    const searchQuery = 'subject:(subscription OR payment OR invoice)';
    const messages = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 10
    });

    console.log(`Found ${messages.data.messages?.length || 0} messages`);

    // Get full message details for each message
    const messageDetails = await Promise.all(
      (messages.data.messages || []).map(async (message) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: message.id
          });
          return detail.data;
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error.message);
          return null;
        }
      })
    );

    // Filter out any failed message fetches
    const validMessages = messageDetails.filter(msg => msg !== null);

    // Store the messages in a local array (you can replace this with a database later)
    const subscriptionEmails = validMessages.map(msg => {
      const headers = msg.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      
      return {
        id: msg.id,
        subject,
        from,
        date,
        snippet: msg.snippet
      };
    });

    res.json({
      success: true,
      message: 'Email scan completed',
      email: profile.data.emailAddress,
      messageCount: subscriptionEmails.length,
      messages: subscriptionEmails
    });

  } catch (error) {
    console.error('Email scanning error:', error);
    
    let errorMessage = 'Failed to scan emails';
    if (error.response) {
      console.error('Error response:', error.response.data);
      errorMessage = error.response.data.error?.message || errorMessage;
      
      if (errorMessage === 'Mail service not enabled') {
        errorMessage = 'Gmail API access is not properly configured. Please check the OAuth consent screen and API permissions.';
      }
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 