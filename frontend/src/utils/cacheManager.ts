// Cache Manager for REPRO PLAN - Comprehensive caching strategy
export class CacheManager {
  private static instance: CacheManager;
  private cacheVersion = '2.0';
  private cacheNames = {
    static: 'repro-plan-static-v2.0',
    dynamic: 'repro-plan-dynamic-v2.0',
    qr: 'repro-plan-qr-v2.0',
    components: 'repro-plan-components-v2.0',
    api: 'repro-plan-api-v2.0'
  };

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Initialize cache with new features
  public async initializeCache(): Promise<void> {
    try {
      if ('caches' in window) {
        await this.preloadNewFeatures();
        await this.setupCacheStrategies();
        console.log('Cache initialized with new features');
      }
    } catch (error) {
      console.error('Cache initialization failed:', error);
    }
  }

  // Preload new feature components
  private async preloadNewFeatures(): Promise<void> {
    const newFeatures = [
      '/src/components/QRCode/QRCodeGenerator.tsx',
      '/src/components/QRCode/QRCodeScanner.tsx',
      '/src/components/QRCode/QRVerificationManager.tsx',
      '/src/components/AppDownloadModal.tsx',
      '/src/components/FloatingDownloadButton.tsx',
      '/src/components/AppInstallBanner.tsx',
      '/src/components/PWAInstallPrompt.tsx',
      '/src/components/DataVisualization/SecureDataViewer.tsx',
      '/src/components/EmergencyAlertSystem.tsx',
      '/src/components/MapTracking.tsx'
    ];

    const cache = await caches.open(this.cacheNames.components);
    await cache.addAll(newFeatures);
  }

  // Setup cache strategies for different content types
  private async setupCacheStrategies(): Promise<void> {
    // Cache QR code templates and assets
    const qrAssets = [
      '/qr-templates/',
      '/qr-assets/',
      '/verification-assets/'
    ];
    
    const qrCache = await caches.open(this.cacheNames.qr);
    await qrCache.addAll(qrAssets);

    // Cache API endpoints
    const apiEndpoints = [
      '/api/verification',
      '/api/qr-generate',
      '/api/qr-scan',
      '/api/emergency-alerts',
      '/api/location-tracking'
    ];

    const apiCache = await caches.open(this.cacheNames.api);
    await apiCache.addAll(apiEndpoints);
  }

  // Cache QR code data
  public async cacheQRData(qrData: any, userCode: string): Promise<void> {
    try {
      const cache = await caches.open(this.cacheNames.qr);
      const response = new Response(JSON.stringify(qrData), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(`/qr-data/${userCode}`, response);
    } catch (error) {
      console.error('Failed to cache QR data:', error);
    }
  }

  // Get cached QR data
  public async getCachedQRData(userCode: string): Promise<any> {
    try {
      const cache = await caches.open(this.cacheNames.qr);
      const response = await cache.match(`/qr-data/${userCode}`);
      if (response) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached QR data:', error);
      return null;
    }
  }

  // Cache verification results
  public async cacheVerificationResult(verificationData: any): Promise<void> {
    try {
      const cache = await caches.open(this.cacheNames.qr);
      const response = new Response(JSON.stringify(verificationData), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(`/verification/${Date.now()}`, response);
    } catch (error) {
      console.error('Failed to cache verification result:', error);
    }
  }

  // Cache emergency data
  public async cacheEmergencyData(emergencyData: any): Promise<void> {
    try {
      const cache = await caches.open(this.cacheNames.dynamic);
      const response = new Response(JSON.stringify(emergencyData), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put('/emergency-data', response);
    } catch (error) {
      console.error('Failed to cache emergency data:', error);
    }
  }

  // Get cached emergency data
  public async getCachedEmergencyData(): Promise<any> {
    try {
      const cache = await caches.open(this.cacheNames.dynamic);
      const response = await cache.match('/emergency-data');
      if (response) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached emergency data:', error);
      return null;
    }
  }

  // Cache app download preferences
  public async cacheDownloadPreferences(preferences: any): Promise<void> {
    try {
      const cache = await caches.open(this.cacheNames.dynamic);
      const response = new Response(JSON.stringify(preferences), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put('/download-preferences', response);
    } catch (error) {
      console.error('Failed to cache download preferences:', error);
    }
  }

  // Get cached download preferences
  public async getCachedDownloadPreferences(): Promise<any> {
    try {
      const cache = await caches.open(this.cacheNames.dynamic);
      const response = await cache.match('/download-preferences');
      if (response) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached download preferences:', error);
      return null;
    }
  }

  // Clear old cache versions
  public async clearOldCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.includes('repro-plan-') && !name.includes('v2.0')
      );
      
      await Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('Old caches cleared:', oldCaches);
    } catch (error) {
      console.error('Failed to clear old caches:', error);
    }
  }

  // Get cache statistics
  public async getCacheStats(): Promise<any> {
    try {
      const cacheNames = await caches.keys();
      const stats: { [key: string]: any } = {};
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = {
          size: keys.length,
          keys: keys.map(key => key.url)
        };
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {};
    }
  }

  // Update cache version
  public async updateCacheVersion(): Promise<void> {
    try {
      // Store new version in localStorage
      localStorage.setItem('repro-plan-cache-version', this.cacheVersion);
      
      // Notify service worker of update
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({
            type: 'CACHE_UPDATE',
            version: this.cacheVersion
          });
        }
      }
    } catch (error) {
      console.error('Failed to update cache version:', error);
    }
  }

  // Check if cache needs update
  public needsCacheUpdate(): boolean {
    const storedVersion = localStorage.getItem('repro-plan-cache-version');
    return storedVersion !== this.cacheVersion;
  }

  // Force cache refresh
  public async forceCacheRefresh(): Promise<void> {
    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      // Reinitialize
      await this.initializeCache();
      
      console.log('Cache force refreshed');
    } catch (error) {
      console.error('Failed to force cache refresh:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
