import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormHelperText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';

const StyledPaper = styled(Paper)(({ theme }: any) => ({
  padding: theme.spacing(4),
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
}));

const StyledTitle = styled(Typography)({
  color: '#1a365d',
  fontWeight: 600,
  fontFamily: 'Playfair Display, serif',
  marginBottom: '1.5rem',
});

const StyledTextField = styled(TextField)(({ theme }: any) => ({
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#1a365d',
    },
  },
}));

const StyledButton = styled(Button)({
  backgroundColor: 'black',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
});

export interface SubscriptionFormData {
  name: string;
  amount: string;
  billingCycle: string;
  nextBilling: string;
  category: string;
  description: string;
  provider: string;
  type: string;
  price: string;
  frequency: string;
  next_renewal_date: string;
}

interface AddSubscriptionProps {
  onClose: () => void;
  onSubmit: (subscription: SubscriptionFormData) => void;
}

const AddSubscription: React.FC<AddSubscriptionProps> = ({ onClose, onSubmit }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    nextBilling: '',
    category: 'entertainment',
    description: '',
    provider: '',
    type: '',
    price: '',
    frequency: 'monthly',
    next_renewal_date: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <StyledPaper sx={{ width: '100%', maxWidth: 600, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#1a365d',
          }}
        >
          <CloseIcon />
        </IconButton>

        <StyledTitle variant="h5">Add New Subscription</StyledTitle>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Subscription Details
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                id="provider"
                label="Provider"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                error={!!errors.provider}
                helperText={errors.provider}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="type"
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                error={!!errors.type}
                helperText={errors.type}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="price"
                label="Price"
                name="price"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required error={!!errors.frequency} disabled={isSubmitting}>
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleSelectChange}
                  label="Frequency"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
                {errors.frequency && <FormHelperText>{errors.frequency}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="next_renewal_date"
                label="Next Renewal Date"
                name="next_renewal_date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.next_renewal_date}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="description"
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Subscription'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default AddSubscription; 