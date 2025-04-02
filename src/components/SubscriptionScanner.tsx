import React, { useState } from 'react';
import { EnvelopeIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { scanEmails } from '../services/api';

interface SubscriptionScannerProps {
  onScanComplete?: (count: number) => void;
}

export const SubscriptionScanner: React.FC<SubscriptionScannerProps> = ({ onScanComplete }) => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{count: number; lastScan: Date} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!user) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const result = await scanEmails();
      
      if (result) {
        const count = result.count || 0;
        
        setScanResult({
          count,
          lastScan: new Date()
        });
        
        if (onScanComplete) {
          onScanComplete(count);
        }
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'An error occurred during the scan');
    } finally {
      setIsScanning(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <EnvelopeIcon className="h-5 w-5 text-indigo-600 mr-2" />
          Email Subscription Scanner
        </h2>
        
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Scan Emails
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {scanResult && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Scan completed successfully!</p>
            <p>Found {scanResult.count} subscription{scanResult.count !== 1 ? 's' : ''}</p>
            <p className="text-xs text-green-600 mt-1">
              Last scan: {scanResult.lastScan.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 