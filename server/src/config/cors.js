const allowedOrigins = [
  'https://quits.cc',
  'https://www.quits.cc',
  'https://quits.vercel.app',
  'https://quits-git-main-matsottens.vercel.app',
  'https://quits-matsottens.vercel.app',
  'https://quits-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];

const allowedHeaders = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'X-User-ID',
  'X-Gmail-Token',
  'Origin',
  'Cache-Control',
  'Pragma',
  'X-Auth-Token'
];

const exposedHeaders = ['Content-Range', 'X-Content-Range'];

const maxAge = 86400; // 24 hours

const allowCredentials = true;

function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow requests with no origin (like mobile apps or curl requests)
  
  // Check exact matches
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check for any Vercel deployment of the user's projects
  if (origin.match(/https:\/\/[\w-]+-matsottens\.vercel\.app/)) {
    return true;
  }
  
  // Check for quits.cc domains (with or without www)
  if (origin === 'https://quits.cc' || origin === 'https://www.quits.cc') {
    return true;
  }
  
  return false;
}

function getCorsHeaders(origin) {
  if (!origin) {
    // For requests with no origin, use * to allow from anywhere (e.g. curl requests)
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': allowedMethods.join(', '),
      'Access-Control-Allow-Headers': allowedHeaders.join(', '),
      'Access-Control-Expose-Headers': exposedHeaders.join(', '),
      'Access-Control-Max-Age': maxAge
    };
  } else if (isAllowedOrigin(origin)) {
    // Important: Use the actual origin that was sent in the request
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': allowedMethods.join(', '),
      'Access-Control-Allow-Headers': allowedHeaders.join(', '),
      'Access-Control-Expose-Headers': exposedHeaders.join(', '),
      'Access-Control-Allow-Credentials': allowCredentials,
      'Access-Control-Max-Age': maxAge
    };
  }
  
  return {};
}

module.exports = {
  allowedOrigins,
  allowedMethods,
  allowedHeaders,
  exposedHeaders,
  maxAge,
  allowCredentials,
  isAllowedOrigin,
  getCorsHeaders
}; 