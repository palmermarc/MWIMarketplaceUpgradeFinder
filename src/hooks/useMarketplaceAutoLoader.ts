/**
 * React hook for marketplace auto-loader integration
 */

import { useState, useEffect, useCallback } from 'react';
import { marketplaceAutoLoader, MarketplaceLoadState } from '@/services/marketplaceAutoLoader';
import { MarketData } from '@/types/marketplace';

export interface UseMarketplaceAutoLoaderResult {
  // Data
  marketData: MarketData | null;
  lastUpdated: number | null;

  // State
  isLoading: boolean;
  isRefreshing: boolean;
  isFresh: boolean;
  error: string | null;
  source: 'storage' | 'api' | null;

  // Computed values
  dataAge: number | null; // in hours
  needsRefresh: boolean;

  // Actions
  forceRefresh: () => Promise<void>;
  initialize: () => Promise<void>;

  // Status helpers
  getStatusText: () => string;
  getStatusColor: () => string;
}

export const useMarketplaceAutoLoader = (): UseMarketplaceAutoLoaderResult => {
  const [state, setState] = useState<MarketplaceLoadState>(() =>
    marketplaceAutoLoader.getState()
  );

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = marketplaceAutoLoader.subscribe(setState);
    return unsubscribe;
  }, []);

  // Initialize on mount
  useEffect(() => {
    marketplaceAutoLoader.initialize().catch(error => {
      // Failed to initialize marketplace auto-loader
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Note: Don't dispose the service here as it might be used by other components
    };
  }, []);

  const forceRefresh = useCallback(async () => {
    await marketplaceAutoLoader.forceRefresh();
  }, []);

  const initialize = useCallback(async () => {
    await marketplaceAutoLoader.initialize();
  }, []);

  const getStatusText = useCallback((): string => {
    if (state.isLoading) return 'Loading marketplace data...';
    if (state.isRefreshing) return 'Refreshing marketplace data...';
    if (state.error) return `Error: ${state.error}`;
    if (!state.data) return 'No marketplace data available';

    const ageHours = state.lastUpdated ?
      (Date.now() - state.lastUpdated) / (1000 * 60 * 60) : null;

    if (ageHours === null) return 'Marketplace data loaded';
    if (ageHours < 1) return 'Marketplace data fresh (< 1 hour)';
    if (ageHours < 3) return `Marketplace data fresh (${ageHours.toFixed(1)} hours)`;
    if (ageHours < 24) return `Marketplace data stale (${ageHours.toFixed(1)} hours)`;
    return `Marketplace data old (${Math.floor(ageHours / 24)} days)`;
  }, [state]);

  const getStatusColor = useCallback((): string => {
    if (state.isLoading || state.isRefreshing) return 'blue';
    if (state.error) return 'red';
    if (!state.data) return 'gray';
    if (state.isFresh) return 'green';
    return 'yellow'; // stale data
  }, [state]);

  const dataAge = state.lastUpdated ?
    (Date.now() - state.lastUpdated) / (1000 * 60 * 60) : null;

  return {
    // Data
    marketData: state.data,
    lastUpdated: state.lastUpdated,

    // State
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    isFresh: state.isFresh,
    error: state.error,
    source: state.source,

    // Computed values
    dataAge,
    needsRefresh: marketplaceAutoLoader.needsRefresh(),

    // Actions
    forceRefresh,
    initialize,

    // Status helpers
    getStatusText,
    getStatusColor
  };
};