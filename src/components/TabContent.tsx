'use client';

import { NavigationTab } from './Navigation';
import { CharacterStats } from '@/types/character';
import { MarketData, UpgradeOpportunity } from '@/types/marketplace';
import { CombatSlotItems } from '@/constants/combatItems';
import { CombatUpgradeAnalysisIframe } from './CombatUpgradeAnalysisIframe';
import { CharacterImport } from './CharacterImport';
import { CalculateCosts } from './CalculateCosts';
import { SkillsLevelingCalculator } from './SkillsLevelingCalculator';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'import-character':
        return (
          <div className="w-full">
            {/* Welcome Introduction */}
              <div className={`max-w-7xl mx-auto p-8`}>
                <h1 className={`text-4xl font-bold text-center mb-6 ${theme.textColor}`}>
                  Welcome to the Milky Way Idle Companion Tool
                </h1>

                <p className={`text-lg text-center mb-8 ${theme.textColor} max-w-4xl mx-auto leading-relaxed opacity-90`}>
                  Take your Milky Way Idle experience to the next level with this all-in-one companion app designed to save you time and optimize your progression.
                </p>

                <p className={`text-lg mb-6 ${theme.textColor} max-w-4xl mx-auto opacity-85`}>
                  Import your character directly from the game and instantly access a powerful suite of tools built to streamline your journey:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                  <div className={`p-5 rounded-lg ${theme.cardBackground} ${theme.borderColor} border`}>
                    <h3 className={`text-2xl font-semibold mb-2 ${theme.textColor}`}>
                      Combat Simulation
                    </h3>
                    <p className={`text-base ${theme.textColor} opacity-80 leading-relaxed`}>
                      Test bulk item changes and evaluate upgrade potential without manually running each fight. Skip the spreadsheets—get clear results in seconds.
                    </p>
                  </div>

                  <div className={`p-5 rounded-lg ${theme.cardBackground} ${theme.borderColor} border`}>
                    <h3 className={`text-2xl font-semibold mb-2 ${theme.textColor}`}>
                      Abilities Calculator
                    </h3>
                    <p className={`text-base ${theme.textColor} opacity-80 leading-relaxed`}>
                      Find out exactly how many ability books you&apos;ll need and estimate the total cost to reach your desired ability level.
                    </p>
                  </div>

                  <div className={`p-5 rounded-lg ${theme.cardBackground} ${theme.borderColor} border`}>
                    <h3 className={`text-2xl font-semibold mb-2 ${theme.textColor}`}>
                      Skills Leveling Planner
                    </h3>
                    <p className={`text-base ${theme.textColor} opacity-80 leading-relaxed`}>
                      Enter your current and target skill levels to generate the most time-efficient strategy for leveling up—so you can plan smarter and play more efficiently.
                    </p>
                  </div>
                </div>

                <p className={`text-lg text-center ${theme.textColor} max-w-4xl mx-auto leading-relaxed opacity-85`}>
                  Whether you&apos;re fine-tuning your loadout or mapping out your long-term skill goals, this tool helps you make data-driven decisions and get the most out of every minute in-game.
                </p>
              </div>

            {/* Character Import Section */}
            <div className="max-w-7xl mx-auto">
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
              <div className={`rounded-lg p-6 ${theme.mode === 'dark' ? 'border' : 'bg-yellow-500/20 border border-yellow-500/50'}`} style={theme.mode === 'dark' ? { backgroundColor: 'rgba(55, 65, 81, 0.3)', borderColor: 'rgba(181, 0, 8, 0.5)' } : {}}>
                <h3 className={`text-2xl font-bold mb-2 ${theme.mode === 'dark' ? 'text-gray-200' : 'text-yellow-200'}`}>Character Required</h3>
                <p className={`${theme.mode === 'dark' ? 'text-gray-300' : 'text-yellow-100'}`}>
                  Please import your character data first using the &quot;Import Character&quot; tab.
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${theme.textColor} mb-2`}>⚔️ Combat Simulations</h2>
              <p className={`${theme.mode === 'light' ? 'text-gray-600' : 'text-blue-200'}`}>
                Configure your equipment, houses, and abilities to simulate different combat scenarios.
              </p>
            </div>
            <CombatUpgradeAnalysisIframe
              character={character}
              rawCharacterData={rawCharacterData}
            />
          </div>
        );

      case 'quick-upgrades':
        if (!character || !marketData) {
          return (
            <div className="w-full">
              <div className={`rounded-lg p-6 ${theme.mode === 'dark' ? 'border' : 'bg-yellow-500/20 border border-yellow-500/50'}`} style={theme.mode === 'dark' ? { backgroundColor: 'rgba(55, 65, 81, 0.3)', borderColor: 'rgba(181, 0, 8, 0.5)' } : {}}>
                <h3 className={`text-2xl font-bold mb-2 ${theme.mode === 'dark' ? 'text-gray-200' : 'text-yellow-200'}`}>Character Required</h3>
                <p className={`${theme.mode === 'dark' ? 'text-gray-300' : 'text-yellow-100'}`}>
                  Please import your character data first using the &quot;Import Character&quot; tab.
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${theme.textColor} mb-2`}>⚡ Quick Upgrades</h2>
              <p className={`${theme.mode === 'light' ? 'text-gray-600' : 'text-blue-200'}`}>
                Marketplace upgrade opportunities based on cost per enhancement level. These suggestions prioritize cost efficiency and do not consider profit calculations or item value analysis.
              </p>
            </div>

            {upgrades.length > 0 ? (
              <div className={`rounded-lg p-6 ${theme.mode === 'dark' ? 'border' : 'bg-blue-500/20 border border-blue-500/50'}`} style={theme.mode === 'dark' ? { backgroundColor: 'rgba(181, 0, 8, 0.2)', borderColor: 'rgba(181, 0, 8, 0.5)' } : {}}>
                <div className="space-y-3">
                  {upgrades.map((upgrade, index) => (
                    <div key={index} className="bg-black/20 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-1">
                            <p className={`${theme.textColor} font-medium`}>{upgrade.currentItem.slot}</p>
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
              <h2 className={`text-2xl font-bold ${theme.textColor} mb-2`}>📊 Marketplace Analysis</h2>
              <p className={`${theme.mode === 'light' ? 'text-gray-600' : 'text-blue-200'}`}>
                Detailed analysis of marketplace data and pricing trends.
              </p>
            </div>

            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-200 mb-4">Market Data Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Total Items:</span>
                  <span className={`${theme.textColor} ml-2`}>{marketData.totalItems}</span>
                </div>
                <div>
                  <span className="text-gray-300">Last Updated:</span>
                  <span className={`${theme.textColor} ml-2`}>{new Date(marketData.lastUpdated).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-300">Upgrade Opportunities:</span>
                  <span className={`${theme.textColor} ml-2`}>{upgrades.length}</span>
                </div>
              </div>
            </div>

            {/* Additional marketplace analysis content can be added here */}
            <div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
              <h4 className={`text-md font-bold ${theme.mode === 'light' ? 'text-gray-700' : 'text-blue-200'} mb-3`}>Price Analysis</h4>
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
              <div className={`rounded-lg p-6 ${theme.mode === 'dark' ? 'border' : 'bg-yellow-500/20 border border-yellow-500/50'}`} style={theme.mode === 'dark' ? { backgroundColor: 'rgba(55, 65, 81, 0.3)', borderColor: 'rgba(181, 0, 8, 0.5)' } : {}}>
                <h3 className={`text-lg font-bold mb-2 ${theme.mode === 'dark' ? 'text-gray-200' : 'text-yellow-200'}`}>Character Required</h3>
                <p className={`${theme.mode === 'dark' ? 'text-gray-300' : 'text-yellow-100'}`}>
                  Please import your character data first using the &quot;Import Character&quot; tab.
                </p>
              </div>
            </div>
          );
        }
        return <CalculateCosts character={character} marketData={marketData} />;

      case 'skills-calculator':
        return <SkillsLevelingCalculator />;

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