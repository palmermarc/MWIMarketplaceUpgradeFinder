'use client';

import { NavigationTab } from './Navigation';
import { CharacterStats } from '@/types/character';
import { MarketData, UpgradeOpportunity } from '@/types/marketplace';
import { CombatSlotItems } from '@/constants/combatItems';
import { CombatUpgradeAnalysisIframe } from './CombatUpgradeAnalysisIframe';
import { CharacterImport } from './CharacterImport';
import { CalculateCosts } from './CalculateCosts';

interface TabContentProps {
  activeTab: NavigationTab;
  character?: CharacterStats | null;
  marketData?: MarketData | null;
  rawCharacterData?: string | null;
  upgrades: UpgradeOpportunity[];
  onCharacterImported?: (character: CharacterStats, rawData?: string) => void;
  onMarketDataLoaded?: (data: MarketData) => void;
  onCombatItemsLoaded?: (items: CombatSlotItems) => void;
}

export function TabContent({
  activeTab,
  character,
  marketData,
  rawCharacterData,
  upgrades,
  onCharacterImported,
  onMarketDataLoaded,
  onCombatItemsLoaded
}: TabContentProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'import-character':
        return (
          <div className="w-full">
            <div className="max-w-4xl mx-auto">
              <CharacterImport
                onCharacterImported={onCharacterImported || (() => {})}
                onMarketDataLoaded={onMarketDataLoaded || (() => {})}
                onCombatItemsLoaded={onCombatItemsLoaded}
              />
            </div>
          </div>
        );

      case 'find-upgrades':
        if (!character) {
          return (
            <div className="w-full">
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-200 mb-2">Character Required</h3>
                <p className="text-yellow-100">
                  Please import your character data first using the &quot;Import Character&quot; tab.
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">⚔️ Combat Simulations</h2>
              <p className="text-blue-200">
                Configure your equipment, houses, and abilities to simulate different combat scenarios.
              </p>
            </div>
            <CombatUpgradeAnalysisIframe
              character={character}
              upgrades={upgrades}
              rawCharacterData={rawCharacterData}
            />
          </div>
        );

      case 'quick-upgrades':
        if (!character || !marketData) {
          return (
            <div className="w-full">
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-200 mb-2">Character Required</h3>
                <p className="text-yellow-100">
                  Please import your character data first using the &quot;Import Character&quot; tab.
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">⚡ Quick Upgrades</h2>
              <p className="text-blue-200">
                Marketplace upgrade opportunities based on cost per enhancement level. These suggestions prioritize cost efficiency and do not consider profit calculations or item value analysis.
              </p>
            </div>

            {upgrades.length > 0 ? (
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6">
                <div className="space-y-3">
                  {upgrades.map((upgrade, index) => (
                    <div key={index} className="bg-black/20 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-1">
                            <p className="text-white font-medium">{upgrade.currentItem.slot}</p>
                            <p className="text-gray-300 text-sm">
                              {upgrade.currentItem.itemName} +{upgrade.currentItem.enhancementLevel} → {upgrade.suggestedUpgrade.itemName} +{upgrade.suggestedUpgrade.enhancementLevel}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              Cost efficiency: {upgrade.costEfficiency.toFixed(0).toLocaleString()} coins/level
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-300 font-medium">{upgrade.suggestedUpgrade.price.toLocaleString()} coins</p>
                          <p className="text-gray-400 text-sm">+{upgrade.suggestedUpgrade.improvement.increase} levels</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-500/20 border border-gray-500/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-2">No Upgrades Found</h3>
                <p className="text-gray-400">
                  No upgrade opportunities were found in the current marketplace data for your character&apos;s equipment.
                </p>
              </div>
            )}
          </div>
        );

      case 'marketplace-analysis':
        if (!marketData) {
          return (
            <div className="w-full">
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-200 mb-2">Marketplace Data Required</h3>
                <p className="text-yellow-100">
                  Please import your character data first using the &quot;Import Character&quot; tab to load marketplace information.
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">📊 Marketplace Analysis</h2>
              <p className="text-blue-200">
                Detailed analysis of marketplace data and pricing trends.
              </p>
            </div>

            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-200 mb-4">Market Data Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Total Items:</span>
                  <span className="text-white ml-2">{marketData.totalItems}</span>
                </div>
                <div>
                  <span className="text-gray-300">Last Updated:</span>
                  <span className="text-white ml-2">{new Date(marketData.lastUpdated).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-300">Upgrade Opportunities:</span>
                  <span className="text-white ml-2">{upgrades.length}</span>
                </div>
              </div>
            </div>

            {/* Additional marketplace analysis content can be added here */}
            <div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
              <h4 className="text-md font-bold text-blue-200 mb-3">Price Analysis</h4>
              <p className="text-blue-100 text-sm">
                Detailed price analysis and market trends will be displayed here in future updates.
              </p>
            </div>
          </div>
        );

      case 'calculate-costs':
        if (!character) {
          return (
            <div className="w-full">
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-200 mb-2">Character Required</h3>
                <p className="text-yellow-100">
                  Please import your character data first using the &quot;Import Character&quot; tab.
                </p>
              </div>
            </div>
          );
        }
        return <CalculateCosts character={character} marketData={marketData} />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full px-6 py-8">
      {renderTabContent()}
    </div>
  );
}