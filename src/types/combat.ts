export interface CombatTarget {
  id: string;
  name: string;
  level: number;
  hp: number;
  mp: number;
  stats: {
    attack: number;
    defense: number;
    magic: number;
    ranged: number;
    intelligence: number;
    stamina: number;
  };
  abilities: string[];
  rewards: {
    experience: number;
    coins: number;
    items?: {
      itemHrid: string;
      dropRate: number;
      quantity: number;
    }[];
  };
  location: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite' | 'Boss';
}

export interface SimulationConfig {
  character: {
    stats: {
      attack: number;
      defense: number;
      magic: number;
      ranged: number;
      intelligence: number;
      stamina: number;
    };
    equipment: {
      [slot: string]: {
        item: string;
        enhancement: number;
      };
    };
    abilities: Array<{
      abilityHrid: string;
      level: number;
    }>;
    consumables: {
      food: Array<{ itemHrid: string }>;
      drinks: Array<{ itemHrid: string }>;
    };
  };
  target: CombatTarget;
  iterations: number;
  strategy: 'balanced' | 'aggressive' | 'defensive' | 'ranged' | 'magic';
}

export interface SimulationResult {
  success: boolean;
  winRate: number;
  averageCombatTime: number;
  averageDamageDealt: number;
  averageDamageTaken: number;
  experiencePerHour: number;
  coinsPerHour: number;
  iterations: number;
  detailedResults: {
    wins: number;
    losses: number;
    averageHpRemaining: number;
    averageMpUsed: number;
    consumablesUsed: {
      food: number;
      drinks: number;
    };
  };
  recommendations: string[];
}

export interface CombatLog {
  timestamp: number;
  action: string;
  actor: 'player' | 'enemy';
  damage?: number;
  healing?: number;
  effect?: string;
  target: 'player' | 'enemy';
}

export interface CombatSession {
  id: string;
  startTime: number;
  endTime?: number;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  enemyMp: number;
  winner?: 'player' | 'enemy';
  log: CombatLog[];
}

export const PREDEFINED_TARGETS: CombatTarget[] = [
  {
    id: 'goblin_warrior',
    name: 'Goblin Warrior',
    level: 15,
    hp: 450,
    mp: 120,
    stats: {
      attack: 25,
      defense: 18,
      magic: 8,
      ranged: 12,
      intelligence: 15,
      stamina: 20,
    },
    abilities: ['slash', 'block'],
    rewards: {
      experience: 85,
      coins: 45,
      items: [
        { itemHrid: '/items/goblin_sword', dropRate: 0.05, quantity: 1 },
        { itemHrid: '/items/copper_coin', dropRate: 0.8, quantity: 3 },
      ],
    },
    location: 'Goblin Camp',
    difficulty: 'Easy',
  },
  {
    id: 'orc_berserker',
    name: 'Orc Berserker',
    level: 35,
    hp: 1200,
    mp: 200,
    stats: {
      attack: 65,
      defense: 45,
      magic: 15,
      ranged: 20,
      intelligence: 25,
      stamina: 55,
    },
    abilities: ['rage', 'cleave', 'intimidate'],
    rewards: {
      experience: 280,
      coins: 125,
      items: [
        { itemHrid: '/items/orc_axe', dropRate: 0.08, quantity: 1 },
        { itemHrid: '/items/silver_coin', dropRate: 0.6, quantity: 2 },
      ],
    },
    location: 'Orc Stronghold',
    difficulty: 'Medium',
  },
  {
    id: 'dragon_knight',
    name: 'Dragon Knight',
    level: 75,
    hp: 3500,
    mp: 800,
    stats: {
      attack: 145,
      defense: 120,
      magic: 95,
      ranged: 65,
      intelligence: 85,
      stamina: 135,
    },
    abilities: ['dragon_breath', 'shield_wall', 'holy_strike', 'regeneration'],
    rewards: {
      experience: 850,
      coins: 420,
      items: [
        { itemHrid: '/items/dragon_scale_armor', dropRate: 0.12, quantity: 1 },
        { itemHrid: '/items/gold_coin', dropRate: 0.9, quantity: 5 },
      ],
    },
    location: 'Dragon\'s Lair',
    difficulty: 'Hard',
  },
  {
    id: 'ancient_lich',
    name: 'Ancient Lich',
    level: 100,
    hp: 6000,
    mp: 1500,
    stats: {
      attack: 85,
      defense: 95,
      magic: 185,
      ranged: 45,
      intelligence: 165,
      stamina: 120,
    },
    abilities: ['death_ray', 'soul_drain', 'necromancy', 'time_stop', 'dark_shield'],
    rewards: {
      experience: 1650,
      coins: 850,
      items: [
        { itemHrid: '/items/staff_of_eternity', dropRate: 0.15, quantity: 1 },
        { itemHrid: '/items/lich_essence', dropRate: 0.3, quantity: 1 },
        { itemHrid: '/items/platinum_coin', dropRate: 0.95, quantity: 8 },
      ],
    },
    location: 'Necropolis',
    difficulty: 'Elite',
  },
];