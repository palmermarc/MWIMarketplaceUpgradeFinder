'use client';

import { useState, useEffect } from 'react';
import { MarketplaceAnalyzer } from '@/components/MarketplaceAnalyzer';
import { Navigation, NavigationTab } from '@/components/Navigation';
import { TabContent } from '@/components/TabContent';
import { CharacterStats } from '@/types/character';
import { MarketData, UpgradeOpportunity } from '@/types/marketplace';
import { CombatSlotItems } from '@/constants/combatItems';
import { useMarketplaceAutoLoader } from '@/hooks/useMarketplaceAutoLoader';
import { useCharacterAutoLoader } from '@/hooks/useCharacterAutoLoader';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const { theme } = useTheme();
  const [character, setCharacter] = useState<CharacterStats | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [rawCharacterData, setRawCharacterData] = useState<string | null>(null);
  const [combatItems, setCombatItems] = useState<CombatSlotItems | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('import-character');
  const [upgrades, setUpgrades] = useState<UpgradeOpportunity[]>([]);

  // Auto-loaders for marketplace and character data
  const marketplaceAutoLoader = useMarketplaceAutoLoader();
  const characterAutoLoader = useCharacterAutoLoader();

  // Sync auto-loader data with local state
  useEffect(() => {
    if (marketplaceAutoLoader.marketData) {
      // Syncing marketplace data from auto-loader
      setMarketData(marketplaceAutoLoader.marketData);
    }
  }, [marketplaceAutoLoader.marketData]);

  // Sync character auto-loader data (no navigation - keep user on their chosen page)
  useEffect(() => {
    if (characterAutoLoader.character) {
      // Auto-loading character from storage
      setCharacter(characterAutoLoader.character);
      setRawCharacterData(characterAutoLoader.rawCharacterData);
      // Keeping user on current tab
    }
  }, [characterAutoLoader.character, characterAutoLoader.characterName, characterAutoLoader.rawCharacterData, activeTab]);

  const handleCharacterImported = (characterData: CharacterStats, rawData?: string) => {
    // Manual character import completed, navigating to find-upgrades
    setCharacter(characterData);
    setRawCharacterData(rawData || null);

    // Navigate to Find Upgrades after manual import
    setActiveTab('find-upgrades');
  };

  const handleMarketDataLoaded = (data: MarketData) => {
    setMarketData(data);
  };

  const handleUpgradesFound = (upgradeData: UpgradeOpportunity[]) => {
    setUpgrades(upgradeData);
  };

  const handleCombatItemsLoaded = (items: CombatSlotItems) => {
    setCombatItems(items);
  };

  // Handle manual tab navigation by user
  const handleTabChange = (tab: NavigationTab) => {
    // User manually navigated to tab
    setActiveTab(tab);
  };

  return (
    <div
      className={`min-h-screen w-full ${theme.mode !== 'classic' ? theme.backgroundColor : ''}`}
      style={theme.mode === 'classic' ? {
        background: 'linear-gradient(180deg,var(--color-midnight-900-opacity-25),var(--color-midnight-500-opacity-25) 8%,var(--color-midnight-500-opacity-25))'
      } : {}}
    >
      {/* Header navigation always visible */}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Marketplace status indicator */}
      <div className={`w-full ${theme.mode === 'classic' ? 'bg-black/20 border-b' : theme.mode === 'dark' ? 'border-b' : `${theme.cardBackground} border-b ${theme.borderColor}`}`} style={theme.mode === 'classic' ? { borderBottomColor: '#98a7e9' } : theme.mode === 'dark' ? { backgroundColor: '#556b2f', borderBottomColor: '#E8000A' } : {}}>
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
              <span className={`${theme.textColor} text-sm`}>
                {marketplaceAutoLoader.getStatusText()}
              </span>
              {marketplaceAutoLoader.dataAge !== null && (
                <span className={`${theme.mode === 'light' ? 'text-gray-600' : 'text-gray-400'} text-xs`}>
                  (Age: {marketplaceAutoLoader.dataAge.toFixed(1)}h)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {marketplaceAutoLoader.needsRefresh && !marketplaceAutoLoader.isRefreshing && (
                <button
                  onClick={marketplaceAutoLoader.forceRefresh}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    theme.mode === 'dark'
                      ? 'text-white hover:bg-orange-700/30'
                      : 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-200 hover:bg-yellow-600/30'
                  }`}
                  style={theme.mode === 'dark' ? {
                    backgroundColor: '#e05a3e',
                    border: '1px solid #e05a3e',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
                  } : {}}
                >
                  Refresh
                </button>
              )}

              {marketplaceAutoLoader.marketData && (
                <span className={`${theme.mode === 'light' ? 'text-gray-700' : 'text-gray-300'} text-xs`}>
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
