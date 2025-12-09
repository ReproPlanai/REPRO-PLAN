import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Home,
  FileText,
  MapPin,
  Shield,
  User,
  MessageCircle
} from 'lucide-react';

interface BottomNavigationProps {
  isAuthenticated: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ isAuthenticated }) => {
  const location = useLocation();

  // Only show bottom nav for authenticated users on mobile devices
  if (!isAuthenticated || window.innerWidth >= 768) {
    return null;
  }

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home', shortLabel: 'Home' },
    { path: '/health-records', icon: FileText, label: 'Records', shortLabel: 'Records' },
    { path: '/clinics', icon: MapPin, label: 'Clinics', shortLabel: 'Clinics' },
    { path: '/emergency', icon: Shield, label: 'Emergency', shortLabel: 'Help' },
    { path: '/chatbot', icon: MessageCircle, label: 'Chat', shortLabel: 'Chat' },
    { path: '/profile', icon: User, label: 'Profile', shortLabel: 'Profile' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom">
      <div className="flex justify-around items-center px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 touch-manipulation
                min-h-[60px] min-w-[60px]
                active:scale-95
                ${active
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                }
              `}
              style={{
                paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
              }}
            >
              <Icon
                size={20}
                className={`mb-1 ${active ? 'stroke-2' : ''}`}
              />
              <span className="text-xs font-medium leading-tight">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .safe-area-bottom {
          padding-bottom: max(0px, env(safe-area-inset-bottom));
        }
      `}</style>
    </nav>
  );
};

export default BottomNavigation;
