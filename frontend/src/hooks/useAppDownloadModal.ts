import { useState, useEffect } from 'react';

const IOS_APP_URL = process.env.REACT_APP_IOS_APP_URL;
const ANDROID_APP_URL = process.env.REACT_APP_ANDROID_APP_URL;

interface UseAppDownloadModalReturn {
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
  handleDownload: () => void;
}

export const useAppDownloadModal = (): UseAppDownloadModalReturn => {
  const [showModal, setShowModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);
  const [reminderTime, setReminderTime] = useState<number | null>(null);

  // Check if user has seen the modal or has a reminder set
  useEffect(() => {
    const hasSeen = localStorage.getItem('repro-plan-app-download-seen');
    const reminder = localStorage.getItem('repro-plan-app-reminder');
    
    setHasSeenModal(hasSeen === 'true');
    
    if (reminder) {
      const reminderTimestamp = parseInt(reminder);
      setReminderTime(reminderTimestamp);
      
      // Check if reminder time has passed
      if (Date.now() >= reminderTimestamp) {
        setShowModal(true);
        // Clear the reminder
        localStorage.removeItem('repro-plan-app-reminder');
      }
    }
  }, []);

  // Show modal after delay if user hasn't seen it
  useEffect(() => {
    if (!hasSeenModal && !reminderTime) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [hasSeenModal, reminderTime]);

  // Check for PWA install prompt
  useEffect(() => {

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Show our custom modal instead
      if (!hasSeenModal) {
        setShowModal(true);
      }
    };

    const handleAppInstalled = () => {
      // Hide the modal when app is installed
      setShowModal(false);
      localStorage.setItem('repro-plan-app-download-seen', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [hasSeenModal]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    localStorage.setItem('repro-plan-app-download-seen', 'true');
  };

  const handleDownload = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);

    let appStoreUrl: string | null = null;
    if (isIOS && IOS_APP_URL) appStoreUrl = IOS_APP_URL;
    if (isAndroid && ANDROID_APP_URL) appStoreUrl = ANDROID_APP_URL;

    if (appStoreUrl) {
      window.open(appStoreUrl, '_blank');
      console.log('Redirecting to app store:', appStoreUrl);
    } else {
      // Fallback to PWA installation
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const installPrompt = (window as any).deferredPrompt;
        if (installPrompt) {
          installPrompt.prompt();
          installPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the PWA install prompt');
            } else {
              console.log('User dismissed the PWA install prompt');
            }
            (window as any).deferredPrompt = null;
          });
        } else {
          showPWAManualInstructions();
        }
      } else {
        showPWAManualInstructions();
      }
    }

    setShowModal(false);
    localStorage.setItem('repro-plan-app-download-seen', 'true');
  };

  const showPWAManualInstructions = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
      alert('To install REPRO PLAN as an app:\n\n1. Tap the Share button at the bottom of Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right corner\n4. The app will appear on your home screen');
    } else if (isAndroid) {
      alert('To install REPRO PLAN as an app:\n\n1. Tap the menu (3 dots) in Chrome\n2. Select "Add to Home screen" or "Install app"\n3. Tap "Add" or "Install"\n4. The app will appear on your home screen');
    } else {
      alert('To install REPRO PLAN as an app:\n\n1. Look for the install icon in your browser address bar\n2. Or click the menu and select "Install REPRO PLAN"\n3. Click "Install" in the prompt\n4. The app will open in its own window');
    }
  };

  return {
    showModal,
    openModal,
    closeModal,
    handleDownload
  };
};
