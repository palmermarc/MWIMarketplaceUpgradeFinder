/**
 * Milky Way Idle - Gathering Skills Data
 *
 * This file contains comprehensive data for all three gathering skills in Milky Way Idle:
 * - Milking: Extracting milk and essences from various cow types
 * - Woodcutting: Harvesting logs and essences from different tree types
 * - Foraging: Collecting fruits, berries, beans, and materials from various areas
 *
 * DATA STRUCTURE EXPLANATION:
 * ==========================
 *
 * Each gathering entry represents a single item that can be obtained from a specific area:
 *
 * 1. skill: The gathering skill name ('Milking' | 'Woodcutting' | 'Foraging')
 * 2. area: The gathering area/location that the user selects in the game
 * 3. output: The item name that is produced/gathered
 * 4. amountRange: Item drop quantity - can be:
 *    - Single number (e.g., 1) for guaranteed single drops
 *    - Range string (e.g., "1.3-3.9") for variable drops
 *    - Range object { min: number, max: number } for parsed ranges
 *
 *    IMPORTANT: The game generates a random number within the range and then ROUNDS DOWN.
 *    Example: Range "1.3-3.9" could generate 2.7, which rounds down to 2 items.
 *
 * 5. dropChance: Percentage chance of getting this item (0-100%)
 *    - 100% = guaranteed drop every gather
 *    - Lower percentages = chance-based drops
 *
 * 6. isRare: Boolean indicating if this is considered a rare drop
 *    - true = rare drop (usually low chance, valuable items)
 *    - false = common drop (milk, logs, essences, etc.)
 *
 * 7. timePerGather: Time in seconds for each gathering action to complete
 *
 * 8. experiencePerGather: XP gained per successful gathering action
 *
 * 9. levelRequired: Minimum skill level required to access this gathering area
 *
 * CALCULATION NOTES:
 * ==================
 *
 * For calculating expected items per gather:
 * - For ranges: Use (min + max) / 2 as average, then apply Math.floor() for game rounding
 * - Multiply by dropChance percentage to get expected drops
 * - Consider time efficiency: items per second = (expected items) / timePerGather
 *
 * For XP calculations:
 * - XP is gained per gathering action, regardless of items received
 * - XP rate = experiencePerGather / timePerGather (XP per second)
 */

// Type definitions for gathering skills data
export type GatheringSkillName = 'Milking' | 'Woodcutting' | 'Foraging';

export interface AmountRange {
  min: number;
  max: number;
  original: string; // Keep original string for reference
}

export interface GatheringItem {
  skill: GatheringSkillName;
  area: string;
  output: string;
  amountRange: number | AmountRange; // Single number or range object
  dropChance: number; // Percentage (0-100)
  isRare: boolean;
  timePerGather: number; // Seconds
  experiencePerGather: number;
  levelRequired: number;
}

// Helper function to parse amount ranges from CSV data
function parseAmountRange(amountStr: string): number | AmountRange {
  // Check if it's a range (contains hyphen)
  if (amountStr.includes('-')) {
    const [minStr, maxStr] = amountStr.split('-');
    return {
      min: parseFloat(minStr),
      max: parseFloat(maxStr),
      original: amountStr
    };
  }

  // Single number
  return parseFloat(amountStr);
}

// Helper function to parse percentage strings (removes % and converts to number)
function parsePercentage(percentStr: string): number {
  return parseFloat(percentStr.replace('%', ''));
}

/**
 * GATHERING SKILLS DATA
 * =====================
 *
 * Organized by skill type, then by area/level progression.
 * Data sourced from "Milkway Idle Skills - Gathering.csv"
 */
export const GATHERING_SKILLS_DATA: GatheringItem[] = [
  // ====================================
  // MILKING SKILL
  // ====================================
  // Basic Cow (Level 1)
  {
    skill: 'Milking',
    area: 'Cow',
    output: 'Milk',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },
  {
    skill: 'Milking',
    area: 'Cow',
    output: 'Milking Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('1.6800%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },
  {
    skill: 'Milking',
    area: 'Cow',
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0140%'),
    isRare: true,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },

  // Verdant Cow (Level 10)
  {
    skill: 'Milking',
    area: 'Verdant Cow',
    output: 'Verdant Milk',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },
  {
    skill: 'Milking',
    area: 'Verdant Cow',
    output: 'Milking Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('1.6800%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 9.7,
    levelRequired: 10
  },
  {
    skill: 'Milking',
    area: 'Verdant Cow',
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0140%'),
    isRare: true,
    timePerGather: 6,
    experiencePerGather: 9.7,
    levelRequired: 10
  },

  // Azure Cow (Level 20)
  {
    skill: 'Milking',
    area: 'Azure Cow',
    output: 'Azure Milk',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },
  {
    skill: 'Milking',
    area: 'Azure Cow',
    output: 'Milking Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('1.6800%'),
    isRare: false,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },
  {
    skill: 'Milking',
    area: 'Azure Cow',
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0140%'),
    isRare: true,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },

  // Burble Cow (Level 35)
  {
    skill: 'Milking',
    area: 'Burble Cow',
    output: 'Burble Milk',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },
  {
    skill: 'Milking',
    area: 'Burble Cow',
    output: 'Milking Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('1.6800%'),
    isRare: false,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },
  {
    skill: 'Milking',
    area: 'Burble Cow',
    output: 'Medium Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0216%'),
    isRare: true,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },

  // Crimson Cow (Level 50)
  {
    skill: 'Milking',
    area: 'Crimson Cow',
    output: 'Crimson Milk',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },
  {
    skill: 'Milking',
    area: 'Crimson Cow',
    output: 'Milking Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('7.0800%'), // Note: Higher essence chance
    isRare: false,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },
  {
    skill: 'Milking',
    area: 'Crimson Cow',
    output: 'Medium Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0302%'),
    isRare: true,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },

  // Unicow (Level 65)
  {
    skill: 'Milking',
    area: 'Unicow',
    output: 'Rainbow Milk',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Milking',
    area: 'Unicow',
    output: 'Milking Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('1.6800%'),
    isRare: false,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Milking',
    area: 'Unicow',
    output: 'Butter of Proficiency',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0010%'), // Extremely rare
    isRare: true,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Milking',
    area: 'Unicow',
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0140%'),
    isRare: true,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },

  // Holy Cow (Level 80)
  {
    skill: 'Milking',
    area: 'Holy Cow',
    output: 'Holy Milk',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Milking',
    area: 'Holy Cow',
    output: 'Milking Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('1.6800%'),
    isRare: false,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Milking',
    area: 'Holy Cow',
    output: 'Butter of Proficiency',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0010%'),
    isRare: true,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Milking',
    area: 'Holy Cow',
    output: 'Large Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0140%'),
    isRare: true,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },

  // ====================================
  // WOODCUTTING SKILL
  // ====================================
  // Tree (Level 1)
  {
    skill: 'Woodcutting',
    area: 'Tree',
    output: 'Log',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },
  {
    skill: 'Woodcutting',
    area: 'Tree',
    output: 'Woodcutting Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('1.6800%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },
  {
    skill: 'Woodcutting',
    area: 'Small', // Note: CSV shows "Small " - might be truncated area name
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0140%'),
    isRare: true,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },

  // Birch Tree (Level 10)
  {
    skill: 'Woodcutting',
    area: 'Birch Tree',
    output: 'Birch Log',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },
  {
    skill: 'Woodcutting',
    area: 'Birch Tree',
    output: 'Woodcutting Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('2.4400%'),
    isRare: false,
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },
  {
    skill: 'Woodcutting',
    area: 'Birch Tree',
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0204%'),
    isRare: true,
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },

  // Cedar Tree (Level 20)
  {
    skill: 'Woodcutting',
    area: 'Cedar Tree',
    output: 'Cedar Log',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },
  {
    skill: 'Woodcutting',
    area: 'Cedar Tree',
    output: 'Woodcutting Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('3.6700%'),
    isRare: false,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },
  {
    skill: 'Woodcutting',
    area: 'Cedar Tree',
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0306%'),
    isRare: true,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },

  // Purpleheart Tree (Level 35)
  {
    skill: 'Woodcutting',
    area: 'Purpleheart Tree',
    output: 'Purpleheart Log',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },
  {
    skill: 'Woodcutting',
    area: 'Purpleheart Tree',
    output: 'Woodcutting Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('5.2500%'),
    isRare: false,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },
  {
    skill: 'Woodcutting',
    area: 'Purpleheart Tree',
    output: 'Medium Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0216%'),
    isRare: true,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },

  // Ginkgo Tree (Level 50)
  {
    skill: 'Woodcutting',
    area: 'Ginkgo Tree',
    output: 'Ginkgo Log',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },
  {
    skill: 'Woodcutting',
    area: 'Ginkgo Tree',
    output: 'Woodcutting Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('7.0800%'),
    isRare: false,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },
  {
    skill: 'Woodcutting',
    area: 'Ginkgo Tree',
    output: 'Medium Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0302%'),
    isRare: true,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },

  // Redwood Tree (Level 65)
  {
    skill: 'Woodcutting',
    area: 'Redwood Tree',
    output: 'Redwood Log',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Woodcutting',
    area: 'Redwood Tree',
    output: 'Woodcutting Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('9.1700%'),
    isRare: false,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Woodcutting',
    area: 'Redwood Tree',
    output: 'Branch of Insight',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0010%'),
    isRare: true,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Woodcutting',
    area: 'Redwood Tree',
    output: 'Medium Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0401%'),
    isRare: true,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },

  // Arcane Tree (Level 80)
  {
    skill: 'Woodcutting',
    area: 'Arcane Tree',
    output: 'Arcane Log',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('100.0000%'),
    isRare: false,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Woodcutting',
    area: 'Arcane Tree',
    output: 'Woodcutting Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('15.0000%'), // Significantly higher essence chance
    isRare: false,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Woodcutting',
    area: 'Arcane Tree',
    output: 'Branch of Insight',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0030%'),
    isRare: true,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Woodcutting',
    area: 'Arcane Tree',
    output: 'Large Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0382%'),
    isRare: true,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },

  // ====================================
  // FORAGING SKILL
  // ====================================
  // Farmland (Level 1)
  {
    skill: 'Foraging',
    area: 'Farmland',
    output: 'Egg',
    amountRange: parseAmountRange('1.3-7.8'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },
  {
    skill: 'Foraging',
    area: 'Farmland',
    output: 'Wheat',
    amountRange: parseAmountRange('1.3-7.8'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },
  {
    skill: 'Foraging',
    area: 'Farmland',
    output: 'Sugar',
    amountRange: parseAmountRange('1.3-18.1'), // Much larger range
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },
  {
    skill: 'Foraging',
    area: 'Farmland',
    output: 'Cotton',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },
  {
    skill: 'Foraging',
    area: 'Farmland',
    output: 'Foraging Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('1.6800%'),
    isRare: false,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },
  {
    skill: 'Foraging',
    area: 'Farmland',
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0140%'),
    isRare: true,
    timePerGather: 6,
    experiencePerGather: 6.5,
    levelRequired: 1
  },

  // Shimmering Lake (Level 10)
  {
    skill: 'Foraging',
    area: 'Shimmering Lake',
    output: 'Blueberry',
    amountRange: parseAmountRange('1.3-10.4'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },
  {
    skill: 'Foraging',
    area: 'Shimmering Lake',
    output: 'Apple',
    amountRange: parseAmountRange('1.3-5.2'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },
  {
    skill: 'Foraging',
    area: 'Shimmering Lake',
    output: 'Arabica Coffee Bean',
    amountRange: parseAmountRange('1.3'), // Fixed amount
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },
  {
    skill: 'Foraging',
    area: 'Shimmering Lake',
    output: 'Flax',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },
  {
    skill: 'Foraging',
    area: 'Shimmering Lake',
    output: 'Foraging Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('2.4400%'),
    isRare: true, // Note: CSV shows 1 for isRare
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },
  {
    skill: 'Foraging',
    area: 'Shimmering Lake',
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0204%'),
    isRare: false, // Note: CSV shows 0 for isRare
    timePerGather: 8,
    experiencePerGather: 9.7,
    levelRequired: 10
  },

  // Misty Forest (Level 20)
  {
    skill: 'Foraging',
    area: 'Misty Forest',
    output: 'Blackberry',
    amountRange: parseAmountRange('1.3-10.4'),
    dropChance: parsePercentage('40.0000%'), // Higher chance than Shimmering Lake
    isRare: false,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },
  {
    skill: 'Foraging',
    area: 'Misty Forest',
    output: 'Orange',
    amountRange: parseAmountRange('1.3-5.2'),
    dropChance: parsePercentage('40.0000%'),
    isRare: false,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },
  {
    skill: 'Foraging',
    area: 'Misty Forest',
    output: 'Robusta Coffee Bean',
    amountRange: parseAmountRange('1.3'),
    dropChance: parsePercentage('40.0000%'),
    isRare: false,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },
  {
    skill: 'Foraging',
    area: 'Misty Forest',
    output: 'Foraging Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('3.6700%'),
    isRare: false,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },
  {
    skill: 'Foraging',
    area: 'Misty Forest',
    output: 'Small Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0306%'),
    isRare: true,
    timePerGather: 11,
    experiencePerGather: 16.2,
    levelRequired: 20
  },

  // Burble Beach (Level 35)
  {
    skill: 'Foraging',
    area: 'Burble Beach',
    output: 'Strawberry',
    amountRange: parseAmountRange('1.3-10.4'),
    dropChance: parsePercentage('30.0000%'), // Back to 30%
    isRare: false,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },
  {
    skill: 'Foraging',
    area: 'Burble Beach',
    output: 'Plum',
    amountRange: parseAmountRange('1.3-5.2'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },
  {
    skill: 'Foraging',
    area: 'Burble Beach',
    output: 'Liberica Coffee Bean',
    amountRange: parseAmountRange('1.3'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },
  {
    skill: 'Foraging',
    area: 'Burble Beach',
    output: 'Bamboo Branch',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },
  {
    skill: 'Foraging',
    area: 'Burble Beach',
    output: 'Foraging Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('5.2500%'),
    isRare: false,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },
  {
    skill: 'Foraging',
    area: 'Burble Beach',
    output: 'Medium Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0216%'),
    isRare: true,
    timePerGather: 14,
    experiencePerGather: 25.9,
    levelRequired: 35
  },

  // Silly Cow Valley (Level 50)
  {
    skill: 'Foraging',
    area: 'Silly Cow Valley',
    output: 'Mooberry',
    amountRange: parseAmountRange('1.3-10.4'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },
  {
    skill: 'Foraging',
    area: 'Silly Cow Valley',
    output: 'Peach',
    amountRange: parseAmountRange('1.3-5.2'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },
  {
    skill: 'Foraging',
    area: 'Silly Cow Valley',
    output: 'Excelsa Coffee Bean',
    amountRange: parseAmountRange('1.3'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },
  {
    skill: 'Foraging',
    area: 'Silly Cow Valley',
    output: 'Cocoon',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },
  {
    skill: 'Foraging',
    area: 'Silly Cow Valley',
    output: 'Foraging Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('7.0800%'),
    isRare: false,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },
  {
    skill: 'Foraging',
    area: 'Silly Cow Valley',
    output: 'Medium Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0302%'),
    isRare: true,
    timePerGather: 17,
    experiencePerGather: 38.8,
    levelRequired: 50
  },

  // Olympus Mons (Level 65)
  {
    skill: 'Foraging',
    area: 'Olympus Mons',
    output: 'Marsberry',
    amountRange: parseAmountRange('1.3-10.4'),
    dropChance: parsePercentage('40.0000%'), // Higher chance
    isRare: false,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Foraging',
    area: 'Olympus Mons',
    output: 'Dragon Fruit',
    amountRange: parseAmountRange('1.3-5.2'),
    dropChance: parsePercentage('40.0000%'),
    isRare: false,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Foraging',
    area: 'Olympus Mons',
    output: 'Fieriosa Coffee Bean',
    amountRange: parseAmountRange('1.3'),
    dropChance: parsePercentage('40.0000%'),
    isRare: false,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Foraging',
    area: 'Olympus Mons',
    output: 'Foraging Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('9.1700%'),
    isRare: false,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Foraging',
    area: 'Olympus Mons',
    output: 'Thread of Expertise',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0010%'),
    isRare: true,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },
  {
    skill: 'Foraging',
    area: 'Olympus Mons',
    output: 'Medium Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0401%'),
    isRare: true,
    timePerGather: 20,
    experiencePerGather: 51.8,
    levelRequired: 65
  },

  // Asteroid Belt (Level 80)
  {
    skill: 'Foraging',
    area: 'Asteroid Belt',
    output: 'Spaceberry',
    amountRange: parseAmountRange('1.3-10.4'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Foraging',
    area: 'Asteroid Belt',
    output: 'Star Fruit',
    amountRange: parseAmountRange('1.3-5.2'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Foraging',
    area: 'Asteroid Belt',
    output: 'Spacia Coffee Bean',
    amountRange: parseAmountRange('1.3'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Foraging',
    area: 'Asteroid Belt',
    output: 'Radiant Fiber',
    amountRange: parseAmountRange('1.3-3.9'),
    dropChance: parsePercentage('30.0000%'),
    isRare: false,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Foraging',
    area: 'Asteroid Belt',
    output: 'Foraging Essence',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('15.0000%'), // Highest essence chance
    isRare: false,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Foraging',
    area: 'Asteroid Belt',
    output: 'Thread of Expertise',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0030%'),
    isRare: true,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  },
  {
    skill: 'Foraging',
    area: 'Asteroid Belt',
    output: 'Large Meteorite Cache',
    amountRange: parseAmountRange('1'),
    dropChance: parsePercentage('0.0382%'),
    isRare: true,
    timePerGather: 30,
    experiencePerGather: 71.2,
    levelRequired: 80
  }
];

// ====================================
// UTILITY FUNCTIONS
// ====================================

/**
 * Get all gathering areas for a specific skill
 */
export function getAreasBySkill(skill: GatheringSkillName): string[] {
  const areas = GATHERING_SKILLS_DATA
    .filter(item => item.skill === skill)
    .map(item => item.area);
  return [...new Set(areas)]; // Remove duplicates
}

/**
 * Get all items that can be gathered from a specific area
 */
export function getItemsByArea(area: string): GatheringItem[] {
  return GATHERING_SKILLS_DATA.filter(item => item.area === area);
}

/**
 * Get all items for a specific skill
 */
export function getItemsBySkill(skill: GatheringSkillName): GatheringItem[] {
  return GATHERING_SKILLS_DATA.filter(item => item.skill === skill);
}

/**
 * Calculate expected items per gather (accounting for drop chance and amount range)
 */
export function calculateExpectedItems(item: GatheringItem): number {
  let avgAmount: number;

  if (typeof item.amountRange === 'number') {
    avgAmount = item.amountRange;
  } else {
    // For ranges, use average of min and max
    avgAmount = (item.amountRange.min + item.amountRange.max) / 2;
  }

  // Apply drop chance and game's floor rounding
  const expectedAmount = Math.floor(avgAmount * (item.dropChance / 100));
  return expectedAmount;
}

/**
 * Calculate XP per second for a gathering item
 */
export function calculateXpPerSecond(item: GatheringItem): number {
  return item.experiencePerGather / item.timePerGather;
}

/**
 * Calculate items per second for a gathering item
 */
export function calculateItemsPerSecond(item: GatheringItem): number {
  const expectedItems = calculateExpectedItems(item);
  return expectedItems / item.timePerGather;
}

/**
 * Get all rare drops across all skills
 */
export function getRareDrops(): GatheringItem[] {
  return GATHERING_SKILLS_DATA.filter(item => item.isRare);
}

/**
 * Get areas unlocked at or before a specific level for a skill
 */
export function getUnlockedAreas(skill: GatheringSkillName, currentLevel: number): string[] {
  const areas = GATHERING_SKILLS_DATA
    .filter(item => item.skill === skill && item.levelRequired <= currentLevel)
    .map(item => item.area);
  return [...new Set(areas)];
}