import { useState, useEffect } from 'react';

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
    // Check if PWA install is available
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Trigger PWA install prompt
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
      // Fallback: Show instructions for manual installation
      alert('To install REPRO PLAN as an app:\n\n1. Open this page in your browser\n2. Look for "Add to Home Screen" in your browser menu\n3. Tap "Add" to install the app');
    }
    
    setShowModal(false);
    localStorage.setItem('repro-plan-app-download-seen', 'true');
  };

  return {
    showModal,
    openModal,
    closeModal,
    handleDownload
  };
};
