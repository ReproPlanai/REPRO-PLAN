// Offline Accessibility Service
// Enhanced offline capabilities for rural communities and accessibility features

export interface OfflineContent {
  id: string;
  type: 'quiz' | 'article' | 'video' | 'audio' | 'image';
  title: string;
  content: string;
  metadata: {
    language: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    size: number;
    lastUpdated: Date;
  };
  accessibility: {
    hasAudio: boolean;
    hasVideo: boolean;
    hasText: boolean;
    hasImages: boolean;
    screenReaderFriendly: boolean;
    voiceCommandCompatible: boolean;
  };
}

export interface OfflineProgress {
  userId: string;
  contentId: string;
  progress: number;
  completed: boolean;
  lastAccessed: Date;
  notes?: string;
}

export interface OfflineSettings {
  autoDownload: boolean;
  maxStorageSize: number; // in MB
  preferredLanguage: string;
  accessibilityMode: boolean;
  lowBandwidthMode: boolean;
  syncWhenOnline: boolean;
}

class OfflineAccessibilityService {
  private content: Map<string, OfflineContent> = new Map();
  private progress: Map<string, OfflineProgress> = new Map();
  private settings: OfflineSettings = {
    autoDownload: true,
    maxStorageSize: 100, // 100MB
    preferredLanguage: 'en',
    accessibilityMode: false,
    lowBandwidthMode: false,
    syncWhenOnline: true
  };

  constructor() {
    this.loadSettings();
    this.loadContent();
    this.loadProgress();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });

    // Listen for storage quota changes
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        console.log('Storage estimate:', estimate);
      });
    }
  }

  private async handleOnline() {
    if (this.settings.syncWhenOnline) {
      await this.syncData();
    }
  }

  private async handleOffline() {
    console.log('App is now offline');
    // Could trigger offline mode UI changes
  }

  // Content Management
  async downloadContent(content: OfflineContent): Promise<boolean> {
    try {
      // Check storage space
      const hasSpace = await this.checkStorageSpace(content.metadata.size);
      if (!hasSpace) {
        throw new Error('Insufficient storage space');
      }

      // Store content
      this.content.set(content.id, content);
      await this.saveContent();

      // Update progress
      this.updateProgress(content.id, 0, false);

      return true;
    } catch (error) {
      console.error('Failed to download content:', error);
      return false;
    }
  }

  async removeContent(contentId: string): Promise<boolean> {
    try {
      this.content.delete(contentId);
      this.progress.delete(contentId);
      await this.saveContent();
      await this.saveProgress();
      return true;
    } catch (error) {
      console.error('Failed to remove content:', error);
      return false;
    }
  }

  getContent(contentId: string): OfflineContent | undefined {
    return this.content.get(contentId);
  }

  getAllContent(): OfflineContent[] {
    return Array.from(this.content.values());
  }

  getContentByType(type: string): OfflineContent[] {
    return Array.from(this.content.values()).filter(content => content.type === type);
  }

  getContentByLanguage(language: string): OfflineContent[] {
    return Array.from(this.content.values()).filter(content => content.metadata.language === language);
  }

  // Progress Management
  updateProgress(contentId: string, progress: number, completed: boolean = false, notes?: string): void {
    const progressData: OfflineProgress = {
      userId: 'default-user', // In real app, this would be the actual user ID
      contentId,
      progress,
      completed,
      lastAccessed: new Date(),
      notes
    };

    this.progress.set(contentId, progressData);
    this.saveProgress();
  }

  getProgress(contentId: string): OfflineProgress | undefined {
    return this.progress.get(contentId);
  }

  getAllProgress(): OfflineProgress[] {
    return Array.from(this.progress.values());
  }

  getCompletedContent(): OfflineContent[] {
    const completedIds = Array.from(this.progress.values())
      .filter(p => p.completed)
      .map(p => p.contentId);
    
    return Array.from(this.content.values())
      .filter(content => completedIds.includes(content.id));
  }

  // Settings Management
  updateSettings(newSettings: Partial<OfflineSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): OfflineSettings {
    return { ...this.settings };
  }

  // Storage Management
  async checkStorageSpace(requiredSize: number): Promise<boolean> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const available = (estimate.quota || 0) - (estimate.usage || 0);
      const requiredBytes = requiredSize * 1024 * 1024; // Convert MB to bytes
      
      return available > requiredBytes;
    }
    return true; // Assume available if can't check
  }

  async getStorageInfo(): Promise<{ used: number; available: number; total: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
        total: estimate.quota || 0
      };
    }
    return { used: 0, available: 0, total: 0 };
  }

  async clearAllData(): Promise<void> {
    this.content.clear();
    this.progress.clear();
    await this.saveContent();
    await this.saveProgress();
  }

  // Accessibility Features
  getAccessibleContent(): OfflineContent[] {
    return Array.from(this.content.values()).filter(content => 
      content.accessibility.screenReaderFriendly ||
      content.accessibility.voiceCommandCompatible
    );
  }

  getLowBandwidthContent(): OfflineContent[] {
    return Array.from(this.content.values()).filter(content => 
      content.metadata.size < 1024 * 1024 // Less than 1MB
    );
  }

  // Sync with Server (when online)
  async syncData(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      // In a real implementation, this would sync with a server
      console.log('Syncing data with server...');
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Data sync completed');
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }

  // Auto-download based on settings
  async autoDownloadContent(): Promise<void> {
    if (!this.settings.autoDownload) return;

    // In a real implementation, this would fetch content from a server
    const sampleContent: OfflineContent = {
      id: 'sample-quiz-1',
      type: 'quiz',
      title: 'HIV Prevention Basics',
      content: JSON.stringify({
        questions: [
          {
            question: 'What is the most effective way to prevent HIV?',
            options: ['Abstinence', 'Condoms', 'Both', 'None'],
            correctAnswer: 2,
            explanation: 'Both abstinence and condoms are effective prevention methods.'
          }
        ]
      }),
      metadata: {
        language: this.settings.preferredLanguage,
        category: 'HIV Prevention',
        difficulty: 'easy',
        size: 0.1, // 100KB
        lastUpdated: new Date()
      },
      accessibility: {
        hasAudio: false,
        hasVideo: false,
        hasText: true,
        hasImages: false,
        screenReaderFriendly: true,
        voiceCommandCompatible: true
      }
    };

    await this.downloadContent(sampleContent);
  }

  // Persistence
  private async saveContent(): Promise<void> {
    try {
      const contentArray = Array.from(this.content.entries());
      localStorage.setItem('offline-content', JSON.stringify(contentArray));
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  }

  private async loadContent(): Promise<void> {
    try {
      const saved = localStorage.getItem('offline-content');
      if (saved) {
        const contentArray = JSON.parse(saved);
        this.content = new Map(contentArray);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  }

  private async saveProgress(): Promise<void> {
    try {
      const progressArray = Array.from(this.progress.entries());
      localStorage.setItem('offline-progress', JSON.stringify(progressArray));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  private async loadProgress(): Promise<void> {
    try {
      const saved = localStorage.getItem('offline-progress');
      if (saved) {
        const progressArray = JSON.parse(saved);
        this.progress = new Map(progressArray);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      localStorage.setItem('offline-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const saved = localStorage.getItem('offline-settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }
}

export const offlineAccessibilityService = new OfflineAccessibilityService();
