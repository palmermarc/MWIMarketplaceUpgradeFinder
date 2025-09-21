'use client';

import { useState } from 'react';
import { CharacterData, CharacterStats } from '@/types/character';
import { MarketData } from '@/types/marketplace';
import { MarketplaceService } from '@/services/marketplace';
import { COMBAT_ITEMS } from '@/constants/combatItems';

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

      // Update loading message for marketplace data
      setLoadingMessage('Loading marketplace data...');

      // Auto-load marketplace data
      try {
        const marketData = await MarketplaceService.getMarketplaceData();
        onMarketDataLoaded(marketData);
      } catch (marketError) {
        console.error('Failed to load marketplace data:', marketError);
        setError('Character imported successfully, but failed to load marketplace data');
      }

      // Character and marketplace loading is done - clear primary loading
      setIsLoading(false);

      // Load combat items from constants (this continues independently)
      if (onCombatItemsLoaded) {
        setLoadingMessage('Loading combat items from constants...');
        console.log('🔧 CHARACTER IMPORT: Loading combat items from constants...');

        // Use the constant instead of API call
        onCombatItemsLoaded(COMBAT_ITEMS);

        console.log('✅ CHARACTER IMPORT: Combat items loaded from constants successfully');
        console.log('📊 Calling onCombatItemsLoaded with constant data...');
        console.log('🎉 CHARACTER IMPORT: Combat items successfully passed to parent component');

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