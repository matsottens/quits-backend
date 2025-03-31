const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
};

// Create Redis client
const redis = new Redis(redisConfig);

// Handle Redis events
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('ready', () => {
  console.log('Redis client is ready');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('Redis client reconnecting');
});

// Helper functions for common operations
const redisClient = {
  // Session management
  async setSession(sessionId, data, expiryInSeconds = 24 * 60 * 60) {
    await redis.set(
      `session:${sessionId}`, 
      JSON.stringify(data), 
      'EX', 
      expiryInSeconds
    );
  },

  async getSession(sessionId) {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  },

  // Cache management
  async setCache(key, data, expiryInSeconds = 3600) {
    await redis.set(
      `cache:${key}`, 
      JSON.stringify(data), 
      'EX', 
      expiryInSeconds
    );
  },

  async getCache(key) {
    const data = await redis.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  },

  // Rate limiting
  async incrementRequestCount(userId, endpoint) {
    const key = `ratelimit:${userId}:${endpoint}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 60); // Reset after 1 minute
    }
    return count;
  },

  // Raw client access
  getClient() {
    return redis;
  }
};

module.exports = redisClient; 