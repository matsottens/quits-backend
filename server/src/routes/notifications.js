const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { authenticateUser } = require('../middleware/auth');

// Get user's notifications
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      status: 'ok',
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.post('/:id/read', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      status: 'ok',
      data
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as read'
    });
  }
});

// Get notification settings
router.get('/settings', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // If no settings exist, create default settings
    if (!data) {
      const { data: newSettings, error: insertError } = await supabase
        .from('notification_settings')
        .insert({
          user_id: req.user.id,
          email_notifications: true,
          price_change_threshold: 5,
          renewal_reminder_days: 7
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return res.json({
        status: 'ok',
        data: newSettings
      });
    }

    res.json({
      status: 'ok',
      data
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notification settings'
    });
  }
});

// Update notification settings
router.post('/settings', authenticateUser, async (req, res) => {
  try {
    const { email_notifications, price_change_threshold, renewal_reminder_days } = req.body;

    // Validate input
    if (typeof email_notifications !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'email_notifications must be a boolean'
      });
    }

    if (typeof price_change_threshold !== 'number' || price_change_threshold < 1 || price_change_threshold > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'price_change_threshold must be between 1 and 100'
      });
    }

    if (typeof renewal_reminder_days !== 'number' || renewal_reminder_days < 1 || renewal_reminder_days > 30) {
      return res.status(400).json({
        status: 'error',
        message: 'renewal_reminder_days must be between 1 and 30'
      });
    }

    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: req.user.id,
        email_notifications,
        price_change_threshold,
        renewal_reminder_days
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      status: 'ok',
      data
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update notification settings'
    });
  }
});

module.exports = router; 