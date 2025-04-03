import React, { useState } from 'react';
import { EnvelopeIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { scanEmails, SubscriptionData } from '../services/api';

interface SubscriptionScannerProps {
  onScanComplete?: (count: number, subscriptions?: SubscriptionData[]) => void;
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
        
        // Process subscription results
        let processedSubscriptions: SubscriptionData[] = [];
        if (result.subscriptions && result.subscriptions.length > 0) {
          // Ensure each subscription has proper defaults and clean provider names
          processedSubscriptions = result.subscriptions.map(sub => {
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
            } else if (providerName.toLowerCase().includes('youtube')) {
              providerName = 'YouTube Premium';
            }
            
            // If the provider name has an email domain, extract the company name
            if (providerName.includes('@')) {
              const domainPart = providerName.split('@')[1];
              if (domainPart) {
                // Remove domain suffix and convert to proper name format
                providerName = domainPart
                  .split('.')[0] // Take the first part before any dots
                  .replace(/-/g, ' ') // Replace hyphens with spaces
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize words
                  .join(' ');
              }
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
        }
        
        // Store the scan count in localStorage
        localStorage.setItem('last_scan_count', count.toString());
        localStorage.setItem('last_scan_time', new Date().toISOString());
        
        if (onScanComplete) {
          onScanComplete(count, processedSubscriptions);
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
          <EnvelopeIcon className="h-5 w-5 text-primary mr-2" />
          Email Subscription Scanner
        </h2>
        
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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