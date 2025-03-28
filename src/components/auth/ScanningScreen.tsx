import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Subscription {
  id?: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: string;
  lastBilled: string;
  category: string;
  isActive: boolean;
}

export const ScanningScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const navigate = useNavigate();
  const { scanEmails } = useAuth();

  useEffect(() => {
    let mounted = true;
    let progressInterval: NodeJS.Timeout;

    const startScanning = async () => {
      try {
        setStatus('Connecting to email service...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!mounted) return;
        setStatus('Scanning your emails...');
        
        // Start progress animation
        progressInterval = setInterval(() => {
          if (!mounted) return;
          setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + 1;
          });
        }, 100);

        // Start actual scanning
        await scanEmails();
        
        if (!mounted) return;
        setProgress(100);
        setStatus('Scan complete!');
        
        // Navigate after a short delay
        setTimeout(() => {
          if (!mounted) return;
          navigate('/dashboard');
        }, 1000);
      } catch (error) {
        if (!mounted) return;
        setStatus('Error scanning emails. Please try again.');
        console.error('Scanning error:', error);
      }
    };

    startScanning();

    return () => {
      mounted = false;
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [navigate, scanEmails]);

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
        size={60}
        thickness={4}
        sx={{ mb: 2 }}
      />
      <Typography variant="h6" gutterBottom>
        {status}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {progress}% complete
      </Typography>
    </Box>
  );
}; 