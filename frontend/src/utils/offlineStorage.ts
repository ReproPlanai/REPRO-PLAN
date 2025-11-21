import localforage from 'localforage';

// Configure localforage for offline storage
localforage.config({
  name: 'REPRO PLAN',
  storeName: 'repro-plan_data',
  description: 'REPRO PLAN offline data storage'
});

export interface OfflineData {
  id: string;
  type: 'chat' | 'tracker' | 'emergency' | 'mentorship';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorage {
  private static instance: OfflineStorage;
  private db: LocalForage;

  constructor() {
    this.db = localforage;
  }

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  // Store data offline
  async storeData(key: string, data: any): Promise<void> {
    try {
      await this.db.setItem(key, {
        ...data,
        timestamp: Date.now(),
        synced: false
      });
    } catch (error) {
      console.error('Failed to store data offline:', error);
    }
  }

  // Retrieve data from offline storage
  async getData(key: string): Promise<any> {
    try {
      return await this.db.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  // Get all offline data
  async getAllData(): Promise<OfflineData[]> {
    try {
      const keys = await this.db.keys();
      const data: OfflineData[] = [];
      
      for (const key of keys) {
        const item = await this.db.getItem(key);
        if (item) {
          data.push(item as OfflineData);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get all data:', error);
      return [];
    }
  }

  // Remove data from offline storage
  async removeData(key: string): Promise<void> {
    try {
      await this.db.removeItem(key);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  }

  // Clear all offline data
  async clearAll(): Promise<void> {
    try {
      await this.db.clear();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // Get unsynced data
  async getUnsyncedData(): Promise<OfflineData[]> {
    try {
      const allData = await this.getAllData();
      return allData.filter(item => !item.synced);
    } catch (error) {
      console.error('Failed to get unsynced data:', error);
      return [];
    }
  }

  // Mark data as synced
  async markAsSynced(key: string): Promise<void> {
    try {
      const data = await this.getData(key);
      if (data) {
        data.synced = true;
        await this.db.setItem(key, data);
      }
    } catch (error) {
      console.error('Failed to mark data as synced:', error);
    }
  }

  // Get storage usage info
  async getStorageInfo(): Promise<{ used: number; available: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0
        };
      }
      return { used: 0, available: 0 };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0 };
    }
  }
}

export const offlineStorage = OfflineStorage.getInstance();
