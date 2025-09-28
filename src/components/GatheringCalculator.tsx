'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  GatheringSkillName,
  // getAreasBySkill,
  // getItemsBySkill
} from '@/constants/gatheringSkills';
import {
  SkillLevels,
  HouseRoomLevels,
  EquipmentBonuses,
  formatDuration
} from '@/utils/skillCalculations';
import { getGatheringTools } from '@/constants/items';
import {
  GearModifiers,
  OptimizationSettings,
  GatheringOptimizationResult,
  LevelMilestone,
  generateLevelingPath
  // simulateResourceGathering,
  // calculateGearBreakeven
} from '@/utils/gatheringOptimizer';

interface GatheringCalculatorProps {
  character?: {
    milking_level?: number;
    woodcutting_level?: number;
    foraging_level?: number;
  };
  marketData?: Record<string, unknown>; // Will integrate with market data later
}

export function GatheringCalculator({ character, marketData }: GatheringCalculatorProps) {
  const { theme } = useTheme();

  // State for inputs
  const [selectedSkill, setSelectedSkill] = useState<GatheringSkillName>('Milking');
  const [startLevel, setStartLevel] = useState<number>(1);
  const [targetLevel, setTargetLevel] = useState<number>(50);

  // Equipment and house room states
  const [skillLevels, setSkillLevels] = useState<SkillLevels>({
    milking: 1,
    woodcutting: 1,
    foraging: 1
  });

  const [houseRoomLevels, setHouseRoomLevels] = useState<HouseRoomLevels>({
    dairy_barn: 0,
    garden: 0,
    log_shed: 0,
    forge: 0,
    workshop: 0,
    sewing_parlor: 0,
    kitchen: 0,
    brewery: 0,
    laboratory: 0,
    observatory: 0
  });

  const [equipment, setEquipment] = useState<EquipmentBonuses>({
    hasBrush: false,
    hasShears: false,
    hasHatchet: false,
    activeTool: {
      milking: '',
      woodcutting: '',
      foraging: ''
    }
  });

  const [gearModifiers, setGearModifiers] = useState<GearModifiers>({
    speedMultiplier: 1.0,
    experienceMultiplier: 1.0,
    rareDropMultiplier: 1.0,
    efficiencyBonus: 0
  });

  // Advanced settings
  const [includeRareDrops, setIncludeRareDrops] = useState<boolean>(true);
  const [maxTimePerLevel, setMaxTimePerLevel] = useState<number>(24);
  const [profitWeighting, setProfitWeighting] = useState<number>(0.5);
  const [autoCalculate, setAutoCalculate] = useState<boolean>(true);

  // Results state
  const [optimizationResults, setOptimizationResults] = useState<{
    experience: GatheringOptimizationResult | null;
    profit: GatheringOptimizationResult | null;
    speed: GatheringOptimizationResult | null;
    balanced: GatheringOptimizationResult | null;
  }>({
    experience: null,
    profit: null,
    speed: null,
    balanced: null
  });
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [selectedMilestone, setSelectedMilestone] = useState<LevelMilestone | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'experience' | 'profit' | 'speed' | 'balanced'>('experience');

  // Suppress unused variable warnings temporarily
  void marketData;
  void setHouseRoomLevels;
  void setGearModifiers;
  void setIncludeRareDrops;
  void setMaxTimePerLevel;

  // Load character data if available
  useEffect(() => {
    if (character) {
      // Update skill levels from character data
      const newSkillLevels: SkillLevels = {};
      if (character.milking_level) newSkillLevels.milking = character.milking_level;
      if (character.woodcutting_level) newSkillLevels.woodcutting = character.woodcutting_level;
      if (character.foraging_level) newSkillLevels.foraging = character.foraging_level;

      setSkillLevels(prev => ({ ...prev, ...newSkillLevels }));
      setStartLevel(newSkillLevels[selectedSkill.toLowerCase()] || 1);
    }
  }, [character, selectedSkill]);

  // Calculate all optimization strategies
  const calculateOptimization = useCallback(async () => {
    setIsCalculating(true);
    try {
      const strategies: ('experience' | 'profit' | 'speed' | 'balanced')[] = ['experience', 'profit', 'speed', 'balanced'];
      const results: {
        experience: GatheringOptimizationResult | null;
        profit: GatheringOptimizationResult | null;
        speed: GatheringOptimizationResult | null;
        balanced: GatheringOptimizationResult | null;
      } = {
        experience: null,
        profit: null,
        speed: null,
        balanced: null
      };

      // Run all 4 optimization strategies
      for (const strategy of strategies) {
        try {
          const settings: OptimizationSettings = {
            optimizeFor: strategy,
            includeRareDrops,
            maxTimePerLevel,
            profitWeighting: strategy === 'balanced' ? profitWeighting : (strategy === 'profit' ? 1.0 : 0.0)
          };

          const result = generateLevelingPath(
            selectedSkill,
            startLevel,
            targetLevel,
            skillLevels,
            houseRoomLevels,
            equipment,
            gearModifiers,
            settings
          );

          results[strategy] = result;
        } catch (error) {
          console.error(`Error calculating ${strategy} optimization:`, error);
        }
      }

      setOptimizationResults(results);
    } catch (error) {
      console.error('Error calculating optimizations:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [
    selectedSkill, startLevel, targetLevel, includeRareDrops,
    maxTimePerLevel, profitWeighting, skillLevels, houseRoomLevels,
    equipment, gearModifiers
  ]);

  // Auto-calculate when inputs change (only if autoCalculate is enabled)
  useEffect(() => {
    if (autoCalculate && startLevel < targetLevel) {
      calculateOptimization();
    }
  }, [autoCalculate, startLevel, targetLevel]); // Removed calculateOptimization to fix infinite loop

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toLocaleString();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className={`rounded-lg p-6 ${theme.mode === 'dark' ? 'border' : 'bg-blue-500/20 border border-blue-500/50'}`}
           style={theme.mode === 'dark' ? { backgroundColor: 'rgba(181, 0, 8, 0.2)', borderColor: 'rgba(181, 0, 8, 0.5)' } : {}}>
        <h1 className={`text-3xl font-bold mb-4 ${theme.mode === 'dark' ? 'text-red-200' : 'text-blue-200'}`}>
          🌾 Gathering Professions Calculator
        </h1>
        <p className={`${theme.mode === 'dark' ? 'text-red-300' : 'text-blue-300'}`}>
          Optimize your gathering progression with intelligent level-by-level recommendations that factor in bonuses, equipment, and profit potential.
        </p>
      </div>

      {/* Input Configuration */}
      <div className={`rounded-lg p-6 ${theme.cardBackground} border ${theme.borderColor}`}>
        <h2 className={`text-xl font-bold mb-4 ${theme.textColor}`}>Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skill Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>
              Gathering Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value as GatheringSkillName);
                setStartLevel(skillLevels[e.target.value.toLowerCase()] || 1);
              }}
              className={`w-full px-3 py-2 rounded border ${theme.inputBackground} ${theme.inputBorder} ${theme.textColor}`}
            >
              <option value="Milking">🥛 Milking</option>
              <option value="Woodcutting">🪓 Woodcutting</option>
              <option value="Foraging">🍓 Foraging</option>
            </select>
          </div>

          {/* Level Range */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>
              Start Level
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={startLevel}
              onChange={(e) => setStartLevel(parseInt(e.target.value) || 1)}
              className={`w-full px-3 py-2 rounded border ${theme.inputBackground} ${theme.inputBorder} ${theme.textColor}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>
              Target Level
            </label>
            <input
              type="number"
              min={startLevel + 1}
              max="99"
              value={targetLevel}
              onChange={(e) => setTargetLevel(parseInt(e.target.value) || startLevel + 1)}
              className={`w-full px-3 py-2 rounded border ${theme.inputBackground} ${theme.inputBorder} ${theme.textColor}`}
            />
          </div>


          {/* Tools */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>
              Tools
            </label>
            <div className="space-y-3">
              {/* Milking Tools */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${theme.textColor} opacity-80`}>
                  Milking Tool
                </label>
                <select
                  value={equipment.activeTool?.milking || ''}
                  onChange={(e) => setEquipment(prev => ({
                    ...prev,
                    activeTool: { ...prev.activeTool, milking: e.target.value },
                    hasBrush: e.target.value !== '' // Update backwards compatibility flag
                  }))}
                  className={`w-full px-3 py-1 text-sm rounded border ${theme.mode === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">No Tool</option>
                  {getGatheringTools('milking').map(tool => (
                    <option key={tool.itemHrid} value={tool.displayName}>
                      {tool.displayName} (+{tool.toolBonuses?.professionSpeed}% speed{tool.toolBonuses?.rareFind ? `, +${tool.toolBonuses.rareFind}% rare` : ''}{tool.toolBonuses?.experience ? `, +${tool.toolBonuses.experience}% XP` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Woodcutting Tools */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${theme.textColor} opacity-80`}>
                  Woodcutting Tool
                </label>
                <select
                  value={equipment.activeTool?.woodcutting || ''}
                  onChange={(e) => setEquipment(prev => ({
                    ...prev,
                    activeTool: { ...prev.activeTool, woodcutting: e.target.value },
                    hasHatchet: e.target.value !== '' // Update backwards compatibility flag
                  }))}
                  className={`w-full px-3 py-1 text-sm rounded border ${theme.mode === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">No Tool</option>
                  {getGatheringTools('woodcutting').map(tool => (
                    <option key={tool.itemHrid} value={tool.displayName}>
                      {tool.displayName} (+{tool.toolBonuses?.professionSpeed}% speed{tool.toolBonuses?.rareFind ? `, +${tool.toolBonuses.rareFind}% rare` : ''}{tool.toolBonuses?.experience ? `, +${tool.toolBonuses.experience}% XP` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Foraging Tools */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${theme.textColor} opacity-80`}>
                  Foraging Tool
                </label>
                <select
                  value={equipment.activeTool?.foraging || ''}
                  onChange={(e) => setEquipment(prev => ({
                    ...prev,
                    activeTool: { ...prev.activeTool, foraging: e.target.value },
                    hasShears: e.target.value !== '' // Update backwards compatibility flag
                  }))}
                  className={`w-full px-3 py-1 text-sm rounded border ${theme.mode === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">No Tool</option>
                  {getGatheringTools('foraging').map(tool => (
                    <option key={tool.itemHrid} value={tool.displayName}>
                      {tool.displayName} (+{tool.toolBonuses?.professionSpeed}% speed{tool.toolBonuses?.rareFind ? `, +${tool.toolBonuses.rareFind}% rare` : ''}{tool.toolBonuses?.experience ? `, +${tool.toolBonuses.experience}% XP` : ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Profit Weighting (for balanced strategy) */}
          {true && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>
                Profit vs XP Weight ({Math.round(profitWeighting * 100)}% profit)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={profitWeighting}
                onChange={(e) => setProfitWeighting(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Pure XP</span>
                <span>Balanced</span>
                <span>Pure Profit</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculate Controls */}
      <div className={`rounded-lg p-6 ${theme.cardBackground} border ${theme.borderColor}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoCalculate}
                onChange={(e) => setAutoCalculate(e.target.checked)}
                className="rounded"
              />
              <span className={`text-sm ${theme.textColor}`}>Auto-calculate when inputs change</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            {!autoCalculate && (
              <button
                onClick={calculateOptimization}
                disabled={isCalculating || startLevel >= targetLevel}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all
                  ${isCalculating || startLevel >= targetLevel
                    ? 'bg-gray-500 cursor-not-allowed'
                    : `${theme.mode === 'dark'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                      } shadow-lg hover:shadow-xl transform hover:scale-105`
                  }`}
              >
                {isCalculating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Calculate Optimal Path</span>
                  </div>
                )}
              </button>
            )}

            {isCalculating && autoCalculate && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                <span className={theme.textColor}>Auto-calculating...</span>
              </div>
            )}
          </div>
        </div>

        {startLevel >= targetLevel && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ Start level must be lower than target level to calculate a leveling path.
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {(optimizationResults.experience || optimizationResults.profit || optimizationResults.speed || optimizationResults.balanced) && (
        <div className="space-y-6">
          {/* Strategy Comparison Overview */}
          <div className={`rounded-lg p-6 ${theme.cardBackground} border ${theme.borderColor}`}>
            <h2 className={`text-xl font-bold mb-4 ${theme.textColor}`}>Strategy Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Experience Strategy */}
              {optimizationResults.experience && (
                <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedStrategy === 'experience'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-black/20 hover:border-purple-400'
                }`}
                onClick={() => setSelectedStrategy('experience')}>
                  <div className="text-center">
                    <div className="text-purple-400 text-lg font-bold mb-2">⚡ Experience</div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-purple-300">
                        {formatDuration(optimizationResults.experience.totalTimeEstimate)}
                      </div>
                      <div className="text-xs text-gray-400">Fastest Leveling</div>
                      <div className="text-sm text-purple-200">
                        {formatNumber(optimizationResults.experience.totalProfitEstimate)} coins
                      </div>
                      <div className="text-xs text-gray-500">
                        {optimizationResults.experience.levelingPath.length} zone changes
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profit Strategy */}
              {optimizationResults.profit && (
                <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedStrategy === 'profit'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-gray-600 bg-black/20 hover:border-green-400'
                }`}
                onClick={() => setSelectedStrategy('profit')}>
                  <div className="text-center">
                    <div className="text-green-400 text-lg font-bold mb-2">💰 Profit</div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-300">
                        {formatNumber(optimizationResults.profit.totalProfitEstimate)} coins
                      </div>
                      <div className="text-xs text-gray-400">Highest Income</div>
                      <div className="text-sm text-green-200">
                        {formatDuration(optimizationResults.profit.totalTimeEstimate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {optimizationResults.profit.levelingPath.length} zone changes
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Speed Strategy */}
              {optimizationResults.speed && (
                <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedStrategy === 'speed'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-black/20 hover:border-blue-400'
                }`}
                onClick={() => setSelectedStrategy('speed')}>
                  <div className="text-center">
                    <div className="text-blue-400 text-lg font-bold mb-2">🏃 Speed</div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-blue-300">
                        {formatNumber(optimizationResults.speed.levelingPath[0]?.calculationResult.actionsPerHour || 0)}
                      </div>
                      <div className="text-xs text-gray-400">Actions/Hour</div>
                      <div className="text-sm text-blue-200">
                        {formatDuration(optimizationResults.speed.totalTimeEstimate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {optimizationResults.speed.levelingPath.length} zone changes
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Balanced Strategy */}
              {optimizationResults.balanced && (
                <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedStrategy === 'balanced'
                    ? 'border-yellow-500 bg-yellow-500/20'
                    : 'border-gray-600 bg-black/20 hover:border-yellow-400'
                }`}
                onClick={() => setSelectedStrategy('balanced')}>
                  <div className="text-center">
                    <div className="text-yellow-400 text-lg font-bold mb-2">⚖️ Balanced</div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-yellow-300">
                        {Math.round(profitWeighting * 100)}% profit
                      </div>
                      <div className="text-xs text-gray-400">XP + Profit Mix</div>
                      <div className="text-sm text-yellow-200">
                        {formatDuration(optimizationResults.balanced.totalTimeEstimate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {optimizationResults.balanced.levelingPath.length} zone changes
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed View of Selected Strategy */}
          {optimizationResults[selectedStrategy] && (
            <div className="space-y-6">
              {/* Selected Strategy Summary */}
              <div className={`rounded-lg p-6 ${theme.cardBackground} border ${theme.borderColor}`}>
                <h2 className={`text-xl font-bold mb-4 ${theme.textColor}`}>
                  {selectedStrategy === 'experience' && '⚡ Experience Strategy - Fastest Leveling'}
                  {selectedStrategy === 'profit' && '💰 Profit Strategy - Highest Income'}
                  {selectedStrategy === 'speed' && '🏃 Speed Strategy - Most Actions'}
                  {selectedStrategy === 'balanced' && '⚖️ Balanced Strategy - XP + Profit'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${theme.mode === 'dark' ? 'text-red-300' : 'text-orange-300'}`}>
                      {formatDuration(optimizationResults[selectedStrategy]!.totalTimeEstimate)}
                    </div>
                    <div className={`text-sm ${theme.textColor} opacity-70`}>Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${theme.mode === 'dark' ? 'text-red-300' : 'text-orange-300'}`}>
                      {formatNumber(optimizationResults[selectedStrategy]!.totalProfitEstimate)}
                    </div>
                    <div className={`text-sm ${theme.textColor} opacity-70`}>Total Profit (coins)</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${theme.mode === 'dark' ? 'text-red-300' : 'text-orange-300'}`}>
                      {optimizationResults[selectedStrategy]!.levelingPath.length}
                    </div>
                    <div className={`text-sm ${theme.textColor} opacity-70`}>Zone Changes</div>
                  </div>
                </div>
              </div>

              {/* Leveling Path for Selected Strategy */}
          <div className={`rounded-lg p-6 ${theme.cardBackground} border ${theme.borderColor}`}>
            <h2 className={`text-xl font-bold mb-4 ${theme.textColor}`}>Leveling Path</h2>
            <div className="space-y-3">
              {optimizationResults[selectedStrategy]!.levelingPath.map((milestone, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedMilestone === milestone
                      ? `bg-orange-500/20 border-orange-500/50`
                      : `bg-black/20 border-gray-600 hover:bg-gray-700/50`
                  }`}
                  onClick={() => setSelectedMilestone(selectedMilestone === milestone ? null : milestone)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-bold ${theme.textColor}`}>
                          Level {milestone.level} → {milestone.level + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          milestone.newAreasUnlocked.length > 0
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {milestone.newAreasUnlocked.length > 0
                            ? `New: ${milestone.newAreasUnlocked.join(', ')}`
                            : 'Continue Current Area'
                          }
                        </span>
                      </div>
                      <div className={`${theme.textColor} opacity-80`}>
                        📍 {milestone.recommendedArea} •
                        ⏱️ {formatDuration(milestone.timeToNextLevel)} •
                        💰 {formatNumber(milestone.estimatedProfitPerHour)}/hr
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${theme.mode === 'dark' ? 'text-red-300' : 'text-orange-300'}`}>
                        {formatNumber(milestone.calculationResult.experiencePerHour)} XP/hr
                      </div>
                      <div className={`text-sm ${theme.textColor} opacity-70`}>
                        {milestone.calculationResult.efficiency.toFixed(1)}% efficiency
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selectedMilestone === milestone && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className={`font-medium mb-2 ${theme.textColor}`}>Expected Resources/Hour</h4>
                          <div className="space-y-1">
                            {Object.entries(milestone.estimatedItemsPerHour).map(([item, quantity]) => (
                              <div key={item} className="flex justify-between text-sm">
                                <span className={`${theme.textColor} opacity-80`}>{item}</span>
                                <span className={`${theme.mode === 'dark' ? 'text-red-300' : 'text-orange-300'}`}>
                                  {formatNumber(quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className={`font-medium mb-2 ${theme.textColor}`}>Statistics</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className={`${theme.textColor} opacity-80`}>Actions/Hour</span>
                              <span className={`${theme.mode === 'dark' ? 'text-red-300' : 'text-orange-300'}`}>
                                {Math.round(milestone.calculationResult.actionsPerHour)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`${theme.textColor} opacity-80`}>Action Time</span>
                              <span className={`${theme.mode === 'dark' ? 'text-red-300' : 'text-orange-300'}`}>
                                {milestone.calculationResult.modifiedTime.toFixed(1)}s
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`${theme.textColor} opacity-80`}>XP per Action</span>
                              <span className={`${theme.mode === 'dark' ? 'text-red-300' : 'text-orange-300'}`}>
                                {milestone.calculationResult.modifiedExperience.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

              {/* Gear Recommendations for Selected Strategy */}
              {optimizationResults[selectedStrategy]!.gearRecommendations.length > 0 && (
                <div className={`rounded-lg p-6 ${theme.cardBackground} border ${theme.borderColor}`}>
                  <h2 className={`text-xl font-bold mb-4 ${theme.textColor}`}>Gear Recommendations</h2>
                  <div className="space-y-2">
                    {optimizationResults[selectedStrategy]!.gearRecommendations.map((recommendation, index) => (
                      <div key={index} className={`p-3 rounded bg-green-500/20 border border-green-500/50`}>
                        <span className="text-green-200">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Comparison Table */}
          <div className={`rounded-lg p-6 ${theme.cardBackground} border ${theme.borderColor}`}>
            <h2 className={`text-xl font-bold mb-4 ${theme.textColor}`}>Quick Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className={`text-left py-2 ${theme.textColor}`}>Strategy</th>
                    <th className={`text-left py-2 ${theme.textColor}`}>Total Time</th>
                    <th className={`text-left py-2 ${theme.textColor}`}>Total Profit</th>
                    <th className={`text-left py-2 ${theme.textColor}`}>Zone Changes</th>
                    <th className={`text-left py-2 ${theme.textColor}`}>Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {optimizationResults.experience && (
                    <tr className="border-b border-gray-700/50">
                      <td className="py-2 text-purple-300">⚡ Experience</td>
                      <td className="py-2 text-purple-200">{formatDuration(optimizationResults.experience.totalTimeEstimate)}</td>
                      <td className="py-2 text-gray-300">{formatNumber(optimizationResults.experience.totalProfitEstimate)}</td>
                      <td className="py-2 text-gray-300">{optimizationResults.experience.levelingPath.length}</td>
                      <td className="py-2 text-gray-400">Fastest leveling, rushing to high levels</td>
                    </tr>
                  )}
                  {optimizationResults.profit && (
                    <tr className="border-b border-gray-700/50">
                      <td className="py-2 text-green-300">💰 Profit</td>
                      <td className="py-2 text-gray-300">{formatDuration(optimizationResults.profit.totalTimeEstimate)}</td>
                      <td className="py-2 text-green-200">{formatNumber(optimizationResults.profit.totalProfitEstimate)}</td>
                      <td className="py-2 text-gray-300">{optimizationResults.profit.levelingPath.length}</td>
                      <td className="py-2 text-gray-400">Maximum income, funding other skills</td>
                    </tr>
                  )}
                  {optimizationResults.speed && (
                    <tr className="border-b border-gray-700/50">
                      <td className="py-2 text-blue-300">🏃 Speed</td>
                      <td className="py-2 text-blue-200">{formatDuration(optimizationResults.speed.totalTimeEstimate)}</td>
                      <td className="py-2 text-gray-300">{formatNumber(optimizationResults.speed.totalProfitEstimate)}</td>
                      <td className="py-2 text-gray-300">{optimizationResults.speed.levelingPath.length}</td>
                      <td className="py-2 text-gray-400">Most actions, quick resource gathering</td>
                    </tr>
                  )}
                  {optimizationResults.balanced && (
                    <tr>
                      <td className="py-2 text-yellow-300">⚖️ Balanced</td>
                      <td className="py-2 text-yellow-200">{formatDuration(optimizationResults.balanced.totalTimeEstimate)}</td>
                      <td className="py-2 text-yellow-200">{formatNumber(optimizationResults.balanced.totalProfitEstimate)}</td>
                      <td className="py-2 text-gray-300">{optimizationResults.balanced.levelingPath.length}</td>
                      <td className="py-2 text-gray-400">Good compromise for steady progression</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {!optimizationResults.experience && !optimizationResults.profit && !optimizationResults.speed && !optimizationResults.balanced && !isCalculating && (
        <div className={`rounded-lg p-8 text-center ${theme.cardBackground} border ${theme.borderColor}`}>
          <p className={`${theme.textColor} text-lg mb-4`}>Click Calculate to see your optimal leveling paths</p>
          <p className={`text-gray-400 text-sm`}>All four strategies will be calculated and compared for you to make the best decision.</p>
        </div>
      )}

      {/* Loading State */}
      {isCalculating && (
        <div className={`rounded-lg p-8 text-center ${theme.cardBackground} border ${theme.borderColor}`}>
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className={`${theme.textColor}`}>Calculating optimal leveling path...</p>
        </div>
      )}
    </div>
  );
}