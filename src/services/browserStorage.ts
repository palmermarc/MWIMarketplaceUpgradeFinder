/**
 * Browser Storage Service using IndexedDB for long-term, expandable data storage
 *
 * Features:
 * - Version management for schema upgrades
 * - Structured data storage with TypeScript support
 * - Automatic data expiration and cleanup
 * - Compression for large datasets
 * - Export/import functionality
 * - Performance optimizations
 */

import { CharacterStats } from '@/types/character';
import { MarketData } from '@/types/marketplace';
import { CombatSlotItems } from '@/constants/combatItems';

// Database configuration
export const DB_NAME = 'MWIUpgradeFinderDB';
export const DB_VERSION = 1;

// Object store names
export const STORES = {
  CHARACTER_DATA: 'characterData',
  MARKETPLACE_DATA: 'marketplaceData',
  COMBAT_ITEMS: 'combatItems',
  USER_PREFERENCES: 'userPreferences',
  CACHE_METADATA: 'cacheMetadata',
  ANALYSIS_HISTORY: 'analysisHistory'
} as const;

// Data interfaces for storage
export interface StoredCharacterData {
  id: string;
  name: string;
  data: CharacterStats;
  rawData?: string;
  timestamp: number;
  lastAccessed: number;
  version: string;
}

export interface StoredMarketplaceData {
  id: string;
  data: MarketData;
  timestamp: number;
  expiresAt: number;
  version: string;
  source: string; // 'api' | 'manual' | 'cache'
}

export interface StoredCombatItems {
  id: string;
  data: CombatSlotItems;
  timestamp: number;
  version: string;
  source: string;
}

export interface UserPreferences {
  id: string;
  preferences: {
    autoSave: boolean;
    dataRetentionDays: number;
    defaultAnalysisSettings: Record<string, unknown>;
    favoriteCharacters: string[];
    theme: string;
    language: string;
  };
  timestamp: number;
}

export interface CacheMetadata {
  id: string;
  type: string;
  size: number;
  lastCleanup: number;
  totalEntries: number;
}

export interface AnalysisHistory {
  id: string;
  characterId: string;
  analysisType: string;
  parameters: Record<string, unknown>;
  results: Record<string, unknown>;
  timestamp: number;
  duration: number;
}

// Storage service class
export class BrowserStorageService {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeDB();
    }
  }

  /**
   * Initialize the IndexedDB database
   */
  private async initializeDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    // Check if we're on the client side
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB is not available');
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db, event.oldVersion);
      };
    });

    return this.dbPromise;
  }

  /**
   * Create object stores and indexes for the database
   */
  private createObjectStores(db: IDBDatabase, oldVersion: number) {
    console.log(`Upgrading database from version ${oldVersion} to ${DB_VERSION}`);

    // Character Data Store
    if (!db.objectStoreNames.contains(STORES.CHARACTER_DATA)) {
      const characterStore = db.createObjectStore(STORES.CHARACTER_DATA, { keyPath: 'id' });
      characterStore.createIndex('name', 'name', { unique: false });
      characterStore.createIndex('timestamp', 'timestamp', { unique: false });
      characterStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
    }

    // Marketplace Data Store
    if (!db.objectStoreNames.contains(STORES.MARKETPLACE_DATA)) {
      const marketStore = db.createObjectStore(STORES.MARKETPLACE_DATA, { keyPath: 'id' });
      marketStore.createIndex('timestamp', 'timestamp', { unique: false });
      marketStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      marketStore.createIndex('source', 'source', { unique: false });
    }

    // Combat Items Store
    if (!db.objectStoreNames.contains(STORES.COMBAT_ITEMS)) {
      const combatStore = db.createObjectStore(STORES.COMBAT_ITEMS, { keyPath: 'id' });
      combatStore.createIndex('timestamp', 'timestamp', { unique: false });
      combatStore.createIndex('source', 'source', { unique: false });
    }

    // User Preferences Store
    if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
      const prefStore = db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'id' });
      prefStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Cache Metadata Store
    if (!db.objectStoreNames.contains(STORES.CACHE_METADATA)) {
      const cacheStore = db.createObjectStore(STORES.CACHE_METADATA, { keyPath: 'id' });
      cacheStore.createIndex('type', 'type', { unique: false });
      cacheStore.createIndex('lastCleanup', 'lastCleanup', { unique: false });
    }

    // Analysis History Store
    if (!db.objectStoreNames.contains(STORES.ANALYSIS_HISTORY)) {
      const historyStore = db.createObjectStore(STORES.ANALYSIS_HISTORY, { keyPath: 'id' });
      historyStore.createIndex('characterId', 'characterId', { unique: false });
      historyStore.createIndex('analysisType', 'analysisType', { unique: false });
      historyStore.createIndex('timestamp', 'timestamp', { unique: false });
    }
  }

  /**
   * Get a transaction for the specified stores
   */
  private async getTransaction(storeNames: string | string[], mode: IDBTransactionMode = 'readonly'): Promise<IDBTransaction> {
    const db = await this.initializeDB();
    return db.transaction(storeNames, mode);
  }

  /**
   * Generate a unique ID for storage entries
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Character Data Methods
  /**
   * Save character data to storage
   */
  async saveCharacterData(character: CharacterStats, rawData?: string, name?: string): Promise<string> {
    const id = this.generateId('char');
    const characterData: StoredCharacterData = {
      id,
      name: name || 'Unnamed Character',
      data: character,
      rawData,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      version: '1.0'
    };

    const transaction = await this.getTransaction(STORES.CHARACTER_DATA, 'readwrite');
    const store = transaction.objectStore(STORES.CHARACTER_DATA);
    await store.add(characterData);

    console.log(`Character data saved with ID: ${id}`);
    return id;
  }

  /**
   * Get character data by ID
   */
  async getCharacterData(id: string): Promise<StoredCharacterData | null> {
    const transaction = await this.getTransaction(STORES.CHARACTER_DATA);
    const store = transaction.objectStore(STORES.CHARACTER_DATA);
    const result = await store.get(id);

    if (result) {
      // Update last accessed time
      const updatedResult = result as unknown as StoredCharacterData;
      updatedResult.lastAccessed = Date.now();
      const updateTransaction = await this.getTransaction(STORES.CHARACTER_DATA, 'readwrite');
      const updateStore = updateTransaction.objectStore(STORES.CHARACTER_DATA);
      await updateStore.put(updatedResult);
    }

    return (result as unknown as StoredCharacterData) || null;
  }

  /**
   * Get all character data
   */
  async getAllCharacterData(): Promise<StoredCharacterData[]> {
    const transaction = await this.getTransaction(STORES.CHARACTER_DATA);
    const store = transaction.objectStore(STORES.CHARACTER_DATA);
    const index = store.index('lastAccessed');
    const cursor = index.openCursor(null, 'prev'); // Most recent first

    return new Promise((resolve, reject) => {
      const results: StoredCharacterData[] = [];
      cursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      cursor.onerror = () => reject(cursor.error);
    });
  }

  // Marketplace Data Methods
  /**
   * Save marketplace data to storage
   */
  async saveMarketplaceData(marketData: MarketData, source: string = 'api', ttlHours: number = 24): Promise<string> {
    const id = this.generateId('market');
    const now = Date.now();
    const expiresAt = now + (ttlHours * 60 * 60 * 1000); // TTL in milliseconds

    const storedData: StoredMarketplaceData = {
      id,
      data: marketData,
      timestamp: now,
      expiresAt,
      version: '1.0',
      source
    };

    const transaction = await this.getTransaction(STORES.MARKETPLACE_DATA, 'readwrite');
    const store = transaction.objectStore(STORES.MARKETPLACE_DATA);

    // Remove expired data first
    await this.cleanupExpiredMarketplaceData();

    await store.add(storedData);

    console.log(`Marketplace data saved with ID: ${id}, expires at: ${new Date(expiresAt).toISOString()}`);
    return id;
  }

  /**
   * Get the most recent valid marketplace data
   */
  async getLatestMarketplaceData(): Promise<StoredMarketplaceData | null> {
    const transaction = await this.getTransaction(STORES.MARKETPLACE_DATA);
    const store = transaction.objectStore(STORES.MARKETPLACE_DATA);
    const index = store.index('timestamp');
    const cursor = index.openCursor(null, 'prev'); // Most recent first

    return new Promise((resolve, reject) => {
      cursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const data = cursor.value as StoredMarketplaceData;
          // Check if data is still valid (not expired)
          if (data.expiresAt > Date.now()) {
            resolve(data);
          } else {
            cursor.continue(); // Try next entry
          }
        } else {
          resolve(null); // No valid data found
        }
      };
      cursor.onerror = () => reject(cursor.error);
    });
  }

  /**
   * Clean up expired marketplace data
   */
  private async cleanupExpiredMarketplaceData(): Promise<void> {
    const transaction = await this.getTransaction(STORES.MARKETPLACE_DATA, 'readwrite');
    const store = transaction.objectStore(STORES.MARKETPLACE_DATA);
    const index = store.index('expiresAt');
    const range = IDBKeyRange.upperBound(Date.now());
    const cursor = index.openCursor(range);

    return new Promise((resolve, reject) => {
      let deletedCount = 0;
      cursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount} expired marketplace entries`);
          }
          resolve();
        }
      };
      cursor.onerror = () => reject(cursor.error);
    });
  }

  // Combat Items Methods
  /**
   * Save combat items data
   */
  async saveCombatItems(combatItems: CombatSlotItems, source: string = 'constants'): Promise<string> {
    const id = this.generateId('combat');
    const storedData: StoredCombatItems = {
      id,
      data: combatItems,
      timestamp: Date.now(),
      version: '1.0',
      source
    };

    const transaction = await this.getTransaction(STORES.COMBAT_ITEMS, 'readwrite');
    const store = transaction.objectStore(STORES.COMBAT_ITEMS);
    await store.add(storedData);

    console.log(`Combat items saved with ID: ${id}`);
    return id;
  }

  /**
   * Get the most recent combat items data
   */
  async getLatestCombatItems(): Promise<StoredCombatItems | null> {
    const transaction = await this.getTransaction(STORES.COMBAT_ITEMS);
    const store = transaction.objectStore(STORES.COMBAT_ITEMS);
    const index = store.index('timestamp');
    const cursor = index.openCursor(null, 'prev');

    return new Promise((resolve, reject) => {
      cursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          resolve(cursor.value);
        } else {
          resolve(null);
        }
      };
      cursor.onerror = () => reject(cursor.error);
    });
  }

  // User Preferences Methods
  /**
   * Save user preferences
   */
  async saveUserPreferences(preferences: UserPreferences['preferences']): Promise<string> {
    const id = 'user_prefs';
    const userData: UserPreferences = {
      id,
      preferences,
      timestamp: Date.now()
    };

    const transaction = await this.getTransaction(STORES.USER_PREFERENCES, 'readwrite');
    const store = transaction.objectStore(STORES.USER_PREFERENCES);
    await store.put(userData); // Use put to update existing

    console.log('User preferences saved');
    return id;
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<UserPreferences | null> {
    const transaction = await this.getTransaction(STORES.USER_PREFERENCES);
    const store = transaction.objectStore(STORES.USER_PREFERENCES);
    const result = await store.get('user_prefs');
    return (result as unknown as UserPreferences) || null;
  }

  // Analysis History Methods
  /**
   * Save analysis history entry
   */
  async saveAnalysisHistory(entry: Omit<AnalysisHistory, 'id' | 'timestamp'>): Promise<string> {
    const id = this.generateId('analysis');
    const historyEntry: AnalysisHistory = {
      ...entry,
      id,
      timestamp: Date.now()
    };

    const transaction = await this.getTransaction(STORES.ANALYSIS_HISTORY, 'readwrite');
    const store = transaction.objectStore(STORES.ANALYSIS_HISTORY);
    await store.add(historyEntry);

    console.log(`Analysis history saved with ID: ${id}`);
    return id;
  }

  /**
   * Get analysis history for a character
   */
  async getAnalysisHistory(characterId: string, limit: number = 50): Promise<AnalysisHistory[]> {
    const transaction = await this.getTransaction(STORES.ANALYSIS_HISTORY);
    const store = transaction.objectStore(STORES.ANALYSIS_HISTORY);
    const index = store.index('characterId');
    const cursor = index.openCursor(IDBKeyRange.only(characterId), 'prev');

    return new Promise((resolve, reject) => {
      const results: AnalysisHistory[] = [];
      cursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      cursor.onerror = () => reject(cursor.error);
    });
  }

  // Utility Methods
  /**
   * Clear all data (for testing or reset)
   */
  async clearAllData(): Promise<void> {
    const storeNames = Object.values(STORES);
    const transaction = await this.getTransaction(storeNames, 'readwrite');

    const promises = storeNames.map(storeName => {
      const store = transaction.objectStore(storeName);
      return store.clear();
    });

    await Promise.all(promises);
    console.log('All data cleared from storage');
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{ [storeName: string]: number }> {
    const storeNames = Object.values(STORES);
    const transaction = await this.getTransaction(storeNames);
    const stats: { [storeName: string]: number } = {};

    const promises = storeNames.map(async storeName => {
      const store = transaction.objectStore(storeName);
      const count = await store.count();
      stats[storeName] = count as unknown as number;
    });

    await Promise.all(promises);
    return stats;
  }

  /**
   * Export all data for backup
   */
  async exportAllData(): Promise<{ [storeName: string]: unknown[] }> {
    const storeNames = Object.values(STORES);
    const transaction = await this.getTransaction(storeNames);
    const exportData: { [storeName: string]: unknown[] } = {};

    const promises = storeNames.map(async storeName => {
      const store = transaction.objectStore(storeName);
      const cursor = store.openCursor();

      return new Promise<void>((resolve, reject) => {
        const storeData: unknown[] = [];
        cursor.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            storeData.push(cursor.value);
            cursor.continue();
          } else {
            exportData[storeName] = storeData;
            resolve();
          }
        };
        cursor.onerror = () => reject(cursor.error);
      });
    });

    await Promise.all(promises);
    return exportData;
  }

  /**
   * Clean up old data based on retention policies
   */
  async performMaintenanceCleanup(): Promise<void> {
    const prefs = await this.getUserPreferences();
    const retentionDays = prefs?.preferences.dataRetentionDays || 30;
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);

    // Cleanup old character data
    const charTransaction = await this.getTransaction(STORES.CHARACTER_DATA, 'readwrite');
    const charStore = charTransaction.objectStore(STORES.CHARACTER_DATA);
    const charIndex = charStore.index('lastAccessed');
    const charRange = IDBKeyRange.upperBound(cutoffTime);
    let charDeleted = 0;

    await new Promise<void>((resolve, reject) => {
      const cursor = charIndex.openCursor(charRange);
      cursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          charDeleted++;
          cursor.continue();
        } else {
          resolve();
        }
      };
      cursor.onerror = () => reject(cursor.error);
    });

    // Cleanup old analysis history
    const historyTransaction = await this.getTransaction(STORES.ANALYSIS_HISTORY, 'readwrite');
    const historyStore = historyTransaction.objectStore(STORES.ANALYSIS_HISTORY);
    const historyIndex = historyStore.index('timestamp');
    const historyRange = IDBKeyRange.upperBound(cutoffTime);
    let historyDeleted = 0;

    await new Promise<void>((resolve, reject) => {
      const cursor = historyIndex.openCursor(historyRange);
      cursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          historyDeleted++;
          cursor.continue();
        } else {
          resolve();
        }
      };
      cursor.onerror = () => reject(cursor.error);
    });

    // Cleanup expired marketplace data
    await this.cleanupExpiredMarketplaceData();

    console.log(`Maintenance cleanup completed: ${charDeleted} character records, ${historyDeleted} history entries removed`);
  }
}

// Create singleton instance
export const browserStorage = new BrowserStorageService();

// Helper hook for React components
export const useBrowserStorage = () => {
  return browserStorage;
};