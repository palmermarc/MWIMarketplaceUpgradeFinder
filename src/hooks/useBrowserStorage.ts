/**
 * React hooks for browser storage integration
 * Provides easy-to-use hooks for managing persistent data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  browserStorage,
  StoredCharacterData,
  StoredMarketplaceData,
  StoredCombatItems,
  UserPreferences
} from '@/services/browserStorage';
import { CharacterStats } from '@/types/character';
import { MarketData } from '@/types/marketplace';
import { CombatSlotItems } from '@/constants/combatItems';

// Character storage hook
export const useCharacterStorage = () => {
  const [characters, setCharacters] = useState<StoredCharacterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const characterList = await browserStorage.getAllCharacterData();
      setCharacters(characterList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
      console.error('Failed to load characters:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCharacter = useCallback(async (
    character: CharacterStats,
    rawData?: string,
    name?: string
  ): Promise<string | null> => {
    setError(null);
    try {
      const id = await browserStorage.saveCharacterData(character, rawData, name);
      await loadCharacters(); // Refresh the list
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save character');
      console.error('Failed to save character:', err);
      return null;
    }
  }, [loadCharacters]);

  const getCharacter = useCallback(async (id: string): Promise<StoredCharacterData | null> => {
    setError(null);
    try {
      return await browserStorage.getCharacterData(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get character');
      console.error('Failed to get character:', err);
      return null;
    }
  }, []);

  const deleteCharacter = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const success = await browserStorage.deleteCharacterData(id);
      if (success) {
        await loadCharacters(); // Refresh the list after deletion
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character');
      console.error('Failed to delete character:', err);
      return false;
    }
  }, [loadCharacters]);

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  return {
    characters,
    isLoading,
    error,
    saveCharacter,
    getCharacter,
    deleteCharacter,
    refreshCharacters: loadCharacters
  };
};

// Marketplace data storage hook
export const useMarketplaceStorage = () => {
  const [marketData, setMarketData] = useState<StoredMarketplaceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatestMarketData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await browserStorage.getLatestMarketplaceData();
      setMarketData(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marketplace data');
      console.error('Failed to load marketplace data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveMarketData = useCallback(async (
    data: MarketData,
    source: string = 'api',
    ttlHours: number = 24
  ): Promise<string | null> => {
    setError(null);
    try {
      const id = await browserStorage.saveMarketplaceData(data, source, ttlHours);
      await loadLatestMarketData(); // Refresh the current data
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save marketplace data');
      console.error('Failed to save marketplace data:', err);
      return null;
    }
  }, [loadLatestMarketData]);

  const isMarketDataFresh = useCallback((maxAgeHours: number = 6): boolean => {
    if (!marketData) return false;
    const ageHours = (Date.now() - marketData.timestamp) / (1000 * 60 * 60);
    return ageHours < maxAgeHours;
  }, [marketData]);

  // Load on mount
  useEffect(() => {
    loadLatestMarketData();
  }, [loadLatestMarketData]);

  return {
    marketData,
    isLoading,
    error,
    saveMarketData,
    isMarketDataFresh,
    refreshMarketData: loadLatestMarketData
  };
};

// Combat items storage hook
export const useCombatItemsStorage = () => {
  const [combatItems, setCombatItems] = useState<StoredCombatItems | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatestCombatItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await browserStorage.getLatestCombatItems();
      setCombatItems(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load combat items');
      console.error('Failed to load combat items:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCombatItems = useCallback(async (
    data: CombatSlotItems,
    source: string = 'constants'
  ): Promise<string | null> => {
    setError(null);
    try {
      const id = await browserStorage.saveCombatItems(data, source);
      await loadLatestCombatItems(); // Refresh the current data
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save combat items');
      console.error('Failed to save combat items:', err);
      return null;
    }
  }, [loadLatestCombatItems]);

  // Load on mount
  useEffect(() => {
    loadLatestCombatItems();
  }, [loadLatestCombatItems]);

  return {
    combatItems,
    isLoading,
    error,
    saveCombatItems,
    refreshCombatItems: loadLatestCombatItems
  };
};

// User preferences hook
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const prefs = await browserStorage.getUserPreferences();
      setPreferences(prefs);
      return prefs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      console.error('Failed to load preferences:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePreferences = useCallback(async (
    newPreferences: UserPreferences['preferences']
  ): Promise<boolean> => {
    setError(null);
    try {
      await browserStorage.saveUserPreferences(newPreferences);
      await loadPreferences(); // Refresh
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
      console.error('Failed to save preferences:', err);
      return false;
    }
  }, [loadPreferences]);

  const updatePreference = useCallback(async (
    key: keyof UserPreferences['preferences'],
    value: unknown
  ): Promise<boolean> => {
    if (!preferences?.preferences) {
      console.error('No preferences loaded');
      return false;
    }

    const updatedPreferences = {
      ...preferences.preferences,
      [key]: value
    };

    return await savePreferences(updatedPreferences);
  }, [preferences, savePreferences]);

  // Load on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    isLoading,
    error,
    savePreferences,
    updatePreference,
    refreshPreferences: loadPreferences
  };
};

// Storage statistics hook
export const useStorageStats = () => {
  const [stats, setStats] = useState<{ [storeName: string]: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storageStats = await browserStorage.getStorageStats();
      setStats(storageStats);
      return storageStats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load storage stats');
      console.error('Failed to load storage stats:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performMaintenance = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      await browserStorage.performMaintenanceCleanup();
      await loadStats(); // Refresh stats after cleanup
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform maintenance');
      console.error('Failed to perform maintenance:', err);
      return false;
    }
  }, [loadStats]);

  const clearAllData = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      await browserStorage.clearAllData();
      await loadStats(); // Refresh stats
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data');
      console.error('Failed to clear data:', err);
      return false;
    }
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    loadStats,
    performMaintenance,
    clearAllData
  };
};

// Combined storage hook for convenience
export const useApplicationStorage = () => {
  const characterStorage = useCharacterStorage();
  const marketplaceStorage = useMarketplaceStorage();
  const combatItemsStorage = useCombatItemsStorage();
  const userPreferences = useUserPreferences();
  const storageStats = useStorageStats();

  const isAnyLoading =
    characterStorage.isLoading ||
    marketplaceStorage.isLoading ||
    combatItemsStorage.isLoading ||
    userPreferences.isLoading ||
    storageStats.isLoading;

  const hasAnyError =
    characterStorage.error ||
    marketplaceStorage.error ||
    combatItemsStorage.error ||
    userPreferences.error ||
    storageStats.error;

  return {
    character: characterStorage,
    marketplace: marketplaceStorage,
    combatItems: combatItemsStorage,
    preferences: userPreferences,
    stats: storageStats,
    isLoading: isAnyLoading,
    hasError: hasAnyError
  };
};