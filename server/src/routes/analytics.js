const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { authenticateUser } = require('../middleware/auth');

// Get subscription analytics
router.get('/subscription-analytics', authenticateUser, async (req, res) => {
  try {
    // Get all subscriptions for the user
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id);

    if (subscriptionsError) throw subscriptionsError;

    // Get price history for all subscriptions
    const { data: priceHistory, error: priceHistoryError } = await supabase
      .from('subscription_prices')
      .select('*')
      .in('subscription_id', subscriptions.map(s => s.id))
      .order('detected_at', { ascending: false });

    if (priceHistoryError) throw priceHistoryError;

    // Calculate monthly and yearly totals
    const monthlyTotal = subscriptions.reduce((total, sub) => {
      if (sub.frequency === 'monthly') return total + sub.price;
      if (sub.frequency === 'yearly') return total + (sub.price / 12);
      return total;
    }, 0);

    const yearlyTotal = subscriptions.reduce((total, sub) => {
      if (sub.frequency === 'monthly') return total + (sub.price * 12);
      if (sub.frequency === 'yearly') return total + sub.price;
      return total;
    }, 0);

    // Group price history by subscription and find price changes
    const priceChanges = [];
    const priceHistoryBySubscription = {};

    priceHistory.forEach(price => {
      if (!priceHistoryBySubscription[price.subscription_id]) {
        priceHistoryBySubscription[price.subscription_id] = [];
      }
      priceHistoryBySubscription[price.subscription_id].push(price);
    });

    // Find price changes for each subscription
    Object.entries(priceHistoryBySubscription).forEach(([subscriptionId, prices]) => {
      if (prices.length >= 2) {
        const latestPrice = prices[0];
        const previousPrice = prices[1];
        const change = latestPrice.price - previousPrice.price;
        const percentageChange = (change / previousPrice.price) * 100;

        if (change !== 0) {
          const subscription = subscriptions.find(s => s.id === subscriptionId);
          priceChanges.push({
            provider: subscription.provider,
            oldPrice: previousPrice.price,
            newPrice: latestPrice.price,
            change,
            percentageChange,
            firstDetected: latestPrice.detected_at,
            lastUpdated: latestPrice.detected_at
          });
        }
      }
    });

    // Get upcoming renewals
    const upcomingRenewals = subscriptions
      .filter(sub => sub.renewal_date)
      .map(sub => {
        const renewalDate = new Date(sub.renewal_date);
        const today = new Date();
        const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

        return {
          provider: sub.provider,
          renewal_date: sub.renewal_date,
          daysUntilRenewal,
          price: sub.price,
          frequency: sub.frequency
        };
      })
      .filter(renewal => renewal.daysUntilRenewal > 0)
      .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
      .slice(0, 5); // Get next 5 renewals

    res.json({
      status: 'ok',
      data: {
        subscriptions: subscriptions.length,
        monthlyTotal,
        yearlyTotal,
        priceChanges,
        upcomingRenewals
      }
    });
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscription analytics'
    });
  }
});

module.exports = router; 