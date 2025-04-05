# Quits API Backend Fixes

This repository contains fixes for the Quits API backend to address CORS and API connectivity issues between the frontend and backend services.

## Key Improvements

1. **Enhanced CORS Handling**: Updated CORS configuration to properly support all Vercel deployments and development environments.
2. **Health Check Endpoint**: Added a `/api/health` endpoint to verify API connectivity.
3. **CORS Test Endpoint**: Improved the `/api/test-cors` endpoint for diagnosing connection issues.
4. **Vercel Configuration**: Updated deployment configuration for consistent behavior on Vercel.

## Installation

```bash
# Clone the repository
git clone https://github.com/matsottens/quits-backend-fixes.git

# Navigate to project folder
cd quits-backend-fixes

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deploying to Vercel

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the API:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Deployment Configuration

The included `vercel.json` file contains all necessary configuration for deploying to Vercel, including:

- CORS headers for all API routes
- Environment variable declarations
- Route handling

## Testing API Connectivity

After deployment, you can test API connectivity using the following endpoints:

- **Health Check**: `https://api.quits.cc/api/health`
- **CORS Test**: `https://api.quits.cc/api/test-cors`

## Updating Your Frontend

The frontend should be configured to use the API URL:

```javascript
// In your frontend code
const API_URL = 'https://api.quits.cc';
```

Ensure all API requests include proper headers:

```javascript
fetch(`${API_URL}/api/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Gmail-Token': gmailToken,
    'X-User-ID': userId
  },
  credentials: 'include',
  mode: 'cors'
})
```

## Troubleshooting

If you encounter CORS issues:

1. Check the browser's network tab for specific CORS errors
2. Verify the request's `Origin` header is in the allowed origins list
3. Ensure proper credentials are being sent with requests
4. Test with the `/api/test-cors` endpoint 