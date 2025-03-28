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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ManualSubscription, { ManualSubscriptionFormData } from '../subscription/ManualSubscription';
import ManageSubscription, { SubscriptionData } from '../subscription/ManageSubscription';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [showManualSubscription, setShowManualSubscription] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionData | null>(null);

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
    <div className="max-w-7xl mx-auto">
      {/* Updated header - White background with dark text */}
      <div className="bg-white text-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div>
              <Button
                ref={anchorRef}
                variant="contained"
                startIcon={<AddIcon />}
                endIcon={<ArrowDropDownIcon />}
                onClick={handleToggleMenu}
                sx={{
                  backgroundColor: '#26457A',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1a365d',
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
                    <Paper elevation={3} sx={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
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
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {/* Total Subscriptions Card */}
          <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-[#26457A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#26457A]/70 truncate">
                      Total Subscriptions
                    </dt>
                    <dd className="text-lg font-medium text-[#26457A]">
                      {subscriptions.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Cost Card */}
          <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-[#26457A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#26457A]/70 truncate">
                      Monthly Cost
                    </dt>
                    <dd className="text-lg font-medium text-[#26457A]">
                      ${totalCost.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Renewals Card */}
          <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-[#26457A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#26457A]/70 truncate">
                      Upcoming Renewals
                    </dt>
                    <dd className="text-lg font-medium text-[#26457A]">
                      {upcomingRenewals.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-[#26457A] mb-4">Recent Activity</h2>
          <div className="bg-white shadow-md overflow-hidden rounded-lg border border-gray-100">
            <ul className="divide-y divide-gray-100">
              {subscriptions.map((subscription) => (
                <li 
                  key={subscription.id}
                  onClick={() => handleSubscriptionClick(subscription)}
                  className="cursor-pointer"
                >
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-[#26457A] truncate">
                        {subscription.name}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#FFEDD6] text-[#26457A]">
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-[#26457A]/70">
                          Next billing: {subscription.nextBilling}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-[#26457A]/70 sm:mt-0 sm:ml-6">
                          €{subscription.amount}/month
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showManualSubscription && (
        <ManualSubscription
          onClose={() => setShowManualSubscription(false)}
          onSubmit={handleManualSubscriptionSubmit}
        />
      )}

      {selectedSubscription && (
        <ManageSubscription
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          onSave={handleSaveSubscription}
          onDelete={handleDeleteSubscription}
        />
      )}
    </div>
  );
}; 