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
          
          // Process subscription results to ensure provider names and default values
          if (result?.subscriptions && result.subscriptions.length > 0) {
            // Ensure each subscription has proper defaults
            const processedSubscriptions = result.subscriptions.map(sub => {
              // Process the provider name to make it more user-friendly
              let providerName = sub.provider || '';
              
              // Handle common services by known patterns
              if (providerName.toLowerCase().includes('netflix')) {
                providerName = 'Netflix';
              } else if (providerName.toLowerCase().includes('spotify')) {
                providerName = 'Spotify';
              } else if (providerName.toLowerCase().includes('apple')) {
                providerName = 'Apple';
              } else if (providerName.toLowerCase().includes('amazon')) {
                providerName = 'Amazon';
              } else if (providerName.toLowerCase().includes('disney')) {
                providerName = 'Disney+';
              } else if (providerName.toLowerCase().includes('google')) {
                providerName = 'Google';
              } else if (providerName.toLowerCase().includes('hbo')) {
                providerName = 'HBO Max';
              }
              
              return {
                ...sub,
                provider: providerName || "Unknown Service",
                price: sub.price || 0,
                frequency: sub.frequency || "monthly"
              };
            });
            
            // Store the processed subscriptions
            localStorage.setItem('last_subscriptions', JSON.stringify(processedSubscriptions));
            result.subscriptions = processedSubscriptions;
          }
          
          // Store other scan results
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
          
          // Navigate to dashboard after a short delay with subscription data
          setTimeout(() => {
            if (!mounted) return;
            navigate('/dashboard', { 
              state: { 
                fromScan: true, 
                scanCount: result?.count || 0,
                subscriptions: result?.subscriptions || []
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