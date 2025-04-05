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

const SubscriptionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  );
};

export default SubscriptionDetailsPage; 