const corsConfig = require('../config/cors');

// Generate a unique request ID
const generateRequestId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Detailed logging function
const logCorsInfo = (requestId, info) => {
  const logData = {
    timestamp: new Date().toISOString(),
    requestId,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    ...info
  };
  
  // Log to console with request ID prefix for easy filtering
  console.log(`[CORS ${requestId}]`, JSON.stringify(logData, null, 2));
  
  // Also log to a file if in production
  if (process.env.NODE_ENV === 'production') {
    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    fs.appendFileSync(
      path.join(logDir, `cors-${new Date().toISOString().split('T')[0]}.log`),
      JSON.stringify(logData) + '\n'
    );
  }
};

// CORS middleware with detailed logging
const corsMiddleware = (req, res, next) => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Log initial request details
  logCorsInfo(requestId, {
    type: 'request_start',
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    protocol: req.protocol,
    secure: req.secure,
    host: req.hostname,
    ip: req.ip,
    ips: req.ips,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      'x-gmail-token': req.headers['x-gmail-token'] ? '[REDACTED]' : undefined,
      'x-user-id': req.headers['x-user-id'] ? '[REDACTED]' : undefined
    },
    query: req.query,
    body: req.body,
    cookies: req.cookies,
    signedCookies: req.signedCookies
  });

  const origin = req.headers.origin;
  
  // Log origin analysis
  logCorsInfo(requestId, {
    type: 'origin_analysis',
    origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    accept: req.headers.accept,
    allowedOrigins: corsConfig.allowedOrigins
  });

  // Special handling for /api/scan-emails endpoint
  if (req.path === '/api/scan-emails') {
    console.log('[CORS] Email scan endpoint hit - applying special CORS handling');
    
    // For preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Gmail-Token, X-User-ID, Origin, X-Requested-With, Accept');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400');
      return res.status(204).end();
    }
    
    // For actual requests
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  // Get the CORS headers based on origin
  const corsHeaders = corsConfig.getCorsHeaders(origin);
  
  if (corsHeaders) {
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Log successful CORS setup
    logCorsInfo(requestId, {
      type: 'cors_success',
      headers: corsHeaders,
      responseHeaders: res.getHeaders()
    });

    // Add response logging
    const originalEnd = res.end;
    res.end = function(chunk, encoding, callback) {
      const duration = Date.now() - startTime;
      logCorsInfo(requestId, {
        type: 'response_end',
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        headers: res.getHeaders(),
        body: chunk ? '[REDACTED]' : undefined
      });
      return originalEnd.call(this, chunk, encoding, callback);
    };

    // Continue to next middleware
    next();
  } else {
    // Log failed CORS setup
    logCorsInfo(requestId, {
      type: 'cors_failed',
      reason: 'origin_not_allowed',
      origin,
      allowedOrigins: corsConfig.allowedOrigins
    });

    // Reject the request
    res.status(403).json({
      error: 'CORS error',
      message: 'Origin not allowed',
      requestId,
      origin,
      allowedOrigins: corsConfig.allowedOrigins
    });
  }
};

module.exports = corsMiddleware; 