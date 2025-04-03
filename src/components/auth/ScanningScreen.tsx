import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SubscriptionData } from '../../services/api';

const ScanningScreen: React.FC = () => {
  const navigate = useNavigate();
  const { scanEmails, subscriptionState } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startScan = async () => {
      try {
        await scanEmails();
        navigate('/dashboard', { state: { scanCount: subscriptionState.subscriptions.length } });
      } catch (error) {
        console.error('Scan failed:', error);
        navigate('/dashboard');
      }
    };

    startScan();

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [navigate, scanEmails, subscriptionState.subscriptions.length]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDD6]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-[#26457A]">Scanning Your Emails</h2>
        <p className="text-gray-600">Looking for subscription information...</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[#26457A] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">{progress}% complete</p>
      </div>
    </div>
  );
};

export default ScanningScreen; 