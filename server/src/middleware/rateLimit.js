const redisClient = require('../config/redis');

const RATE_LIMIT_WINDOW = 60; // 1 minute
const MAX_REQUESTS = 100; // Maximum requests per minute

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';
    const endpoint = req.path;
    
    // Increment request count for this user and endpoint
    const requestCount = await redisClient.incrementRequestCount(userId, endpoint);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - requestCount));
    
    // Check if rate limit exceeded
    if (requestCount > MAX_REQUESTS) {
      return res.status(429).json({
        error: 'Too many requests',
        details: `Rate limit of ${MAX_REQUESTS} requests per ${RATE_LIMIT_WINDOW} seconds exceeded`
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow request to proceed if Redis is down
    next();
  }
};

module.exports = rateLimitMiddleware; 