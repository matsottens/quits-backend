import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { styled, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import '@fontsource/playfair-display/400.css';
import { SubscriptionData as BaseSubscriptionData } from '../../types/subscription';

// Extend the base interface for local use
export interface ExtendedSubscriptionData extends BaseSubscriptionData {
  isActive: boolean;
  description?: string;
  status: string;
  type: string;
  next_renewal_date?: string;
  category: string;
}

const StyledPaper = styled(Paper)(({ theme }: any) => ({
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

const DeleteButton = styled(Button)({
  backgroundColor: '#dc2626',
  color: 'white',
  '&:hover': {
    backgroundColor: '#b91c1c',
  },
});

interface ManageSubscriptionProps {
  onSave?: (subscription: ExtendedSubscriptionData) => void;
  onDelete?: (id: string) => void;
  subscription?: ExtendedSubscriptionData;
  onClose?: () => void;
  onCancel?: () => void;
}

const ManageSubscription: React.FC<ManageSubscriptionProps> = ({ subscription, 
  onClose, 
  onSave,
  onDelete,
  onCancel, }: any) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const defaultSubscription: ExtendedSubscriptionData = {
    id: `sub-${Date.now()}`,
    provider: '',
    price: 0,
    frequency: 'monthly',
    renewal_date: new Date().toISOString(),
    term_months: 1,
    is_price_increase: false,
    lastDetectedDate: new Date().toISOString(),
    isActive: true,
    type: 'digital',
    status: 'active',
    next_renewal_date: new Date().toISOString(),
    category: 'other',
  };

  const [formData, setFormData] = useState<ExtendedSubscriptionData>(
    subscription || defaultSubscription
  );

  // Convert renewal_date to next_renewal_date if needed
  useEffect(() => {
    if (subscription && subscription.renewal_date && !subscription.next_renewal_date) {
      setFormData({
        ...formData,
        next_renewal_date: subscription.renewal_date
      });
    }
  }, [subscription]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (onSave) {
      onSave(formData);
    }
    
    if (onClose) {
      onClose();
    }
  };

  const handleDelete = () => {
    if (subscription && onDelete) {
      onDelete(subscription.id);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    } else {
      navigate(-1);
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
                id="provider"
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
                id="type"
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
                id="price"
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
                id="next_renewal_date"
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
                id="description"
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
                    onClick={handleCancel}
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