'use client';

import { useState, useEffect } from 'react';
import { CharacterData, CharacterStats } from '@/types/character';
import { MarketData } from '@/types/marketplace';
import { MarketplaceService } from '@/services/marketplace';
import { COMBAT_ITEMS } from '@/constants/combatItems';
import { useCharacterStorage, useCombatItemsStorage } from '@/hooks/useBrowserStorage';
import { useMarketplaceAutoLoader } from '@/hooks/useMarketplaceAutoLoader';
import { useTheme } from '@/contexts/ThemeContext';

interface CharacterImportProps {
  onCharacterImported: (character: CharacterStats, rawData?: string) => void;
  onMarketDataLoaded: (data: MarketData) => void;
  onCombatItemsLoaded?: (combatItems: { [slot: string]: { [itemHrid: string]: string } }) => void;
}

export function CharacterImport({ onCharacterImported, onMarketDataLoaded, onCombatItemsLoaded }: CharacterImportProps) {
  const { theme } = useTheme();
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCharacter, setImportedCharacter] = useState<CharacterStats | null>(null);
  const [isLoadingCombatItems, setIsLoadingCombatItems] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [useStoredData, setUseStoredData] = useState(false);

  // Storage hooks
  const characterStorage = useCharacterStorage();
  const combatItemsStorage = useCombatItemsStorage();

  // Auto-loader for marketplace data
  const marketplaceAutoLoader = useMarketplaceAutoLoader();

  // Check for existing data on mount
  useEffect(() => {
    const checkExistingData = async () => {
      // Use marketplace data from auto-loader (which handles freshness automatically)
      if (marketplaceAutoLoader.marketData) {
        // Found marketplace data from auto-loader
        onMarketDataLoaded(marketplaceAutoLoader.marketData);
      }

      // Check if we have combat items data
      if (combatItemsStorage.combatItems && onCombatItemsLoaded) {
        // Found combat items data in storage
        onCombatItemsLoaded(combatItemsStorage.combatItems.data);
      }
    };

    checkExistingData();
  }, [marketplaceAutoLoader.marketData, combatItemsStorage.combatItems, onMarketDataLoaded, onCombatItemsLoaded]);

  const parseItemName = (itemHrid: string): string => {
    return itemHrid.replace('/items/', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const parseLocationName = (locationHrid: string): string => {
    return locationHrid.replace('/item_locations/', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const transformCharacterData = (data: CharacterData): CharacterStats => {
    const equipment: { [slot: string]: { item: string; enhancement: number } } = {};
    
    data.player.equipment.forEach(eq => {
      const slot = parseLocationName(eq.itemLocationHrid);
      equipment[slot] = {
        item: parseItemName(eq.itemHrid),
        enhancement: eq.enhancementLevel
      };
    });

    const combatFood = data.food['/action_types/combat'] || [];
    const combatDrinks = data.drinks['/action_types/combat'] || [];

    return {
      combat: {
        attack: data.player.attackLevel,
        defense: data.player.defenseLevel,
        magic: data.player.magicLevel,
        melee: data.player.meleeLevel,
        intelligence: data.player.intelligenceLevel,
        stamina: data.player.staminaLevel,
        ranged: data.player.rangedLevel,
      },
      equipment,
      abilities: data.abilities,
      consumables: {
        food: combatFood,
        drinks: combatDrinks,
      },
      houseRooms: data.houseRooms || {},
    };
  };

  const handleImport = async () => {
    setIsLoading(true);
    setIsLoadingCombatItems(true);
    setError(null);
    setLoadingMessage('Importing Character and Loading Items');

    try {
      const characterData: CharacterData = JSON.parse(jsonInput);

      if (!characterData.player || typeof characterData.player.attackLevel !== 'number') {
        throw new Error('Invalid character data format');
      }

      const transformedData = transformCharacterData(characterData);
      setImportedCharacter(transformedData);
      onCharacterImported(transformedData, jsonInput);

      // Save character data to storage
      setLoadingMessage('Saving character data...');
      try {
        const characterId = await characterStorage.saveCharacter(
          transformedData,
          jsonInput,
'Imported Character'
        );
        // Character saved to storage
      } catch (storageError) {
        console.error('Failed to save character to storage:', storageError);
        // Don't fail the import if storage fails
      }

      // Update loading message for marketplace data
      setLoadingMessage('Checking marketplace data...');

      // Use marketplace data from auto-loader (which handles freshness automatically)
      if (marketplaceAutoLoader.marketData) {
        // Using marketplace data from auto-loader
        onMarketDataLoaded(marketplaceAutoLoader.marketData);
      } else if (marketplaceAutoLoader.isLoading) {
        // Auto-loader is still loading marketplace data
        setLoadingMessage('Waiting for marketplace data to load...');

        // Wait a bit for auto-loader to finish
        const maxWaitTime = 10000; // 10 seconds
        const checkInterval = 500; // 0.5 seconds
        let waitedTime = 0;

        const waitForMarketData = () => {
          if (marketplaceAutoLoader.marketData) {
            // Marketplace data loaded by auto-loader
            onMarketDataLoaded(marketplaceAutoLoader.marketData);
          } else if (waitedTime < maxWaitTime && marketplaceAutoLoader.isLoading) {
            waitedTime += checkInterval;
            setTimeout(waitForMarketData, checkInterval);
          } else {
            // Auto-loader did not provide marketplace data in time
            setError('Character imported successfully, but marketplace data is still loading');
          }
        };

        setTimeout(waitForMarketData, checkInterval);
      } else if (marketplaceAutoLoader.error) {
        console.error('Auto-loader failed to load marketplace data:', marketplaceAutoLoader.error);
        setError('Character imported successfully, but failed to load marketplace data');
      }

      // Character and marketplace loading is done - clear primary loading
      setIsLoading(false);

      // Load combat items (check storage first, then use constants)
      if (onCombatItemsLoaded) {
        setLoadingMessage('Loading combat items...');
        // Loading combat items...

        // Check if we have combat items in storage
        if (combatItemsStorage.combatItems) {
          // Using combat items from storage
          onCombatItemsLoaded(combatItemsStorage.combatItems.data);
        } else {
          // Use constants and save to storage
          // Loading combat items from constants
          onCombatItemsLoaded(COMBAT_ITEMS);

          // Save to storage for future use
          try {
            const combatId = await combatItemsStorage.saveCombatItems(COMBAT_ITEMS, 'constants');
            // Combat items saved to storage
          } catch (storageError) {
            console.error('Failed to save combat items to storage:', storageError);
          }
        }

        // Combat items loaded successfully

        // Combat items loading is complete - clear secondary loading
        setIsLoadingCombatItems(false);
        setLoadingMessage('');
      } else {
        // No combat items loading callback provided
        setIsLoadingCombatItems(false);
        setLoadingMessage('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse character data');
      // Clear all loading states on main error
      setIsLoading(false);
      setIsLoadingCombatItems(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className={`p-8`}>
      <div className="space-y-6">
        {/* Stored Characters Section - moved to top */}
        {characterStorage.characters.length > 0 && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-green-200 mb-4">📂 Stored Characters</h3>
            <div className="space-y-3">
              {characterStorage.characters.slice(0, 5).map((storedChar) => (
                <div
                  key={storedChar.id}
                  className="bg-black/20 rounded-lg p-3 border border-green-500/30 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{storedChar.name}</p>
                    <p className="text-green-300 text-sm">
                      Saved: {new Date(storedChar.timestamp).toLocaleDateString()} {new Date(storedChar.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-green-400 text-xs">
                      Last accessed: {new Date(storedChar.lastAccessed).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          setImportedCharacter(storedChar.data);
                          onCharacterImported(storedChar.data, storedChar.rawData);
                          // Loaded character from storage
                        } catch (err) {
                          console.error('Failed to load character from storage:', err);
                          setError('Failed to load character from storage');
                        }
                      }}
                      disabled={isLoading || isLoadingCombatItems}
                      className="bg-green-600/20 border border-green-500/50 rounded px-3 py-1 text-green-200 hover:bg-green-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Load
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete "${storedChar.name}"? This action cannot be undone.`)) {
                          try {
                            const success = await characterStorage.deleteCharacter(storedChar.id);
                            if (success) {
                              // Deleted character from storage
                            } else {
                              setError('Failed to delete character from storage');
                            }
                          } catch (err) {
                            console.error('Failed to delete character from storage:', err);
                            setError('Failed to delete character from storage');
                          }
                        }
                      }}
                      disabled={isLoading || isLoadingCombatItems}
                      className="bg-red-600/20 border border-red-500/50 rounded px-3 py-1 text-red-200 hover:bg-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      title="Delete this character"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {characterStorage.characters.length > 5 && (
                <p className="text-green-300 text-sm text-center">
                  ... and {characterStorage.characters.length - 5} more characters
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className={`block ${theme.textColor} text-2xl text-center mb-2`}>
            Paste your character JSON export:
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className={`w-full h-64 p-4 ${theme.inputBackground} border ${theme.inputBorder} rounded-lg ${theme.textColor} placeholder-gray-400 font-mono text-sm resize-none`}
            placeholder='{"player":{"defenseLevel":109,"magicLevel":21,...}}'
          />
        </div>

        {/* Spooling effect for loading (both character import and combat items) */}
        {(isLoading || isLoadingCombatItems) && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-200 font-medium">{loadingMessage}</span>
              </div>
            </div>
            <div className="mt-2 text-blue-300 text-sm">
              Please wait while we process your character and load combat items...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200">Error: {error}</p>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!jsonInput.trim() || isLoading || isLoadingCombatItems}
          className={`text-white px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.mode === 'dark' ? '' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'}`}
          style={theme.mode === 'dark' ? {
            background: 'linear-gradient(to right, #B50008, #E8000A)'
          } : {}}
        >
          {(isLoading || isLoadingCombatItems) ? 'Processing...' : 'Import Character'}
        </button>


        {importedCharacter && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-200 mb-4">Character Imported Successfully!</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-2">Combat Stats:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Attack:</span>
                    <span className="text-white">{importedCharacter.combat.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Defense:</span>
                    <span className="text-white">{importedCharacter.combat.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ranged:</span>
                    <span className="text-white">{importedCharacter.combat.ranged}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Magic:</span>
                    <span className="text-white">{importedCharacter.combat.magic}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Equipment Slots:</h4>
                <div className="text-sm text-gray-300">
                  {Object.keys(importedCharacter.equipment).length} items equipped
                </div>
                <div className="text-sm text-gray-300">
                  {importedCharacter.abilities.length} abilities configured
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}