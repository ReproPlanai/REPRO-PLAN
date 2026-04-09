import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface UpdateInfo {
  version: string;
  available: boolean;
  mandatory: boolean;
  downloadUrl?: string;
  releaseNotes?: string;
  progress?: number;
}

interface UpdateContextType {
  updateInfo: UpdateInfo | null;
  checkingForUpdate: boolean;
  downloadingUpdate: boolean;
  applyingUpdate: boolean;
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  applyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

const UpdateContext = createContext<UpdateContextType | null>(null);

export const useUpdate = () => {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error('useUpdate must be used within UpdateProvider');
  }
  return context;
};

export const UpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [applyingUpdate, setApplyingUpdate] = useState(false);

  // Get current version from environment or package.json
  const getCurrentVersion = useCallback(() => {
    return process.env.REACT_APP_VERSION || '1.0.0';
  }, []);

  // Check if cached version matches current version
  const checkVersionCache = useCallback(() => {
    const cachedVersion = localStorage.getItem('app_version');
    const currentVersion = getCurrentVersion();
    
    if (cachedVersion && cachedVersion !== currentVersion) {
      // Version mismatch - clear cache and reload
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('app_version', currentVersion);
      
      // Clear service worker cache if available
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        });
      }
      
      // Force reload
      window.location.reload();
      return true;
    }
    
    localStorage.setItem('app_version', currentVersion);
    return false;
  }, [getCurrentVersion]);

  // Check for updates from server
  const checkForUpdates = useCallback(async () => {
    setCheckingForUpdate(true);
    
    try {
      const response = await fetch('/api/version', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const serverVersion = await response.json();
        const currentVersion = getCurrentVersion();
        
        if (serverVersion.version !== currentVersion) {
          setUpdateInfo({
            version: serverVersion.version,
            available: true,
            mandatory: serverVersion.mandatory || false,
            downloadUrl: serverVersion.downloadUrl,
            releaseNotes: serverVersion.releaseNotes,
            progress: 0
          });
        } else {
          setUpdateInfo({
            version: currentVersion,
            available: false,
            mandatory: false
          });
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setCheckingForUpdate(false);
    }
  }, [getCurrentVersion]);

  // Simulate update download with progress
  const downloadUpdate = useCallback(async () => {
    if (!updateInfo?.downloadUrl) return;
    
    setDownloadingUpdate(true);
    
    try {
      // Simulate download progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUpdateInfo(prev => prev ? { ...prev, progress } : null);
      }
      
      setUpdateInfo(prev => prev ? { ...prev, progress: 100 } : null);
    } catch (error) {
      console.error('Failed to download update:', error);
    } finally {
      setDownloadingUpdate(false);
    }
  }, [updateInfo]);

  // Apply update (reload page)
  const applyUpdate = useCallback(async () => {
    setApplyingUpdate(true);
    
    try {
      // Clear all caches
      localStorage.clear();
      sessionStorage.clear();
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }
      
      // Update version and reload
      localStorage.setItem('app_version', updateInfo?.version || getCurrentVersion());
      window.location.reload();
    } catch (error) {
      console.error('Failed to apply update:', error);
      setApplyingUpdate(false);
    }
  }, [updateInfo, getCurrentVersion]);

  // Dismiss update notification
  const dismissUpdate = useCallback(() => {
    if (updateInfo && !updateInfo.mandatory) {
      localStorage.setItem('dismissed_update', updateInfo.version);
      setUpdateInfo(null);
    }
  }, [updateInfo]);

  // Initialize version checking
  useEffect(() => {
    // Check for version mismatch on app start
    const needsReload = checkVersionCache();
    if (!needsReload) {
      // Check for updates after a short delay
      setTimeout(() => {
        checkForUpdates();
        
        // Check for updates periodically
        const interval = setInterval(checkForUpdates, 5 * 60 * 1000); // Every 5 minutes
        return () => clearInterval(interval);
      }, 2000);
    }
  }, [checkVersionCache, checkForUpdates]);

  // Check if update was previously dismissed
  useEffect(() => {
    if (updateInfo && !updateInfo.mandatory) {
      const dismissedVersion = localStorage.getItem('dismissed_update');
      if (dismissedVersion === updateInfo.version) {
        setUpdateInfo(null);
      }
    }
  }, [updateInfo]);

  const value: UpdateContextType = {
    updateInfo,
    checkingForUpdate,
    downloadingUpdate,
    applyingUpdate,
    checkForUpdates,
    downloadUpdate,
    applyUpdate,
    dismissUpdate
  };

  return (
    <UpdateContext.Provider value={value}>
      {children}
    </UpdateContext.Provider>
  );
};

// Update Modal Component
export const UpdateModal: React.FC = () => {
  const { updateInfo, downloadingUpdate, applyingUpdate, downloadUpdate, dismissUpdate } = useUpdate();

  if (!updateInfo || !updateInfo.available) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Update Available
          </h2>
          <p className="text-gray-600 mb-4">
            Version {updateInfo.version} is now available
            {updateInfo.mandatory && (
              <span className="text-red-600 font-semibold"> (Required)</span>
            )}
          </p>
        </div>

        {updateInfo.releaseNotes && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">What's New:</h3>
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {updateInfo.releaseNotes}
            </div>
          </div>
        )}

        {downloadingUpdate && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Downloading update...</span>
              <span className="text-sm font-medium">{updateInfo.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${updateInfo.progress}%` }}
              />
            </div>
          </div>
        )}

        {applyingUpdate && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Applying update...</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!downloadingUpdate && !applyingUpdate && (
            <>
              <button
                onClick={downloadUpdate}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled={applyingUpdate}
              >
                Update Now
              </button>
              {!updateInfo.mandatory && (
                <button
                  onClick={dismissUpdate}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={applyingUpdate}
                >
                  Later
                </button>
              )}
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {updateInfo.mandatory 
              ? "This update is required for continued use of the application."
              : "You can update later from Settings > About."
            }
          </p>
        </div>
      </div>
    </div>
  );
};
