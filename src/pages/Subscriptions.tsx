import React from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  CircularProgress, 
  Alert
} from '@mui/material';
import { useSubscriptions } from '../hooks/useSubscriptions';

const Subscriptions: React.FC = () => {
  const { 
    subscriptions, 
    loading, 
    error, 
    isLocalDev 
  } = useSubscriptions();

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
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {isLocalDev && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Dev Mode: Showing mock subscription data
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom>
        Your Subscriptions
      </Typography>
      
      {subscriptions.length === 0 ? (
        <Typography>No subscriptions found. Try scanning your emails to detect subscriptions.</Typography>
      ) : (
        <Box>
          {subscriptions.map((subscription) => (
            <Box 
              key={subscription.id} 
              sx={{ 
                border: '1px solid #eee', 
                borderRadius: 2, 
                p: 2, 
                mb: 2 
              }}
            >
              <Typography variant="h6">{subscription.provider}</Typography>
              <Typography>
                {subscription.price ? `$${subscription.price}` : 'Price unknown'} 
                {subscription.frequency ? ` / ${subscription.frequency}` : ''}
              </Typography>
              {subscription.renewal_date && (
                <Typography>
                  Renews: {new Date(subscription.renewal_date).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Subscriptions; 