import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { apiService } from '../services/api';

const CorsTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const runApiTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test the API connection using the new method
      const connectionTestResult = await apiService.testApiConnection();
      
      // Also run the CORS test endpoint
      const corsTestResult = await apiService.testCors();
      
      setResult({
        connectionTest: connectionTestResult,
        corsTest: corsTestResult
      });
    } catch (err) {
      console.error('Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        API Connectivity Test
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={runApiTest}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Run API Test'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {result && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Connection Test Results
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Connection Test:</Typography>
            <Typography component="pre" sx={{ 
              bgcolor: 'background.default', 
              p: 2, 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 300
            }}>
              {JSON.stringify(result.connectionTest, null, 2)}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">CORS Test:</Typography>
            <Typography component="pre" sx={{ 
              bgcolor: 'background.default', 
              p: 2, 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 300 
            }}>
              {JSON.stringify(result.corsTest, null, 2)}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CorsTest; 