import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  ArrowRight
} from 'lucide-react';

interface AppInstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const AppInstallBanner: React.FC<AppInstallBannerProps> = ({
  onInstall,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the banner before
    const hasSeen = localStorage.getItem('repro-plan-install-banner-seen');
    if (!hasSeen) {
      // Show banner after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('repro-plan-install-banner-seen', 'true');
    onDismiss();
  };

  const handleInstall = () => {
    setIsVisible(false);
    localStorage.setItem('repro-plan-install-banner-seen', 'true');
    onInstall();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base">Get the REPRO PLAN App</h3>
            <p className="text-blue-100 text-xs sm:text-sm">
              Install for offline access, push notifications, and better performance
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Install</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppInstallBanner;
