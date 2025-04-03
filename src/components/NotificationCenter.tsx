import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Typography } from '../pages/quits-subscription-tracker/components/ui/typography';

interface Notification {
  id: string;
  type: 'price_change' | 'renewal' | 'subscription';
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    provider?: string;
    oldPrice?: number;
    newPrice?: number;
    renewalDate?: string;
  };
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiService.getNotifications();
        if (response.success && response.data) {
          setNotifications(response.data);
        } else {
          setError('Failed to fetch notifications');
        }
      } catch (err) {
        setError('An error occurred while fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg ${
            notification.read ? 'bg-gray-50' : 'bg-blue-50'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <Typography.span className="font-medium">
                {notification.type === 'price_change' && 'Price Change'}
                {notification.type === 'renewal' && 'Renewal Reminder'}
                {notification.type === 'subscription' && 'New Subscription'}
              </Typography.span>
              <Typography.span className="text-sm text-gray-500 ml-2">
                {new Date(notification.createdAt).toLocaleDateString()}
              </Typography.span>
            </div>
            {!notification.read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark as read
              </button>
            )}
          </div>
          <Typography.p className="mt-2">{notification.message}</Typography.p>
          {notification.data && (
            <div className="mt-2 text-sm text-gray-600">
              {notification.data.provider && (
                <Typography.p>Provider: {notification.data.provider}</Typography.p>
              )}
              {notification.data.oldPrice && notification.data.newPrice && (
                <Typography.p>
                  Price changed from ${notification.data.oldPrice} to $
                  {notification.data.newPrice}
                </Typography.p>
              )}
              {notification.data.renewalDate && (
                <Typography.p>
                  Renewal date: {new Date(notification.data.renewalDate).toLocaleDateString()}
                </Typography.p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter; 