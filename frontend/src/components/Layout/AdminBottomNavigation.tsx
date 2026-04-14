import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Zap, Bell, HelpCircle, LogOut } from 'lucide-react';

const navItems = [
  { path: '/admin', icon: Zap, label: 'Quick Actions' },
  { path: '/admin?tab=notifications', icon: Bell, label: 'Notifications' },
  { path: '/admin?tab=support', icon: HelpCircle, label: 'Support' },
  { path: '/', icon: LogOut, label: 'Logout', action: 'logout' },
];

const AdminBottomNavigation: React.FC = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('admin_token');
    window.location.href = '/';
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-indigo-200 shadow-[0_-4px_6px_-1px_rgba(79,70,229,0.1)]"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      aria-label="Admin navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.action === 'logout' ? false : location.pathname.startsWith('/admin');
          
          if (item.action === 'logout') {
            return (
              <button
                key={item.path}
                onClick={handleLogout}
                className="flex flex-col items-center justify-center flex-1 min-w-0 py-2 px-1 transition-colors touch-manipulation min-h-[48px] text-red-600 hover:text-red-700"
              >
                <Icon
                  className="w-6 h-6 flex-shrink-0"
                  strokeWidth={2}
                />
                <span className="text-xs font-medium mt-0.5 truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 py-2 px-1 transition-colors touch-manipulation min-h-[48px] ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className="w-6 h-6 flex-shrink-0"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium mt-0.5 truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminBottomNavigation;
