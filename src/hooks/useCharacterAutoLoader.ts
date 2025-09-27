/**
 * Auto-loader hook for character data
 * Automatically loads the most recent character from storage on app startup
 */

import { useState, useEffect, useCallback } from 'react';
import { CharacterStats } from '@/types/character';
import { browserStorage } from '@/services/browserStorage';

interface CharacterAutoLoaderState {
  character: CharacterStats | null;
  rawCharacterData: string | null;
  characterName: string | null;
  isLoading: boolean;
  error: string | null;
  hasStoredCharacters: boolean;
}

export const useCharacterAutoLoader = () => {
  const [state, setState] = useState<CharacterAutoLoaderState>({
    character: null,
    rawCharacterData: null,
    characterName: null,
    isLoading: true,
    error: null,
    hasStoredCharacters: false
  });

  const loadMostRecentCharacter = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get all character data
      const characters = await browserStorage.getAllCharacterData();

      if (characters.length === 0) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasStoredCharacters: false
        }));
        return;
      }

      // Sort by lastAccessed (most recent first)
      const sortedCharacters = characters.sort((a, b) => b.lastAccessed - a.lastAccessed);
      const mostRecent = sortedCharacters[0];

      console.log(`🔄 Auto-loading most recent character: ${mostRecent.name} (last accessed: ${new Date(mostRecent.lastAccessed).toLocaleString()})`);

      // Note: lastAccessed is automatically updated when getCharacterData is called

      setState(prev => ({
        ...prev,
        character: mostRecent.data,
        rawCharacterData: mostRecent.rawData || null,
        characterName: mostRecent.name,
        isLoading: false,
        hasStoredCharacters: true
      }));

    } catch (error) {
      console.error('Failed to auto-load character:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load character',
        isLoading: false
      }));
    }
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadMostRecentCharacter();
  }, [loadMostRecentCharacter]);

  const clearAutoLoadedCharacter = useCallback(() => {
    setState(prev => ({
      ...prev,
      character: null,
      rawCharacterData: null,
      characterName: null
    }));
  }, []);

  return {
    ...state,
    reload: loadMostRecentCharacter,
    clear: clearAutoLoadedCharacter
  };
};