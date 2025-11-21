// Privacy-protected analytics for REPRO PLAN
// This module tracks usage patterns without compromising user anonymity

export interface AnalyticsEvent {
  id: string;
  event: string;
  category: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface UsageStats {
  totalSessions: number;
  totalTimeSpent: number;
  featuresUsed: string[];
  lastActive: number;
  anonymousId: string;
}

export class PrivacyAnalytics {
  private static instance: PrivacyAnalytics;
  private events: AnalyticsEvent[] = [];
  private usageStats: UsageStats | null = null;
  private anonymousId: string = '';

  constructor() {
    if (!PrivacyAnalytics.instance) {
      PrivacyAnalytics.instance = this;
      this.anonymousId = this.generateAnonymousId();
      this.initializeUsageStats();
    }
    return PrivacyAnalytics.instance;
  }

  static getInstance(): PrivacyAnalytics {
    if (!PrivacyAnalytics.instance) {
      PrivacyAnalytics.instance = new PrivacyAnalytics();
    }
    return PrivacyAnalytics.instance;
  }

  private generateAnonymousId(): string {
    // Generate a random anonymous ID that doesn't identify the user
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `anon_${timestamp}_${random}`;
  }

  private initializeUsageStats(): void {
    this.usageStats = {
      totalSessions: 0,
      totalTimeSpent: 0,
      featuresUsed: [],
      lastActive: Date.now(),
      anonymousId: this.anonymousId
    };
  }

  // Track events without personal information
  trackEvent(event: string, category: string, metadata?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      id: Date.now().toString(),
      event,
      category,
      timestamp: Date.now(),
      metadata: this.sanitizeMetadata(metadata)
    };

    this.events.push(analyticsEvent);
    this.updateUsageStats(event, category);
    
    // Keep only last 1000 events to prevent storage bloat
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined;

    const sanitized: Record<string, any> = {};
    
    // Only allow safe, non-identifying metadata
    const allowedKeys = [
      'feature_used',
      'duration',
      'success',
      'error_type',
      'language',
      'device_type',
      'connection_type'
    ];

    for (const [key, value] of Object.entries(metadata)) {
      if (allowedKeys.includes(key) && typeof value !== 'object') {
        sanitized[key] = value;
      }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }

  private updateUsageStats(event: string, category: string): void {
    if (!this.usageStats) return;

    this.usageStats.lastActive = Date.now();
    
    // Track feature usage
    if (category === 'feature_usage' && !this.usageStats.featuresUsed.includes(event)) {
      this.usageStats.featuresUsed.push(event);
    }
  }

  // Session tracking
  startSession(): void {
    this.trackEvent('session_start', 'session');
    if (this.usageStats) {
      this.usageStats.totalSessions++;
    }
  }

  endSession(duration: number): void {
    this.trackEvent('session_end', 'session', { duration });
    if (this.usageStats) {
      this.usageStats.totalTimeSpent += duration;
    }
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string, success: boolean = true): void {
    this.trackEvent(feature, 'feature_usage', { success });
  }

  trackError(errorType: string, feature: string): void {
    this.trackEvent('error', 'error', { error_type: errorType, feature_used: feature });
  }

  // Health tracking analytics
  trackHealthEntry(type: string): void {
    this.trackEvent('health_entry', 'health_tracking', { feature_used: type });
  }

  // Chat analytics
  trackChatMessage(category: string): void {
    this.trackEvent('chat_message', 'chat', { feature_used: category });
  }

  // Emergency analytics
  trackEmergencyAction(action: string): void {
    this.trackEvent('emergency_action', 'emergency', { feature_used: action });
  }

  // Get aggregated, anonymous statistics
  getAggregatedStats(): {
    totalEvents: number;
    uniqueFeatures: number;
    sessionCount: number;
    totalTimeSpent: number;
    lastActive: number;
    topFeatures: Array<{ feature: string; count: number }>;
    errorRate: number;
  } {
    const featureCounts: Record<string, number> = {};
    let errorCount = 0;

    this.events.forEach(event => {
      if (event.category === 'feature_usage') {
        featureCounts[event.event] = (featureCounts[event.event] || 0) + 1;
      }
      if (event.category === 'error') {
        errorCount++;
      }
    });

    const topFeatures = Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: this.events.length,
      uniqueFeatures: Object.keys(featureCounts).length,
      sessionCount: this.usageStats?.totalSessions || 0,
      totalTimeSpent: this.usageStats?.totalTimeSpent || 0,
      lastActive: this.usageStats?.lastActive || 0,
      topFeatures,
      errorRate: this.events.length > 0 ? (errorCount / this.events.length) * 100 : 0
    };
  }

  // Export data for analysis (anonymized)
  exportAnalytics(): string {
    const stats = this.getAggregatedStats();
    const exportData = {
      anonymousId: this.anonymousId,
      exportDate: new Date().toISOString(),
      stats,
      // Include only aggregated event data, not individual events
      eventSummary: {
        totalEvents: this.events.length,
        categories: this.getEventCategories(),
        timeRange: {
          first: this.events[0]?.timestamp,
          last: this.events[this.events.length - 1]?.timestamp
        }
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  private getEventCategories(): Record<string, number> {
    const categories: Record<string, number> = {};
    this.events.forEach(event => {
      categories[event.category] = (categories[event.category] || 0) + 1;
    });
    return categories;
  }

  // Clear all analytics data
  clearAnalytics(): void {
    this.events = [];
    this.initializeUsageStats();
  }

  // Get anonymous user ID (for debugging purposes only)
  getAnonymousId(): string {
    return this.anonymousId;
  }

  // Check if analytics are enabled
  isAnalyticsEnabled(): boolean {
    // In a real app, this would check user preferences
    return true;
  }

  // Disable analytics
  disableAnalytics(): void {
    this.clearAnalytics();
    // In a real app, this would save the preference
  }
}

export const privacyAnalytics = PrivacyAnalytics.getInstance();
