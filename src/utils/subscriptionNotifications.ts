import { useToast } from '../hooks/use-toast';

interface Subscription {
  id: string;
  name: string;
  endDate: string;
  // Add other subscription properties as needed
}

interface NotificationSettings {
  enabled: boolean;
  daysBefore: string;
}

export const checkSubscriptionExpiration = (subscriptions: Subscription[]) => {
  const { toast } = useToast();
  
  // Get notification settings from localStorage
  const notificationSettingsStr = localStorage.getItem('subscriptionNotifications');
  const notificationSettings: NotificationSettings = notificationSettingsStr 
    ? JSON.parse(notificationSettingsStr)
    : { enabled: true, daysBefore: '30' }; // Default values

  if (!notificationSettings.enabled) return;

  const today = new Date();
  const daysBefore = parseInt(notificationSettings.daysBefore);

  subscriptions.forEach(subscription => {
    const endDate = new Date(subscription.endDate);
    const daysUntilExpiration = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Check if the subscription is expiring within the notification period
    if (daysUntilExpiration <= daysBefore && daysUntilExpiration > 0) {
      // Show notification
      toast({
        title: "Subscription Expiring Soon",
        description: `${subscription.name} will expire in ${daysUntilExpiration} days.`,
        variant: "default",
      });
    }
  });
};

// Function to check subscriptions periodically (e.g., daily)
export const startSubscriptionCheck = () => {
  // Check immediately
  const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
  checkSubscriptionExpiration(subscriptions);

  // Check daily
  setInterval(() => {
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    checkSubscriptionExpiration(subscriptions);
  }, 24 * 60 * 60 * 1000); // 24 hours
}; 