// Performance Monitor for REPRO PLAN - Track and optimize performance
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, any> = new Map();
  private observers: PerformanceObserver[] = [];

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Initialize performance monitoring
  public initialize(): void {
    this.setupPerformanceObservers();
    this.trackPageLoad();
    this.trackUserInteractions();
    this.trackCachePerformance();
  }

  // Setup performance observers
  private setupPerformanceObservers(): void {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.trackNavigationTiming(entry as PerformanceNavigationTiming);
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    }

    // Observe resource timing
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.trackResourceTiming(entry as PerformanceResourceTiming);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }

    // Observe paint timing
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.trackPaintTiming(entry as PerformancePaintTiming);
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }
  }

  // Track page load performance
  private trackPageLoad(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstByte: navigation.responseStart - navigation.fetchStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart
      };

      this.metrics.set('pageLoad', metrics);
      this.logPerformance('Page Load', metrics);
    });
  }

  // Track navigation timing
  private trackNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      ttfb: entry.responseStart - entry.fetchStart,
      download: entry.responseEnd - entry.responseStart,
      domProcessing: entry.domComplete - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart
    };

    this.metrics.set('navigation', metrics);
  }

  // Track resource timing
  private trackResourceTiming(entry: PerformanceResourceTiming): void {
    const resourceType = this.getResourceType(entry.name);
    const metrics = {
      name: entry.name,
      type: resourceType,
      size: entry.transferSize,
      duration: entry.duration,
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      download: entry.responseEnd - entry.responseStart
    };

    const existingResources = this.metrics.get('resources') || [];
    existingResources.push(metrics);
    this.metrics.set('resources', existingResources);
  }

  // Track paint timing
  private trackPaintTiming(entry: PerformancePaintTiming): void {
    const metrics = {
      name: entry.name,
      startTime: entry.startTime
    };

    this.metrics.set(`paint_${entry.name}`, metrics);
    
    if (entry.name === 'first-contentful-paint') {
      this.logPerformance('First Contentful Paint', { time: entry.startTime });
    }
  }

  // Track user interactions
  private trackUserInteractions(): void {
    // Track click events
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const interaction = {
        type: 'click',
        target: target.tagName,
        className: target.className,
        id: target.id,
        timestamp: Date.now()
      };
      
      this.trackInteraction('click', interaction);
    });

    // Track scroll events
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackInteraction('scroll', {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          timestamp: Date.now()
        });
      }, 100);
    });

    // Track form interactions
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this.trackInteraction('input', {
          type: target.type,
          name: target.name,
          timestamp: Date.now()
        });
      }
    });
  }

  // Track cache performance
  private trackCachePerformance(): void {
    // Monitor cache hit rates
    if ('caches' in window) {
      this.monitorCacheStats();
    }
  }

  // Monitor cache statistics
  private async monitorCacheStats(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      const stats: { [key: string]: any } = {};
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = {
          size: keys.length,
          lastUpdated: Date.now()
        };
      }
      
      this.metrics.set('cacheStats', stats);
    } catch (error) {
      console.error('Failed to monitor cache stats:', error);
    }
  }

  // Track QR code operations
  public trackQROperation(operation: string, duration: number, success: boolean): void {
    const metrics = {
      operation,
      duration,
      success,
      timestamp: Date.now()
    };

    const existingOperations = this.metrics.get('qrOperations') || [];
    existingOperations.push(metrics);
    this.metrics.set('qrOperations', existingOperations);
    
    this.logPerformance(`QR ${operation}`, metrics);
  }

  // Track app download operations
  public trackDownloadOperation(operation: string, duration: number, success: boolean): void {
    const metrics = {
      operation,
      duration,
      success,
      timestamp: Date.now()
    };

    const existingOperations = this.metrics.get('downloadOperations') || [];
    existingOperations.push(metrics);
    this.metrics.set('downloadOperations', existingOperations);
    
    this.logPerformance(`Download ${operation}`, metrics);
  }

  // Track emergency operations
  public trackEmergencyOperation(operation: string, duration: number, success: boolean): void {
    const metrics = {
      operation,
      duration,
      success,
      timestamp: Date.now()
    };

    const existingOperations = this.metrics.get('emergencyOperations') || [];
    existingOperations.push(metrics);
    this.metrics.set('emergencyOperations', existingOperations);
    
    this.logPerformance(`Emergency ${operation}`, metrics);
  }

  // Track interaction
  private trackInteraction(type: string, data: any): void {
    const interactions = this.metrics.get('interactions') || [];
    interactions.push({ type, ...data });
    this.metrics.set('interactions', interactions);
  }

  // Get resource type from URL
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.webp')) return 'image';
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf')) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  // Log performance metrics
  private logPerformance(operation: string, metrics: any): void {
    console.log(`[Performance] ${operation}:`, metrics);
  }

  // Get performance report
  public getPerformanceReport(): any {
    const report = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null,
      metrics: Object.fromEntries(this.metrics),
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null
    };

    return report;
  }

  // Export performance data
  public exportPerformanceData(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  // Clean up observers
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
