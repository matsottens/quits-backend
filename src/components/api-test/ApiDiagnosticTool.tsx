'use client';

import React, { useState } from 'react';
import { apiService } from '../../services/api';

interface ApiTestResult {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
}

const ApiDiagnosticTool: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await apiService.testApiConnection();
      setTestResult(result);
      console.log('API Test Result:', result);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const scanEmails = async () => {
    setLoading(true);
    try {
      const result = await apiService.scanEmails();
      alert(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error scanning emails:', error);
      alert('Error scanning emails: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">API Diagnostic Tool</h1>
      
      <div className="mb-6">
        <button
          onClick={runTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button
          onClick={scanEmails}
          disabled={loading}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Scan Emails
        </button>
      </div>
      
      {testResult && (
        <div className={`p-4 rounded-lg mb-4 ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h2 className="text-xl font-semibold mb-2">
            {testResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
          </h2>
          
          {!testResult.success && testResult.error && (
            <div className="mb-4">
              <p className="font-medium text-red-700">{testResult.error}</p>
              {testResult.details && (
                <p className="mt-1 text-sm text-red-600">{testResult.details}</p>
              )}
            </div>
          )}
          
          {testResult.success && testResult.data && (
            <div className="space-y-4">
              <div>
                <button 
                  onClick={() => toggleSection('public')}
                  className="flex items-center justify-between w-full p-2 bg-white rounded"
                >
                  <span className="font-medium">Public Health Endpoint</span>
                  <span>{expandedSection === 'public' ? '▼' : '▶'}</span>
                </button>
                
                {expandedSection === 'public' && testResult.data.publicEndpoint && (
                  <div className="p-3 bg-white rounded-b border-t">
                    <pre className="text-xs overflow-auto">{JSON.stringify(testResult.data.publicEndpoint, null, 2)}</pre>
                  </div>
                )}
              </div>
              
              <div>
                <button 
                  onClick={() => toggleSection('auth')}
                  className="flex items-center justify-between w-full p-2 bg-white rounded"
                >
                  <span className="font-medium">Authentication Endpoint</span>
                  <span>{expandedSection === 'auth' ? '▼' : '▶'}</span>
                </button>
                
                {expandedSection === 'auth' && testResult.data.authenticatedEndpoint && (
                  <div className="p-3 bg-white rounded-b border-t">
                    <pre className="text-xs overflow-auto">{JSON.stringify(testResult.data.authenticatedEndpoint, null, 2)}</pre>
                  </div>
                )}
              </div>
              
              <div>
                <button 
                  onClick={() => toggleSection('scan')}
                  className="flex items-center justify-between w-full p-2 bg-white rounded"
                >
                  <span className="font-medium">Scan Emails Endpoint</span>
                  <span>{expandedSection === 'scan' ? '▼' : '▶'}</span>
                </button>
                
                {expandedSection === 'scan' && testResult.data.scanEmailsEndpoint && (
                  <div className="p-3 bg-white rounded-b border-t">
                    <pre className="text-xs overflow-auto">{JSON.stringify(testResult.data.scanEmailsEndpoint, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">API Configuration</h3>
        <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'https://api.quits.cc'}</p>
        <p><strong>Origin:</strong> {window.location.origin}</p>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
      </div>
    </div>
  );
};

export default ApiDiagnosticTool; 