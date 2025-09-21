'use client';

import { useState } from 'react';
import { CharacterImport } from '@/components/CharacterImport';
import { MarketplaceAnalyzer } from '@/components/MarketplaceAnalyzer';
import { Logo } from '@/components/Logo';
import { Navigation, NavigationTab } from '@/components/Navigation';
import { TabContent } from '@/components/TabContent';
import { CharacterStats } from '@/types/character';
import { MarketData, UpgradeOpportunity } from '@/types/marketplace';
import { CombatSlotItems } from '@/constants/combatItems';

export default function Home() {
  const [character, setCharacter] = useState<CharacterStats | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [rawCharacterData, setRawCharacterData] = useState<string | null>(null);
  const [combatItems, setCombatItems] = useState<CombatSlotItems | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('import-character');
  const [upgrades, setUpgrades] = useState<UpgradeOpportunity[]>([]);

  const handleCharacterImported = (characterData: CharacterStats, rawData?: string) => {
    setCharacter(characterData);
    setRawCharacterData(rawData || null);
  };

  const handleMarketDataLoaded = (data: MarketData) => {
    setMarketData(data);
  };

  const handleUpgradesFound = (upgradeData: UpgradeOpportunity[]) => {
    setUpgrades(upgradeData);
  };

  const handleCombatItemsLoaded = (items: CombatSlotItems) => {
    setCombatItems(items);
    console.log('🎯 MAIN PAGE: Combat items loaded and stored in state');

    // Log comprehensive breakdown for verification
    console.log('🔍 COMBAT ITEMS BREAKDOWN:');
    Object.entries(items).forEach(([slot, slotItems]) => {
      console.log(`  ${slot.toUpperCase()}: ${Object.keys(slotItems).length} items`);

      // Log first few items as examples
      const itemEntries = Object.entries(slotItems);
      const samplesToShow = Math.min(3, itemEntries.length);
      for (let i = 0; i < samplesToShow; i++) {
        const [itemHrid, itemName] = itemEntries[i];
        console.log(`    - ${itemHrid} → "${itemName}"`);
      }
      if (itemEntries.length > samplesToShow) {
        console.log(`    ... and ${itemEntries.length - samplesToShow} more`);
      }
    });

    const totalItems = Object.values(items).reduce((sum, slotItems) => sum + Object.keys(slotItems).length, 0);
    console.log(`📊 TOTAL: ${totalItems} items across ${Object.keys(items).length} slots stored in app state`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header navigation always visible */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Hidden MarketplaceAnalyzer to get upgrade data - only when we have character and market data */}
      {character && marketData && (
        <div style={{ display: 'none' }}>
          <MarketplaceAnalyzer
            character={character}
            marketData={marketData}
            rawCharacterData={rawCharacterData}
            combatItems={combatItems}
            onUpgradesFound={handleUpgradesFound}
          />
        </div>
      )}

      {/* Main content */}
      <main className="w-full max-w-none">
        <TabContent
          activeTab={activeTab}
          character={character}
          marketData={marketData}
          rawCharacterData={rawCharacterData}
          upgrades={upgrades}
          onCharacterImported={handleCharacterImported}
          onMarketDataLoaded={handleMarketDataLoaded}
          onCombatItemsLoaded={handleCombatItemsLoaded}
        />
      </main>
    </div>
  );
}
