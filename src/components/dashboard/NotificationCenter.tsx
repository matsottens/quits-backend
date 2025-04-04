import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLocalDev = localStorage.getItem('isLocalDev') === 'true';

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiService.getNotifications();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch notifications');
      }
      
      // Handle the structure of the mock data
      let notificationsList: Notification[];
      if (Array.isArray(response.data)) {
        notificationsList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        notificationsList = response.data.data;
      } else {
        notificationsList = [];
        console.warn('Unexpected notification data structure:', response.data);
      }
      
      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(notif => !notif.read).length);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark notification as read');
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

      {isLocalDev && (
        <div className="mb-4 p-2 bg-yellow-50 text-yellow-700 rounded-lg text-xs">
          <span className="font-medium">Dev Mode:</span> Using mock notification data
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

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
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
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