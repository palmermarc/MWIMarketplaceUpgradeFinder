'use client';

import { useState } from 'react';
import { CombatSimulatorApiService } from '@/services/combatSimulatorApi';
import { UpgradeOpportunity } from '@/types/marketplace';
import { CharacterStats } from '@/types/character';

interface CombatUpgradeAnalysisProps {
  character: CharacterStats;
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

export function CombatUpgradeAnalysisIframe({ character, rawCharacterData }: CombatUpgradeAnalysisProps) {
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

  // Note: Not filtering to combat items in baseline mode - will be used in upgrade mode

  // No cleanup needed for API-based approach

  const runCombatAnalysis = async () => {
    setIsAnalyzing(true);
    setIsInitializing(true);
    setError(null);
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

  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString();
  };

  const getImprovementColor = (value: number): string => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const bestProfitZone = getBestZoneForProfit();
  const bestExpZone = getBestZoneForExp();

  return (
    <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-purple-200">Combat Zone Analysis</h3>
        <button
          onClick={runCombatAnalysis}
          disabled={isAnalyzing}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isAnalyzing
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isAnalyzing ? 'Analyzing Zones...' : 'Run Zone Analysis'}
        </button>
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
              {isInitializing ? 'Initializing combat simulator...' : 'Analyzing all combat zones...'}
            </span>
            <span className="text-purple-300">
              🎯 ZONE ANALYSIS
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
              : 'Testing all zones with your current equipment...'
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

      <div className="mt-4 text-xs text-gray-400">
        <p>💡 This uses server-side browser automation (Puppeteer) for accurate combat simulation</p>
        <p>Analysis includes all difficulty levels for each combat zone</p>
      </div>
    </div>
  );
}