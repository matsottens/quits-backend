const redis = require('../config/redis');

// Rate limit configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  blockDuration: 60 * 60 * 1000, // 1 hour block if exceeded
};

// Helper function to get rate limit key
const getRateLimitKey = (req) => {
  const identifier = req.headers['x-user-id'] || req.ip;
  return `ratelimit:${identifier}`;
};

// Helper function to log rate limit events
const logRateLimitEvent = (req, remaining, blocked = false) => {
  const requestId = req.requestId || Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Rate limit check:`, {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.headers['x-user-id'],
    remaining,
    blocked,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      'x-gmail-token': req.headers['x-gmail-token'] ? '[REDACTED]' : undefined
    }
  });
};

// Rate limiting middleware with Redis
const rateLimitMiddleware = async (req, res, next) => {
  const key = getRateLimitKey(req);
  const redisClient = redis.getClient();

  try {
    // Get current request count
    const requests = await redisClient.incr(key);
    
    // Set expiry for the key if it's new
    if (requests === 1) {
      await redisClient.expire(key, Math.ceil(rateLimitConfig.windowMs / 1000));
    }

    // Check if blocked
    const blockedKey = `${key}:blocked`;
    const isBlocked = await redisClient.get(blockedKey);

    if (isBlocked) {
      const ttl = await redisClient.ttl(blockedKey);
      logRateLimitEvent(req, 0, true);
      
      return res.status(429).json({
        error: 'Too Many Requests',
        details: `You are blocked for ${Math.ceil(ttl / 60)} minutes due to rate limit violation`,
        retryAfter: ttl
      });
    }

    // Check rate limit
    const remaining = Math.max(0, rateLimitConfig.maxRequests - requests);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimitConfig.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitConfig.windowMs / 1000));

    logRateLimitEvent(req, remaining);

    if (requests > rateLimitConfig.maxRequests) {
      // Block the user
      await redisClient.setex(
        blockedKey,
        Math.ceil(rateLimitConfig.blockDuration / 1000),
        '1'
      );

      logRateLimitEvent(req, 0, true);

      return res.status(429).json({
        error: 'Too Many Requests',
        details: `Rate limit exceeded. You are blocked for ${rateLimitConfig.blockDuration / 1000 / 60} minutes`,
        retryAfter: Math.ceil(rateLimitConfig.blockDuration / 1000)
      });
    }

    next();
  } catch (error) {
    console.error('Rate limit error:', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Fail open - allow the request in case of Redis errors
    next();
  }
};

module.exports = rateLimitMiddleware; 