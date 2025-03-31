const Redis = require('ioredis');

// Create Redis client with configuration
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
});

// Handle Redis connection events
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('ready', () => {
  console.log('Redis client is ready');
});

module.exports = redis; 