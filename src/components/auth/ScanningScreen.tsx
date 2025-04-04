import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

export const ScanningScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLocalDev = localStorage.getItem('isLocalDev') === 'true';

  useEffect(() => {
    let mounted = true;
    let progressInterval: NodeJS.Timeout;

    const startScanning = async () => {
      try {
        // Stage 1: Initialization
        setStatus('Connecting to email service...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!mounted) return;
        setProgress(10);
        
        // Stage 2: Authentication check
        setStatus('Authenticating...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!mounted) return;
        setProgress(25);
        
        // Stage 3: Scanning emails
        setStatus(isLocalDev ? 'Loading mock subscription data...' : 'Scanning your emails...');
        
        // Start progress animation - advance from 25% to 75% during scan
        progressInterval = setInterval(() => {
          if (!mounted) return;
          setProgress(prev => {
            if (prev >= 75) return prev;
            return prev + 1;
          });
        }, 150);

        // Perform the actual scanning
        try {
          const result = await apiService.scanEmails();
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to scan emails');
          }
          
          // Process subscription results
          if (result.data && result.data.details && result.data.details.length > 0) {
            // Store the processed subscriptions
            localStorage.setItem('last_subscriptions', JSON.stringify(result.data.details));
            localStorage.setItem('last_scan_count', result.data.subscriptionsFound.toString());
            localStorage.setItem('last_scan_time', new Date().toISOString());
          }
          
          if (!mounted) return;
          
          // Stage 4: Processing complete
          clearInterval(progressInterval);
          setProgress(90);
          setStatus('Processing results...');
          
          await new Promise(resolve => setTimeout(resolve, 800));
          
          if (!mounted) return;
          setProgress(100);
          setStatus('Scan complete!');
          
          // Navigate to dashboard after a short delay with subscription data
          setTimeout(() => {
            if (!mounted) return;
            navigate('/dashboard', { 
              state: { 
                fromScan: true, 
                scanCount: result.data?.subscriptionsFound || 0,
                subscriptions: result.data?.details || []
              } 
            });
          }, 1000);
        } catch (error) {
          console.error('Error during scan:', error);
          if (!mounted) return;
          clearInterval(progressInterval);
          setStatus('Error scanning emails. Please try again.');
          
          // Navigate to dashboard after error, with an error flag
          setTimeout(() => {
            if (!mounted) return;
            navigate('/dashboard', { state: { fromScan: true, scanError: true } });
          }, 3000);
        }
      } catch (error) {
        if (!mounted) return;
        if (progressInterval) clearInterval(progressInterval);
        setStatus('Error connecting to email service. Please try again.');
        console.error('Scanning setup error:', error);
        
        // Navigate back to dashboard after error
        setTimeout(() => {
          if (!mounted) return;
          navigate('/dashboard');
        }, 3000);
      }
    };

    if (user) {
      startScanning();
    } else {
      // If no user, redirect to login
      navigate('/login');
    }

    return () => {
      mounted = false;
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [navigate, user, isLocalDev]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#FFEDD6'
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '16px',
          p: 6,
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        {isLocalDev && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mb: 2, 
              p: 1, 
              bgcolor: '#FEF3C7', 
              color: '#92400E',
              borderRadius: '4px',
              fontWeight: 500
            }}
          >
            Dev Mode: Using mock subscription data
          </Typography>
        )}
        
        <CircularProgress
          variant="determinate"
          value={progress}
          size={80}
          thickness={4}
          sx={{ 
            mb: 4,
            color: progress === 100 ? 'success.main' : '#26457A'
          }}
        />
        <Typography variant="h5" gutterBottom fontWeight="medium" color="#26457A">
          {status}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {progress}% complete
        </Typography>
      </Box>
    </Box>
  );
}; 