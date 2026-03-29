import { apiService } from './apiReal';

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration: number;
  details?: any;
}

export interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  tests: TestResult[];
  timestamp: Date;
  performance: {
    pageLoadTime: number;
    apiResponseTime: number;
    memoryUsage: number;
  };
}

class TestingService {
  private static instance: TestingService;
  private testResults: TestResult[] = [];

  static getInstance(): TestingService {
    if (!TestingService.instance) {
      TestingService.instance = new TestingService();
    }
    return TestingService.instance;
  }

  // Run comprehensive system health check
  async runSystemHealthCheck(): Promise<SystemHealthReport> {
    const tests: TestResult[] = [];

    // API Connectivity Tests
    tests.push(await this.testAPIConnectivity());
    tests.push(await this.testAuthentication());
    tests.push(await this.testDataIntegrity());

    // Frontend Tests
    tests.push(this.testLocalStorage());
    tests.push(this.testSessionStorage());
    tests.push(this.testSpeechSynthesis());
    tests.push(this.testGeolocation());
    tests.push(this.testCameraAccess());
    tests.push(this.testNotificationAccess());

    // Performance Tests
    const performanceData = await this.measurePerformance();

    const overallStatus = this.calculateOverallStatus(tests);

    return {
      overall: overallStatus,
      tests,
      timestamp: new Date(),
      performance: performanceData
    };
  }

  // API Tests
  private async testAPIConnectivity(): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      const duration = performance.now() - startTime;
      
      if (response.ok) {
        return {
          name: 'API Connectivity',
          status: 'pass',
          message: 'API server is responding correctly',
          duration,
          details: { status: response.status, responseTime: duration }
        };
      } else {
        return {
          name: 'API Connectivity',
          status: 'fail',
          message: `API server returned status ${response.status}`,
          duration,
          details: { status: response.status }
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'API Connectivity',
        status: 'fail',
        message: `API connection failed: ${error}`,
        duration,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private async testAuthentication(): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      const token = localStorage.getItem('auth_token');
      const duration = performance.now() - startTime;

      if (!token) {
        return {
          name: 'Authentication',
          status: 'warning',
          message: 'No authentication token found',
          duration,
          details: { authenticated: false }
        };
      }

      // Test token validity
      try {
        await apiService.checkAuth();
        return {
          name: 'Authentication',
          status: 'pass',
          message: 'Authentication token is valid',
          duration,
          details: { authenticated: true }
        };
      } catch (authError) {
        return {
          name: 'Authentication',
          status: 'fail',
          message: 'Authentication token is invalid or expired',
          duration,
          details: { authenticated: false, error: authError instanceof Error ? authError.message : String(authError) }
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'Authentication',
        status: 'fail',
        message: `Authentication test failed: ${error instanceof Error ? error.message : String(error)}`,
        duration,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private async testDataIntegrity(): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      // Test critical data structures
      const testData = {
        test: 'integrity_check',
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('test_integrity', JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem('test_integrity') || '{}');
      localStorage.removeItem('test_integrity');

      const duration = performance.now() - startTime;
      
      if (retrieved.test === testData.test && retrieved.timestamp === testData.timestamp) {
        return {
          name: 'Data Integrity',
          status: 'pass',
          message: 'Data storage and retrieval working correctly',
          duration
        };
      } else {
        return {
          name: 'Data Integrity',
          status: 'fail',
          message: 'Data corruption detected in storage',
          duration,
          details: { expected: testData, actual: retrieved }
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'Data Integrity',
        status: 'fail',
        message: `Data integrity test failed: ${error instanceof Error ? error.message : String(error)}`,
        duration,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  // Frontend Tests
  private testLocalStorage(): TestResult {
    const startTime = performance.now();
    
    try {
      const testKey = 'test_local_storage';
      const testValue = 'test_value_' + Date.now();
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      const duration = performance.now() - startTime;
      
      if (retrieved === testValue) {
        return {
          name: 'Local Storage',
          status: 'pass',
          message: 'Local storage is working correctly',
          duration
        };
      } else {
        return {
          name: 'Local Storage',
          status: 'fail',
          message: 'Local storage data corruption detected',
          duration,
          details: { expected: testValue, actual: retrieved }
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'Local Storage',
        status: 'fail',
        message: `Local storage test failed: ${error instanceof Error ? error.message : String(error)}`,
        duration,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private testSessionStorage(): TestResult {
    const startTime = performance.now();
    
    try {
      const testKey = 'test_session_storage';
      const testValue = 'test_value_' + Date.now();
      
      sessionStorage.setItem(testKey, testValue);
      const retrieved = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      
      const duration = performance.now() - startTime;
      
      if (retrieved === testValue) {
        return {
          name: 'Session Storage',
          status: 'pass',
          message: 'Session storage is working correctly',
          duration
        };
      } else {
        return {
          name: 'Session Storage',
          status: 'fail',
          message: 'Session storage data corruption detected',
          duration,
          details: { expected: testValue, actual: retrieved }
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'Session Storage',
        status: 'fail',
        message: `Session storage test failed: ${error instanceof Error ? error.message : String(error)}`,
        duration,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private testSpeechSynthesis(): TestResult {
    const startTime = performance.now();
    
    try {
      const isSupported = 'speechSynthesis' in window && 
                         typeof window.speechSynthesis.getVoices === 'function';
      
      const duration = performance.now() - startTime;
      
      if (isSupported) {
        const voices = window.speechSynthesis.getVoices();
        return {
          name: 'Speech Synthesis',
          status: 'pass',
          message: `Speech synthesis available (${voices.length} voices)`,
          duration,
          details: { voiceCount: voices.length }
        };
      } else {
        return {
          name: 'Speech Synthesis',
          status: 'warning',
          message: 'Speech synthesis not supported in this browser',
          duration
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'Speech Synthesis',
        status: 'fail',
        message: `Speech synthesis test failed: ${error instanceof Error ? error.message : String(error)}`,
        duration,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private testGeolocation(): TestResult {
    const startTime = performance.now();
    
    try {
      const isSupported = 'geolocation' in navigator;
      
      const duration = performance.now() - startTime;
      
      if (isSupported) {
        return {
          name: 'Geolocation',
          status: 'pass',
          message: 'Geolocation API is available',
          duration
        };
      } else {
        return {
          name: 'Geolocation',
          status: 'warning',
          message: 'Geolocation not supported in this browser',
          duration
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'Geolocation',
        status: 'fail',
        message: `Geolocation test failed: ${error instanceof Error ? error.message : String(error)}`,
        duration,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private testCameraAccess(): TestResult {
    const startTime = performance.now();
    
    try {
      const isSupported = 'mediaDevices' in navigator && 
                         typeof navigator.mediaDevices.getUserMedia === 'function';
      
      const duration = performance.now() - startTime;
      
      if (isSupported) {
        return {
          name: 'Camera Access',
          status: 'pass',
          message: 'Camera access API is available',
          duration
        };
      } else {
        return {
          name: 'Camera Access',
          status: 'warning',
          message: 'Camera access not supported in this browser',
          duration
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'Camera Access',
        status: 'fail',
        message: `Camera access test failed: ${error instanceof Error ? error.message : String(error)}`,
        duration,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  private testNotificationAccess(): TestResult {
    const startTime = performance.now();
    
    try {
      const isSupported = 'Notification' in window;
      
      const duration = performance.now() - startTime;
      
      if (isSupported) {
        const permission = Notification.permission;
        return {
          name: 'Notification Access',
          status: permission === 'granted' ? 'pass' : 'warning',
          message: `Notifications ${permission}`,
          duration,
          details: { permission }
        };
      } else {
        return {
          name: 'Notification Access',
          status: 'warning',
          message: 'Notifications not supported in this browser',
          duration
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        name: 'Notification Access',
        status: 'fail',
        message: `Notification test failed: ${error instanceof Error ? error.message : String(error)}`,
        duration,
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  // Performance Measurement
  private async measurePerformance(): Promise<SystemHealthReport['performance']> {
    const pageLoadTime = this.getPageLoadTime();
    const apiResponseTime = await this.measureAPIResponseTime();
    const memoryUsage = this.getMemoryUsage();

    return {
      pageLoadTime,
      apiResponseTime,
      memoryUsage
    };
  }

  private getPageLoadTime(): number {
    if (window.performance && window.performance.timing) {
      return window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    }
    return 0;
  }

  private async measureAPIResponseTime(): Promise<number> {
    const startTime = performance.now();
    
    try {
      await fetch('/api/health', { method: 'HEAD' });
      return performance.now() - startTime;
    } catch (error) {
      return performance.now() - startTime; // Still return duration even if failed
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  // Utility Methods
  private calculateOverallStatus(tests: TestResult[]): 'healthy' | 'degraded' | 'unhealthy' {
    const failedTests = tests.filter(test => test.status === 'fail').length;
    const warningTests = tests.filter(test => test.status === 'warning').length;
    const totalTests = tests.length;

    if (failedTests === 0) {
      return warningTests > totalTests * 0.25 ? 'degraded' : 'healthy';
    } else if (failedTests <= totalTests * 0.25) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  // Validation Utilities
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) return { isValid: false, error: 'Email is required' };
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  }

  static validatePhone(phone: string): { isValid: boolean; error?: string } {
    if (!phone) return { isValid: false, error: 'Phone number is required' };
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { isValid: false, error: 'Phone number must be at least 10 digits' };
    }
    
    if (cleanPhone.length > 15) {
      return { isValid: false, error: 'Phone number must not exceed 15 digits' };
    }
    
    return { isValid: true };
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateRequired(value: any, fieldName: string): { isValid: boolean; error?: string } {
    if (value === null || value === undefined) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (typeof value === 'string' && value.trim().length === 0) {
      return { isValid: false, error: `${fieldName} cannot be empty` };
    }
    
    if (Array.isArray(value) && value.length === 0) {
      return { isValid: false, error: `${fieldName} cannot be empty` };
    }
    
    return { isValid: true };
  }

  // Error Reporting
  async reportError(error: Error, context?: any): Promise<void> {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId')
      }
    };

    try {
      // Send to error reporting service
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      // Fallback to console
      console.error('Original error:', error);
      console.error('Error context:', context);
    }
  }

  // Test Data Generation
  static generateTestData(type: 'user' | 'clinic' | 'medication'): any {
    switch (type) {
      case 'user':
        return {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          dateOfBirth: '2000-01-01',
          gender: 'other'
        };
      
      case 'clinic':
        return {
          name: 'Test Clinic',
          address: '123 Test Street, Test City',
          phone: '+1234567890',
          email: 'clinic@test.com',
          services: ['General Practice', 'SRHR Services'],
          coordinates: { lat: 0, lng: 0 }
        };
      
      case 'medication':
        return {
          name: 'Test Medication',
          description: 'Test medication description',
          category: 'Contraception',
          price: 10.99,
          inStock: true,
          requiresPrescription: false
        };
      
      default:
        return {};
    }
  }
}

export const testingService = TestingService.getInstance();
export default testingService;
