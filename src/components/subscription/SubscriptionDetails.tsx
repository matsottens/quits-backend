import React from 'react';
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
  };
  onClose: () => void;
  onEdit: (subscription: SubscriptionDetailsProps['subscription']) => void;
  onDelete: (id: string) => void;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  subscription,
  onClose,
  onEdit,
  onDelete,
}) => {
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

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <DetailLabel>Amount</DetailLabel>
            <DetailValue>€{subscription.amount}</DetailValue>
          </Grid>

          <Grid item xs={12} sm={6}>
            <DetailLabel>Billing Cycle</DetailLabel>
            <DetailValue>{subscription.billing_cycle.charAt(0).toUpperCase() + subscription.billing_cycle.slice(1)}</DetailValue>
          </Grid>

          <Grid item xs={12} sm={6}>
            <DetailLabel>Next Billing Date</DetailLabel>
            <DetailValue>{new Date(subscription.next_billing).toLocaleDateString()}</DetailValue>
          </Grid>

          <Grid item xs={12} sm={6}>
            <DetailLabel>Category</DetailLabel>
            <DetailValue>{subscription.category.charAt(0).toUpperCase() + subscription.category.slice(1)}</DetailValue>
          </Grid>

          <Grid item xs={12}>
            <DetailLabel>Status</DetailLabel>
            <DetailValue>
              <Typography
                component="span"
                sx={{
                  backgroundColor: subscription.status === 'active' ? '#dcfce7' : '#fee2e2',
                  color: subscription.status === 'active' ? '#166534' : '#991b1b',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Typography>
            </DetailValue>
          </Grid>

          {subscription.description && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <DetailLabel>Description</DetailLabel>
                <DetailValue>{subscription.description}</DetailValue>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={onClose}>Close</Button>
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>
    </Box>
  );
};

export default SubscriptionDetails; 