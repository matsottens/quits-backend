import React, { useState } from 'react';
<<<<<<< HEAD
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
=======
import { useNavigate } from 'react-router-dom';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { Button } from '../components/ui/button';
import { Form, FormLabel, FormInput } from '../components/ui/form';

interface SubscriptionFormData {
  provider: string;
  price: string;
  frequency: string;
  renewal_date: string;
}

const AddSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { addSubscription } = useSubscriptions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    provider: '',
    price: '',
    frequency: 'monthly',
    renewal_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const subscription = {
        provider: formData.provider,
        price: parseFloat(formData.price),
        frequency: formData.frequency,
        renewal_date: formData.renewal_date || null,
        is_price_increase: false,
        lastDetectedDate: new Date().toISOString(),
        term_months: formData.frequency === 'monthly' ? 1 : 12,
        user_id: '', // This will be set by the hook
      };

      const result = await addSubscription(subscription);
      if (result) {
        navigate('/subscriptions');
      } else {
        throw new Error('Failed to add subscription');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Add New Subscription</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <FormLabel htmlFor="provider">Provider</FormLabel>
            <FormInput
              id="provider"
              name="provider"
              type="text"
              required
              value={formData.provider}
              onChange={handleChange}
              placeholder="Netflix, Spotify, etc."
            />
          </div>

          <div>
            <FormLabel htmlFor="price">Price</FormLabel>
            <FormInput
              id="price"
              name="price"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="9.99"
            />
          </div>

          <div>
            <FormLabel htmlFor="frequency">Billing Frequency</FormLabel>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#26457A] focus:ring-[#26457A]"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <FormLabel htmlFor="renewal_date">Next Renewal Date</FormLabel>
            <FormInput
              id="renewal_date"
              name="renewal_date"
              type="date"
              value={formData.renewal_date}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={() => navigate('/subscriptions')}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#26457A] text-white"
            >
              {loading ? 'Adding...' : 'Add Subscription'}
            </Button>
          </div>
        </div>
      </Form>
    </div>
>>>>>>> 3eecfe20aa44ecc34637e52822ef45fcbeca7461
  );
};

export default AddSubscription; 