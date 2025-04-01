const express = require('express');
const router = express.Router();

// Test endpoint for CORS
router.get('/test-cors', (req, res) => {
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

module.exports = router; 