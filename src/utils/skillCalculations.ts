/**
 * Milky Way Idle - Skill Calculation Utilities
 *
 * This file contains comprehensive calculation functions for all skill-related mechanics
 * including efficiency bonuses, house room buffs, experience calculations, and more.
 *
 * IMPORTANT GAME MECHANICS:
 * =========================
 *
 * EFFICIENCY:
 * - Base: 1% efficiency bonus for each level above action's level requirement
 * - House rooms: +1.5% efficiency per room level (except Observatory)
 * - Effect: % chance to instantly repeat the current action
 *
 * WISDOM:
 * - House rooms: +0.05% wisdom per room level
 * - Effect: Multiplicative bonus to experience gained (including combat)
 *
 * RARE FIND:
 * - House rooms: +0.2% rare find per room level
 * - Effect: % chance to obtain rare items (Meteorite Cache, Artisan Crate, etc.)
 * - Bonuses are MULTIPLICATIVE, not additive
 *
 * SPECIAL MECHANICS:
 * - Equipment bonuses: Brush (milking), Shears (foraging), Hatchet (woodcutting)
 * - Enhancing: +1% action speed per level above item's recommended level
 * - Alchemy: +1% efficiency per level above item's recommended level
 * - Observatory: +0.05% enhancing success rate & +1% action speed per level
 */

import { GatheringItem } from '@/constants/gatheringSkills';

// Types for calculation inputs
export interface SkillLevels {
  [skillName: string]: number;
}

export interface HouseRoomLevels {
  dairy_barn: number;      // Milking buffs
  garden: number;          // Foraging buffs
  log_shed: number;        // Woodcutting buffs
  forge: number;           // Cheesesmithing buffs
  workshop: number;        // Crafting buffs
  sewing_parlor: number;   // Tailoring buffs
  kitchen: number;         // Cooking buffs
  brewery: number;         // Brewing buffs
  laboratory: number;      // Alchemy buffs
  observatory: number;     // Enhancing buffs
}

export interface EquipmentBonuses {
  hasBrush: boolean;       // Milking speed bonus
  hasShears: boolean;      // Foraging speed bonus
  hasHatchet: boolean;     // Woodcutting speed bonus
}

export interface CalculationResult {
  baseTime: number;           // Original action time in seconds
  modifiedTime: number;       // Time after all modifiers
  baseExperience: number;     // Original experience per action
  modifiedExperience: number; // Experience after wisdom bonus
  efficiency: number;         // % chance to repeat action instantly
  rareFind: number;          // % chance for rare drops (multiplicative)
  actionsPerHour: number;    // Effective actions per hour including efficiency
  experiencePerHour: number; // Total XP/hour including efficiency
}

// House room mappings for each skill
const SKILL_TO_HOUSE_ROOM: { [skillName: string]: keyof HouseRoomLevels } = {
  'milking': 'dairy_barn',
  'foraging': 'garden',
  'woodcutting': 'log_shed',
  'cheesesmithing': 'forge',
  'crafting': 'workshop',
  'tailoring': 'sewing_parlor',
  'cooking': 'kitchen',
  'brewing': 'brewery',
  'alchemy': 'laboratory',
  'enhancing': 'observatory'
};

/**
 * Calculate efficiency bonus for a skill action
 * Efficiency = chance to instantly repeat the action
 */
export function calculateEfficiency(
  skillLevel: number,
  actionLevelRequirement: number,
  houseRoomLevel: number,
  skillName: string,
  targetItemLevel?: number // For alchemy calculations
): number {
  let efficiency = 0;

  // Base efficiency: 1% per level above requirement
  if (skillLevel > actionLevelRequirement) {
    efficiency += (skillLevel - actionLevelRequirement) * 1.0;
  }

  // House room efficiency: 1.5% per room level (except Observatory)
  if (skillName !== 'enhancing') {
    efficiency += houseRoomLevel * 1.5;
  }

  // Special case: Alchemy gets extra efficiency based on item level
  if (skillName === 'alchemy' && targetItemLevel) {
    if (skillLevel > targetItemLevel) {
      efficiency += (skillLevel - targetItemLevel) * 1.0;
    }
  }

  return Math.max(0, efficiency);
}

/**
 * Calculate wisdom bonus (multiplicative experience modifier)
 */
export function calculateWisdom(houseRoomLevel: number): number {
  // House rooms: +0.05% wisdom per level
  return houseRoomLevel * 0.05;
}

/**
 * Calculate rare find chance (multiplicative rare item drop modifier)
 */
export function calculateRareFind(
  baseRareChance: number,
  houseRoomLevel: number
): number {
  // House rooms: +0.2% rare find per level (multiplicative)
  const roomBonus = houseRoomLevel * 0.2;

  // Apply multiplicative bonus: base * (1 + bonus/100)
  return baseRareChance * (1 + roomBonus / 100);
}

/**
 * Calculate action speed modifier for gathering skills
 */
export function calculateActionSpeed(
  baseTime: number,
  skillName: string,
  equipment: EquipmentBonuses,
  skillLevel?: number,
  itemLevel?: number,
  observatoryLevel?: number
): number {
  let speedModifier = 1.0; // 1.0 = no change, 0.5 = 50% faster

  // Equipment bonuses (these would need specific values from game data)
  if (skillName === 'milking' && equipment.hasBrush) {
    // Brush bonus - would need actual value from game
    speedModifier *= 0.9; // Example: 10% faster
  }

  if (skillName === 'foraging' && equipment.hasShears) {
    // Shears bonus - would need actual value from game
    speedModifier *= 0.9; // Example: 10% faster
  }

  if (skillName === 'woodcutting' && equipment.hasHatchet) {
    // Hatchet bonus - would need actual value from game
    speedModifier *= 0.9; // Example: 10% faster
  }

  // Enhancing speed bonus: 1% per level above item's recommended level
  if (skillName === 'enhancing' && skillLevel && itemLevel && skillLevel > itemLevel) {
    const speedBonus = (skillLevel - itemLevel) * 1.0; // 1% per level
    speedModifier *= (1 - speedBonus / 100);
  }

  // Observatory action speed: 1% per level
  if (skillName === 'enhancing' && observatoryLevel) {
    const observatorySpeed = observatoryLevel * 1.0; // 1% per level
    speedModifier *= (1 - observatorySpeed / 100);
  }

  return baseTime * speedModifier;
}

/**
 * Calculate comprehensive skill results for a gathering action
 */
export function calculateGatheringSkillResults(
  gatheringItem: GatheringItem,
  skillLevels: SkillLevels,
  houseRoomLevels: HouseRoomLevels,
  equipment: EquipmentBonuses = { hasBrush: false, hasShears: false, hasHatchet: false }
): CalculationResult {
  const skillName = gatheringItem.skill.toLowerCase();
  const skillLevel = skillLevels[skillName] || 1;
  const houseRoomLevel = houseRoomLevels[SKILL_TO_HOUSE_ROOM[skillName]] || 0;

  // Calculate efficiency
  const efficiency = calculateEfficiency(
    skillLevel,
    gatheringItem.levelRequired,
    houseRoomLevel,
    skillName
  );

  // Calculate wisdom bonus
  const wisdom = calculateWisdom(houseRoomLevel);

  // Calculate rare find for rare items
  const rareFind = gatheringItem.isRare
    ? calculateRareFind(gatheringItem.dropChance, houseRoomLevel)
    : gatheringItem.dropChance;

  // Calculate action speed
  const modifiedTime = calculateActionSpeed(
    gatheringItem.timePerGather,
    skillName,
    equipment,
    skillLevel,
    undefined,
    skillName === 'enhancing' ? houseRoomLevels.observatory : undefined
  );

  // Calculate experience with wisdom bonus
  const modifiedExperience = gatheringItem.experiencePerGather * (1 + wisdom / 100);

  // Calculate effective actions per hour (accounting for efficiency)
  const baseActionsPerHour = 3600 / modifiedTime;
  const effectiveActionsPerHour = baseActionsPerHour * (1 + efficiency / 100);

  // Calculate experience per hour
  const experiencePerHour = effectiveActionsPerHour * modifiedExperience;

  return {
    baseTime: gatheringItem.timePerGather,
    modifiedTime,
    baseExperience: gatheringItem.experiencePerGather,
    modifiedExperience,
    efficiency,
    rareFind,
    actionsPerHour: effectiveActionsPerHour,
    experiencePerHour
  };
}

/**
 * Calculate expected items per hour for a gathering action
 */
export function calculateItemsPerHour(
  gatheringItem: GatheringItem,
  calculationResult: CalculationResult
): number {
  // Get expected items per action
  let expectedItemsPerAction: number;

  if (typeof gatheringItem.amountRange === 'number') {
    expectedItemsPerAction = gatheringItem.amountRange;
  } else {
    // For ranges, use average and apply floor (game rounds down)
    const avgAmount = (gatheringItem.amountRange.min + gatheringItem.amountRange.max) / 2;
    expectedItemsPerAction = Math.floor(avgAmount);
  }

  // Apply drop chance
  const expectedWithDropChance = expectedItemsPerAction * (calculationResult.rareFind / 100);

  // Multiply by effective actions per hour
  return expectedWithDropChance * calculationResult.actionsPerHour;
}

/**
 * Calculate time to reach a target level
 */
export function calculateTimeToLevel(
  currentLevel: number,
  targetLevel: number,
  experiencePerHour: number,
  getExperienceForLevel: (level: number) => number
): { hours: number; days: number } {
  if (targetLevel <= currentLevel) {
    return { hours: 0, days: 0 };
  }

  let totalExperienceNeeded = 0;
  for (let level = currentLevel; level < targetLevel; level++) {
    totalExperienceNeeded += getExperienceForLevel(level + 1);
  }

  const hoursNeeded = totalExperienceNeeded / experiencePerHour;
  const daysNeeded = hoursNeeded / 24;

  return {
    hours: Math.ceil(hoursNeeded),
    days: Math.ceil(daysNeeded * 10) / 10 // Round to 1 decimal place
  };
}

/**
 * Experience table for Milky Way Idle (placeholder - would need actual values)
 * This is a simplified exponential curve - replace with actual game values
 */
export function getExperienceForLevel(level: number): number {
  if (level <= 1) return 0;

  // Simplified exponential formula - replace with actual MWI experience table
  return Math.floor(100 * Math.pow(1.1, level - 1));
}

/**
 * Get total experience needed to reach a level
 */
export function getTotalExperienceForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += getExperienceForLevel(i);
  }
  return total;
}

/**
 * Helper function to format time duration
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.ceil(hours * 60);
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${Math.ceil(hours)}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.ceil(hours % 24);
    return `${days}d ${remainingHours}h`;
  }
}

/**
 * Calculate optimal gathering location for a skill based on efficiency
 */
export function findOptimalGatheringLocation(
  gatheringItems: GatheringItem[],
  skillName: string,
  skillLevels: SkillLevels,
  houseRoomLevels: HouseRoomLevels,
  equipment: EquipmentBonuses,
  optimizeFor: 'experience' | 'items' | 'efficiency' = 'experience'
): { item: GatheringItem; result: CalculationResult; score: number } | null {
  const validItems = gatheringItems.filter(item =>
    item.skill.toLowerCase() === skillName.toLowerCase() &&
    item.levelRequired <= (skillLevels[skillName.toLowerCase()] || 1)
  );

  if (validItems.length === 0) return null;

  let bestOption: { item: GatheringItem; result: CalculationResult; score: number } | null = null;

  for (const item of validItems) {
    const result = calculateGatheringSkillResults(item, skillLevels, houseRoomLevels, equipment);

    let score: number;
    switch (optimizeFor) {
      case 'experience':
        score = result.experiencePerHour;
        break;
      case 'items':
        score = calculateItemsPerHour(item, result);
        break;
      case 'efficiency':
        score = result.efficiency;
        break;
      default:
        score = result.experiencePerHour;
    }

    if (!bestOption || score > bestOption.score) {
      bestOption = { item, result, score };
    }
  }

  return bestOption;
}