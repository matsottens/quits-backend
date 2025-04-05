import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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

const DetailLabel = styled(Typography)({
  color: '#64748b',
  fontSize: '0.875rem',
  marginBottom: '0.25rem',
});

const DetailValue = styled(Typography)({
  color: '#1a365d',
  fontWeight: 500,
  marginBottom: '1rem',
});

interface SubscriptionDetailsProps {
  subscription: {
    id: string;
    user_id: string;
    name: string;
    amount: string;
    billing_cycle: string;
    next_billing: string;
    category: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    provider: string;
    type: string;
    price: number;
    frequency: string;
    next_renewal_date: string;
    notes: string;
  };
  onClose: () => void;
  onEdit: (subscription: SubscriptionDetailsProps['subscription']) => void;
  onDelete: (id: string) => void;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ subscription,
  onClose,
  onEdit,
  onDelete, }: any) => {
  const navigate = useNavigate();

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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <StyledTitle variant="h5">{subscription.name}</StyledTitle>
          <Box>
            <IconButton onClick={() => onEdit(subscription)} sx={{ color: '#1a365d' }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(subscription.id)} sx={{ color: '#ef4444' }}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Provider</Typography>
            <Typography variant="body1">{subscription.provider}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Type</Typography>
            <Typography variant="body1">{subscription.type || 'Unknown'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Price</Typography>
            <Typography variant="body1">${subscription.price.toFixed(2)} / {subscription.frequency}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Renewal Date</Typography>
            <Typography variant="body1">
              {subscription.next_renewal_date 
                ? new Date(subscription.next_renewal_date).toLocaleDateString() 
                : 'Not set'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography variant="body1">{subscription.description || 'No description'}</Typography>
          </Grid>

          {/* Additional Details Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Additional Details</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
            <Typography variant="body1">{subscription.notes || 'No notes'}</Typography>
          </Grid>

          {/* Actions Section */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={onClose}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => onEdit(subscription)}
              >
                Edit Subscription
              </Button>
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>
    </Box>
  );
};

export default SubscriptionDetails; 