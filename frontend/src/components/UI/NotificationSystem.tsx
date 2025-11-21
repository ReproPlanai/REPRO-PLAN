import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

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

  // Sample notifications for SRHR app - simplified for unread count only
  const sampleNotifications: Notification[] = useMemo(() => [
    {
      id: '1',
      type: 'reminder',
      title: 'Health Check Reminder',
      message: 'It\'s time for your monthly health check. Book an appointment with a healthcare provider.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      actionUrl: '/clinics',
      actionText: 'Find Clinics',
      category: 'health'
    },
    {
      id: '2',
      type: 'info',
      title: 'New Educational Content',
      message: 'New articles about contraception methods are now available in the Articles section.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: false,
      actionUrl: '/articles',
      actionText: 'Read Articles',
      category: 'education'
    },
    {
      id: '3',
      type: 'success',
      title: 'Quiz Completed',
      message: 'Great job! You completed the STI Prevention quiz with a score of 85%.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      actionUrl: '/games',
      actionText: 'Take More Quizzes',
      category: 'education'
    },
    {
      id: '4',
      type: 'warning',
      title: 'Privacy Reminder',
      message: 'Remember to clear your browser history if you\'re using a shared device.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isRead: true,
      category: 'safety'
    },
    {
      id: '5',
      type: 'info',
      title: 'Community Support',
      message: 'New peer mentors are available for support. Connect with someone who understands your situation.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: false,
      actionUrl: '/mentorship',
      actionText: 'Find Mentors',
      category: 'community'
    }
  ], []);

  useEffect(() => {
    setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
  }, [sampleNotifications]);

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
