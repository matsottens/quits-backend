import React, { useState } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  TextField, 
  Button, 
  MenuItem, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions } from '../hooks/useSubscriptions';

const AddSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSubscriptions, isLocalDev } = useSubscriptions();
  
  const [formData, setFormData] = useState({
    provider: '',
    price: '',
    frequency: 'monthly',
    renewalDate: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // In a real implementation, you would use the API service to add a subscription
      // For now, we'll just simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh subscriptions to get the updated list
      await refreshSubscriptions();
      
      // Navigate back to the subscriptions list
      navigate('/subscriptions');
    } catch (err) {
      console.error('Error adding subscription:', err);
      setError('Failed to add subscription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {isLocalDev && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Dev Mode: Manual subscription additions not saved
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom>
        Add New Subscription
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Provider Name"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <span>$</span>
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                label="Frequency"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Next Renewal Date"
              name="renewalDate"
              type="date"
              value={formData.renewalDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/subscriptions')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Subscription'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AddSubscription; 