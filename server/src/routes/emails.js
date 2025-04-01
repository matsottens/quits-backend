const express = require('express');
const router = express.Router();
const { supabase } = require('../middleware/auth');

// Email scanning endpoint (protected)
router.get('/scan-emails', async (req, res) => {
  try {
    const gmailToken = req.headers['x-gmail-token'];
    const userId = req.headers['x-user-id'];

    if (!gmailToken) {
      return res.status(401).json({ error: 'No Gmail token provided' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'No user ID provided' });
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
          user_id: userId,
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
      success: true,
      message: 'Email scan initiated',
      email: mockEmail,
      subscription: data[0]
    });
  } catch (error) {
    console.error('Error scanning emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 