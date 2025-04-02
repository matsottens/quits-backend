// Add a simple test route
app.get('/api/test', (req, res) => {
  console.log('Test route hit with query:', req.query);
  console.log('Request headers:', req.headers);
  console.log('Client IP:', req.ip);
  
  // Return detailed information about the request
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    headers: req.headers,
    query: req.query,
    ip: req.ip,
    vercelInfo: process.env.VERCEL_URL ? {
      url: process.env.VERCEL_URL,
      region: process.env.VERCEL_REGION
    } : null
  });
}); 