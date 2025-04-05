import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SubscriptionData } from '../../types/subscription';

interface ScanResult {
  subscriptions: SubscriptionData[];
  count?: number;
  scanStatus?: string;
  totalFound?: number;
}

const ScanningScreen: React.FC = () => {
  const { scanEmails } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("Preparing to scan...");
  const [error, setError] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState<boolean>(false);

  useEffect(() => {
    const startScan = async () => {
      // Reset states for new scan
      setError(null);
      setProgress(0);
      setStatus("Connecting to email provider...");
      
      // Setup progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          // Slow down progress near the end to wait for actual completion
          if (prev >= 90) return prev;
          return Math.min(prev + (Math.random() * 4), 90);
        });
      }, 1000);

      // Status update animation
      const statusMessages = [
        "Scanning inbox...",
        "Identifying subscription emails...",
        "Analyzing subscription data...",
        "Calculating payment patterns...",
        "Preparing results..."
      ];
      
      let currentMessageIndex = 0;
      const statusInterval = setInterval(() => {
        if (currentMessageIndex < statusMessages.length) {
          setStatus(statusMessages[currentMessageIndex]);
          currentMessageIndex++;
        }
      }, 3500);

      try {
        // Perform actual scan after a brief delay to set up UI
        setTimeout(async () => {
          try {
            const result = await scanEmails() as unknown as ScanResult;
            
            // Save scan results
            if (result && Array.isArray(result.subscriptions)) {
              localStorage.setItem('last_scan_count', result.subscriptions.length.toString());
              localStorage.setItem('last_subscriptions', JSON.stringify(result.subscriptions));
              
              // Complete the progress and display success
              setProgress(100);
              setStatus("Scan complete!");
              setScanComplete(true);
              
              // Navigate to phone number screen with the results
              setTimeout(() => {
                navigate('/phone-number', { 
                  state: { 
                    subscriptions: result.subscriptions
                  }
                });
              }, 1000);
            } else {
              throw new Error("No subscription data returned");
            }
          } catch (error) {
            clearInterval(progressInterval);
            clearInterval(statusInterval);
            
            let errorMessage = "Failed to scan emails";
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            
            console.error("Email scan error:", error);
            setError(errorMessage);
            setStatus("Scan failed");
          }
        }, 2000);
      } catch (error) {
        clearInterval(progressInterval);
        let errorMessage = "Failed to start scan";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        console.error("Email scan error:", error);
        setError(errorMessage);
        setStatus("Scan failed");
      }

      // Cleanup function
      return () => {
        clearInterval(progressInterval);
        clearInterval(statusInterval);
      };
    };

    startScan();
  }, [scanEmails, navigate]);

  // Helper function to determine progress bar color
  const getProgressColor = () => {
    if (error) return "bg-red-500";
    if (scanComplete) return "bg-green-500";
    return "bg-primary";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Scanning Your Emails</h2>
          <p className="text-gray-600 mt-2">
            {error ? "An error occurred" : status}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className={`h-4 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {error ? (
          <div className="mt-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center italic">
            {scanComplete ? "Redirecting to your phone number..." : "This may take a few moments..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ScanningScreen; 