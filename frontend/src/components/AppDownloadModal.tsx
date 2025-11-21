import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Star, 
  Shield, 
  Heart, 
  Globe,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  onDownload
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [hasSeenModal, setHasSeenModal] = useState(false);

  // Check if user has seen the modal before
  useEffect(() => {
    const hasSeen = localStorage.getItem('repro-plan-app-download-seen');
    setHasSeenModal(hasSeen === 'true');
  }, []);

  // Show modal after 3 seconds if user hasn't seen it
  useEffect(() => {
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        // This will be controlled by parent component
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenModal]);

  const handleDownload = () => {
    setIsInstalling(true);
    setInstallProgress(0);

    // Simulate installation process
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsInstalling(false);
          onDownload();
          localStorage.setItem('repro-plan-app-download-seen', 'true');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleClose = () => {
    onClose();
    localStorage.setItem('repro-plan-app-download-seen', 'true');
  };

  const handleRemindLater = () => {
    onClose();
    // Set a reminder for 24 hours later
    const reminderTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('repro-plan-app-reminder', reminderTime.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white p-4 sm:p-6 rounded-t-2xl flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2 sm:mb-4 pr-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">Download REPRO PLAN App</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Get the full experience</p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Benefits */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">Enhanced Security</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Biometric authentication and end-to-end encryption</p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">Offline Access</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Works without internet connection</p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">Push Notifications</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Real-time emergency alerts and updates</p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">App-like Experience</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Native app feel with better performance</p>
                </div>
              </div>
            </div>

            {/* Installation Progress */}
            {isInstalling && (
              <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Installing REPRO PLAN...</span>
                <span className="text-sm text-gray-600">{installProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${installProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Features Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Emergency panic button with instant alerts</li>
              <li>• Anonymous SRHR chatbot and resources</li>
              <li>• Secure medication ordering system</li>
              <li>• Safe house locator with navigation</li>
              <li>• Offline access to all features</li>
              <li>• Push notifications for emergencies</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={isInstalling}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium text-sm sm:text-base"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Download & Install</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={handleRemindLater}
                  className="flex-1 py-2 px-3 sm:px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  Remind me later
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 px-3 sm:px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  Continue in browser
                </button>
              </div>
          </div>

            {/* PWA Instructions */}
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0">
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="text-xs sm:text-sm text-yellow-800 min-w-0">
                  <p className="font-medium">How to install:</p>
                  <p>Look for the "Add to Home Screen" option in your browser menu, or follow the installation prompt when it appears.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadModal;
