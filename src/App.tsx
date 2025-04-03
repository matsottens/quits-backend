import '@fontsource-variable/inter';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { Dashboard } from './components/dashboard/Dashboard';
import Settings from './components/settings/Settings';
import OAuthRedirect from './components/auth/OAuthRedirect';
import ScanningScreen from './components/auth/ScanningScreen';
import { SubscriptionSelection } from './components/auth/SubscriptionSelection';
import { EmailOAuthConsent } from './components/auth/EmailOAuthConsent';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Box, CircularProgress } from '@mui/material';
import { AuthCallback } from './components/auth/AuthCallback';
import PrivateRoute from './components/PrivateRoute';
import SignIn from './pages/SignIn';

// Protected Route component with Layout
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
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
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
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

const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/signin" />} />
            <Route path="/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
            <Route path="/auth/google/callback" element={<OAuthRedirect />} />
            <Route path="/auth/consent" element={<EmailOAuthConsent />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/scanning" element={<ScanningScreen />} />
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
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
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
};

export default App; 