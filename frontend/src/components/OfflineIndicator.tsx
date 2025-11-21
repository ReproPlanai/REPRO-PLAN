import React from 'react';
import { useOffline } from '../hooks/useOffline';
import { WifiOff, AlertTriangle } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isSlowConnection, connectionType } = useOffline();

  if (isOnline && !isSlowConnection) {
    return null; // Don't show indicator when online with good connection
  }

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        message: 'You\'re offline. Some features may be limited.',
        bgColor: 'bg-red-500',
        textColor: 'text-white'
      };
    }
    
    if (isSlowConnection) {
      return {
        icon: AlertTriangle,
        message: `Slow connection (${connectionType}). Loading may take longer.`,
        bgColor: 'bg-yellow-500',
        textColor: 'text-white'
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  const Icon = statusInfo.icon;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${statusInfo.bgColor} ${statusInfo.textColor} px-4 py-2 text-center text-sm font-medium`}>
      <div className="flex items-center justify-center space-x-2">
        <Icon size={16} />
        <span>{statusInfo.message}</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
