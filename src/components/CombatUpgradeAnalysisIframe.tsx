'use client';

import { useState, useEffect } from 'react';
import type { CombatUpgradeAnalysis } from '@/services/combatSimulatorIframe';
import { ItemClassificationService } from '@/services/itemClassification';
import { UpgradeOpportunity } from '@/types/marketplace';
import { CharacterStats } from '@/types/character';
import { ItemIcon } from './ItemIcon';

interface CombatUpgradeAnalysisProps {
  character: CharacterStats;
  upgrades: UpgradeOpportunity[];
}

export function CombatUpgradeAnalysisIframe({ character, upgrades }: CombatUpgradeAnalysisProps) {
  const [combatResults, setCombatResults] = useState<CombatUpgradeAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Filter to combat items only
  const combatUpgrades = ItemClassificationService.filterCombatUpgrades(upgrades);

  useEffect(() => {
    // Cleanup iframe when component unmounts
    return () => {
      // Dynamically import and cleanup
      import('@/services/combatSimulatorIframe').then(({ CombatSimulatorIframeService }) => {
        CombatSimulatorIframeService.cleanup();
      });
    };
  }, []);

  const runCombatAnalysis = async () => {
    if (combatUpgrades.length === 0) {
      setError('No combat upgrades found to analyze');
      return;
    }

    setIsAnalyzing(true);
    setIsInitializing(true);
    setError(null);
    setProgress({ current: 0, total: combatUpgrades.length });

    try {
      // Dynamically import the service
      const { CombatSimulatorIframeService } = await import('@/services/combatSimulatorIframe');

      // Initialize the iframe first
      setProgress({ current: 0, total: combatUpgrades.length + 1 });
      await CombatSimulatorIframeService.initialize();
      setIsInitializing(false);
      setProgress({ current: 1, total: combatUpgrades.length + 1 });

      // Analyze upgrades one by one with progress tracking
      const results: CombatUpgradeAnalysis[] = [];

      for (let i = 0; i < combatUpgrades.length; i++) {
        const upgrade = combatUpgrades[i];
        setProgress({ current: i + 1, total: combatUpgrades.length + 1 });

        try {
          // Run simulation for this specific upgrade
          const currentResults = await CombatSimulatorIframeService.runCombatSimulation(character);

          // Create equipment override with the upgrade
          const upgradedEquipment = { ...character.equipment };
          upgradedEquipment[upgrade.currentItem.slot] = {
            item: upgrade.suggestedUpgrade.itemName,
            enhancement: upgrade.suggestedUpgrade.enhancementLevel
          };

          const upgradedResults = await CombatSimulatorIframeService.runCombatSimulation(character, upgradedEquipment);

          // Calculate improvements
          const improvement = {
            killsPerHourIncrease: upgradedResults.killsPerHour - currentResults.killsPerHour,
            expPerHourIncrease: upgradedResults.expPerHour - currentResults.expPerHour,
            profitPerHourIncrease: upgradedResults.profitPerHour - currentResults.profitPerHour,
            percentageIncrease: currentResults.killsPerHour > 0
              ? ((upgradedResults.killsPerHour - currentResults.killsPerHour) / currentResults.killsPerHour) * 100
              : 0
          };

          results.push({
            ...upgrade,
            combatResults: {
              current: currentResults,
              upgraded: upgradedResults,
              improvement
            }
          });

          // Update results progressively
          setCombatResults([...results]);

        } catch (upgradeError) {
          console.error(`Failed to analyze upgrade for ${upgrade.currentItem.slot}:`, upgradeError);
          results.push({
            ...upgrade,
            combatResults: {
              current: { killsPerHour: 0, expPerHour: 0, profitPerHour: 0, zone: 'unknown', success: false },
              upgraded: { killsPerHour: 0, expPerHour: 0, profitPerHour: 0, zone: 'unknown', success: false },
              improvement: { killsPerHourIncrease: 0, expPerHourIncrease: 0, profitPerHourIncrease: 0, percentageIncrease: 0 }
            }
          });
        }
      }

      setProgress({ current: combatUpgrades.length + 1, total: combatUpgrades.length + 1 });
      setCombatResults(results);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze combat upgrades');
    } finally {
      setIsAnalyzing(false);
      setIsInitializing(false);
    }
  };

  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString();
  };

  const getImprovementColor = (value: number): string => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-purple-200">Combat Upgrade Analysis (Iframe)</h3>
        <button
          onClick={runCombatAnalysis}
          disabled={isAnalyzing || combatUpgrades.length === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isAnalyzing
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : combatUpgrades.length === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isAnalyzing ? 'Analyzing...' : `Analyze ${combatUpgrades.length} Combat Upgrades`}
        </button>
      </div>

      {combatUpgrades.length === 0 && (
        <div className="bg-gray-500/20 border border-gray-500/50 rounded-lg p-4">
          <p className="text-gray-300">No combat upgrades found. Only tools detected in current upgrades.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-black/20 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300">
              {isInitializing ? 'Initializing combat simulator...' : 'Running combat simulations...'}
            </span>
            <span className="text-purple-300">
              {progress.current}/{progress.total}
            </span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>

          <p className="text-gray-400 text-sm">
            {isInitializing
              ? 'Loading external combat simulator...'
              : `Analyzing upgrade ${Math.max(0, progress.current - 1)} of ${progress.total - 1}`
            }
          </p>
        </div>
      )}

      {combatResults.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-300 border-b border-gray-600 pb-2">
            <div>Upgrade</div>
            <div>Kills/Hour</div>
            <div>EXP/Hour</div>
            <div>Profit/Hour</div>
          </div>

          {combatResults
            .sort((a, b) => (b.combatResults?.improvement.percentageIncrease || 0) - (a.combatResults?.improvement.percentageIncrease || 0))
            .map((result, index) => {
              const combat = result.combatResults;
              if (!combat) return null;

              return (
                <div key={index} className="bg-black/20 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    {/* Upgrade Info */}
                    <div className="flex items-center gap-3">
                      <ItemIcon
                        itemHrid={result.suggestedUpgrade.itemHrid}
                        size={32}
                        className="flex-shrink-0"
                      />
                      <div>
                        <p className="text-white font-medium">{result.currentItem.slot}</p>
                        <p className="text-gray-300 text-sm">
                          +{result.suggestedUpgrade.enhancementLevel} → {result.suggestedUpgrade.itemName}
                        </p>
                        <p className="text-yellow-300 text-xs">
                          {result.suggestedUpgrade.price.toLocaleString()} coins
                        </p>
                      </div>
                    </div>

                    {/* Kills/Hour */}
                    <div>
                      <p className="text-white">{formatNumber(combat.upgraded.killsPerHour)}</p>
                      <p className={`text-sm ${getImprovementColor(combat.improvement.killsPerHourIncrease)}`}>
                        {combat.improvement.killsPerHourIncrease > 0 ? '+' : ''}{formatNumber(combat.improvement.killsPerHourIncrease)}
                        {combat.improvement.percentageIncrease !== 0 && (
                          <span className="ml-1">
                            ({combat.improvement.percentageIncrease > 0 ? '+' : ''}{combat.improvement.percentageIncrease.toFixed(1)}%)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* EXP/Hour */}
                    <div>
                      <p className="text-white">{formatNumber(combat.upgraded.expPerHour)}</p>
                      <p className={`text-sm ${getImprovementColor(combat.improvement.expPerHourIncrease)}`}>
                        {combat.improvement.expPerHourIncrease > 0 ? '+' : ''}{formatNumber(combat.improvement.expPerHourIncrease)}
                      </p>
                    </div>

                    {/* Profit/Hour */}
                    <div>
                      <p className="text-white">{formatNumber(combat.upgraded.profitPerHour)}</p>
                      <p className={`text-sm ${getImprovementColor(combat.improvement.profitPerHourIncrease)}`}>
                        {combat.improvement.profitPerHourIncrease > 0 ? '+' : ''}{formatNumber(combat.improvement.profitPerHourIncrease)}
                      </p>
                    </div>
                  </div>

                  {(!combat.current.success || !combat.upgraded.success) && (
                    <div className="mt-2 text-orange-300 text-sm">
                      ⚠ Simulation may be inaccurate due to iframe communication limitations
                    </div>
                  )}

                  {(combat.current.error?.includes('mock data') || combat.upgraded.error?.includes('mock data')) && (
                    <div className="mt-2 text-blue-300 text-sm">
                      ℹ Using mock data - external simulator communication timed out
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        <p>💡 This attempts to use an embedded combat simulator iframe for accurate results</p>
        <p>If the external simulator doesn&apos;t respond, mock data will be generated for demonstration</p>
      </div>
    </div>
  );
}