const express = require('express');
const cors = require('cors');
const corsMiddleware = require('./src/middleware/cors');
const corsConfig = require('./src/config/cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Apply CORS middleware
app.use(corsMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
    service: 'quits-api',
    memory: process.memoryUsage(),
    cors: {
      allowedOrigins: corsConfig.allowedOrigins,
      origin: req.headers.origin,
      isAllowed: corsConfig.isAllowedOrigin(req.headers.origin)
    }
  };
  
  console.log('Health check requested:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    origin: req.headers.origin,
    method: req.method,
    ip: req.ip
  });
  
  res.json(healthData);
});

// CORS test endpoint
app.get('/api/test-cors', (req, res) => {
  const requestId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  // Send detailed response
  res.json({
    success: true,
    requestId,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    cors: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      allowedOrigins: corsConfig.allowedOrigins,
      isAllowed: corsConfig.isAllowedOrigin(req.headers.origin),
      headers: corsConfig.getCorsHeaders(req.headers.origin)
    },
    request: {
      method: req.method,
      path: req.path,
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      protocol: req.protocol,
      secure: req.secure,
      host: req.hostname,
      ip: req.ip
    },
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      cookie: req.headers.cookie ? '[REDACTED]' : undefined
    },
    response: {
      statusCode: res.statusCode,
      headers: res.getHeaders()
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('CORS configuration:', {
    allowedOrigins: corsConfig.allowedOrigins,
    allowedMethods: corsConfig.allowedMethods,
    allowedHeaders: corsConfig.allowedHeaders
  });
});

module.exports = app; 