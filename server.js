require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:10000';

// Middleware to handle CORS preflight
app.use((req, res, next) => {
  // Set CORS headers on all responses including errors
  res.set({
    'Access-Control-Allow-Origin': FRONTEND_URL,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Gmail-Token, X-User-ID',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/',
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

// Configure Google Strategy with environment variables
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
  console.log('Session ID:', req.sessionID);
  console.log('Is Authenticated:', req.isAuthenticated());
  next();
});

// Routes
app.get('/auth/google', (req, res, next) => {
  // If user is already authenticated and setup is complete, redirect to scanning page
  if (req.isAuthenticated() && req.user?.setup_complete) {
    return res.redirect(`${FRONTEND_URL}/scanning`);
  }
  
  // Set a flag in the session to indicate this is initial setup
  if (req.query.setup === 'true') {
    req.session.is_setup = true;
  }
  
  // Continue with normal OAuth flow for new users or setup
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    accessType: 'offline',
    // Only force consent screen for initial setup
    prompt: req.session.is_setup ? 'consent' : 'none', 
    includeGrantedScopes: true
  })(req, res, next);
});

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}/login`,
    session: true
  }),
  (req, res) => {
    // Store the tokens in session
    if (req.user) {
      req.session.accessToken = req.user.accessToken;
      req.session.refreshToken = req.user.refreshToken;
      req.session.user = req.user;
      
      // Check if this was part of setup
      const isSetup = req.session.is_setup;
      if (isSetup) {
        // Clear the setup flag
        req.session.is_setup = false;
      }
      
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

// Handle the frontend callback
app.get('/auth/callback', (req, res) => {
  res.redirect(`${FRONTEND_URL}/scanning`);
});

app.get('/auth/user', (req, res) => {
  console.log('Auth check - Session:', req.session);
  console.log('Auth check - User:', req.user);
  console.log('Auth check - Is Authenticated:', req.isAuthenticated());
  
  if (req.isAuthenticated()) {
    const { accessToken, refreshToken, ...user } = req.user;
    res.json({
      authenticated: true,
      user: user,
      setup_complete: user.setup_complete
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// Endpoint to check if user needs to complete setup
app.get('/auth/needs-setup', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      needs_setup: !req.user.setup_complete
    });
  } else {
    res.json({
      needs_setup: true
    });
  }
});

app.get('/auth/logout', (req, res) => {
  // Clear the session
  req.logout(() => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      
      // Send back a successful response
      res.json({ success: true });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 