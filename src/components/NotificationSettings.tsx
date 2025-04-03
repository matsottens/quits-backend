import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Typography } from '../pages/quits-subscription-tracker/components/ui/typography';

interface NotificationSettings {
  emailNotifications: boolean;
  priceChangeAlerts: boolean;
  renewalReminders: boolean;
  pushNotifications: boolean;
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    priceChangeAlerts: true,
    renewalReminders: true,
    pushNotifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiService.getNotificationSettings();
        if (response.success && response.data) {
          setSettings(response.data);
        } else {
          setError('Failed to fetch notification settings');
        }
      } catch (err) {
        setError('An error occurred while fetching settings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleToggle = async (setting: keyof NotificationSettings) => {
    try {
      const newValue = !settings[setting];
      const response = await apiService.updateNotificationSettings({
        ...settings,
        [setting]: newValue,
      });

      if (response.success) {
        setSettings(prev => ({
          ...prev,
          [setting]: newValue,
        }));
      } else {
        setError('Failed to update settings');
      }
    } catch (err) {
      setError('An error occurred while updating settings');
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Typography.h2 className="text-xl font-semibold">
        Notification Settings
      </Typography.h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Typography.span className="font-medium">Email Notifications</Typography.span>
            <Typography.p className="text-sm text-gray-500">
              Receive notifications via email
            </Typography.p>
          </div>
          <button
            onClick={() => handleToggle('emailNotifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Typography.span className="font-medium">Price Change Alerts</Typography.span>
            <Typography.p className="text-sm text-gray-500">
              Get notified when subscription prices change
            </Typography.p>
          </div>
          <button
            onClick={() => handleToggle('priceChangeAlerts')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.priceChangeAlerts ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.priceChangeAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Typography.span className="font-medium">Renewal Reminders</Typography.span>
            <Typography.p className="text-sm text-gray-500">
              Receive reminders before subscription renewals
            </Typography.p>
          </div>
          <button
            onClick={() => handleToggle('renewalReminders')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.renewalReminders ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.renewalReminders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Typography.span className="font-medium">Push Notifications</Typography.span>
            <Typography.p className="text-sm text-gray-500">
              Receive push notifications on your device
            </Typography.p>
          </div>
          <button
            onClick={() => handleToggle('pushNotifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 