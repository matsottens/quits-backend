import '@fontsource-variable/inter';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { Dashboard } from './components/dashboard/Dashboard';
import Settings from './components/settings/Settings';
import { OAuthRedirect } from './components/auth/OAuthRedirect';
import { ScanningScreen } from './components/auth/ScanningScreen';
import { SubscriptionSelection } from './components/auth/SubscriptionSelection';
import { EmailOAuthConsent } from './components/auth/EmailOAuthConsent';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Box, CircularProgress } from '@mui/material';
import { AuthCallback } from './components/auth/AuthCallback';

// Check if running in local development
const isLocalDev = import.meta.env.VITE_ENV === 'development' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

// If in local development, register the service worker and set a flag
if (isLocalDev) {
  console.log('Running in local development mode with mock API data');
  // Set a flag to show dev mode indicators in the UI
  window.localStorage.setItem('isLocalDev', 'true');
} else {
  window.localStorage.removeItem('isLocalDev');
}

// Protected Route component with Layout
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Public Route component - redirects to dashboard if already authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            <Route path="/auth/google/callback" element={<OAuthRedirect />} />
            <Route path="/auth/consent" element={<EmailOAuthConsent />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/scanning"
              element={
                <ProtectedRoute>
                  <ScanningScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription-selection"
              element={
                <ProtectedRoute>
                  <SubscriptionSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 