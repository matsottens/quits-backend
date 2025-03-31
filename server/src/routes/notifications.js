const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');
const { supabase } = require('../middleware/auth');

// Cache middleware for notifications
const notificationsCacheMiddleware = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return next();

  try {
    const cacheKey = `notifications:${userId}`;
    const cachedData = await redisClient.getCache(cacheKey);
    if (cachedData) {
      console.log('Serving notifications from cache for user:', userId);
      return res.json({ success: true, data: cachedData });
    }
    next();
  } catch (error) {
    console.error('Cache error:', error);
    next();
  }
};

// Get notifications with caching
router.get('/', notificationsCacheMiddleware, async (req, res) => {
  const userId = req.headers['x-user-id'];
  
  try {
    // Get user's notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (notifError) throw notifError;

    // Get unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    const data = {
      notifications,
      unreadCount
    };

    // Cache the results for 5 minutes
    await redisClient.setCache(`notifications:${userId}`, data, 300);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ 
      error: 'Failed to get notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark notification as read and invalidate cache
router.post('/:id/read', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const notificationId = req.params.id;

  try {
    // Update notification
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate the notifications cache for this user
    const cacheKey = `notifications:${userId}`;
    await redisClient.getClient().del(cacheKey);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark notification as read',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get notification settings
router.get('/settings', async (req, res) => {
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
router.post('/settings', async (req, res) => {
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