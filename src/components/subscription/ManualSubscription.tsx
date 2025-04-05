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
  SelectChangeEvent,
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

const StyledPaper = styled(Paper)(({ theme }: any) => ({
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

const StyledTextField = styled(TextField)(({ theme }: any) => ({
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

const ManualSubscription: React.FC<ManualSubscriptionProps> = ({ onClose, onSubmit }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Subscription Details
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="provider"
                label="Provider"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="amount"
                label="Type"
                name="amount"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required error={!!errors.billingCycle} disabled={isSubmitting}>
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleSelectChange}
                  label="Frequency"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
                {errors.billingCycle && <FormHelperText>{errors.billingCycle}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="nextBilling"
                label="Price"
                name="nextBilling"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.nextBilling}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Additional Information
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  <MenuItem value="streaming">Streaming</MenuItem>
                  <MenuItem value="software">Software</MenuItem>
                  <MenuItem value="gaming">Gaming</MenuItem>
                  <MenuItem value="news">News</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
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
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                <Button variant="outlined" color="primary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Subscription'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default ManualSubscription; 