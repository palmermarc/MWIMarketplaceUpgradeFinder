'use client';

import { useState, useEffect } from 'react';
import { CharacterData, CharacterStats } from '@/types/character';
import { MarketData } from '@/types/marketplace';
import { MarketplaceService } from '@/services/marketplace';
import { COMBAT_ITEMS } from '@/constants/combatItems';
import { useCharacterStorage, useMarketplaceStorage, useCombatItemsStorage } from '@/hooks/useBrowserStorage';
import { useMarketplaceAutoLoader } from '@/hooks/useMarketplaceAutoLoader';

interface CharacterImportProps {
  onCharacterImported: (character: CharacterStats, rawData?: string) => void;
  onMarketDataLoaded: (data: MarketData) => void;
  onCombatItemsLoaded?: (combatItems: { [slot: string]: { [itemHrid: string]: string } }) => void;
}

export function CharacterImport({ onCharacterImported, onMarketDataLoaded, onCombatItemsLoaded }: CharacterImportProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCharacter, setImportedCharacter] = useState<CharacterStats | null>(null);
  const [isLoadingCombatItems, setIsLoadingCombatItems] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [useStoredData, setUseStoredData] = useState(false);

  // Storage hooks
  const characterStorage = useCharacterStorage();
  const marketplaceStorage = useMarketplaceStorage();
  const combatItemsStorage = useCombatItemsStorage();

  // Auto-loader for marketplace data
  const marketplaceAutoLoader = useMarketplaceAutoLoader();

  // Check for existing data on mount
  useEffect(() => {
    const checkExistingData = async () => {
      // Use marketplace data from auto-loader (which handles freshness automatically)
      if (marketplaceAutoLoader.marketData) {
        console.log('Found marketplace data from auto-loader');
        onMarketDataLoaded(marketplaceAutoLoader.marketData);
      }

      // Check if we have combat items data
      if (combatItemsStorage.combatItems && onCombatItemsLoaded) {
        console.log('Found combat items data in storage');
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
        console.log(`Character saved to storage with ID: ${characterId}`);
      } catch (storageError) {
        console.error('Failed to save character to storage:', storageError);
        // Don't fail the import if storage fails
      }

      // Update loading message for marketplace data
      setLoadingMessage('Checking marketplace data...');

      // Use marketplace data from auto-loader (which handles freshness automatically)
      if (marketplaceAutoLoader.marketData) {
        console.log('Using marketplace data from auto-loader');
        onMarketDataLoaded(marketplaceAutoLoader.marketData);
      } else if (marketplaceAutoLoader.isLoading) {
        console.log('Auto-loader is still loading marketplace data');
        setLoadingMessage('Waiting for marketplace data to load...');

        // Wait a bit for auto-loader to finish
        const maxWaitTime = 10000; // 10 seconds
        const checkInterval = 500; // 0.5 seconds
        let waitedTime = 0;

        const waitForMarketData = () => {
          if (marketplaceAutoLoader.marketData) {
            console.log('Marketplace data loaded by auto-loader');
            onMarketDataLoaded(marketplaceAutoLoader.marketData);
          } else if (waitedTime < maxWaitTime && marketplaceAutoLoader.isLoading) {
            waitedTime += checkInterval;
            setTimeout(waitForMarketData, checkInterval);
          } else {
            console.warn('Auto-loader did not provide marketplace data in time');
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
        console.log('🔧 CHARACTER IMPORT: Loading combat items...');

        // Check if we have combat items in storage
        if (combatItemsStorage.combatItems) {
          console.log('Using combat items from storage');
          onCombatItemsLoaded(combatItemsStorage.combatItems.data);
        } else {
          // Use constants and save to storage
          console.log('Loading combat items from constants');
          onCombatItemsLoaded(COMBAT_ITEMS);

          // Save to storage for future use
          try {
            const combatId = await combatItemsStorage.saveCombatItems(COMBAT_ITEMS, 'constants');
            console.log(`Combat items saved to storage with ID: ${combatId}`);
          } catch (storageError) {
            console.error('Failed to save combat items to storage:', storageError);
          }
        }

        console.log('✅ CHARACTER IMPORT: Combat items loaded successfully');

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
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
     
      <div className="space-y-6">
        <div>
          <label className="block text-white text-center mb-2">
            Paste your character JSON export:
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-64 p-4 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 font-mono text-sm resize-none"
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
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {(isLoading || isLoadingCombatItems) ? 'Processing...' : 'Import Character'}
        </button>

        {/* Stored Characters Section */}
        {characterStorage.characters.length > 0 && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-200 mb-4">📂 Stored Characters</h3>
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
                  <button
                    onClick={async () => {
                      try {
                        setImportedCharacter(storedChar.data);
                        onCharacterImported(storedChar.data, storedChar.rawData);
                        console.log(`Loaded character from storage: ${storedChar.name}`);
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

        {/* Storage Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Marketplace Data Status */}
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <h4 className="text-blue-200 font-medium mb-2">🏪 Marketplace Data</h4>
            {marketplaceAutoLoader.marketData ? (
              <div className="space-y-1">
                <p className="text-blue-300 text-sm">
                  {marketplaceAutoLoader.getStatusText()}
                </p>
                <p className="text-blue-400 text-xs">
                  {marketplaceAutoLoader.isFresh ? '✅ Fresh' : '⚠️ Stale (will refresh automatically)'}
                </p>
                <p className="text-blue-400 text-xs">
                  {marketplaceAutoLoader.marketData.totalItems} items
                </p>
                {marketplaceAutoLoader.dataAge && (
                  <p className="text-blue-500 text-xs">
                    Age: {marketplaceAutoLoader.dataAge.toFixed(1)} hours
                  </p>
                )}
              </div>
            ) : marketplaceAutoLoader.isLoading ? (
              <div className="space-y-1">
                <p className="text-blue-300 text-sm">Loading marketplace data...</p>
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : marketplaceAutoLoader.error ? (
              <div className="space-y-1">
                <p className="text-red-300 text-sm">Error loading data</p>
                <p className="text-red-400 text-xs">{marketplaceAutoLoader.error}</p>
              </div>
            ) : (
              <p className="text-blue-300 text-sm">Initializing...</p>
            )}
          </div>

          {/* Combat Items Status */}
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
            <h4 className="text-purple-200 font-medium mb-2">⚔️ Combat Items</h4>
            {combatItemsStorage.combatItems ? (
              <div className="space-y-1">
                <p className="text-purple-300 text-sm">
                  Last updated: {new Date(combatItemsStorage.combatItems.timestamp).toLocaleDateString()}
                </p>
                <p className="text-purple-400 text-xs">
                  Source: {combatItemsStorage.combatItems.source}
                </p>
                <p className="text-purple-400 text-xs">
                  {Object.keys(combatItemsStorage.combatItems.data).length} equipment slots
                </p>
              </div>
            ) : (
              <p className="text-purple-300 text-sm">No stored data</p>
            )}
          </div>

          {/* Storage Stats */}
          <div className="bg-gray-500/20 border border-gray-500/50 rounded-lg p-4">
            <h4 className="text-gray-200 font-medium mb-2">💾 Storage</h4>
            <div className="space-y-1">
              <p className="text-gray-300 text-sm">
                Characters: {characterStorage.characters.length}
              </p>
              <p className="text-gray-400 text-xs">
                Total stored items: {characterStorage.characters.length + (marketplaceStorage.marketData ? 1 : 0) + (combatItemsStorage.combatItems ? 1 : 0)}
              </p>
            </div>
          </div>
        </div>

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