const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');
const { supabase } = require('../middleware/auth');

// Cache middleware specific for analytics
const analyticsCacheMiddleware = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return next();

  try {
    const cacheKey = `analytics:${userId}`;
    const cachedData = await redisClient.getCache(cacheKey);
    if (cachedData) {
      console.log('Serving analytics from cache for user:', userId);
      return res.json({ success: true, data: cachedData });
    }
    next();
  } catch (error) {
    console.error('Cache error:', error);
    next();
  }
};

// Subscription analytics endpoint with caching
router.get('/subscription-analytics', analyticsCacheMiddleware, async (req, res) => {
  const userId = req.headers['x-user-id'];
  
  try {
    // Get all subscriptions for the user
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subError) throw subError;

    // Get price history
    const { data: priceHistory, error: priceError } = await supabase
      .from('subscription_prices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (priceError) throw priceError;

    // Calculate analytics
    const analytics = {
      subscriptions: subscriptions.length,
      monthlyTotal: subscriptions.reduce((sum, sub) => {
        if (sub.frequency === 'monthly') return sum + (sub.price || 0);
        return sum;
      }, 0),
      yearlyTotal: subscriptions.reduce((sum, sub) => {
        if (sub.frequency === 'yearly') return sum + (sub.price || 0);
        return sum + ((sub.price || 0) * 12);
      }, 0),
      priceChanges: calculatePriceChanges(priceHistory),
      upcomingRenewals: getUpcomingRenewals(subscriptions),
      priceHistory: groupPriceHistory(priceHistory)
    };

    // Cache the results for 1 hour
    await redisClient.setCache(`analytics:${userId}`, analytics, 3600);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get subscription analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions
function calculatePriceChanges(priceHistory) {
  const byProvider = groupPriceHistory(priceHistory);
  
  return Object.entries(byProvider).map(([provider, history]) => {
    if (history.length < 2) return null;
    
    const latest = history[history.length - 1];
    const oldest = history[0];
    
    return {
      provider,
      oldPrice: oldest.newPrice,
      newPrice: latest.newPrice,
      change: latest.newPrice - oldest.newPrice,
      percentageChange: ((latest.newPrice - oldest.newPrice) / oldest.newPrice) * 100,
      firstDetected: oldest.created_at,
      lastUpdated: latest.created_at
    };
  }).filter(Boolean);
}

function getUpcomingRenewals(subscriptions) {
  return subscriptions
    .filter(sub => sub.renewal_date)
    .map(sub => ({
      ...sub,
      renewal_date: new Date(sub.renewal_date),
      daysUntilRenewal: Math.ceil((new Date(sub.renewal_date) - new Date()) / (1000 * 60 * 60 * 24))
    }))
    .filter(sub => sub.daysUntilRenewal > 0)
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
    .slice(0, 5);
}

function groupPriceHistory(priceHistory) {
  return priceHistory.reduce((acc, entry) => {
    if (!acc[entry.provider]) {
      acc[entry.provider] = [];
    }
    acc[entry.provider].push(entry);
    return acc;
  }, {});
}

module.exports = router; 