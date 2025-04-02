import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { scanEmails } from '../../services/api';

export const ScanningScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const navigate = useNavigate();
  const { user } = useAuth();

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
        setStatus('Scanning your emails...');
        
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
          const result = await scanEmails();
          
          // Store the result in localStorage to display on dashboard
          if (result?.count !== undefined) {
            localStorage.setItem('last_scan_count', result.count.toString());
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
          
          // Navigate to dashboard after a short delay
          setTimeout(() => {
            if (!mounted) return;
            navigate('/dashboard', { state: { fromScan: true, scanCount: result?.count || 0 } });
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
  }, [navigate, user]);

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
        bgcolor: 'background.default'
      }}
    >
      <CircularProgress
        variant="determinate"
        value={progress}
        size={80}
        thickness={4}
        sx={{ 
          mb: 4,
          color: progress === 100 ? 'success.main' : 'primary.main'
        }}
      />
      <Typography variant="h5" gutterBottom fontWeight="medium">
        {status}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        {progress}% complete
      </Typography>
    </Box>
  );
}; 