'use client';

import { useState, useEffect } from 'react';
import { CharacterImport } from '@/components/CharacterImport';
import { MarketplaceAnalyzer } from '@/components/MarketplaceAnalyzer';
import { Logo } from '@/components/Logo';
import { Navigation, NavigationTab } from '@/components/Navigation';
import { TabContent } from '@/components/TabContent';
import { CharacterStats } from '@/types/character';
import { MarketData, UpgradeOpportunity } from '@/types/marketplace';
import { CombatSlotItems } from '@/constants/combatItems';
import { useMarketplaceAutoLoader } from '@/hooks/useMarketplaceAutoLoader';

export default function Home() {
  const [character, setCharacter] = useState<CharacterStats | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [rawCharacterData, setRawCharacterData] = useState<string | null>(null);
  const [combatItems, setCombatItems] = useState<CombatSlotItems | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('import-character');
  const [upgrades, setUpgrades] = useState<UpgradeOpportunity[]>([]);

  // Auto-loader for marketplace data
  const marketplaceAutoLoader = useMarketplaceAutoLoader();

  // Sync auto-loader data with local state
  useEffect(() => {
    if (marketplaceAutoLoader.marketData) {
      console.log('🔄 APP: Syncing marketplace data from auto-loader');
      setMarketData(marketplaceAutoLoader.marketData);
    }
  }, [marketplaceAutoLoader.marketData]);

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

      {/* Marketplace status indicator */}
      <div className="w-full bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                marketplaceAutoLoader.getStatusColor() === 'green' ? 'bg-green-400' :
                marketplaceAutoLoader.getStatusColor() === 'yellow' ? 'bg-yellow-400' :
                marketplaceAutoLoader.getStatusColor() === 'blue' ? 'bg-blue-400' :
                marketplaceAutoLoader.getStatusColor() === 'red' ? 'bg-red-400' :
                'bg-gray-400'
              } ${marketplaceAutoLoader.isLoading || marketplaceAutoLoader.isRefreshing ? 'animate-pulse' : ''}`}></div>
              <span className="text-white text-sm">
                {marketplaceAutoLoader.getStatusText()}
              </span>
              {marketplaceAutoLoader.dataAge !== null && (
                <span className="text-gray-400 text-xs">
                  (Age: {marketplaceAutoLoader.dataAge.toFixed(1)}h)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {marketplaceAutoLoader.needsRefresh && !marketplaceAutoLoader.isRefreshing && (
                <button
                  onClick={marketplaceAutoLoader.forceRefresh}
                  className="px-3 py-1 text-xs bg-yellow-600/20 border border-yellow-500/50 rounded text-yellow-200 hover:bg-yellow-600/30 transition-colors"
                >
                  Refresh
                </button>
              )}

              {marketplaceAutoLoader.marketData && (
                <span className="text-gray-300 text-xs">
                  {marketplaceAutoLoader.marketData.totalItems} items
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

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
