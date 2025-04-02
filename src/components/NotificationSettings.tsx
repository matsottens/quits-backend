import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BellIcon } from '@heroicons/react/24/outline';

interface NotificationSettings {
  email_notifications: boolean;
  price_change_threshold: number;
  renewal_reminder_days: number;
}

export const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    price_change_threshold: 5,
    renewal_reminder_days: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.quits.cc';

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        const response = await fetch(`${apiUrl}/api/notification-settings`, {
          headers: {
            'Authorization': `Bearer ${user.id}`,
            'x-user-id': user.id
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notification settings');
        }

        const data = await response.json();
        setSettings(data.settings);
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        setError('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${apiUrl}/api/notification-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
          'x-user-id': user.id
        },
        body: JSON.stringify({ settings })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <BellIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold">Notification Settings</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.email_notifications}
              onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Enable email notifications</span>
          </label>
          <p className="mt-1 text-sm text-gray-500 ml-8">
            Receive email notifications for price changes and upcoming renewals
          </p>
        </div>

        {/* Price Change Threshold */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Change Threshold (%)
          </label>
          <div className="mt-1">
            <input
              type="number"
              min="1"
              max="100"
              value={settings.price_change_threshold}
              onChange={(e) => setSettings({ ...settings, price_change_threshold: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)) })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Minimum percentage change in subscription price to trigger a notification
          </p>
        </div>

        {/* Renewal Reminder Days */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Renewal Reminder Days
          </label>
          <div className="mt-1">
            <input
              type="number"
              min="1"
              max="30"
              value={settings.renewal_reminder_days}
              onChange={(e) => setSettings({ ...settings, renewal_reminder_days: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) })}
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
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}; 