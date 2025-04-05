import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

export const CorsTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testCors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.testCors();
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test CORS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>CORS Test</h2>
      <button 
        onClick={testCors}
        disabled={loading}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test CORS Configuration'}
      </button>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div>
          <h3>Test Results:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 