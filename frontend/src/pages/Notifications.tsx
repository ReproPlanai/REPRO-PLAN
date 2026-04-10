import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Heart,
  Shield,
  BookOpen,
  Users,
  Search,
  Sparkles,
  Lock,
  Phone
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';

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

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'health' | 'safety' | 'education' | 'community' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Health Check Complete',
        message: 'Your monthly health check has been completed successfully.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        category: 'health',
        actionUrl: '/health-tracker',
        actionText: 'View Details'
      },
      {
        id: '2',
        type: 'reminder',
        title: 'Appointment Reminder',
        message: 'Don\'t forget your appointment tomorrow at 10:00 AM.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isRead: false,
        category: 'health',
        actionUrl: '/appointments',
        actionText: 'View Appointment'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Medication Alert',
        message: 'Your medication refill is due in 3 days.',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
        isRead: true,
        category: 'health',
        actionUrl: '/medications',
        actionText: 'Order Refill'
      },
      {
        id: '4',
        type: 'info',
        title: 'New Resource Available',
        message: 'A new educational resource about SRHR has been added.',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        isRead: true,
        category: 'education',
        actionUrl: '/education',
        actionText: 'Learn More'
      },
      {
        id: '5',
        type: 'success',
        title: 'Community Event',
        message: 'You\'ve been invited to a community support group meeting.',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
        isRead: false,
        category: 'community',
        actionUrl: '/community',
        actionText: 'RSVP'
      },
      {
        id: '6',
        type: 'error',
        title: 'Emergency Contact Update',
        message: 'Please update your emergency contact information.',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        isRead: true,
        category: 'safety',
        actionUrl: '/emergency',
        actionText: 'Update Contacts'
      }
    ];

    setNotifications(sampleNotifications);
  }, []);

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'health') return Heart;
    if (category === 'safety') return Shield;
    if (category === 'education') return BookOpen;
    if (category === 'community') return Users;
    
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertCircle;
      case 'reminder':
        return Bell;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'reminder':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health':
        return 'bg-pink-100 text-pink-700';
      case 'safety':
        return 'bg-red-100 text-red-700';
      case 'education':
        return 'bg-blue-100 text-blue-700';
      case 'community':
        return 'bg-green-100 text-green-700';
      case 'system':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      notification.category === filter;
    
    const matchesSearch = searchQuery === '' ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { value: 'health', label: 'Health', count: notifications.filter(n => n.category === 'health').length },
    { value: 'safety', label: 'Safety', count: notifications.filter(n => n.category === 'safety').length },
    { value: 'education', label: 'Education', count: notifications.filter(n => n.category === 'education').length },
    { value: 'community', label: 'Community', count: notifications.filter(n => n.category === 'community').length },
    { value: 'system', label: 'System', count: notifications.filter(n => n.category === 'system').length },
  ];

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-2xl shadow-primary-500/20 mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Notifications</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Your Notifications</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Stay updated with important health reminders, appointments, and safety alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { icon: Lock, title: '100%', desc: 'Private', color: 'from-emerald-500 to-teal-500' },
            { icon: Phone, title: '24/7', desc: 'Alerts', color: 'from-blue-500 to-cyan-500' },
            { icon: Shield, title: 'Secure', desc: 'Encrypted', color: 'from-purple-500 to-indigo-500' },
            { icon: Sparkles, title: 'Smart', desc: 'Filtered', color: 'from-amber-500 to-orange-500' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={desc} className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{option.label}</span>
                {option.count > 0 && (
                  <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs">{option.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-20 sm:pb-8">
          {filteredNotifications.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No matching notifications' : 'No notifications'}
              </h3>
              <p className="text-sm text-gray-500">
                {searchQuery ? 'Try adjusting your search or filter' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type, notification.category);
              
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${
                    !notification.isRead ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2.5 rounded-xl ${getNotificationColor(notification.type)} flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{notification.title}</h4>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(notification.category)}`}>
                            {notification.category}
                          </span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(notification.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex-1 py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                      {notification.actionUrl && (
                        <button
                          onClick={() => handleAction(notification)}
                          className="flex-1 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-primary-600 hover:to-purple-600 transition-colors"
                        >
                          {notification.actionText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </PageContainer>
  );
};

export default Notifications;
