import { useState, useEffect } from 'react';

interface ServiceWorkerUpdate {
  isUpdateAvailable: boolean;
  isUpdating: boolean;
  updateServiceWorker: () => void;
  dismissUpdate: () => void;
}

const useServiceWorkerUpdate = (): ServiceWorkerUpdate => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Check for updates - PRODUCTION: Apply immediately without user interaction
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // PRODUCTION: Auto-apply update immediately
                console.log('🔄 New app version detected - applying immediately...');
                setIsUpdateAvailable(true);
                // Auto-update after a brief delay to ensure UI updates
                setTimeout(async () => {
                  try {
                    if (registration.waiting) {
                      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                  } catch (error) {
                    console.error('Auto-update failed:', error);
                    window.location.reload();
                  }
                }, 2000);
              }
            });
          }
        });

        // Listen for controller change (when new service worker takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Reload the page to get the new version
          window.location.reload();
        });

      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    registerServiceWorker();

    // Check for updates on page load
    async function checkForUpdates() {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    // PRODUCTION: Check for updates immediately on load
    checkForUpdates();

    // PRODUCTION: Check for updates every 5 seconds (ultra-frequent for immediate updates)
    const updateInterval = setInterval(checkForUpdates, 5 * 1000);

    // Also check for updates when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(updateInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const updateServiceWorker = async () => {
    setIsUpdating(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        // PRODUCTION: Immediately apply update
        console.log('🚀 Applying app update immediately...');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Failed to update service worker:', error);
      // PRODUCTION: Force reload on update failure
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const dismissUpdate = () => {
    setIsUpdateAvailable(false);
  };

  return {
    isUpdateAvailable,
    isUpdating,
    updateServiceWorker,
    dismissUpdate
  };
};

export default useServiceWorkerUpdate;
