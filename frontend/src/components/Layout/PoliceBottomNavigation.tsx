import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Scan, FileText, Settings } from 'lucide-react';

const navItems = [
  { path: '/dashboard?role=POLICE&tab=emergency', icon: AlertTriangle, label: 'Alerts' },
  { path: '/dashboard?role=POLICE&tab=map', icon: MapPin, label: 'Map' },
  { path: '/dashboard?role=POLICE&tab=qr-scanner', icon: Scan, label: 'Scanner' },
  { path: '/dashboard?role=POLICE&tab=cases', icon: FileText, label: 'Cases' },
  { path: '/dashboard?role=POLICE&tab=settings', icon: Settings, label: 'Settings' },
];

const PoliceBottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-blue-200 shadow-[0_-4px_6px_-1px_rgba(59,130,246,0.1)]"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      aria-label="Police navigation"
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
                  ? 'text-blue-600'
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

export default PoliceBottomNavigation;
