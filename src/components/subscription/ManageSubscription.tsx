import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  IconButton,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormHelperText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import '@fontsource/playfair-display/400.css';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
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

const DeleteButton = styled(Button)({
  backgroundColor: '#dc2626',
  color: 'white',
  '&:hover': {
    backgroundColor: '#b91c1c',
  },
});

export interface SubscriptionData {
  id: string;
  name: string;
  amount: string;
  billingCycle: string;
  nextBilling: string;
  category: string;
  description?: string;
  notifyBefore: string;
  notificationType: string;
  creditDate?: string;
  isActive: boolean;
  provider: string;
  type: string;
  price: string;
  frequency: string;
  next_renewal_date: string;
  status: string;
}

interface ManageSubscriptionProps {
  subscription: SubscriptionData;
  onClose: () => void;
  onSave: (subscription: SubscriptionData) => void;
  onDelete: (id: string) => void;
}

const ManageSubscription: React.FC<ManageSubscriptionProps> = ({ 
  subscription, 
  onClose, 
  onSave,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SubscriptionData>(subscription);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleToggleActive = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      onDelete(subscription.id);
      onClose();
    }
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

        <StyledTitle variant="h5" sx={{ color: '#26457A' }}>Manage Subscription</StyledTitle>

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
                label="Provider"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                error={!!errors.provider}
                helperText={errors.provider}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                error={!!errors.type}
                helperText={errors.type}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                label="Price"
                name="price"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required error={!!errors.frequency} disabled={isLoading}>
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
                label="Next Renewal Date"
                name="next_renewal_date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.next_renewal_date}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={isLoading}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={isLoading}>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Delete Subscription
                </Button>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default ManageSubscription; 