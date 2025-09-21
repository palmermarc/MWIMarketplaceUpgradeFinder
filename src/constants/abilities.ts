import { getExperienceBetweenLevels } from './experience';

export interface AbilityInfo {
  name: string;
  hrid: string;
  displayName: string;
  bookExperience: number; // Experience gained from using the ability book
}

export interface AbilityBookCalculation {
  abilityHrid: string;
  abilityName: string;
  fromLevel: number;
  toLevel: number;
  experienceNeeded: number;
  booksRequired: number;
  bookExperienceValue: number;
  excessExperience: number; // Experience gained beyond target level
}

export interface AbilityBookCostCalculation extends AbilityBookCalculation {
  bookItemHrid: string;
  bookName: string;
  unitPrice?: number; // Price per book from marketplace
  totalCost?: number; // Total cost for all books needed
  marketplaceAvailable?: boolean; // Whether books are available in marketplace
}

export interface AbilitiesByType {
  [key: string]: AbilityInfo[];
}

// Helper function to convert ability name to hrid format
const createAbilityHrid = (name: string): string => {
  return `/abilities/${name.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '')}`;
};

// Helper function to create display name (capitalize and space)
const createDisplayName = (name: string): string => {
  return name;
};

// Helper function to determine book experience based on ability name
const getBookExperience = (name: string): number => {
  const lowExpAbilities = ['Poke', 'Scratch', 'Smack', 'Quick Shot', 'Water Strike', 'Entangle', 'Fireball', 'Minor Heal'];
  return lowExpAbilities.includes(name) ? 50 : 500;
};

// Create ability info objects
const createAbility = (name: string): AbilityInfo => ({
  name: name.toLowerCase().replace(/\s+/g, '_').replace(/'/g, ''),
  hrid: createAbilityHrid(name),
  displayName: createDisplayName(name),
  bookExperience: getBookExperience(name)
});

export const ABILITIES_BY_TYPE: AbilitiesByType = {
  melee: [
    createAbility('Poke'),
    createAbility('Impale'),
    createAbility('Puncture'),
    createAbility('Penetrating Strike'),
    createAbility('Scratch'),
    createAbility('Cleave'),
    createAbility('Maim'),
    createAbility('Crippling Slash'),
    createAbility('Smack'),
    createAbility('Sweep'),
    createAbility('Stunning Blow')
  ],
  ranged: [
    createAbility('Quick Shot'),
    createAbility('Flame Arrow'),
    createAbility('Aqua Arrow'),
    createAbility('Rain of Arrows'),
    createAbility('Silencing Shot'),
    createAbility('Steady Shot'),
    createAbility('Pestilent Shot'),
    createAbility('Penetrating Shot')
  ],
  magic: [
    createAbility('Water Strike'),
    createAbility('Ice Spear'),
    createAbility('Frost Surge'),
    createAbility('Mana Spring'),
    createAbility('Entangle'),
    createAbility('Toxic Pollen'),
    createAbility('Nature\'s Veil'),
    createAbility('Life Drain'),
    createAbility('Fireball'),
    createAbility('Flame Blast'),
    createAbility('Firestorm'),
    createAbility('Smoke Burst'),
    createAbility('Minor Heal'),
    createAbility('Heal'),
    createAbility('Quick Aid'),
    createAbility('Rejuvenate')
  ],
  buffing: [
    createAbility('Taunt'),
    createAbility('Provoke'),
    createAbility('Toughness'),
    createAbility('Elusiveness'),
    createAbility('Precision'),
    createAbility('Berserk'),
    createAbility('Elemental Affinity'),
    createAbility('Frenzy'),
    createAbility('Spike Shell'),
    createAbility('Arcane Reflection'),
    createAbility('Vampirism')
  ],
  special: [
    createAbility('Revive'),
    createAbility('Insanity'),
    createAbility('Invincible'),
    createAbility('Fierce Aura'),
    createAbility('Aqua Aura'),
    createAbility('Sylvan Aura'),
    createAbility('Flame Aura'),
    createAbility('Speed Aura'),
    createAbility('Critical Aura')
  ]
};

// Flattened list of all abilities for easier lookup
export const ALL_ABILITIES: AbilityInfo[] = Object.values(ABILITIES_BY_TYPE).flat();

// Helper function to get ability info by hrid
export const getAbilityByHrid = (hrid: string): AbilityInfo | undefined => {
  return ALL_ABILITIES.find(ability => ability.hrid === hrid);
};

// Helper function to get ability info by name
export const getAbilityByName = (name: string): AbilityInfo | undefined => {
  return ALL_ABILITIES.find(ability => ability.name === name);
};

// Helper function to get ability type by hrid
export const getAbilityType = (hrid: string): string | undefined => {
  for (const [type, abilities] of Object.entries(ABILITIES_BY_TYPE)) {
    if (abilities.some(ability => ability.hrid === hrid)) {
      return type;
    }
  }
  return undefined;
};

// Helper function to get abilities by book experience value
export const getAbilitiesByBookExperience = (experience: number): AbilityInfo[] => {
  return ALL_ABILITIES.filter(ability => ability.bookExperience === experience);
};

// Get basic abilities (50 exp books)
export const getBasicAbilities = (): AbilityInfo[] => {
  return getAbilitiesByBookExperience(50);
};

// Get advanced abilities (500 exp books)
export const getAdvancedAbilities = (): AbilityInfo[] => {
  return getAbilitiesByBookExperience(500);
};

// Type display names for UI
export const ABILITY_TYPE_DISPLAY_NAMES: { [key: string]: string } = {
  melee: 'Melee Abilities',
  ranged: 'Ranged Abilities',
  magic: 'Magic Abilities',
  buffing: 'Buffing Abilities',
  special: 'Special Abilities'
};

// Experience value constants
export const ABILITY_BOOK_EXPERIENCE = {
  BASIC: 50,
  ADVANCED: 500
} as const;

// Helper function to get book item HRID for an ability
const getAbilityBookItemHrid = (abilityHrid: string): string => {
  const ability = getAbilityByHrid(abilityHrid);
  if (!ability) return '/items/unknown_ability_book';

  // Convert ability HRID to item HRID format
  // /abilities/rain_of_arrows -> /items/rain_of_arrows
  return abilityHrid.replace('/abilities/', '/items/');
};

// Helper function to get book display name for an ability
const getAbilityBookName = (abilityHrid: string): string => {
  const ability = getAbilityByHrid(abilityHrid);
  if (!ability) return 'Unknown Ability';

  // Return the display name of the ability itself
  return ability.displayName;
};

/**
 * Calculate how many books are required to level an ability from start to target level
 */
export const calculateAbilityBookRequirement = (
  abilityHrid: string,
  fromLevel: number,
  toLevel: number
): AbilityBookCalculation | null => {
  if (fromLevel >= toLevel) return null;

  const ability = getAbilityByHrid(abilityHrid);
  if (!ability) return null;

  const experienceNeeded = getExperienceBetweenLevels(fromLevel, toLevel);
  const bookExperienceValue = ability.bookExperience;
  const booksRequired = Math.ceil(experienceNeeded / bookExperienceValue);
  const totalExperienceGained = booksRequired * bookExperienceValue;
  const excessExperience = totalExperienceGained - experienceNeeded;

  return {
    abilityHrid,
    abilityName: ability.displayName,
    fromLevel,
    toLevel,
    experienceNeeded,
    booksRequired,
    bookExperienceValue,
    excessExperience
  };
};

/**
 * Calculate the marketplace cost for books needed to level an ability
 */
export const calculateAbilityBookCost = (
  abilityHrid: string,
  fromLevel: number,
  toLevel: number,
  marketplaceData?: { [itemHrid: string]: { price: number; available: boolean } }
): AbilityBookCostCalculation | null => {
  const bookCalculation = calculateAbilityBookRequirement(abilityHrid, fromLevel, toLevel);
  if (!bookCalculation) return null;

  const bookItemHrid = getAbilityBookItemHrid(abilityHrid);
  const bookName = getAbilityBookName(abilityHrid);

  let unitPrice: number | undefined;
  let totalCost: number | undefined;
  let marketplaceAvailable: boolean | undefined;

  if (marketplaceData && marketplaceData[bookItemHrid]) {
    const marketplaceItem = marketplaceData[bookItemHrid];
    unitPrice = marketplaceItem.price;
    totalCost = bookCalculation.booksRequired * unitPrice;
    marketplaceAvailable = marketplaceItem.available;
  }

  return {
    ...bookCalculation,
    bookItemHrid,
    bookName,
    unitPrice,
    totalCost,
    marketplaceAvailable
  };
};

/**
 * Calculate book requirements for multiple abilities
 */
export const calculateMultipleAbilityBookRequirements = (
  abilities: Array<{ abilityHrid: string; fromLevel: number; toLevel: number }>
): AbilityBookCalculation[] => {
  return abilities
    .map(({ abilityHrid, fromLevel, toLevel }) =>
      calculateAbilityBookRequirement(abilityHrid, fromLevel, toLevel)
    )
    .filter(Boolean) as AbilityBookCalculation[];
};

/**
 * Calculate total cost for multiple ability upgrades
 */
export const calculateMultipleAbilityBookCosts = (
  abilities: Array<{ abilityHrid: string; fromLevel: number; toLevel: number }>,
  marketplaceData?: { [itemHrid: string]: { price: number; available: boolean } }
): {
  calculations: AbilityBookCostCalculation[];
  summary: {
    totalBooks: number;
    totalCost?: number;
    bookTypes: { [bookItemHrid: string]: { name: string; count: number; cost?: number } };
  };
} => {
  const calculations = abilities
    .map(({ abilityHrid, fromLevel, toLevel }) =>
      calculateAbilityBookCost(abilityHrid, fromLevel, toLevel, marketplaceData)
    )
    .filter(Boolean) as AbilityBookCostCalculation[];

  // Summarize by book types
  const bookTypes: { [bookItemHrid: string]: { name: string; count: number; cost?: number } } = {};
  let totalBooks = 0;
  let totalCost = 0;
  let hasCostData = true;

  calculations.forEach(calc => {
    if (!bookTypes[calc.bookItemHrid]) {
      bookTypes[calc.bookItemHrid] = {
        name: calc.bookName,
        count: 0,
        cost: 0
      };
    }

    bookTypes[calc.bookItemHrid].count += calc.booksRequired;
    totalBooks += calc.booksRequired;

    if (calc.totalCost !== undefined && bookTypes[calc.bookItemHrid].cost !== undefined) {
      bookTypes[calc.bookItemHrid].cost! += calc.totalCost;
      totalCost += calc.totalCost;
    } else {
      bookTypes[calc.bookItemHrid].cost = undefined;
      hasCostData = false;
    }
  });

  return {
    calculations,
    summary: {
      totalBooks,
      totalCost: hasCostData ? totalCost : undefined,
      bookTypes
    }
  };
};