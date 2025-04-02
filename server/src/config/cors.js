const allowedOrigins = [
  'https://quits.cc',
  'https://www.quits.cc',
  'https://quits.vercel.app',
  'http://localhost:3000'
];

const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];

const allowedHeaders = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'X-User-ID',
  'X-Gmail-Token',
  'Origin'
];

const exposedHeaders = ['Content-Range', 'X-Content-Range'];

const maxAge = 86400; // 24 hours

const allowCredentials = true;

function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow requests with no origin (like mobile apps or curl requests)
  return allowedOrigins.includes(origin);
}

function getCorsHeaders(origin) {
  if (!origin || !isAllowedOrigin(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': allowedMethods.join(', '),
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Expose-Headers': exposedHeaders.join(', '),
    'Access-Control-Allow-Credentials': allowCredentials,
    'Access-Control-Max-Age': maxAge
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