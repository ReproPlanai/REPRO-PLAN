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
  ExternalLink,
  QrCode,
  Share2,
  Apple,
  Monitor
} from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

interface DeviceInfo {
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  browser: string;
  isStandalone: boolean;
  canInstall: boolean;
}

const IOS_APP_URL = process.env.REACT_APP_IOS_APP_URL;
const ANDROID_APP_URL = process.env.REACT_APP_ANDROID_APP_URL;

const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  onDownload
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [hasSeenModal, setHasSeenModal] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'unknown',
    browser: 'unknown',
    isStandalone: false,
    canInstall: false
  });
  const [showInstructions, setShowInstructions] = useState(false);

  // Detect device and platform
  useEffect(() => {
    const detectDevice = (): DeviceInfo => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      const isAndroid = /android/i.test(userAgent);
      const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
      
      // Detect browser
      let browser = 'unknown';
      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'chrome';
      else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'safari';
      else if (userAgent.includes('Firefox')) browser = 'firefox';
      else if (userAgent.includes('Edg')) browser = 'edge';
      
      // Check if PWA can be installed
      const canInstall = 'serviceWorker' in navigator && 
                        ('PushManager' in window || isIOS || isAndroid);
      
      let platform: DeviceInfo['platform'] = 'unknown';
      if (isIOS) platform = 'ios';
      else if (isAndroid) platform = 'android';
      else if (window.innerWidth >= 768) platform = 'desktop';
      
      return {
        platform,
        browser,
        isStandalone,
        canInstall
      };
    };

    setDeviceInfo(detectDevice());
  }, []);

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

    // Check device type and provide appropriate download
    const downloadUrl = getDownloadUrl();

    if (downloadUrl) {
      // Real download - redirect to app store or download link
      setTimeout(() => {
        window.open(downloadUrl, '_blank');
        setIsInstalling(false);
        onDownload();
        localStorage.setItem('repro-plan-app-download-seen', 'true');
      }, 1000);
    } else {
      // Fallback to PWA installation
      const interval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsInstalling(false);
            triggerPWAInstall();
            onDownload();
            localStorage.setItem('repro-plan-app-download-seen', 'true');
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const getDownloadUrl = (): string | null => {
    switch (deviceInfo.platform) {
      case 'ios':
        return IOS_APP_URL || null;
      case 'android':
        return ANDROID_APP_URL || null;
      default:
        return null; // Use PWA installation
    }
  };

  const triggerPWAInstall = () => {
    // Check if PWA install is available
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const installPrompt = (window as any).deferredPrompt;
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
          (window as any).deferredPrompt = null;
        });
      }
    } else {
      alert('To install REPRO PLAN as an app:\n\n1. Open this page in your browser\n2. Look for "Add to Home Screen" in your browser menu\n3. Tap "Add" to install the app');
    }
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

  const getDeviceInstructions = () => {
    const downloadUrl = getDownloadUrl();

    if (deviceInfo.isStandalone) {
      return {
        title: 'App Already Installed',
        icon: <Star className="w-4 h-4 text-green-600" />,
        steps: ['REPRO PLAN is already installed on your device!'],
        bgClass: 'bg-green-50',
        borderClass: 'border-green-200',
        textClass: 'text-green-900',
        iconClass: 'text-green-600'
      };
    }

    // If we have actual download URLs, show download instructions
    if (downloadUrl) {
      switch (deviceInfo.platform) {
        case 'ios':
          return {
            title: 'Download from App Store',
            icon: <Apple className="w-4 h-4 text-gray-700" />,
            steps: [
              'Click "Download & Install" above',
              'You will be redirected to the App Store',
              'Tap "Get" to download REPRO PLAN',
              'The app will install automatically'
            ],
            bgClass: 'bg-blue-50',
            borderClass: 'border-blue-200',
            textClass: 'text-blue-900',
            iconClass: 'text-blue-600'
          };
        case 'android':
          return {
            title: 'Download from Google Play',
            icon: <Smartphone className="w-4 h-4 text-green-600" />,
            steps: [
              'Click "Download & Install" above',
              'You will be redirected to Google Play Store',
              'Tap "Install" to download REPRO PLAN',
              'The app will install automatically'
            ],
            bgClass: 'bg-green-50',
            borderClass: 'border-green-200',
            textClass: 'text-green-900',
            iconClass: 'text-green-600'
          };
        default:
          return {
            title: 'Download App',
            icon: <Download className="w-4 h-4 text-purple-600" />,
            steps: [
              'Click "Download & Install" above',
              'You will be redirected to download the app',
              'Follow the installation instructions'
            ],
            bgClass: 'bg-purple-50',
            borderClass: 'border-purple-200',
            textClass: 'text-purple-900',
            iconClass: 'text-purple-600'
          };
      }
    }

    // Fallback to PWA installation instructions
    switch (deviceInfo.platform) {
      case 'ios':
        return {
          title: 'Install as Web App (iOS)',
          icon: <Apple className="w-4 h-4 text-gray-700" />,
          steps: [
            'Tap the Share button at the bottom of Safari',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" in the top right corner',
            'The app will appear on your home screen'
          ],
          bgClass: 'bg-blue-50',
          borderClass: 'border-blue-200',
          textClass: 'text-blue-900',
          iconClass: 'text-blue-600'
        };
      case 'android':
        return {
          title: 'Install as Web App (Android)',
          icon: <Smartphone className="w-4 h-4 text-green-600" />,
          steps: [
            'Tap the menu (3 dots) in Chrome',
            'Select "Add to Home screen" or "Install app"',
            'Tap "Add" or "Install"',
            'The app will appear on your home screen'
          ],
          bgClass: 'bg-green-50',
          borderClass: 'border-green-200',
          textClass: 'text-green-900',
          iconClass: 'text-green-600'
        };
      case 'desktop':
        return {
          title: 'Install as Web App (Desktop)',
          icon: <Monitor className="w-4 h-4 text-blue-600" />,
          steps: [
            'Look for the install icon in your browser address bar',
            'Or click the menu and select "Install REPRO PLAN"',
            'Click "Install" in the prompt',
            'The app will open in its own window'
          ],
          bgClass: 'bg-blue-50',
          borderClass: 'border-blue-200',
          textClass: 'text-blue-900',
          iconClass: 'text-blue-600'
        };
      default:
        return {
          title: 'Install as Web App',
          icon: <ExternalLink className="w-4 h-4 text-yellow-600" />,
          steps: [
            'Look for "Add to Home Screen" in your browser menu',
            'Or wait for the installation prompt to appear',
            'Follow the on-screen instructions'
          ],
          bgClass: 'bg-yellow-50',
          borderClass: 'border-yellow-200',
          textClass: 'text-yellow-900',
          iconClass: 'text-yellow-600'
        };
    }
  };

  const instructions = getDeviceInstructions();

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
              <h2 className="text-lg sm:text-xl font-bold truncate">
                {getDownloadUrl() ? 'Download REPRO PLAN App' : 'Install REPRO PLAN App'}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm">
                {getDownloadUrl() ? 'Download from app store' : 'Install as web app'}
              </p>
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
                <span className="text-sm font-medium text-gray-900">
                  {getDownloadUrl() ? 'Redirecting to Download...' : 'Installing REPRO PLAN...'}
                </span>
                <span className="text-sm text-gray-600">{installProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${installProgress}%` }}
                ></div>
              </div>
              {getDownloadUrl() && (
                <p className="text-xs text-gray-600 mt-2">
                  You'll be redirected to the app store to complete the download
                </p>
              )}
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
                    <span>{getDownloadUrl() ? 'Redirecting...' : 'Installing...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{getDownloadUrl() ? 'Download App' : 'Install as App'}</span>
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

            {/* Device-Specific Instructions */}
            <div className={`mt-3 sm:mt-4 p-3 sm:p-4 ${instructions.bgClass} border ${instructions.borderClass} rounded-lg`}>
              <div className="flex items-start space-x-3">
                <div className={`w-5 h-5 sm:w-6 sm:h-6 ${instructions.iconClass} mt-0.5 flex-shrink-0 flex items-center justify-center`}>
                  {instructions.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${instructions.textClass} text-sm sm:text-base mb-2`}>
                    {instructions.title}
                  </p>
                  {!deviceInfo.isStandalone ? (
                    <ol className="text-xs sm:text-sm text-gray-700 space-y-1.5 list-decimal list-inside">
                      {instructions.steps.map((step, index) => (
                        <li key={index} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-xs sm:text-sm text-green-700">{instructions.steps[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {!deviceInfo.isStandalone && (
              <div className="mt-3 flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Need help?</span>
                </button>
                {navigator.share && (
                  <button
                    onClick={async () => {
                      try {
                        await navigator.share({
                          title: 'REPRO PLAN - Download the App',
                          text: 'Get the REPRO PLAN app for better access to SRHR resources',
                          url: window.location.href
                        });
                      } catch (err) {
                        console.log('Share cancelled');
                      }
                    }}
                    className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Share</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadModal;
