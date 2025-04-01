require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('cross-fetch');

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

async function testScanEmails() {
  const testCases = [
    {
      name: 'Test scan-emails with minimal headers',
      url: 'https://api.quits.cc/api/scan-emails',
      method: 'POST',
      headers: {
        'Origin': 'https://www.quits.cc',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    },
    {
      name: 'Test scan-emails with all required headers',
      url: 'https://api.quits.cc/api/scan-emails',
      method: 'POST',
      headers: {
        'Origin': 'https://www.quits.cc',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'X-User-ID': 'test-user',
        'X-Gmail-Token': 'test-gmail-token'
      },
      body: JSON.stringify({ test: true })
    },
    {
      name: 'Test scan-emails OPTIONS request',
      url: 'https://api.quits.cc/api/scan-emails',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.quits.cc',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, X-User-ID, X-Gmail-Token'
      }
    }
  ];

  for (const test of testCases) {
    console.log(`\nRunning test: ${test.name}`);
    console.log('URL:', test.url);
    console.log('Method:', test.method);
    console.log('Headers:', JSON.stringify(test.headers, null, 2));
    if (test.body) {
      console.log('Body:', JSON.stringify(test.body, null, 2));
    }

    try {
      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers,
        body: test.body,
        credentials: 'include'
      });

      console.log('\nResponse status:', response.status);
      console.log('Response headers:', JSON.stringify(response.headers.raw(), null, 2));

      // For OPTIONS requests, we don't expect a body
      if (test.method !== 'OPTIONS') {
        try {
          const data = await response.json();
          console.log('Response body:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('No JSON response body');
        }
      }

      // Check CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
        'Access-Control-Max-Age': response.headers.get('Access-Control-Max-Age'),
        'Vary': response.headers.get('Vary')
      };

      console.log('\nCORS headers:', JSON.stringify(corsHeaders, null, 2));

      // Verify CORS headers
      const issues = [];
      if (corsHeaders['Access-Control-Allow-Origin'] !== 'https://www.quits.cc') {
        issues.push('Access-Control-Allow-Origin is not set correctly');
      }
      if (!corsHeaders['Access-Control-Allow-Methods']?.includes('POST')) {
        issues.push('Access-Control-Allow-Methods does not include POST');
      }
      if (!corsHeaders['Access-Control-Allow-Headers']?.includes('Authorization')) {
        issues.push('Access-Control-Allow-Headers does not include Authorization');
      }
      if (corsHeaders['Access-Control-Allow-Credentials'] !== 'true') {
        issues.push('Access-Control-Allow-Credentials is not set to true');
      }

      if (issues.length > 0) {
        console.log('\n⚠️ CORS issues found:', issues);
      } else {
        console.log('\n✅ CORS configuration is correct');
      }

      // Additional checks for scan-emails endpoint
      if (test.method === 'POST') {
        if (response.status === 401) {
          console.log('\n⚠️ Authentication required');
        } else if (response.status === 403) {
          console.log('\n⚠️ Access forbidden');
        } else if (response.status === 405) {
          console.log('\n⚠️ Method not allowed');
        } else if (response.status === 500) {
          console.log('\n⚠️ Server error');
        }
      }

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('Server is not running or not accessible');
      }
      if (error.code === 'ECONNRESET') {
        console.log('Connection reset by server');
      }
      if (error.code === 'ETIMEDOUT') {
        console.log('Request timed out');
      }
    }
  }
}

// Run the tests
testScanEmails().catch(console.error); 