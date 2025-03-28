import '@fontsource-variable/inter';
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Login } from './components/auth/Login';
import { SignUp } from '@/components/auth/SignUp';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Settings } from '@/components/settings/Settings';
import { OAuthRedirect } from '@/components/auth/OAuthRedirect';
import { ScanningScreen } from '@/components/auth/ScanningScreen';
import { SubscriptionSelection } from '@/components/auth/SubscriptionSelection';
import { EmailOAuthConsent } from '@/components/auth/EmailOAuthConsent';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SubscriptionDashboard from './components/subscription/SubscriptionDashboard';
import { Box, CircularProgress } from '@mui/material';

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

// Define routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignUp />
      </PublicRoute>
    )
  },
  {
    path: '/auth/google/callback',
    element: <OAuthRedirect />
  },
  {
    path: '/auth/consent',
    element: <EmailOAuthConsent />
  },
  // Protected routes
  {
    path: '/scanning',
    element: (
      <ProtectedRoute>
        <ScanningScreen />
      </ProtectedRoute>
    )
  },
  {
    path: '/subscription-selection',
    element: (
      <ProtectedRoute>
        <SubscriptionSelection />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    )
  },
  {
    path: '/subscription-dashboard',
    element: (
      <ProtectedRoute>
        <SubscriptionDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App; 