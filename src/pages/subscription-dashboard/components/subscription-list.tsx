import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '../../../components/ui/button';
import { SubscriptionData } from '../../../types/subscription';
import ManageSubscription, { ExtendedSubscriptionData } from '../../../components/subscription/ManageSubscription';

// Define a UI-specific interface that extends SubscriptionData with display properties
interface UISubscriptionData extends SubscriptionData {
  name?: string;
  amount?: number;
  nextBilling?: string;
  currency?: string;
  billingPeriod?: string;
  isActive?: boolean;
  status?: string;
  type?: string;
  firstDetected?: string;
  lastDetected?: string;
}

interface SubscriptionListProps {
  subscriptions: UISubscriptionData[];
  onSaveSubscription?: (subscription: UISubscriptionData) => void;
  onDeleteSubscription?: (id: string) => void;
}

// Mock subscription data
const mockSubscriptions: UISubscriptionData[] = [
  {
    id: '1',
    provider: 'Netflix',
    price: 13.99,
    frequency: 'monthly',
    renewal_date: '2023-12-15T00:00:00.000Z',
    term_months: 1,
    is_price_increase: false,
    lastDetectedDate: '2023-11-15',
    // UI specific properties
    name: 'Netflix Standard',
    amount: 13.99,
    currency: 'EUR',
    nextBilling: '2023-12-15',
    billingPeriod: 'monthly',
    isActive: true,
    status: 'active',
    type: 'streaming',
    firstDetected: '2023-01-01',
    lastDetected: '2023-11-15',
    category: 'streaming'
  },
  {
    id: '2',
    provider: 'Spotify',
    price: 9.99,
    frequency: 'monthly',
    renewal_date: '2023-12-10T00:00:00.000Z',
    term_months: 1,
    is_price_increase: false,
    lastDetectedDate: '2023-11-10',
    // UI specific properties
    name: 'Spotify Premium',
    amount: 9.99,
    currency: 'EUR',
    nextBilling: '2023-12-10',
    billingPeriod: 'monthly',
    isActive: true,
    status: 'active',
    type: 'music',
    firstDetected: '2023-02-15',
    lastDetected: '2023-11-10',
    category: 'music'
  },
  {
    id: '3',
    provider: 'Amazon Prime',
    price: 49.99,
    frequency: 'yearly',
    renewal_date: '2024-01-05T00:00:00.000Z',
    term_months: 12,
    is_price_increase: false,
    lastDetectedDate: '2023-11-05',
    // UI specific properties
    name: 'Prime Membership',
    amount: 49.99,
    currency: 'EUR',
    nextBilling: '2024-01-05',
    billingPeriod: 'yearly',
    isActive: true,
    status: 'active',
    type: 'shopping',
    firstDetected: '2023-01-05',
    lastDetected: '2023-11-05',
    category: 'shopping'
  },
];

// Helper function to convert UISubscriptionData to ExtendedSubscriptionData
const convertToExtendedFormat = (subscription: UISubscriptionData): ExtendedSubscriptionData => {
  return {
    id: subscription.id,
    provider: subscription.provider,
    price: subscription.amount || subscription.price || 0,
    frequency: subscription.frequency,
    renewal_date: subscription.renewal_date,
    term_months: subscription.term_months,
    is_price_increase: subscription.is_price_increase,
    isActive: subscription.isActive === undefined ? true : subscription.isActive,
    status: subscription.status || 'active',
    type: subscription.type || 'other',
    next_renewal_date: subscription.nextBilling,
    lastDetectedDate: subscription.lastDetectedDate,
    description: '',
    category: subscription.category || 'other'
  };
};

// Helper function to convert back from ExtendedSubscriptionData to UISubscriptionData
const convertFromExtendedFormat = (subscription: ExtendedSubscriptionData): UISubscriptionData => {
  return {
    id: subscription.id,
    provider: subscription.provider,
    price: subscription.price,
    frequency: subscription.frequency,
    renewal_date: subscription.renewal_date,
    term_months: subscription.term_months,
    is_price_increase: subscription.is_price_increase,
    lastDetectedDate: subscription.lastDetectedDate,
    // UI specific properties
    name: subscription.provider,
    amount: subscription.price || 0,
    nextBilling: subscription.next_renewal_date,
    isActive: subscription.isActive,
    status: subscription.status,
    type: subscription.type,
    category: subscription.category
  };
};

// Component to render the logo or icon for each subscription
const LogoComponent = ({ provider }: { provider: string }) => {
  // This could be extended to use actual logos based on the provider
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
  
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 2,
      }}
    >
      <Typography variant="subtitle1">{getInitials(provider)}</Typography>
    </Box>
  );
};

export default function SubscriptionList({
  subscriptions = mockSubscriptions,
  onSaveSubscription,
  onDeleteSubscription,
}: SubscriptionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<ExtendedSubscriptionData | null>(null);

  const handleSubscriptionClick = (subscription: UISubscriptionData) => {
    setSelectedSubscription(convertToExtendedFormat(subscription));
    setManageModalOpen(true);
  };

  const handleCloseManageModal = () => {
    setManageModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleSaveSubscription = (subscription: ExtendedSubscriptionData) => {
    if (onSaveSubscription) {
      onSaveSubscription(convertFromExtendedFormat(subscription));
    }
    handleCloseManageModal();
  };

  const handleDeleteSubscription = (id: string) => {
    if (onDeleteSubscription) {
      onDeleteSubscription(id);
    }
    handleCloseManageModal();
  };

  // Filter subscriptions based on search query
  const filteredSubscriptions = subscriptions.filter(sub =>
    (sub.name?.toLowerCase() || sub.provider.toLowerCase()).includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search subscriptions..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map((subscription) => (
            <ListItem
              key={subscription.id}
              alignItems="flex-start"
              sx={{
                mb: 1,
                borderRadius: 1,
                boxShadow: 1,
                '&:hover': { boxShadow: 3, cursor: 'pointer' },
              }}
              onClick={() => handleSubscriptionClick(subscription)}
            >
              <LogoComponent provider={subscription.provider} />
              <ListItemText
                primary={
                  <Typography variant="subtitle1" component="div">
                    {subscription.name || subscription.provider}
                    {subscription.isActive ? (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        sx={{ ml: 1 }}
                      />
                    ) : (
                      <Chip
                        label="Inactive"
                        size="small"
                        color="default"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography variant="body2" component="span" color="textPrimary">
                      {subscription.amount && subscription.currency ? 
                        `${subscription.amount} ${subscription.currency} / ${subscription.billingPeriod || subscription.frequency || 'monthly'}` : 
                        `${subscription.price} EUR / ${subscription.frequency || 'monthly'}`}
                    </Typography>
                    <Typography variant="body2" component="div" color="textSecondary">
                      Next billing: {subscription.nextBilling || (subscription.renewal_date && new Date(subscription.renewal_date).toLocaleDateString()) || 'Not set'}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            No subscriptions found.
          </Typography>
        )}
      </List>

      <Dialog
        open={manageModalOpen}
        onClose={handleCloseManageModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            {selectedSubscription ? 'Edit Subscription' : 'Add Subscription'}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseManageModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedSubscription && (
            <ManageSubscription
              subscription={selectedSubscription}
              onSave={handleSaveSubscription}
              onDelete={handleDeleteSubscription}
              onClose={handleCloseManageModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 