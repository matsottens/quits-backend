import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon } from '@heroicons/react/24/outline';

interface NotificationSettings {
  email_notifications: boolean;
  price_change_threshold: number;
  renewal_reminder_days: number;
}

export const NotificationSettings: React.FC = () => {
  const { session, apiUrl } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    price_change_threshold: 5,
    renewal_reminder_days: 7
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/notification-settings`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'x-user-id': session?.user?.id || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification settings');
      }

      const data = await response.json();
      setSettings(data.data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      setError('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`${apiUrl}/api/notification-settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'x-user-id': session?.user?.id || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save notification settings');
      }

      setSuccess(true);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setError('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchSettings();
    }
  }, [session?.access_token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <BellIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold">Notification Settings</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.email_notifications}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                email_notifications: e.target.checked
              }))}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-700">Enable email notifications</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Receive email notifications for price changes and upcoming renewals
          </p>
        </div>

        {/* Price Change Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price Change Threshold (%)
          </label>
          <div className="mt-1">
            <input
              type="number"
              min="1"
              max="100"
              value={settings.price_change_threshold}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                price_change_threshold: Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
              }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Minimum percentage change in subscription price to trigger a notification
          </p>
        </div>

        {/* Renewal Reminder Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Renewal Reminder Days
          </label>
          <div className="mt-1">
            <input
              type="number"
              min="1"
              max="30"
              value={settings.renewal_reminder_days}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                renewal_reminder_days: Math.max(1, Math.min(30, parseInt(e.target.value) || 1))
              }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Number of days before renewal to send a reminder notification
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={saveSettings}
            disabled={saving}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}; 