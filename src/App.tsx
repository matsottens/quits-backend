import '@fontsource-variable/inter';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Login } from './components/auth/Login';
import { SignUp } from '@/components/auth/SignUp';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Settings } from '@/components/settings/Settings';
import { OAuthRedirect } from '@/components/auth/OAuthRedirect';
import { ScanningScreen } from '@/components/auth/ScanningScreen';
import { SubscriptionSelection } from '@/components/auth/SubscriptionSelection';
import { EmailOAuthConsent } from '@/components/auth/EmailOAuthConsent';
import PrivateRoute from '@/components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';
import SubscriptionDashboard from './components/subscription/SubscriptionDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import GetStarted from './components/onboarding/GetStarted';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Component to automatically log out on startup
const AutoLogoutContent: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Call the logout function to clear the session
    const performLogout = async () => {
      try {
        await fetch('http://localhost:5000/auth/logout', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        // Clear any local state
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        
        // Redirect to get started page
        navigate('/get-started');
      } catch (error) {
        console.error('Error during logout:', error);
        navigate('/get-started');
      }
    };
    
    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26457A] mx-auto"></div>
        <p className="mt-4 text-[#26457A]">Starting new session...</p>
      </div>
    </div>
  );
};

// Wrapper component that can be used in Routes
const AutoLogout: React.FC = () => {
  return <AutoLogoutContent />;
};

// Setup redirect component
const SetupRedirect: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/login?setup=true');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26457A] mx-auto"></div>
        <p className="mt-4 text-[#26457A]">Preparing setup...</p>
      </div>
    </div>
  );
};

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Main app content component
const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/logout" replace />} />
      <Route path="/logout" element={<AutoLogout />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<SetupRedirect />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/oauth-redirect" element={<OAuthRedirect />} />
      <Route path="/oauth-consent" element={<EmailOAuthConsent />} />
      <Route 
        path="/scanning" 
        element={
          <PrivateRoute>
            <ScanningScreen />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/subscription-selection" 
        element={
          <PrivateRoute>
            <SubscriptionSelection />
          </PrivateRoute>
        } 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route 
        path="/subscription-dashboard" 
        element={
          <PrivateRoute>
            <SubscriptionDashboard />
          </PrivateRoute>
        } 
      />
      <Route path="/auth/google/callback" element={<OAuthRedirect />} />
      <Route path="*" element={<Navigate to="/get-started" replace />} />
    </Routes>
  );
};

// Define routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <SignUp />
  },
  {
    path: '/auth/google',
    element: <OAuthRedirect />
  },
  {
    path: '/auth/consent',
    element: <EmailOAuthConsent />
  },
  {
    path: '/scanning',
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    )
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App; 