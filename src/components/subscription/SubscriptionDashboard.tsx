import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  AppBar,
  Toolbar,
  Drawer,
  ListItemIcon,
  Menu,
  MenuItem,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  Paper as MuiPaper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import AddSubscription from './AddSubscription';
import ManualSubscription from './ManualSubscription';
import SubscriptionDetails from './SubscriptionDetails';
import { cn } from '../../lib/utils';
import { db } from '../../lib/supabase';
import type { Subscription } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#ffefd5',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(4),
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#26457A',
  color: 'white',
  boxShadow: 'none',
  borderBottom: '1px solid #e5e7eb',
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '1rem 0',
});

const Logo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const LogoIcon = styled(Box)({
  width: '2rem',
  height: '2rem',
  marginRight: '0.5rem',
  position: 'relative',
  '& > div': {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(4, 1fr)',
    gap: '0.125rem',
    '& > div': {
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
  },
});

const LogoText = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'white',
  fontFamily: 'Playfair Display, serif',
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'white',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  marginTop: theme.spacing(3),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '0.5rem',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f3f4f6',
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    backgroundColor: 'white',
    borderRight: '1px solid #e5e7eb',
  },
}));

interface SubscriptionFormData {
  name: string;
  amount: string;
  billingCycle: string;
  nextBilling: string;
  category: string;
  description: string;
}

interface ManualSubscriptionFormData {
  name: string;
  amount: string;
  billingCycle: string;
  nextBilling: string;
  category: string;
  description: string;
  notifyBefore: string;
  notificationType: string;
}

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onClose: () => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

const SubscriptionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAddSubscription, setShowAddSubscription] = useState(false);
  const [showManualSubscription, setShowManualSubscription] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);

  // Load subscriptions from Supabase
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await db.getSubscriptionsByUserId(user.id);
        setSubscriptions(data);
      } catch (err) {
        console.error('Error loading subscriptions:', err);
        setError('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, [user]);

  useEffect(() => {
    // Check for query params to determine which form to show
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    
    if (mode === 'manual') {
      setShowManualSubscription(true);
    } else if (mode === 'scan') {
      setShowAddSubscription(true);
    }
  }, [location]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

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
    setShowAddSubscription(true);
  };

  const handleAddManually = () => {
    setMenuOpen(false);
    setShowManualSubscription(true);
  };

  const handleSubscriptionClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  const handleSubscriptionSubmit = (formData: SubscriptionFormData) => {
    if (!user) return;
    
    // Here you would typically make an API call to save the subscription
    const newSubscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> = {
      ...formData,
      user_id: user.id,
      status: 'active',
      billing_cycle: formData.billingCycle,
      next_billing: formData.nextBilling
    };
    
    console.log('New subscription:', newSubscription);
    // For now, we'll just close the modal
    setShowAddSubscription(false);
  };

  const handleManualSubscriptionSubmit = async (formData: ManualSubscriptionFormData) => {
    if (!user) return;
    
    try {
      console.log('Received form data:', formData);
      
      const newSubscription = {
        user_id: user.id,
        name: formData.name,
        amount: formData.amount,
        billing_cycle: formData.billingCycle,
        next_billing: formData.nextBilling,
        category: formData.category,
        description: formData.description,
        status: 'active',
      };

      const savedSubscription = await db.createSubscription(newSubscription);
      setSubscriptions(prev => [...prev, savedSubscription]);
      setShowManualSubscription(false);
    } catch (error) {
      console.error('Error adding subscription:', error);
      setError('Failed to add subscription');
    }
  };

  const handleSubscriptionEdit = async (updatedSubscription: Subscription) => {
    try {
      const savedSubscription = await db.updateSubscription(
        updatedSubscription.id,
        updatedSubscription
      );
      
      setSubscriptions(prev =>
        prev.map(sub =>
          sub.id === savedSubscription.id ? savedSubscription : sub
        )
      );
      
      setSelectedSubscription(null);
    } catch (error) {
      console.error('Error editing subscription:', error);
      setError('Failed to update subscription');
    }
  };

  const handleSubscriptionDelete = async (id: string) => {
    try {
      await db.deleteSubscription(id);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      setSelectedSubscription(null);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setError('Failed to delete subscription');
    }
  };

  return (
    <StyledContainer>
      <StyledAppBar position="static">
        <StyledToolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Logo>
              <LogoIcon>
                <div>
                  {Array(16).fill(0).map((_, i) => (
                    <div key={i} />
                  ))}
                </div>
              </LogoIcon>
              <LogoText>Quits</LogoText>
            </Logo>
          </Box>
          <Button
            ref={anchorRef}
            variant="contained"
            startIcon={<AddIcon />}
            endIcon={<ArrowDropDownIcon />}
            onClick={handleToggleMenu}
            sx={{
              backgroundColor: 'white',
              color: '#26457A',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Add Subscription
          </Button>
          <Popper
            open={menuOpen}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-end"
            transition
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom-end' ? 'right top' : 'right bottom',
                }}
              >
                <MuiPaper elevation={3} sx={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
                  <ClickAwayListener onClickAway={handleCloseMenu}>
                    <MenuList autoFocusItem={menuOpen}>
                      <MenuItem onClick={handleScanEmail} sx={{ py: 1.5 }}>
                        <EmailIcon sx={{ mr: 2 }} />
                        Scan Email
                      </MenuItem>
                      <MenuItem onClick={handleAddManually} sx={{ py: 1.5 }}>
                        <EditIcon sx={{ mr: 2 }} />
                        Add Manually
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </MuiPaper>
              </Grow>
            )}
          </Popper>
        </StyledToolbar>
      </StyledAppBar>

      <StyledDrawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#1a365d',
              fontWeight: 600,
              fontFamily: 'Playfair Display, serif',
              mb: 2,
            }}
          >
            Menu
          </Typography>
          <List>
            <ListItem button onClick={() => navigate('/dashboard')}>
              <ListItemIcon>
                <TrackChangesIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => navigate('/subscription-tracker')}>
              <ListItemIcon>
                <TrackChangesIcon />
              </ListItemIcon>
              <ListItemText primary="Subscription Tracker" />
            </ListItem>
            <ListItem button onClick={() => navigate('/calendar')}>
              <ListItemIcon>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="Calendar" />
            </ListItem>
            <ListItem button onClick={() => navigate('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
        </Box>
      </StyledDrawer>

      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#1a365d',
            fontWeight: 600,
            fontFamily: 'Playfair Display, serif',
            mb: 2,
          }}
        >
          Your Subscriptions ({subscriptions.length})
        </Typography>

        <StyledPaper>
          <List>
            {subscriptions.map((subscription, index) => (
              <React.Fragment key={subscription.id}>
                <StyledListItem
                  onClick={() => handleSubscriptionClick(subscription)}
                >
                  <ListItemText
                    primary={subscription.name}
                    secondary={`Next billing: ${subscription.nextBilling}`}
                  />
                  <ListItemSecondaryAction>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mr: 2 }}
                    >
                      €{subscription.amount}
                    </Typography>
                    <IconButton edge="end" aria-label="details">
                      <ChevronRightIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </StyledListItem>
                {index < subscriptions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </StyledPaper>
      </Box>

      {showAddSubscription && (
        <AddSubscription
          onClose={() => setShowAddSubscription(false)}
          onSubmit={handleSubscriptionSubmit}
        />
      )}

      {showManualSubscription && (
        <ManualSubscription
          onClose={() => setShowManualSubscription(false)}
          onSubmit={handleManualSubscriptionSubmit}
        />
      )}

      {selectedSubscription && (
        <SubscriptionDetails
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          onEdit={handleSubscriptionEdit}
          onDelete={handleSubscriptionDelete}
        />
      )}
    </StyledContainer>
  );
};

export default SubscriptionDashboard; 