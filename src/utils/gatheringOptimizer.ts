/**
 * Milky Way Idle - Advanced Gathering Optimization Engine
 *
 * This system provides intelligent gathering optimization that:
 * 1. Calculates optimal zones for each level progression
 * 2. Factors in level bonuses and equipment modifiers
 * 3. Recalculates optimization at each level milestone
 * 4. Simulates resource gathering and profit calculations
 * 5. Provides comprehensive leveling path recommendations
 */

import {
  GatheringItem,
  GatheringSkillName,
  getItemsBySkill,
  getUnlockedAreas
  // calculateExpectedItems,
  // calculateXpPerSecond
} from '@/constants/gatheringSkills';

import {
  SkillLevels,
  HouseRoomLevels,
  EquipmentBonuses,
  CalculationResult,
  calculateGatheringSkillResults,
  calculateItemsPerHour,
  getExperienceForLevel
  // getTotalExperienceForLevel
} from '@/utils/skillCalculations';

// Enhanced types for optimization
export interface GearModifiers {
  speedMultiplier: number;      // Overall action speed modifier
  experienceMultiplier: number; // XP gain modifier
  rareDropMultiplier: number;   // Rare find chance modifier
  efficiencyBonus: number;      // Additional efficiency percentage
}

export interface OptimizationSettings {
  optimizeFor: 'experience' | 'profit' | 'speed' | 'balanced';
  includeRareDrops: boolean;
  maxTimePerLevel: number;      // Max hours willing to spend per level
  profitWeighting: number;      // 0-1, how much to weight profit vs XP
}

export interface LevelMilestone {
  level: number;
  newAreasUnlocked: string[];
  recommendedArea: string;
  gatheringItem: GatheringItem;
  calculationResult: CalculationResult;
  estimatedItemsPerHour: { [itemName: string]: number };
  estimatedProfitPerHour: number;
  timeToNextLevel: number; // Hours
  cumulativeTime: number;  // Total hours from start
}

export interface GatheringOptimizationResult {
  skill: GatheringSkillName;
  startLevel: number;
  targetLevel: number;
  totalTimeEstimate: number; // Total hours
  totalProfitEstimate: number;
  levelingPath: LevelMilestone[];
  gearRecommendations: string[];
  alternativeStrategies: {
    name: string;
    description: string;
    modifiedPath: LevelMilestone[];
  }[];
}

export interface ResourceSimulation {
  itemName: string;
  expectedQuantity: number;
  averageValuePerItem: number; // Will be integrated with market data later
  totalValue: number;
  dropChance: number;
  isRare: boolean;
}

/**
 * Calculate level bonuses based on how much higher the player is than required level
 */
export function calculateLevelBonus(
  playerLevel: number,
  requiredLevel: number,
  bonusType: 'efficiency' | 'speed' | 'experience'
): number {
  // DISABLED: These bonuses were causing incorrect area selection
  // The massive XP bonuses for being over-leveled made low-level areas
  // appear more efficient than high-level areas, which is incorrect.
  //
  // Real game mechanics don't provide such massive bonuses for being
  // over-leveled on gathering actions.

  return 0;

  // Original logic (disabled):
  // const levelDifference = Math.max(0, playerLevel - requiredLevel);
  // switch (bonusType) {
  //   case 'efficiency':
  //     return levelDifference * 1.0;
  //   case 'speed':
  //     return levelDifference * 0.5;
  //   case 'experience':
  //     return levelDifference * 2.0;
  //   default:
  //     return 0;
  // }
}

/**
 * Enhanced calculation that includes gear modifiers and level bonuses
 */
export function calculateEnhancedGatheringResults(
  gatheringItem: GatheringItem,
  skillLevels: SkillLevels,
  houseRoomLevels: HouseRoomLevels,
  equipment: EquipmentBonuses,
  gearModifiers: GearModifiers
): CalculationResult {
  // Get base calculation
  const baseResult = calculateGatheringSkillResults(
    gatheringItem,
    skillLevels,
    houseRoomLevels,
    equipment
  );

  const skillName = gatheringItem.skill.toLowerCase();
  const playerLevel = skillLevels[skillName] || 1;

  // Apply level bonuses
  const efficiencyBonus = calculateLevelBonus(playerLevel, gatheringItem.levelRequired, 'efficiency');
  const speedBonus = calculateLevelBonus(playerLevel, gatheringItem.levelRequired, 'speed');
  const experienceBonus = calculateLevelBonus(playerLevel, gatheringItem.levelRequired, 'experience');

  // Apply gear modifiers
  const enhancedResult: CalculationResult = {
    ...baseResult,
    modifiedTime: baseResult.modifiedTime * gearModifiers.speedMultiplier * (1 - speedBonus / 100),
    modifiedExperience: baseResult.modifiedExperience * gearModifiers.experienceMultiplier * (1 + experienceBonus / 100),
    efficiency: baseResult.efficiency + efficiencyBonus + gearModifiers.efficiencyBonus,
    rareFind: baseResult.rareFind * gearModifiers.rareDropMultiplier,
    actionsPerHour: 0, // Will recalculate
    experiencePerHour: 0 // Will recalculate
  };

  // Recalculate derived values
  const baseActionsPerHour = 3600 / enhancedResult.modifiedTime;
  enhancedResult.actionsPerHour = baseActionsPerHour * (1 + enhancedResult.efficiency / 100);
  enhancedResult.experiencePerHour = enhancedResult.actionsPerHour * enhancedResult.modifiedExperience;

  return enhancedResult;
}

/**
 * Find the optimal gathering location for a specific level
 */
export function findOptimalLocationForLevel(
  skill: GatheringSkillName,
  level: number,
  skillLevels: SkillLevels,
  houseRoomLevels: HouseRoomLevels,
  equipment: EquipmentBonuses,
  gearModifiers: GearModifiers,
  settings: OptimizationSettings
): { area: string; item: GatheringItem; result: CalculationResult; score: number } | null {
  const availableItems = getItemsBySkill(skill).filter(
    item => item.levelRequired <= level && !item.isRare // Focus on main gathering items
  );

  if (availableItems.length === 0) return null;

  // Group by area and find the representative item for each area
  const areaMap = new Map<string, GatheringItem>();
  for (const item of availableItems) {
    const currentItem = areaMap.get(item.area);
    if (!currentItem) {
      areaMap.set(item.area, item);
    } else {
      // For Milking/Woodcutting: Prioritize 100% drop chance items (main resources)
      // For Foraging: Use the first non-rare item with highest drop chance in the area
      const shouldReplace =
        // Prioritize 100% drop chance over anything else (Milking/Woodcutting main items)
        (item.dropChance === 100 && currentItem.dropChance < 100) ||
        // If both are 100% drop chance, pick the one with higher XP (shouldn't happen but safety)
        (item.dropChance === 100 && currentItem.dropChance === 100 && item.experiencePerGather > currentItem.experiencePerGather) ||
        // If no 100% items exist, pick highest drop chance (Foraging areas)
        (currentItem.dropChance < 100 && item.dropChance > currentItem.dropChance) ||
        // If same drop chance and no 100% items, pick highest XP (Foraging tiebreaker)
        (currentItem.dropChance < 100 && item.dropChance === currentItem.dropChance && item.experiencePerGather > currentItem.experiencePerGather);

      if (shouldReplace) {
        areaMap.set(item.area, item);
      }
    }
  }

  let bestOption: { area: string; item: GatheringItem; result: CalculationResult; score: number } | null = null;

  for (const [area, item] of areaMap) {
    const tempSkillLevels = { ...skillLevels, [skill.toLowerCase()]: level };
    const result = calculateEnhancedGatheringResults(
      item,
      tempSkillLevels,
      houseRoomLevels,
      equipment,
      gearModifiers
    );

    let score: number;
    switch (settings.optimizeFor) {
      case 'experience':
        score = result.experiencePerHour;
        break;
      case 'speed':
        score = result.actionsPerHour;
        break;
      case 'profit':
        // Placeholder - will integrate with market data
        score = calculateItemsPerHour(item, result) * 100; // Assume 100 coins per item
        break;
      case 'balanced':
        const xpScore = result.experiencePerHour / 1000; // Normalize
        const profitScore = calculateItemsPerHour(item, result) * 100 / 1000; // Normalize
        score = (xpScore * (1 - settings.profitWeighting)) + (profitScore * settings.profitWeighting);
        break;
      default:
        score = result.experiencePerHour;
    }

    if (!bestOption || score > bestOption.score) {
      bestOption = { area, item, result, score };
    }
  }

  return bestOption;
}

/**
 * Simulate resource gathering for an area
 */
export function simulateResourceGathering(
  area: string,
  skill: GatheringSkillName,
  level: number,
  hours: number,
  skillLevels: SkillLevels,
  houseRoomLevels: HouseRoomLevels,
  equipment: EquipmentBonuses,
  gearModifiers: GearModifiers
): ResourceSimulation[] {
  const areaItems = getItemsBySkill(skill).filter(
    item => item.area === area && item.levelRequired <= level
  );

  const tempSkillLevels = { ...skillLevels, [skill.toLowerCase()]: level };
  const simulations: ResourceSimulation[] = [];

  for (const item of areaItems) {
    const result = calculateEnhancedGatheringResults(
      item,
      tempSkillLevels,
      houseRoomLevels,
      equipment,
      gearModifiers
    );

    const itemsPerHour = calculateItemsPerHour(item, result);
    const expectedQuantity = itemsPerHour * hours;

    // Placeholder pricing - will integrate with market data later
    const averageValuePerItem = item.isRare ? 10000 : 100;
    const totalValue = expectedQuantity * averageValuePerItem;

    simulations.push({
      itemName: item.output,
      expectedQuantity,
      averageValuePerItem,
      totalValue,
      dropChance: result.rareFind,
      isRare: item.isRare
    });
  }

  return simulations;
}

/**
 * Generate complete leveling optimization path
 */
export function generateLevelingPath(
  skill: GatheringSkillName,
  startLevel: number,
  targetLevel: number,
  skillLevels: SkillLevels,
  houseRoomLevels: HouseRoomLevels,
  equipment: EquipmentBonuses,
  gearModifiers: GearModifiers,
  settings: OptimizationSettings
): GatheringOptimizationResult {
  const levelingPath: LevelMilestone[] = [];
  let cumulativeTime = 0;
  let totalProfitEstimate = 0;

  // Get all potential unlock levels
  const allItems = getItemsBySkill(skill);
  // const unlockLevels = [...new Set(allItems.map(item => item.levelRequired))].sort((a, b) => a - b);
  void allItems; // Suppress unused warning

  // Calculate path for each significant level
  for (let currentLevel = startLevel; currentLevel < targetLevel; currentLevel++) {
    // Check if this level unlocks new areas
    const previousUnlocked = getUnlockedAreas(skill, currentLevel - 1);
    const currentUnlocked = getUnlockedAreas(skill, currentLevel);
    const newAreasUnlocked = currentUnlocked.filter(area => !previousUnlocked.includes(area));

    // Find optimal location for this level
    const optimal = findOptimalLocationForLevel(
      skill,
      currentLevel,
      skillLevels,
      houseRoomLevels,
      equipment,
      gearModifiers,
      settings
    );

    if (!optimal) continue;

    // Calculate XP needed to reach next level
    const xpToNextLevel = getExperienceForLevel(currentLevel + 1);
    const timeToNextLevel = xpToNextLevel / optimal.result.experiencePerHour;

    // Simulate resource gathering for this level
    const resourceSim = simulateResourceGathering(
      optimal.area,
      skill,
      currentLevel,
      timeToNextLevel,
      skillLevels,
      houseRoomLevels,
      equipment,
      gearModifiers
    );

    const estimatedItemsPerHour: { [itemName: string]: number } = {};
    let estimatedProfitPerHour = 0;

    for (const sim of resourceSim) {
      estimatedItemsPerHour[sim.itemName] = sim.expectedQuantity / timeToNextLevel;
      estimatedProfitPerHour += sim.totalValue / timeToNextLevel;
    }

    cumulativeTime += timeToNextLevel;
    totalProfitEstimate += estimatedProfitPerHour * timeToNextLevel;

    levelingPath.push({
      level: currentLevel,
      newAreasUnlocked,
      recommendedArea: optimal.area,
      gatheringItem: optimal.item,
      calculationResult: optimal.result,
      estimatedItemsPerHour,
      estimatedProfitPerHour,
      timeToNextLevel,
      cumulativeTime
    });

    // Early termination if exceeding max time per level
    if (timeToNextLevel > settings.maxTimePerLevel) {
      break;
    }
  }

  // Generate gear recommendations
  const gearRecommendations = generateGearRecommendations(skill, targetLevel);

  // No alternative strategies to prevent recursion - they are handled at the component level
  const alternativeStrategies: { name: string; description: string; modifiedPath: LevelMilestone[] }[] = [];

  return {
    skill,
    startLevel,
    targetLevel,
    totalTimeEstimate: cumulativeTime,
    totalProfitEstimate,
    levelingPath,
    gearRecommendations,
    alternativeStrategies
  };
}

/**
 * Generate gear recommendations based on skill and level
 */
function generateGearRecommendations(skill: GatheringSkillName, targetLevel: number): string[] {
  const recommendations: string[] = [];

  switch (skill) {
    case 'Milking':
      recommendations.push('Milking Brush - Increases milking speed');
      if (targetLevel >= 35) recommendations.push('Upgraded Milking Brush - Higher speed bonus');
      break;
    case 'Woodcutting':
      recommendations.push('Woodcutting Hatchet - Increases chopping speed');
      if (targetLevel >= 35) recommendations.push('Upgraded Hatchet - Higher speed bonus');
      break;
    case 'Foraging':
      recommendations.push('Foraging Shears - Increases gathering speed');
      if (targetLevel >= 35) recommendations.push('Upgraded Shears - Higher speed bonus');
      break;
  }

  recommendations.push('House Room Upgrades - Efficiency, Wisdom, and Rare Find bonuses');

  return recommendations;
}

// Removed generateAlternativeStrategies function to prevent recursion
// Alternative strategies are now handled at the component level

/**
 * Calculate break-even analysis for gear investments
 */
export function calculateGearBreakeven(
  skill: GatheringSkillName,
  currentLevel: number,
  gearCost: number,
  gearModifiers: GearModifiers,
  skillLevels: SkillLevels,
  houseRoomLevels: HouseRoomLevels,
  equipment: EquipmentBonuses
): { breakEvenHours: number; profitImprovement: number } {
  // Calculate without gear
  const baseGear: GearModifiers = {
    speedMultiplier: 1,
    experienceMultiplier: 1,
    rareDropMultiplier: 1,
    efficiencyBonus: 0
  };

  const optimal = findOptimalLocationForLevel(
    skill,
    currentLevel,
    skillLevels,
    houseRoomLevels,
    equipment,
    baseGear,
    { optimizeFor: 'profit', includeRareDrops: true, maxTimePerLevel: 24, profitWeighting: 0.5 }
  );

  if (!optimal) return { breakEvenHours: Infinity, profitImprovement: 0 };

  // Calculate with gear
  const gearOptimal = findOptimalLocationForLevel(
    skill,
    currentLevel,
    skillLevels,
    houseRoomLevels,
    equipment,
    gearModifiers,
    { optimizeFor: 'profit', includeRareDrops: true, maxTimePerLevel: 24, profitWeighting: 0.5 }
  );

  if (!gearOptimal) return { breakEvenHours: Infinity, profitImprovement: 0 };

  const baseProfitPerHour = optimal.score;
  const gearProfitPerHour = gearOptimal.score;
  const profitImprovement = gearProfitPerHour - baseProfitPerHour;

  const breakEvenHours = profitImprovement > 0 ? gearCost / profitImprovement : Infinity;

  return {
    breakEvenHours,
    profitImprovement
  };
}