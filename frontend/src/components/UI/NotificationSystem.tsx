import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { apiService } from '../../services/apiReal';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  category: 'health' | 'safety' | 'education' | 'community' | 'system';
}

const NotificationSystem: React.FC = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiService.getNotifications?.() as { 
          success?: boolean; 
          notifications?: Notification[] 
        };
        
        if (response?.success && response.notifications) {
          setUnreadCount(response.notifications.filter(n => !n.isRead).length);
        } else {
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setUnreadCount(0);
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={handleNotificationClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationSystem;
