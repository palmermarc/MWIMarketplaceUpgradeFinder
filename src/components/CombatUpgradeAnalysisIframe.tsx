'use client';

import { useState } from 'react';
import { CombatSimulatorApiService, CombatUpgradeAnalysis, ConcurrentUpgradeAnalysisProgress } from '@/services/combatSimulatorApi';
import { UpgradeOpportunity } from '@/types/marketplace';
import { CharacterStats } from '@/types/character';

interface CombatUpgradeAnalysisProps {
  character: CharacterStats;
  upgrades: UpgradeOpportunity[];
  rawCharacterData?: string | null;
}

interface ZoneData {
  zone_name: string;
  difficulty: string;
  player: string;
  encounters: string;
  deaths_per_hour: string;
  total_experience: string;
  stamina: string;
  intelligence: string;
  attack: string;
  magic: string;
  ranged: string;
  melee: string;
  defense: string;
  no_rng_revenue: string;
  expense: string;
  no_rng_profit: string;
}

export function CombatUpgradeAnalysisIframe({ character, upgrades, rawCharacterData }: CombatUpgradeAnalysisProps) {
  const [zoneData, setZoneData] = useState<ZoneData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [optimizeFor, setOptimizeFor] = useState<'profit' | 'exp'>('profit');
  const [maxEnhancementTiers, setMaxEnhancementTiers] = useState(5);
  const [showZoneTable, setShowZoneTable] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('no_rng_profit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // New state for concurrent upgrade analysis
  const [upgradeAnalysisResults, setUpgradeAnalysisResults] = useState<CombatUpgradeAnalysis[]>([]);
  const [concurrentProgress, setConcurrentProgress] = useState<ConcurrentUpgradeAnalysisProgress | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'baseline' | 'upgrades'>('baseline');

  // Note: Not filtering to combat items in baseline mode - will be used in upgrade mode

  // No cleanup needed for API-based approach

  const runConcurrentUpgradeAnalysis = async () => {
    setIsAnalyzing(true);
    setIsInitializing(true);
    setError(null);
    setAnalysisMode('upgrades');
    setConcurrentProgress(null);
    setUpgradeAnalysisResults([]);

    try {
      console.log(`🚀 CONCURRENT UPGRADE MODE: Analyzing ${upgrades.length} upgrades...`);

      setIsInitializing(false);

      // Run concurrent upgrade analysis with progress tracking
      const results = await CombatSimulatorApiService.analyzeCombatUpgradesConcurrent(
        character,
        upgrades,
        (progressUpdate) => {
          setConcurrentProgress(progressUpdate);
          setProgress({ current: progressUpdate.completed, total: progressUpdate.total });
        }
      );

      console.log('✅ Concurrent upgrade analysis completed:', results);
      setUpgradeAnalysisResults(results);

    } catch (err) {
      console.error('❌ Concurrent upgrade analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze upgrades');
    } finally {
      setIsAnalyzing(false);
      setIsInitializing(false);
    }
  };

  const runCombatAnalysis = async () => {
    setIsAnalyzing(true);
    setIsInitializing(true);
    setError(null);
    setAnalysisMode('baseline');
    setProgress({ current: 0, total: 1 });

    try {
      console.log('🎯 BASELINE MODE: Testing current equipment setup...');

      setProgress({ current: 0, total: 1 });
      setIsInitializing(false);

      // Run baseline simulation to get zone data
      const results = await CombatSimulatorApiService.runCombatSimulation(character, undefined, rawCharacterData);

      console.log('📊 Zone Results:', results);

      // The results should now be an array of zone data
      if (Array.isArray(results)) {
        setZoneData(results);
      } else {
        setError('Unexpected data format received from simulation');
      }

      setProgress({ current: 1, total: 1 });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to establish baseline');
    } finally {
      setIsAnalyzing(false);
      setIsInitializing(false);
    }
  };

  const getBestZoneForProfit = (): ZoneData | null => {
    if (zoneData.length === 0) return null;

    return zoneData.reduce((best, current) => {
      const currentProfit = parseFloat(current.no_rng_profit.replace(/,/g, '')) || 0;
      const bestProfit = parseFloat(best.no_rng_profit.replace(/,/g, '')) || 0;
      return currentProfit > bestProfit ? current : best;
    });
  };

  const getBestZoneForExp = (): ZoneData | null => {
    if (zoneData.length === 0) return null;

    return zoneData.reduce((best, current) => {
      const currentExp = parseFloat(current.total_experience) || 0;
      const bestExp = parseFloat(best.total_experience) || 0;
      return currentExp > bestExp ? current : best;
    });
  };

  const handleFindUpgrades = () => {
    // TODO: Implement upgrade finding logic
    console.log('Finding upgrades for:', optimizeFor, 'with max tiers:', maxEnhancementTiers);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortedZoneData = () => {
    return [...zoneData].sort((a, b) => {
      const aValue = a[sortColumn as keyof ZoneData];
      const bValue = b[sortColumn as keyof ZoneData];

      // Try to parse as numbers first
      const aNum = parseFloat(aValue.replace(/,/g, '')) || 0;
      const bNum = parseFloat(bValue.replace(/,/g, '')) || 0;

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Fall back to string comparison
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const bestProfitZone = getBestZoneForProfit();
  const bestExpZone = getBestZoneForExp();

  return (
    <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-purple-200">
          {analysisMode === 'baseline' ? 'Combat Zone Analysis' : 'Concurrent Upgrade Analysis'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={runCombatAnalysis}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isAnalyzing
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : analysisMode === 'baseline'
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {analysisMode === 'baseline' && isAnalyzing ? 'Analyzing Zones...' : 'Run Zone Analysis'}
          </button>
          {upgrades.length > 0 && (
            <button
              onClick={runConcurrentUpgradeAnalysis}
              disabled={isAnalyzing}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isAnalyzing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : analysisMode === 'upgrades'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-700 text-green-100 hover:bg-green-600'
              }`}
            >
              {analysisMode === 'upgrades' && isAnalyzing ? 'Analyzing Upgrades...' : `Analyze ${upgrades.length} Upgrades`}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-black/20 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300">
              {isInitializing
                ? 'Initializing combat simulator...'
                : analysisMode === 'baseline'
                  ? 'Analyzing all combat zones...'
                  : 'Running concurrent upgrade simulations...'
              }
            </span>
            <span className={analysisMode === 'baseline' ? 'text-purple-300' : 'text-green-300'}>
              {analysisMode === 'baseline' ? '🎯 ZONE ANALYSIS' : '🚀 CONCURRENT UPGRADES'}
            </span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                analysisMode === 'baseline' ? 'bg-purple-500' : 'bg-green-500'
              }`}
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
            ></div>
          </div>

          {analysisMode === 'upgrades' && concurrentProgress && (
            <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
              <div>
                <span className="text-gray-400">Progress: </span>
                <span className="text-green-300">{concurrentProgress.completed}/{concurrentProgress.total}</span>
              </div>
              <div>
                <span className="text-gray-400">In Progress: </span>
                <span className="text-yellow-300">{concurrentProgress.inProgress}</span>
              </div>
              {concurrentProgress.summary && (
                <>
                  <div>
                    <span className="text-gray-400">Successful: </span>
                    <span className="text-green-300">{concurrentProgress.summary.successful}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Duration: </span>
                    <span className="text-blue-300">{(concurrentProgress.summary.duration / 1000).toFixed(1)}s</span>
                  </div>
                </>
              )}
            </div>
          )}

          <p className="text-gray-400 text-sm">
            {isInitializing
              ? 'Loading external combat simulator...'
              : analysisMode === 'baseline'
                ? 'Testing all zones with your current equipment...'
                : `Running ${upgrades.length} upgrade simulations in parallel for 5-10x faster results...`
            }
          </p>
        </div>
      )}

      {zoneData.length > 0 && (
        <div className="space-y-6">
          {/* Best Zone Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best Profit Zone */}
            {bestProfitZone && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <h4 className="text-lg font-bold text-green-200 mb-2">🪙 Best for Profit</h4>
                <p className="text-white">
                  Your best place for farming <strong>Profit</strong> is{' '}
                  <span className="text-green-300 font-semibold">{bestProfitZone.zone_name}</span>{' '}
                  (Difficulty {bestProfitZone.difficulty})
                </p>
                <p className="text-green-100 text-sm mt-1">
                  Earning <strong>{parseFloat(bestProfitZone.no_rng_profit.replace(/,/g, '')).toLocaleString()} coins/hour</strong>
                </p>
              </div>
            )}

            {/* Best EXP Zone */}
            {bestExpZone && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <h4 className="text-lg font-bold text-blue-200 mb-2">⭐ Best for Experience</h4>
                <p className="text-white">
                  Your best place for farming <strong>EXP</strong> is{' '}
                  <span className="text-blue-300 font-semibold">{bestExpZone.zone_name}</span>{' '}
                  (Difficulty {bestExpZone.difficulty})
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Earning <strong>{parseFloat(bestExpZone.total_experience).toLocaleString()} EXP/hour</strong>
                </p>
              </div>
            )}
          </div>

          {/* Upgrade Analysis Form */}
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-yellow-200 mb-4">🔧 Find Equipment Upgrades</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Optimization Target */}
              <div>
                <label className="block text-yellow-200 text-sm font-medium mb-2">
                  Optimize For:
                </label>
                <select
                  value={optimizeFor}
                  onChange={(e) => setOptimizeFor(e.target.value as 'profit' | 'exp')}
                  className="w-full p-2 bg-black/30 border border-yellow-500/50 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                >
                  <option value="profit">Profit (Coins/Hour)</option>
                  <option value="exp">Experience (EXP/Hour)</option>
                </select>
              </div>

              {/* Enhancement Tiers */}
              <div>
                <label className="block text-yellow-200 text-sm font-medium mb-2">
                  Max Enhancement Tiers:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxEnhancementTiers}
                  onChange={(e) => setMaxEnhancementTiers(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full p-2 bg-black/30 border border-yellow-500/50 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                />
                <p className="text-yellow-300 text-xs mt-1">How many enhancement levels to consider (1-20)</p>
              </div>

              {/* Find Upgrades Button */}
              <div>
                <label className="block text-yellow-200 text-sm font-medium mb-2">&nbsp;</label>
                <button
                  onClick={handleFindUpgrades}
                  className="w-full px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-all"
                >
                  Find My Best Upgrades
                </button>
              </div>
            </div>
          </div>

          {/* Zone Data Summary */}
          <div className="bg-gray-500/20 border border-gray-500/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-gray-200 mb-2">📊 Analysis Summary</h4>
                <p className="text-gray-300 text-sm">
                  Analyzed <strong>{zoneData.length} zones</strong> with your current equipment configuration.
                </p>
              </div>
              <button
                onClick={() => setShowZoneTable(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                View Full Data
              </button>
            </div>
          </div>

          {/* Zone Data Table Modal */}
          {showZoneTable && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg border border-gray-600 max-w-7xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-600">
                  <h3 className="text-xl font-bold text-white">Zone Analysis Data</h3>
                  <button
                    onClick={() => setShowZoneTable(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="overflow-auto max-h-[calc(90vh-100px)]">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 sticky top-0">
                      <tr>
                        {Object.keys(zoneData[0] || {}).map((header) => (
                          <th
                            key={header}
                            className="p-2 text-left text-gray-200 cursor-pointer hover:bg-gray-700 border-b border-gray-600"
                            onClick={() => handleSort(header)}
                          >
                            <div className="flex items-center gap-1">
                              {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              <span className="text-xs">{getSortIcon(header)}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedZoneData().map((zone, index) => (
                        <tr
                          key={index}
                          className={`${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-700/50'} hover:bg-gray-600/50`}
                        >
                          {Object.entries(zone).map(([key, value]) => (
                            <td key={key} className="p-2 text-gray-300 border-b border-gray-700">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Analysis Results */}
      {upgradeAnalysisResults.length > 0 && (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-green-200 mb-4">🚀 Concurrent Upgrade Analysis Results</h4>

            {concurrentProgress?.summary && (
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="bg-black/20 rounded p-3">
                  <div className="text-green-300 font-bold">{concurrentProgress.summary.successful}</div>
                  <div className="text-gray-400">Successful</div>
                </div>
                <div className="bg-black/20 rounded p-3">
                  <div className="text-red-300 font-bold">{concurrentProgress.summary.failed}</div>
                  <div className="text-gray-400">Failed</div>
                </div>
                <div className="bg-black/20 rounded p-3">
                  <div className="text-blue-300 font-bold">{(concurrentProgress.summary.duration / 1000).toFixed(1)}s</div>
                  <div className="text-gray-400">Duration</div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {upgradeAnalysisResults
                .sort((a, b) => (b.combatResults?.improvement.percentageIncrease || 0) - (a.combatResults?.improvement.percentageIncrease || 0))
                .map((upgrade, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-white">{upgrade.currentItem.slot}</div>
                      <div className="text-sm text-gray-400">
                        {upgrade.currentItem.itemName} +{upgrade.currentItem.enhancementLevel} → {upgrade.suggestedUpgrade.itemName} +{upgrade.suggestedUpgrade.enhancementLevel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        (upgrade.combatResults?.improvement.percentageIncrease || 0) > 0
                          ? 'text-green-300'
                          : 'text-red-300'
                      }`}>
                        {(upgrade.combatResults?.improvement.percentageIncrease || 0) > 0 ? '+' : ''}
                        {(upgrade.combatResults?.improvement.percentageIncrease || 0).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Performance</div>
                    </div>
                  </div>

                  {upgrade.combatResults && (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Kills/Hour</div>
                        <div className="text-white">
                          {upgrade.combatResults.current.killsPerHour} → {upgrade.combatResults.upgraded.killsPerHour}
                          <span className={`ml-1 ${upgrade.combatResults.improvement.killsPerHourIncrease >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            ({upgrade.combatResults.improvement.killsPerHourIncrease >= 0 ? '+' : ''}{upgrade.combatResults.improvement.killsPerHourIncrease})
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">EXP/Hour</div>
                        <div className="text-white">
                          {upgrade.combatResults.current.expPerHour} → {upgrade.combatResults.upgraded.expPerHour}
                          <span className={`ml-1 ${upgrade.combatResults.improvement.expPerHourIncrease >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            ({upgrade.combatResults.improvement.expPerHourIncrease >= 0 ? '+' : ''}{upgrade.combatResults.improvement.expPerHourIncrease})
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Profit/Hour</div>
                        <div className="text-white">
                          {upgrade.combatResults.current.profitPerHour} → {upgrade.combatResults.upgraded.profitPerHour}
                          <span className={`ml-1 ${upgrade.combatResults.improvement.profitPerHourIncrease >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            ({upgrade.combatResults.improvement.profitPerHourIncrease >= 0 ? '+' : ''}{upgrade.combatResults.improvement.profitPerHourIncrease})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">Cost: </span>
                    <span className="text-yellow-300">{upgrade.suggestedUpgrade.price.toLocaleString()} crowns</span>
                    <span className="text-gray-400 ml-4">Efficiency: </span>
                    <span className="text-blue-300">{upgrade.costEfficiency.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        <p>💡 This uses server-side browser automation (Puppeteer) for accurate combat simulation</p>
        <p>Analysis includes all difficulty levels for each combat zone</p>
        {analysisMode === 'upgrades' && (
          <p>🚀 Concurrent analysis runs {upgrades.length} simulations in parallel for 5-10x faster results</p>
        )}
      </div>
    </div>
  );
}