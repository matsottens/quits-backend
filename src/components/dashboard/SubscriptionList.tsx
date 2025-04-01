import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';

interface Subscription {
  id: string;
  provider: string;
  type: string;
  price: number;
  frequency: string;
  lastDetectedDate: string;
  created_at: string;
}

export const SubscriptionList: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, scanEmails } = useAuth();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      await scanEmails();
      await fetchSubscriptions(); // Refresh the list after scanning
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Your Subscriptions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleScanEmails}
          disabled={loading}
        >
          Scan for New Subscriptions
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {subscriptions.length === 0 ? (
        <Alert severity="info">
          No subscriptions found. Click "Scan for New Subscriptions" to find your subscriptions.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {subscriptions.map((subscription) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={subscription.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {subscription.provider}
                  </Typography>
                  <Typography color="text.secondary">
                    Type: {subscription.type || 'Unknown'}
                  </Typography>
                  {subscription.price && (
                    <Typography color="text.secondary">
                      Price: ${subscription.price.toFixed(2)} / {subscription.frequency}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Last detected: {new Date(subscription.lastDetectedDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SubscriptionList; 