import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// Mock data - kept for reference but not actively used since we're using the real API
const MOCK_SUBSCRIPTIONS = [
  {
    provider: 'Netflix',
    price: 15.99,
    frequency: 'monthly',
    renewal_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    term_months: 1,
    is_price_increase: false,
    lastDetectedDate: new Date().toISOString(),
    title: 'Netflix Standard'
  },
  {
    provider: 'Spotify',
    price: 9.99,
    frequency: 'monthly',
    renewal_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    term_months: 1,
    is_price_increase: false,
    lastDetectedDate: new Date().toISOString(),
    title: 'Spotify Premium'
  }
];

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Netflix price increase',
    message: 'Your Netflix subscription price will increase from $13.99 to $15.99 on your next billing cycle.',
    type: 'price_increase',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: '2',
    title: 'Spotify renewal coming up',
    message: 'Your Spotify Premium subscription will renew in 7 days at $9.99.',
    type: 'renewal_reminder',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false
  }
];

// Load API URL from environment or use default
const API_URL = process.env.VITE_API_URL || 'https://quits-api.vercel.app';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    svgr(), 
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying API request:', req.method, req.url);
            // Forward the original authorization headers
            const authHeader = req.headers['authorization'];
            if (authHeader) {
              proxyReq.setHeader('Authorization', authHeader);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received API response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
}); 