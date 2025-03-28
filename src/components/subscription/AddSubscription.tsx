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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';

const StyledPaper = styled(Paper)(({ theme }) => ({
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

const StyledTextField = styled(TextField)(({ theme }) => ({
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
}

interface AddSubscriptionProps {
  onClose: () => void;
  onSubmit: (subscription: SubscriptionFormData) => void;
}

const AddSubscription: React.FC<AddSubscriptionProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    nextBilling: '',
    category: 'entertainment',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Subscription Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: '€',
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label="Billing Cycle"
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                required
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </StyledTextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                label="Next Billing Date"
                name="nextBilling"
                type="date"
                value={formData.nextBilling}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <MenuItem value="entertainment">Entertainment</MenuItem>
                <MenuItem value="utilities">Utilities</MenuItem>
                <MenuItem value="software">Software</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </StyledTextField>
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <StyledButton type="submit" variant="contained">
                  Add Subscription
                </StyledButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default AddSubscription; 