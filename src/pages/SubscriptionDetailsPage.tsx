<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert,
  Button
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { SubscriptionData } from '../types/subscription';
=======
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { Button } from '../components/ui/button';
>>>>>>> 3eecfe20aa44ecc34637e52822ef45fcbeca7461

const SubscriptionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
<<<<<<< HEAD
  const { subscriptions, loading, error, isLocalDev } = useSubscriptions();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    if (subscriptions.length > 0 && id) {
      const foundSubscription = subscriptions.find(sub => sub.id === id);
      setSubscription(foundSubscription || null);
    }
  }, [subscriptions, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!subscription) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Subscription not found</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/subscriptions')}
          sx={{ mt: 2 }}
        >
          Back to Subscriptions
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {isLocalDev && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Dev Mode: Showing mock subscription details
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {subscription.title || subscription.provider}
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/subscriptions')}
        >
          Back
        </Button>
      </Box>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Provider</Typography>
            <Typography variant="body1">{subscription.provider}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Price</Typography>
            <Typography variant="body1">
              {subscription.price ? `$${subscription.price}` : 'Unknown'}
              {subscription.frequency ? ` / ${subscription.frequency}` : ''}
            </Typography>
          </Grid>
          
          {subscription.category && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">Category</Typography>
              <Typography variant="body1">{subscription.category}</Typography>
            </Grid>
          )}
          
          {subscription.renewal_date && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">Next Renewal</Typography>
              <Typography variant="body1">
                {new Date(subscription.renewal_date).toLocaleDateString()}
              </Typography>
            </Grid>
          )}
          
          {subscription.term_months && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">Term Length</Typography>
              <Typography variant="body1">
                {subscription.term_months} {subscription.term_months === 1 ? 'month' : 'months'}
              </Typography>
            </Grid>
          )}
          
          {subscription.last_payment_date && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">Last Payment</Typography>
              <Typography variant="body1">
                {new Date(subscription.last_payment_date).toLocaleDateString()}
              </Typography>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Price Increase</Typography>
            <Typography variant="body1">
              {subscription.is_price_increase ? 'Yes' : 'No'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">Last Detected</Typography>
            <Typography variant="body1">
              {new Date(subscription.lastDetectedDate).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
=======
  const { subscriptions, loading, error, deleteSubscription } = useSubscriptions();

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const subscription = subscriptions.find(sub => sub.id === id);

  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Subscription not found</h1>
        <Button
          onClick={() => navigate('/subscriptions')}
          className="bg-[#26457A] text-white"
        >
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      const success = await deleteSubscription(subscription.id);
      if (success) {
        navigate('/subscriptions');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{subscription.provider}</h1>
        <div className="space-x-4">
          <Button
            onClick={() => navigate('/subscriptions')}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Price</h3>
          <p className="mt-1 text-lg">${subscription.price} / {subscription.frequency}</p>
        </div>

        {subscription.renewal_date && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Next Renewal</h3>
            <p className="mt-1 text-lg">
              {new Date(subscription.renewal_date).toLocaleDateString()}
            </p>
          </div>
        )}

        {subscription.term_months && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Term Length</h3>
            <p className="mt-1 text-lg">{subscription.term_months} months</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500">Last Detected</h3>
          <p className="mt-1 text-lg">
            {new Date(subscription.lastDetectedDate).toLocaleDateString()}
          </p>
        </div>

        {subscription.is_price_increase && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
            <h3 className="text-sm font-medium text-yellow-800">Price Increase Detected</h3>
            <p className="mt-1 text-sm text-yellow-700">
              This subscription has had a recent price increase.
            </p>
          </div>
        )}
      </div>
    </div>
>>>>>>> 3eecfe20aa44ecc34637e52822ef45fcbeca7461
  );
};

export default SubscriptionDetailsPage; 