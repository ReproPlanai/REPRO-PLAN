import React, { useState, useEffect } from 'react';
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Smartphone,
  QrCode,
  Shield,
  Bell
} from 'lucide-react';

interface UpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
  version?: string;
  features?: string[];
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  onUpdate,
  onDismiss,
  version = '2.0',
  features = [
    'QR Code Verification System',
    'Enhanced App Download Features',
    'Improved Mobile Responsiveness',
    'Advanced Caching System',
    'Better SEO Optimization'
  ]
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [hasSeenUpdate, setHasSeenUpdate] = useState(false);

  useEffect(() => {
    // Check if user has seen this update
    const seenUpdate = localStorage.getItem(`repro-plan-update-seen-${version}`);
    if (!seenUpdate) {
      // Show update notification after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [version]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateProgress(0);

    // Simulate update process
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          setIsVisible(false);
          localStorage.setItem(`repro-plan-update-seen-${version}`, 'true');
          onUpdate();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`repro-plan-update-seen-${version}`, 'true');
    onDismiss();
  };

  const handleRemindLater = () => {
    setIsVisible(false);
    // Set reminder for 1 hour later
    const reminderTime = Date.now() + (60 * 60 * 1000);
    localStorage.setItem('repro-plan-update-reminder', reminderTime.toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base">
                REPRO PLAN Update {version} Available
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm">
                New features and improvements ready to install
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-white text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Update</span>
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Update Progress */}
        {isUpdating && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-blue-100">Installing updates...</span>
              <span className="text-xs text-blue-100">{updateProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div 
                className="bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${updateProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-blue-100">
              <CheckCircle className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleRemindLater}
            className="text-blue-100 hover:text-white text-xs px-3 py-1 rounded hover:bg-white/10 transition-colors"
          >
            Remind me later
          </button>
          <button
            onClick={handleDismiss}
            className="text-blue-100 hover:text-white text-xs px-3 py-1 rounded hover:bg-white/10 transition-colors"
          >
            Don't show again
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
