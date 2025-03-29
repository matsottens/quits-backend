const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('cross-fetch');

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

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

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://www.quits.cc',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(bodyParser.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email scanning endpoint
app.get('/api/scan-emails', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
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
          user_id: req.user?.id,
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
      console.error('Error storing subscription:', error);
      return res.status(500).json({ error: 'Failed to store subscription data' });
    }

    res.json({
      message: 'Email scan initiated',
      email: mockEmail,
      subscription: data[0]
    });
  } catch (error) {
    console.error('Error scanning emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle all other routes
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Export the Express app for Vercel
module.exports = app; 