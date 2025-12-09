// Production reset utility for test-phase users
// Automatically resets app data when moving from test to production

const PRODUCTION_VERSION = '3.0.0';
const PRODUCTION_RESET_KEY = 'repro_plan_production_reset';

export interface ResetResult {
  wasReset: boolean;
  reason: string;
  previousVersion?: string;
}

class ProductionResetManager {
  private static instance: ProductionResetManager;

  private constructor() {}

  static getInstance(): ProductionResetManager {
    if (!ProductionResetManager.instance) {
      ProductionResetManager.instance = new ProductionResetManager();
    }
    return ProductionResetManager.instance;
  }

  /**
   * Check if user was using test data and reset if needed
   */
  async checkAndResetForProduction(): Promise<ResetResult> {
    try {
      // Check if we've already done the production reset
      const alreadyReset = localStorage.getItem(PRODUCTION_RESET_KEY);
      if (alreadyReset === PRODUCTION_VERSION) {
        return { wasReset: false, reason: 'Already reset for production' };
      }

      // Check for test data indicators
      const resetReasons = await this.detectTestData();

      if (resetReasons.length > 0) {
        console.log('🔄 Production reset triggered:', resetReasons);
        await this.performProductionReset();
        localStorage.setItem(PRODUCTION_RESET_KEY, PRODUCTION_VERSION);
        return {
          wasReset: true,
          reason: `Reset due to: ${resetReasons.join(', ')}`,
          previousVersion: 'test-phase'
        };
      }

      // Mark as production-ready even if no reset was needed
      localStorage.setItem(PRODUCTION_RESET_KEY, PRODUCTION_VERSION);
      return { wasReset: false, reason: 'No test data detected' };

    } catch (error) {
      console.error('Production reset check failed:', error);
      return { wasReset: false, reason: 'Reset check failed' };
    }
  }

  /**
   * Detect various indicators of test data
   */
  private async detectTestData(): Promise<string[]> {
    const reasons: string[] = [];

    // Check localStorage for test indicators
    const testIndicators = [
      'test_user_data',
      'mock_data_active',
      'development_mode',
      'test_secret_code'
    ];

    testIndicators.forEach(key => {
      if (localStorage.getItem(key)) {
        reasons.push(`Found test indicator: ${key}`);
      }
    });

    // Check for test URLs or domains
    if (window.location.hostname.includes('localhost') ||
        window.location.hostname.includes('127.0.0.1') ||
        window.location.hostname.includes('test.') ||
        window.location.hostname.includes('staging.')) {
      reasons.push('Detected test/development domain');
    }

    // Check for test user agents or development tools
    if (navigator.userAgent.includes('HeadlessChrome') ||
        navigator.userAgent.includes('Electron')) {
      reasons.push('Detected development/test environment');
    }

    // Check IndexedDB for test data
    try {
      const databases = await indexedDB.databases?.() || [];
      const testDatabases = databases.filter(db =>
        db.name?.includes('test') ||
        db.name?.includes('mock') ||
        db.name?.includes('dev')
      );

      if (testDatabases.length > 0) {
        reasons.push(`Found test databases: ${testDatabases.map(db => db.name).join(', ')}`);
      }
    } catch (error) {
      // IndexedDB check failed, continue
    }

    // Check for old app versions
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion && storedVersion !== PRODUCTION_VERSION) {
      reasons.push(`Version mismatch: was ${storedVersion}, now ${PRODUCTION_VERSION}`);
    }

    // Check for mock API usage
    if (localStorage.getItem('use_mock_api') === 'true') {
      reasons.push('Mock API was enabled');
    }

    return reasons;
  }

  /**
   * Perform comprehensive app reset for production
   */
  private async performProductionReset(): Promise<void> {
    console.log('🔄 Starting production reset...');

    try {
      // Clear all localStorage (except critical app settings)
      const keysToKeep = [
        'i18nextLng', // Language preference
        'accessibility_settings', // User accessibility preferences
        PRODUCTION_RESET_KEY // Our reset marker
      ];

      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear IndexedDB databases (except critical ones)
      try {
        const databases = await indexedDB.databases?.() || [];
        const databasesToClear = databases.filter(db =>
          !db.name?.includes('accessibility') &&
          !db.name?.includes('language')
        );

        for (const db of databasesToClear) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      } catch (error) {
        console.warn('Could not clear IndexedDB:', error);
      }

      // Clear cache storage
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.warn('Could not clear cache storage:', error);
      }

      // Set production version
      localStorage.setItem('app_version', PRODUCTION_VERSION);
      localStorage.setItem('environment', 'production');

      console.log('✅ Production reset completed successfully');

    } catch (error) {
      console.error('❌ Production reset failed:', error);
      throw error;
    }
  }

  /**
   * Force a production reset (for manual/admin use)
   */
  async forceProductionReset(): Promise<ResetResult> {
    try {
      await this.performProductionReset();
      localStorage.setItem(PRODUCTION_RESET_KEY, PRODUCTION_VERSION);
      return {
        wasReset: true,
        reason: 'Forced production reset',
        previousVersion: 'unknown'
      };
    } catch (error) {
      console.error('Forced production reset failed:', error);
      return {
        wasReset: false,
        reason: 'Forced reset failed'
      };
    }
  }

  /**
   * Check if app has been reset for production
   */
  isProductionReady(): boolean {
    return localStorage.getItem(PRODUCTION_RESET_KEY) === PRODUCTION_VERSION;
  }
}

export const productionResetManager = ProductionResetManager.getInstance();
export default productionResetManager;
