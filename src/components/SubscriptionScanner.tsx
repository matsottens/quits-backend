import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EnvelopeIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { scanEmails } from '../services/api';
import { SubscriptionData } from '../types/subscription';

interface SubscriptionScannerProps {
  onScanComplete?: (count: number) => void;
}

const SubscriptionScanner: React.FC<SubscriptionScannerProps> = ({ onScanComplete }: any) => {
  const { scanEmails, subscriptionState } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setError(null);
      await scanEmails();
      onScanComplete?.(subscriptionState.subscriptions.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan emails');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Scan Subscriptions</h2>
      <p className="text-gray-600 mb-4">
        Scan your emails to find and track your subscriptions.
      </p>
      <button
        onClick={handleScan}
        disabled={isScanning}
        className={`w-full py-2 px-4 rounded-md text-white ${
          isScanning ? 'bg-gray-400' : 'bg-[#26457A] hover:bg-[#1e3c72]'
        }`}
      >
        {isScanning ? 'Scanning...' : 'Scan Emails'}
      </button>
      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
      {subscriptionState.subscriptions.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Found {subscriptionState.subscriptions.length} subscriptions
        </div>
      )}
    </div>
  );
};

export default SubscriptionScanner; 