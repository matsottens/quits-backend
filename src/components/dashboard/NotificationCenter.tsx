import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'price_increase' | 'renewal_reminder';
  provider: string;
  read: boolean;
  created_at: string;
  details: {
    oldPrice?: number;
    newPrice?: number;
    percentageChange?: number;
    renewal_date?: string;
    term_months?: number;
    days_until_renewal?: number;
    price?: number;
    frequency?: string;
  };
}

export const NotificationCenter: React.FC = () => {
  const { user, apiUrl } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`${apiUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, apiUrl]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-user-id': user.id
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <BellIcon className="h-6 w-6 mr-2" />
          Notifications
        </h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-sm rounded-full px-2 py-1">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notifications</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">
                    {notification.type === 'price_increase' 
                      ? `Price Increase: ${notification.provider}`
                      : `Upcoming Renewal: ${notification.provider}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.type === 'price_increase' ? (
                      <>
                        Price increasing from ${notification.details.oldPrice} to ${notification.details.newPrice} 
                        ({notification.details.percentageChange?.toFixed(1)}% increase)
                      </>
                    ) : (
                      <>
                        Renewing in {notification.details.days_until_renewal} days
                        (${notification.details.price} per {notification.details.frequency})
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 