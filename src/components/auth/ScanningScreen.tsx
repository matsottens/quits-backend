import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { scanEmails } from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import { SubscriptionData } from '../../services/api';

export const ScanningScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanningComplete, setScanningComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundSubscriptions, setFoundSubscriptions] = useState<SubscriptionData[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let progressInterval: NodeJS.Timeout;

    // Function to simulate progress
    const startProgressSimulation = () => {
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        if (currentProgress < 95) {
          currentProgress += Math.random() * 5;
          if (isMounted) setProgress(Math.min(Math.round(currentProgress), 95));
        }
      }, 500);
    };

    const performScan = async () => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      try {
        startProgressSimulation();
        console.log('Starting email scan...');
        
        const response = await scanEmails();
        
        clearInterval(progressInterval);
        
        if (response.success && response.data) {
          console.log('Scan completed successfully:', response.data);
          
          // Process subscriptions for better display
          const processedSubscriptions = response.data.subscriptions.map(sub => {
            // Log each subscription for debugging
            console.log('Processing subscription:', sub);
            
            // Process the Apple subscriptions with special handling
            if (sub.provider && typeof sub.provider === 'string' && 
                (sub.provider.toLowerCase().includes('apple') || 
                 sub.provider.toLowerCase().includes('babbel'))) {
              console.log('Found Apple/Babbel subscription');
            }
            
            return sub;
          });
          
          // Save to localStorage for persistence
          localStorage.setItem('subscriptions', JSON.stringify(processedSubscriptions));
          localStorage.setItem('scanDate', new Date().toISOString());
          localStorage.setItem('subscriptionCount', String(processedSubscriptions.length));
          
          if (isMounted) {
            setFoundSubscriptions(processedSubscriptions);
            setProgress(100);
            setScanningComplete(true);
          }
          
          // Navigate to dashboard after a brief delay to show 100%
          setTimeout(() => {
            if (isMounted) navigate('/dashboard');
          }, 1500);
        } else {
          if (isMounted) {
            setError(response.error || 'Failed to scan emails');
            console.error('Scan error:', response.error);
          }
        }
      } catch (err) {
        clearInterval(progressInterval);
        if (isMounted) {
          console.error('Error during scan:', err);
          setError('Failed to scan emails. Please try again.');
        }
      }
    };

    performScan();

    return () => {
      isMounted = false;
      clearInterval(progressInterval);
    };
  }, [user, navigate]);

  // Render the scanning screen
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-6 text-primary">Scanning Your Emails</h1>
        
        {error ? (
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full" 
                  style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
                />
              </div>
              <p className="mt-2 text-gray-600">{progress}% complete</p>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                {progress < 30 ? 'Connecting to your email...' :
                 progress < 60 ? 'Scanning for subscription emails...' :
                 progress < 85 ? 'Processing subscription data...' :
                 progress < 100 ? 'Finalizing results...' :
                 'Scan complete!'}
              </p>
            </div>
            
            {scanningComplete && (
              <div className="mt-4 text-center">
                <p className="text-xl font-semibold text-primary">
                  Found {foundSubscriptions.length} subscriptions!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Redirecting to dashboard...
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <LoadingSpinner size="medium" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 