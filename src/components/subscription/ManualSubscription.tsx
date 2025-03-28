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
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
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
  '& .MuiInputLabel-root': {
    color: '#26457A',
  },
  '& .MuiOutlinedInput-root': {
    color: '#26457A',
    '& fieldset': {
      borderColor: 'rgba(38, 69, 122, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: '#26457A',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#26457A',
    },
  },
  '& .MuiSelect-icon': {
    color: '#26457A',
  },
  '& .MuiMenuItem-root': {
    color: '#26457A',
  },
}));

const StyledTitle = styled(Typography)({
  fontWeight: 600,
  fontFamily: 'Playfair Display, serif',
  marginBottom: '1.5rem',
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    color: '#26457A',
  },
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#26457A',
    },
  },
}));

const StyledButton = styled(Button)({
  backgroundColor: '#26457A',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(38, 69, 122, 0.9)',
  },
});

export interface ManualSubscriptionFormData {
  name: string;
  amount: string;
  billingCycle: string;
  nextBilling: string;
  category: string;
  description: string;
  notifyBefore: string;
  notificationType: string;
}

interface ManualSubscriptionProps {
  onClose: () => void;
  onSubmit: (subscription: ManualSubscriptionFormData) => void;
}

const ManualSubscription: React.FC<ManualSubscriptionProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ManualSubscriptionFormData>({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    nextBilling: '',
    category: 'entertainment',
    description: '',
    notifyBefore: '7', // Default to 7 days before
    notificationType: 'email', // Default to email notifications
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backgroundColor: 'transparent',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: -1,
        }
      }}
    >
      <StyledPaper sx={{ 
        width: '100%', 
        maxWidth: 600, 
        position: 'relative', 
        maxHeight: '90vh', 
        overflow: 'auto',
        backgroundColor: 'white',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#26457A',
          }}
        >
          <CloseIcon />
        </IconButton>

        <StyledTitle variant="h5" sx={{ color: '#26457A' }}>Add Subscription Manually</StyledTitle>

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
                <MenuItem value="bimonthly">Bi-Monthly (Every 2 Months)</MenuItem>
                <MenuItem value="quarterly">Quarterly (Every 3 Months)</MenuItem>
                <MenuItem value="semiannually">Semi-Annually (Every 6 Months)</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
                <MenuItem value="biennial">Biennial (Every 2 Years)</MenuItem>
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
                <MenuItem value="food">Food & Delivery</MenuItem>
                <MenuItem value="insurance">Insurance</MenuItem>
                <MenuItem value="shopping">Shopping</MenuItem>
                <MenuItem value="telecom">Telecom</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </StyledTextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#26457A', fontWeight: 500, mt: 2 }}>
                Notification Preferences
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label="Notify Me Before"
                name="notifyBefore"
                value={formData.notifyBefore}
                onChange={handleChange}
                required
              >
                <MenuItem value="1">1 day before</MenuItem>
                <MenuItem value="3">3 days before</MenuItem>
                <MenuItem value="5">5 days before</MenuItem>
                <MenuItem value="7">1 week before</MenuItem>
                <MenuItem value="14">2 weeks before</MenuItem>
                <MenuItem value="30">1 month before</MenuItem>
              </StyledTextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                select
                label="Notification Method"
                name="notificationType"
                value={formData.notificationType}
                onChange={handleChange}
                required
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="push">Push Notification</MenuItem>
                <MenuItem value="all">All Methods</MenuItem>
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
                <Button onClick={onClose} sx={{ color: 'white' }}>Cancel</Button>
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

export default ManualSubscription; 