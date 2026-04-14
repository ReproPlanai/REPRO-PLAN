import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Users, UserPlus, Shield, Lock, Settings } from 'lucide-react';

const navItems = [
  { path: '/dashboard?role=SAFEHOUSE&tab=residents', icon: Users, label: 'Residents' },
  { path: '/dashboard?role=SAFEHOUSE&tab=intake', icon: UserPlus, label: 'Intake' },
  { path: '/dashboard?role=SAFEHOUSE&tab=security', icon: Shield, label: 'Security' },
  { path: '/dashboard?role=SAFEHOUSE&tab=access', icon: Lock, label: 'Access' },
  { path: '/dashboard?role=SAFEHOUSE&tab=settings', icon: Settings, label: 'Settings' },
];

const SafeHouseBottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-green-200 shadow-[0_-4px_6px_-1px_rgba(34,197,94,0.1)]"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      aria-label="SafeHouse navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.search.includes(item.path.split('&tab=')[1]?.split('&')[0] || '');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 py-2 px-1 transition-colors touch-manipulation min-h-[48px] ${
                isActive
                  ? 'text-green-600'
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

export default SafeHouseBottomNavigation;
