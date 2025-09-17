'use client';

import { useState } from 'react';
import { CharacterImport } from '@/components/CharacterImport';
import { MarketplaceAnalyzer } from '@/components/MarketplaceAnalyzer';
import { CharacterStats } from '@/types/character';
import { MarketData } from '@/types/marketplace';

export default function Home() {
  const [character, setCharacter] = useState<CharacterStats | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  const handleCharacterImported = (characterData: CharacterStats) => {
    setCharacter(characterData);
  };

  const handleMarketDataLoaded = (data: MarketData) => {
    setMarketData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Milky Way Idle Marketplace Upgrade Finder
          </h1>
          <p className="text-blue-200">
            Import your character and find upgrade opportunities from the marketplace
          </p>
        </header>

        <main className="max-w-4xl mx-auto space-y-8">
          <CharacterImport
            onCharacterImported={handleCharacterImported}
            onMarketDataLoaded={handleMarketDataLoaded}
          />

          {character && marketData && (
            <MarketplaceAnalyzer
              character={character}
              marketData={marketData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
