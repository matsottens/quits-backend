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
  // For development and testing - allow requests with no origin
  if (!origin) {
    console.log('No origin provided, allowing request');
    return true;
  }
  
  // Log the origin for debugging
  console.log(`Checking if origin is allowed: ${origin}`);
  
  // Check for exact match in allowedOrigins array
  if (allowedOrigins.includes(origin)) {
    console.log(`Origin ${origin} is explicitly allowed`);
    return true;
  }
  
  // Check for Vercel preview deployments
  if (origin.match(/https:\/\/[\w-]+-matsottens\.vercel\.app/)) {
    console.log(`Origin ${origin} matched Vercel deployment pattern`);
    return true;
  }
  
  // Log rejection
  console.log(`Origin ${origin} is not allowed`);
  return false;
}

function getCorsHeaders(origin) {
  // For requests with no origin, use * to allow from anywhere
  if (!origin) {
    console.log('Setting CORS headers for request with no origin');
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': allowedMethods.join(', '),
      'Access-Control-Allow-Headers': allowedHeaders.join(', '),
      'Access-Control-Expose-Headers': exposedHeaders.join(', '),
      'Access-Control-Max-Age': maxAge
    };
  } 
  
  // For allowed origins, return proper CORS headers with the actual origin
  if (isAllowedOrigin(origin)) {
    console.log(`Setting CORS headers for allowed origin: ${origin}`);
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': allowedMethods.join(', '),
      'Access-Control-Allow-Headers': allowedHeaders.join(', '),
      'Access-Control-Expose-Headers': exposedHeaders.join(', '),
      'Access-Control-Allow-Credentials': allowCredentials,
      'Access-Control-Max-Age': maxAge
    };
  }
  
  // For disallowed origins, return empty object (no CORS headers)
  console.log(`Not setting CORS headers for disallowed origin: ${origin}`);
  return {
    'Access-Control-Allow-Origin': 'null',
    'Access-Control-Allow-Methods': 'null',
    'Access-Control-Allow-Headers': 'null',
    'Content-Type': 'text/plain'
  };
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