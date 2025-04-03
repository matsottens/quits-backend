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
      
      if (result && result.success && result.data) {
        const count = result.data.count || 0;
        
        setScanResult({
          count,
          lastScan: new Date()
        });
        
        // Process subscription results with enhanced detection
        let processedSubscriptions: SubscriptionData[] = [];
        if (result.data.subscriptions && result.data.subscriptions.length > 0) {
          // Enhanced processing for Apple subscriptions
          processedSubscriptions = result.data.subscriptions.map(sub => {
            console.log('Processing subscription:', sub);
            
            // Special handling for Apple receipts containing Babbel
            if (sub.provider && typeof sub.provider === 'string') {
              const providerText = sub.provider.toLowerCase();
              
              // Detect Apple subscription with Babbel
              if ((providerText.includes('apple') || providerText.includes('itunes')) && 
                  providerText.includes('babbel')) {
                console.log('Found Babbel subscription through Apple');
                
                // Look for pricing pattern in €XX,XX/X months format
                const pricingMatch = sub.provider.match(/€\s*(\d+[\.,]\d+)\/(\d+)\s*(months|month)/i);
                if (pricingMatch) {
                  const totalPrice = parseFloat(pricingMatch[1].replace(',', '.'));
                  const months = parseInt(pricingMatch[2]);
                  
                  // Calculate monthly price
                  if (!isNaN(totalPrice) && !isNaN(months) && months > 0) {
                    const monthlyPrice = totalPrice / months;
                    console.log(`Calculated monthly price: ${monthlyPrice} from ${totalPrice}/${months} months`);
                    sub.price = monthlyPrice;
                    sub.frequency = 'monthly';
                  }
                }
                
                sub.provider = 'Babbel';
              }
              
              // Try to extract monetary values from text
              if (sub.price === null || sub.price === 0) {
                const extractedPrice = extractMoneyValue(sub.provider);
                if (extractedPrice !== null) {
                  console.log(`Extracted price: ${extractedPrice} from text`);
                  sub.price = extractedPrice;
                }
              }
            }
            
            return sub;
          });
    
          console.log('Processed subscriptions:', processedSubscriptions);
          
          // Store the data in localStorage with a better key name
          localStorage.setItem('subscriptions', JSON.stringify(processedSubscriptions));
        }
        
        // Store the scan count in localStorage
        localStorage.setItem('subscriptionCount', count.toString());
        localStorage.setItem('scanDate', new Date().toISOString());
        
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
  
  // Helper function to find monetary values in text
  const extractMoneyValue = (text: string): number | null => {
    if (!text) return null;
    
    // Match currency symbols followed by numbers
    const prefixMatches = text.match(/[\$€£](\d+[\.,]?\d*)/g);
    if (prefixMatches && prefixMatches.length > 0) {
      // Get the first match and clean it
      const match = prefixMatches[0].replace(/[^\d\.,]/g, '').replace(',', '.');
      return parseFloat(match);
    }
    
    // Match numbers followed by currency symbols
    const suffixMatches = text.match(/(\d+[\.,]?\d*)[\$€£]/g);
    if (suffixMatches && suffixMatches.length > 0) {
      // Get the first match and clean it
      const match = suffixMatches[0].replace(/[^\d\.,]/g, '').replace(',', '.');
      return parseFloat(match);
    }
    
    // Match specific patterns for subscription pricing
    const periodMatch = text.match(/(\d+[\.,]\d+)\/(\d+)\s*(months|month|jaar|year)/i);
    if (periodMatch) {
      const totalAmount = parseFloat(periodMatch[1].replace(',', '.'));
      const period = parseInt(periodMatch[2]);
      if (!isNaN(totalAmount) && !isNaN(period) && period > 0) {
        return totalAmount / period; // Return monthly equivalent
      }
    }
    
    return null;
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