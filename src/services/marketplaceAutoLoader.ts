/**
 * Marketplace Auto-Loader Service
 *
 * Automatically manages marketplace data loading with smart caching:
 * - Loads data automatically on app startup
 * - Checks data freshness (3-hour threshold)
 * - Refreshes stale data in background
 * - Provides loading states and error handling
 */

import { MarketplaceService } from './marketplace';
import { browserStorage } from './browserStorage';
import { MarketData } from '@/types/marketplace';

// Configuration constants
const MARKETPLACE_FRESHNESS_HOURS = 3;
const MARKETPLACE_TTL_HOURS = 24;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

export interface MarketplaceLoadState {
  isLoading: boolean;
  isRefreshing: boolean;
  data: MarketData | null;
  lastUpdated: number | null;
  error: string | null;
  source: 'storage' | 'api' | null;
  isFresh: boolean;
}

export class MarketplaceAutoLoaderService {
  private listeners: Set<(state: MarketplaceLoadState) => void> = new Set();
  private currentState: MarketplaceLoadState = {
    isLoading: false,
    isRefreshing: false,
    data: null,
    lastUpdated: null,
    error: null,
    source: null,
    isFresh: false
  };

  private loadPromise: Promise<void> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: MarketplaceLoadState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit state changes to all listeners
   */
  private emitChange(): void {
    this.listeners.forEach(listener => listener(this.currentState));
  }

  /**
   * Update state and emit changes
   */
  private updateState(updates: Partial<MarketplaceLoadState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.emitChange();
  }

  /**
   * Check if data is fresh (within MARKETPLACE_FRESHNESS_HOURS)
   */
  private isDataFresh(timestamp: number): boolean {
    const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    return ageHours < MARKETPLACE_FRESHNESS_HOURS;
  }

  /**
   * Load marketplace data from storage
   */
  private async loadFromStorage(): Promise<{ data: MarketData; timestamp: number } | null> {
    try {
      const storedData = await browserStorage.getLatestMarketplaceData();
      if (storedData && storedData.expiresAt > Date.now()) {
        // Found valid stored data
        return {
          data: storedData.data,
          timestamp: storedData.timestamp
        };
      }
      return null;
    } catch (error) {
      // Failed to load marketplace data from storage
      return null;
    }
  }

  /**
   * Load marketplace data from API with retry logic
   */
  private async loadFromAPI(retryCount = 0): Promise<MarketData | null> {
    try {
      // Loading from API
      const data = await MarketplaceService.getMarketplaceData();

      // Save to storage
      try {
        await browserStorage.saveMarketplaceData(data, 'api', MARKETPLACE_TTL_HOURS);
        // Data saved to storage
      } catch (storageError) {
        // Failed to save marketplace data to storage
      }

      return data;
    } catch (error) {
      // Failed to load marketplace data from API

      if (retryCount < RETRY_ATTEMPTS - 1) {
        // Retrying...
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return this.loadFromAPI(retryCount + 1);
      }

      return null;
    }
  }

  /**
   * Initialize and load marketplace data
   */
  async initialize(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.performInitialLoad();
    return this.loadPromise;
  }

  /**
   * Perform the initial data loading process
   */
  private async performInitialLoad(): Promise<void> {
    // Starting initialization...

    this.updateState({
      isLoading: true,
      error: null
    });

    try {
      // Step 1: Try to load from storage
      const storedResult = await this.loadFromStorage();

      if (storedResult) {
        const isFresh = this.isDataFresh(storedResult.timestamp);

        // Stored data found

        this.updateState({
          isLoading: false,
          data: storedResult.data,
          lastUpdated: storedResult.timestamp,
          source: 'storage',
          isFresh
        });

        // If data is stale, refresh in background
        if (!isFresh) {
          this.refreshInBackground();
        } else {
          // Schedule next refresh
          this.scheduleNextRefresh();
        }
      } else {
        // Step 2: No stored data, load from API
        // No stored data found, loading from API...
        const apiData = await this.loadFromAPI();

        if (apiData) {
          const timestamp = Date.now();
          this.updateState({
            isLoading: false,
            data: apiData,
            lastUpdated: timestamp,
            source: 'api',
            isFresh: true
          });

          // Schedule next refresh
          this.scheduleNextRefresh();
        } else {
          throw new Error('Failed to load marketplace data from API after all retry attempts');
        }
      }
    } catch (error) {
      // Initialization failed
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load marketplace data'
      });
    }

    this.loadPromise = null;
  }

  /**
   * Refresh data in background without affecting UI state
   */
  private async refreshInBackground(): Promise<void> {
    // Starting background refresh...

    this.updateState({ isRefreshing: true });

    try {
      const freshData = await this.loadFromAPI();

      if (freshData) {
        const timestamp = Date.now();
        this.updateState({
          isRefreshing: false,
          data: freshData,
          lastUpdated: timestamp,
          source: 'api',
          isFresh: true,
          error: null
        });

        // Background refresh completed successfully

        // Schedule next refresh
        this.scheduleNextRefresh();
      } else {
        // Background refresh failed, keeping existing data
        this.updateState({ isRefreshing: false });
      }
    } catch (error) {
      // Background refresh failed
      this.updateState({
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Background refresh failed'
      });
    }
  }

  /**
   * Schedule the next automatic refresh
   */
  private scheduleNextRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh for when data becomes stale
    const refreshDelayMs = MARKETPLACE_FRESHNESS_HOURS * 60 * 60 * 1000;

    this.refreshTimer = setTimeout(() => {
      // Scheduled refresh triggered
      this.refreshInBackground();
    }, refreshDelayMs);

    // Next refresh scheduled
  }

  /**
   * Manually force a refresh
   */
  async forceRefresh(): Promise<void> {
    if (this.currentState.isRefreshing) {
      // Refresh already in progress
      return;
    }

    await this.refreshInBackground();
  }

  /**
   * Get current state
   */
  getState(): MarketplaceLoadState {
    return { ...this.currentState };
  }

  /**
   * Check if data needs refresh
   */
  needsRefresh(): boolean {
    if (!this.currentState.data || !this.currentState.lastUpdated) {
      return true;
    }
    return !this.isDataFresh(this.currentState.lastUpdated);
  }

  /**
   * Get data age in hours
   */
  getDataAge(): number | null {
    if (!this.currentState.lastUpdated) {
      return null;
    }
    return (Date.now() - this.currentState.lastUpdated) / (1000 * 60 * 60);
  }

  /**
   * Clean up timers and listeners
   */
  dispose(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.listeners.clear();
  }
}

// Create singleton instance
export const marketplaceAutoLoader = new MarketplaceAutoLoaderService();

// Auto-initialize on module load (only in browser)
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure the app is ready
  setTimeout(() => {
    marketplaceAutoLoader.initialize().catch(error => {
      // Failed to initialize marketplace auto-loader
    });
  }, 1000);
}