import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Connecting to email...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanEmails = async () => {
      try {
        // Initial status
        setStatus('Connecting to email...');
        setProgress(10);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Start scanning
        setStatus('Reading emails...');
        setProgress(30);
        
        const response = await fetch('http://localhost:5000/api/scan-emails', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to scan emails');
        }

        setStatus('Processing subscription data...');
        setProgress(60);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to scan emails');
        }

        setStatus('Analyzing subscriptions...');
        setProgress(80);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store the found subscriptions
        if (data.subscriptions && data.subscriptions.length > 0) {
          localStorage.setItem('found_subscriptions', JSON.stringify(data.subscriptions));
        }

        setStatus('Finalizing...');
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Navigate to subscription selection
        navigate('/subscription-selection');

      } catch (error) {
        console.error('Scanning error:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while scanning emails');
        setStatus('Scan failed');
      }
    };

    scanEmails();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#26457A] mb-4">Scanning Your Emails</h2>
          <p className="text-gray-600 mb-8">{status}</p>
        </div>
        
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#26457A] bg-[#FFEDD6]">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-[#26457A]">
                {progress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#FFEDD6]">
            <div 
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#26457A] transition-all duration-500"
            ></div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          {error ? (
            <div className="text-red-500">
              <p>{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#26457A] hover:bg-[#1a2f4f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26457A]"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <p>This may take a few minutes. We're scanning your emails to find active subscriptions.</p>
          )}
        </div>
      </div>
    </div>
  );
}; 