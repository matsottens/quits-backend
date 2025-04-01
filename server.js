require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Enable CORS with credentials
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Gmail-Token', 'X-User-ID']
}));

// Handle preflight requests
app.options('*', cors());

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: 'localhost'
  }
};

// Apply session middleware
app.use(session(sessionConfig));

// Initialize passport after session
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      accessToken,
      refreshToken,
      setup_complete: true
    };
    return done(null, user);
  }
));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Session:', req.session);
  console.log('User:', req.user);
  next();
});

// Helper function to get Gmail API client
const getGmailClient = (accessToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  
  oauth2Client.setCredentials({
    access_token: accessToken,
    scope: 'https://www.googleapis.com/auth/gmail.readonly'
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

// Gmail API proxy endpoints
app.get('/api/gmail/messages', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const gmail = getGmailClient(req.user.accessToken);
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10 // Adjust as needed
    });

    res.json(response.data);
  } catch (error) {
    console.error('Gmail API Error:', error);
    
    // Handle token expiration
    if (error.code === 401) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/gmail/message/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const gmail = getGmailClient(req.user.accessToken);
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: req.params.id
    });

    res.json(response.data);
  } catch (error) {
    console.error('Gmail API Error:', error);
    
    if (error.code === 401) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// Routes
app.get('/auth/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    accessType: 'offline',
    prompt: 'consent',
    includeGrantedScopes: true
  })(req, res, next);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (req.user) {
      req.session.accessToken = req.user.accessToken;
      req.session.refreshToken = req.user.refreshToken;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect(`${FRONTEND_URL}/login`);
        }
        res.redirect(`${FRONTEND_URL}/scanning`);
      });
    } else {
      res.redirect(`${FRONTEND_URL}/login`);
    }
  }
);

// API endpoints
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    const { accessToken, refreshToken, ...user } = req.user;
    res.json({
      authenticated: true,
      user: user
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
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.json({ success: true });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 