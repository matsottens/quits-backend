require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:10000',
  'http://localhost:3000',
  'https://quits.cc',
  'https://www.quits.cc'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Gmail-Token', 'X-User-ID']
}));

// Session configuration MUST come before passport middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // set to true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.quits.cc' : 'localhost'
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

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: '82730443897-1c90hk21hl7re899k2ktt0bmuce1b04g.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:5000/auth/google/callback',
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => {
    // Store the tokens with the user profile
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

// Add this middleware to log session and authentication status
app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Authenticated:', req.isAuthenticated());
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