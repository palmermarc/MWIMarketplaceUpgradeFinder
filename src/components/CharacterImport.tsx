'use client';

import { useState } from 'react';
import { CharacterData, CharacterStats } from '@/types/character';
import { MarketData } from '@/types/marketplace';
import { MarketplaceService } from '@/services/marketplace';

interface CharacterImportProps {
  onCharacterImported: (character: CharacterStats) => void;
  onMarketDataLoaded: (data: MarketData) => void;
}

export function CharacterImport({ onCharacterImported, onMarketDataLoaded }: CharacterImportProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCharacter, setImportedCharacter] = useState<CharacterStats | null>(null);

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
    };
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const characterData: CharacterData = JSON.parse(jsonInput);

      if (!characterData.player || typeof characterData.player.attackLevel !== 'number') {
        throw new Error('Invalid character data format');
      }

      const transformedData = transformCharacterData(characterData);
      setImportedCharacter(transformedData);
      onCharacterImported(transformedData);

      // Auto-load marketplace data
      try {
        const marketData = await MarketplaceService.getMarketplaceData();
        onMarketDataLoaded(marketData);
      } catch (marketError) {
        console.error('Failed to load marketplace data:', marketError);
        setError('Character imported successfully, but failed to load marketplace data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse character data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Import Character Data</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2">
            Paste your character JSON export:
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-64 p-4 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 font-mono text-sm resize-none"
            placeholder='{"player":{"defenseLevel":109,"magicLevel":21,...}}'
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200">Error: {error}</p>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!jsonInput.trim() || isLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
{isLoading ? 'Importing & Loading Market Data...' : 'Import Character'}
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