const corsConfig = require('../config/cors');

// Generate a unique request ID
const generateRequestId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Log CORS-related information
const logCorsInfo = (requestId, info) => {
  console.log(`[CORS ${requestId}]`, {
    timestamp: new Date().toISOString(),
    ...info
  });
};

// CORS middleware
const corsMiddleware = (req, res, next) => {
  const requestId = generateRequestId();
  const origin = req.headers.origin;

  // Log incoming request
  logCorsInfo(requestId, {
    type: 'request',
    method: req.method,
    path: req.path,
    origin,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      'x-gmail-token': req.headers['x-gmail-token'] ? '[REDACTED]' : undefined
    }
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    const corsHeaders = corsConfig.getCorsHeaders(origin);
    
    if (corsHeaders) {
      // Set CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Log successful preflight
      logCorsInfo(requestId, {
        type: 'preflight_success',
        headers: corsHeaders
      });

      // End the preflight request
      res.status(204).end();
    } else {
      // Log failed preflight
      logCorsInfo(requestId, {
        type: 'preflight_failed',
        reason: 'origin_not_allowed'
      });

      // Reject the preflight request
      res.status(403).json({
        error: 'CORS error',
        message: 'Origin not allowed',
        requestId
      });
    }
    return;
  }

  // Handle actual requests
  const corsHeaders = corsConfig.getCorsHeaders(origin);
  
  if (corsHeaders) {
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Log successful CORS setup
    logCorsInfo(requestId, {
      type: 'cors_success',
      headers: corsHeaders
    });

    // Continue to next middleware
    next();
  } else {
    // Log failed CORS setup
    logCorsInfo(requestId, {
      type: 'cors_failed',
      reason: 'origin_not_allowed'
    });

    // Reject the request
    res.status(403).json({
      error: 'CORS error',
      message: 'Origin not allowed',
      requestId
    });
  }
};

module.exports = corsMiddleware; 