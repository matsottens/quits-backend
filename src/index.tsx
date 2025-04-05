import * as React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Development environment info
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Running in development mode with real API endpoints');
  console.log('📊 Environment variables:');
  console.log('  - API_URL:', import.meta.env.VITE_API_URL || 'Not set');
  console.log('  - SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || 'Not set');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 