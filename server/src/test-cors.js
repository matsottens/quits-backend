require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration
const corsOptions = {
  origin: ['https://www.quits.cc', 'https://quits.cc', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-User-ID', 'X-Gmail-Token']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Test endpoint
app.get('/api/test-cors', (req, res) => {
  const responseData = {
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin,
    headers: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.getHeader('Access-Control-Allow-Credentials'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
      'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers')
    }
  };

  console.log('Test CORS response:', responseData);
  res.json(responseData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
}); 