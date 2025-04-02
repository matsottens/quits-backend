const express = require('express');
const router = express.Router();
const { supabase } = require('../middleware/auth');
const { createGmailClient, SEARCH_QUERY } = require('../config/gmail');

// Email scanning endpoint (protected)
router.post('/scan-emails', async (req, res) => {
  try {
    const gmailToken = req.headers['x-gmail-token'];
    const userId = req.headers['x-user-id'];

    if (!gmailToken) {
      return res.status(401).json({ error: 'No Gmail token provided' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'No user ID provided' });
    }

    // Create Gmail client
    const gmail = createGmailClient(gmailToken);

    // Search for subscription emails
    console.log('Searching for subscription emails...');
    const { data: messages } = await gmail.users.messages.list({
      userId: 'me',
      q: SEARCH_QUERY,
      maxResults: 10
    });

    if (!messages || !messages.messages) {
      console.log('No subscription emails found');
      return res.json({
        success: true,
        message: 'No subscription emails found',
        count: 0,
        subscriptions: []
      });
    }

    // Process each email
    const subscriptions = [];
    for (const message of messages.messages) {
      const { data: email } = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });

      // Extract email details
      const headers = email.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Check if subscription already exists
      const { data: existingSubscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email_id', message.id);

      const existingSubscription = existingSubscriptions?.[0];

      if (existingSubscription) {
        console.log('Found existing subscription, updating...');
        // Update existing subscription
        const { data: updatedSubscription } = await supabase
          .from('subscriptions')
          .update({
            last_detected_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscription.id)
          .select()
          .single();

        subscriptions.push({
          email: { id: message.id, subject, from, date },
          subscription: updatedSubscription
        });
      } else {
        console.log('Creating new subscription...');
        // Insert new subscription
        const { data: newSubscription } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: userId,
              provider: from.split('@')[1]?.split('>')[0] || 'unknown',
              type: 'email',
              price: null, // Will be updated by price detection
              frequency: null, // Will be updated by frequency detection
              email_id: message.id,
              last_detected_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        subscriptions.push({
          email: { id: message.id, subject, from, date },
          subscription: newSubscription
        });
      }
    }

    res.json({
      success: true,
      message: 'Email scan completed',
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    console.error('Error scanning emails:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router; 