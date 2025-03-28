import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Menu,
  MenuItem,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuList,
  Container,
  Box,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ManualSubscription, { ManualSubscriptionFormData } from '../subscription/ManualSubscription';
import ManageSubscription, { SubscriptionData } from '../subscription/ManageSubscription';
import SubscriptionList from './SubscriptionList';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [showManualSubscription, setShowManualSubscription] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionData | null>(null);
  const { user } = useAuth();

  // TODO: Replace with actual data from API
  const subscriptions: SubscriptionData[] = [
    {
      id: '1',
      name: 'Netflix',
      amount: '15.99',
      nextBilling: '2024-03-15',
      billingCycle: 'monthly',
      category: 'entertainment',
      notifyBefore: '7',
      notificationType: 'email',
      isActive: true,
      description: 'Streaming service',
    },
    {
      id: '2',
      name: 'Spotify',
      amount: '9.99',
      nextBilling: '2024-03-20',
      billingCycle: 'monthly',
      category: 'entertainment',
      notifyBefore: '7',
      notificationType: 'email',
      isActive: true,
      description: 'Music streaming',
    },
  ];

  const totalCost = subscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount), 0);
  const upcomingRenewals = subscriptions.filter(
    (sub) => new Date(sub.nextBilling) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const handleToggleMenu = () => {
    setMenuOpen((prevOpen) => !prevOpen);
  };

  const handleCloseMenu = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setMenuOpen(false);
  };

  const handleScanEmail = () => {
    setMenuOpen(false);
    navigate('/subscription-dashboard');
  };

  const handleAddManually = () => {
    setMenuOpen(false);
    setShowManualSubscription(true);
  };

  const handleManualSubscriptionSubmit = (formData: ManualSubscriptionFormData) => {
    console.log('New manual subscription:', formData);
    setShowManualSubscription(false);
  };

  const handleSubscriptionClick = (subscription: SubscriptionData) => {
    setSelectedSubscription(subscription);
  };

  const handleSaveSubscription = (updatedSubscription: SubscriptionData) => {
    console.log('Saving subscription:', updatedSubscription);
    // Here you would typically update the subscription in your backend
  };

  const handleDeleteSubscription = (id: string) => {
    console.log('Deleting subscription:', id);
    // Here you would typically delete the subscription from your backend
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.email}
        </Typography>
        <SubscriptionList />
      </Box>
    </Container>
  );
};

export default Dashboard; 