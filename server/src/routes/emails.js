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

    // First, check if a subscription with this email_id already exists
    console.log('Checking for existing subscription...');
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email_id', mockEmail.id)
      .single();

    if (checkError) {
      console.error('Error checking existing subscription:', {
        code: checkError.code,
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint
      });
      if (checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        return res.status(500).json({ 
          error: 'Failed to check existing subscription',
          details: checkError.message
        });
      }
    }

    if (existingSubscription) {
      console.log('Found existing subscription, updating...');
      // Update existing subscription
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          last_detected_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating subscription:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        });
        return res.status(500).json({ 
          error: 'Failed to update subscription data',
          details: updateError.message
        });
      }

      return res.json({
        success: true,
        message: 'Subscription updated',
        email: mockEmail,
        subscription: updatedSubscription
      });
    }

    console.log('No existing subscription found, creating new one...');
    // Insert new subscription
    const { data: newSubscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          provider: 'example.com',
          type: 'test',
          price: 9.99,
          frequency: 'monthly',
          email_id: mockEmail.id,
          last_detected_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting subscription:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return res.status(500).json({ 
        error: 'Failed to store subscription data',
        details: insertError.message
      });
    }

    res.json({
      success: true,
      message: 'Email scan initiated',
      email: mockEmail,
      subscription: newSubscription
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