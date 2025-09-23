export interface SavedCombatSimulation {
  id: string;
  timestamp: number;
  characterName: string;
  targetZone: string;
  targetTier: string;
  optimizeFor: 'profit' | 'exp';
  baselineResults: {
    experienceGain: number;
    profitPerDay: number;
  };
  equipmentRecommendations: Record<string, unknown>[];
  abilityRecommendations: Record<string, unknown>[];
  houseRecommendations: Record<string, unknown>[];
  equipmentTests: { [slot: string]: Record<string, unknown>[] };
  abilityTests: { [abilityHrid: string]: Record<string, unknown>[] };
  houseTests: { [roomHrid: string]: Record<string, unknown>[] };
  summary: {
    totalTests: number;
    bestEquipmentUpgrade?: string;
    bestAbilityUpgrade?: string;
    bestHouseUpgrade?: string;
    totalPotentialIncrease: number;
  };
}

class CombatSimulationStorageService {
  private dbName = 'CombatSimulationsDB';
  private dbVersion = 1;
  private storeName = 'simulations';
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for simulations
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });

          // Create indexes for efficient querying
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('characterName', 'characterName', { unique: false });
          store.createIndex('targetZone', 'targetZone', { unique: false });
          store.createIndex('optimizeFor', 'optimizeFor', { unique: false });

          console.log('📦 Created simulations object store with indexes');
        }
      };
    });
  }

  async saveSimulation(simulation: Omit<SavedCombatSimulation, 'id' | 'timestamp'>): Promise<string> {
    if (!this.db) {
      await this.initDB();
    }

    const id = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    const savedSimulation: SavedCombatSimulation = {
      ...simulation,
      id,
      timestamp
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(savedSimulation);

      request.onsuccess = () => {
        console.log(`💾 Saved combat simulation: ${id}`);
        resolve(id);
      };

      request.onerror = () => {
        console.error('Failed to save simulation:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllSimulations(): Promise<SavedCombatSimulation[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        // Sort by timestamp descending (newest first)
        const simulations = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(simulations);
      };

      request.onerror = () => {
        console.error('Failed to get simulations:', request.error);
        reject(request.error);
      };
    });
  }

  async getSimulationById(id: string): Promise<SavedCombatSimulation | null> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Failed to get simulation:', request.error);
        reject(request.error);
      };
    });
  }

  async getSimulationsByCharacter(characterName: string): Promise<SavedCombatSimulation[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('characterName');
      const request = index.getAll(characterName);

      request.onsuccess = () => {
        // Sort by timestamp descending (newest first)
        const simulations = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(simulations);
      };

      request.onerror = () => {
        console.error('Failed to get simulations by character:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteSimulation(id: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`🗑️ Deleted simulation: ${id}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete simulation:', request.error);
        reject(request.error);
      };
    });
  }

  async clearOldSimulations(daysToKeep: number = 30): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffDate);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`🧹 Cleaned up ${deletedCount} old simulations`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        console.error('Failed to clean up old simulations:', request.error);
        reject(request.error);
      };
    });
  }

  async getStorageStats(): Promise<{ count: number; oldestDate: Date | null; newestDate: Date | null }> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const count = countRequest.result;

        if (count === 0) {
          resolve({ count: 0, oldestDate: null, newestDate: null });
          return;
        }

        // Get oldest and newest timestamps
        const index = store.index('timestamp');
        const oldestRequest = index.openCursor();
        const newestRequest = index.openCursor(null, 'prev');

        let oldest: Date | null = null;
        let newest: Date | null = null;
        let completed = 0;

        const checkComplete = () => {
          completed++;
          if (completed === 2) {
            resolve({ count, oldestDate: oldest, newestDate: newest });
          }
        };

        oldestRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            oldest = new Date(cursor.value.timestamp);
          }
          checkComplete();
        };

        newestRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            newest = new Date(cursor.value.timestamp);
          }
          checkComplete();
        };
      };

      countRequest.onerror = () => {
        console.error('Failed to get storage stats:', countRequest.error);
        reject(countRequest.error);
      };
    });
  }
}

export const combatSimulationStorage = new CombatSimulationStorageService();