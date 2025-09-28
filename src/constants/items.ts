export interface ItemInfo {
  itemHrid: string;
  name: string;
  displayName: string;
  category: string;
  subCategory?: string;
  type: string;
  skillHrid?: string; // For tools - which skill they belong to
  slot?: string; // For equipment - which slot they go in
  toolBonuses?: ToolBonuses; // For gathering tools - their stat bonuses
}

export interface ToolBonuses {
  professionSpeed: number; // Percentage speed bonus (e.g., 15 for 15%)
  rareFind?: number; // Percentage rare find bonus (e.g., 15 for 15%)
  experience?: number; // Percentage experience bonus (e.g., 4 for 4%)
}

export interface ItemsByCategory {
  [category: string]: {
    [subCategory: string]: ItemInfo[];
  };
}

// Helper function to create item HRID
const createItemHrid = (name: string): string => {
  return `/items/${name.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '')}`;
};

// Helper function to create item info
const createItem = (
  name: string,
  category: string,
  type: string,
  subCategory?: string,
  skillHrid?: string,
  slot?: string,
  toolBonuses?: ToolBonuses
): ItemInfo => ({
  itemHrid: createItemHrid(name),
  name: name.toLowerCase().replace(/\s+/g, '_').replace(/'/g, ''),
  displayName: name,
  category,
  subCategory,
  type,
  skillHrid,
  slot,
  toolBonuses
});

export const ITEMS_BY_CATEGORY: ItemsByCategory = {
  currencies: {
    basic: [
      createItem('Coin', 'currencies', 'currency'),
      createItem('Task Token', 'currencies', 'currency'),
      createItem('Cowbell', 'currencies', 'currency')
    ],
    special: [
      createItem('Chimerical Token', 'currencies', 'currency'),
      createItem('Sinister Token', 'currencies', 'currency'),
      createItem('Enchanted Token', 'currencies', 'currency')
    ]
  },

  tools: {
    milking: [
      createItem('Cheese Brush', 'tools', 'tool', 'milking', '/skills/milking', undefined, { professionSpeed: 15 }),
      createItem('Verdant Brush', 'tools', 'tool', 'milking', '/skills/milking', undefined, { professionSpeed: 22.5 }),
      createItem('Azure Brush', 'tools', 'tool', 'milking', '/skills/milking', undefined, { professionSpeed: 30 }),
      createItem('Burble Brush', 'tools', 'tool', 'milking', '/skills/milking', undefined, { professionSpeed: 45 }),
      createItem('Crimson Brush', 'tools', 'tool', 'milking', '/skills/milking', undefined, { professionSpeed: 60 }),
      createItem('Rainbow Brush', 'tools', 'tool', 'milking', '/skills/milking', undefined, { professionSpeed: 75 }),
      createItem('Holy Brush', 'tools', 'tool', 'milking', '/skills/milking', undefined, { professionSpeed: 90 }),
      createItem('Celestial Brush', 'tools', 'tool', 'milking', '/skills/milking', undefined, { professionSpeed: 105, rareFind: 15, experience: 4 })
    ],
    woodcutting: [
      createItem('Cheese Hatchet', 'tools', 'tool', 'woodcutting', '/skills/woodcutting', undefined, { professionSpeed: 15 }),
      createItem('Verdant Hatchet', 'tools', 'tool', 'woodcutting', '/skills/woodcutting', undefined, { professionSpeed: 22.5 }),
      createItem('Azure Hatchet', 'tools', 'tool', 'woodcutting', '/skills/woodcutting', undefined, { professionSpeed: 30 }),
      createItem('Burble Hatchet', 'tools', 'tool', 'woodcutting', '/skills/woodcutting', undefined, { professionSpeed: 45 }),
      createItem('Crimson Hatchet', 'tools', 'tool', 'woodcutting', '/skills/woodcutting', undefined, { professionSpeed: 60 }),
      createItem('Rainbow Hatchet', 'tools', 'tool', 'woodcutting', '/skills/woodcutting', undefined, { professionSpeed: 75 }),
      createItem('Holy Hatchet', 'tools', 'tool', 'woodcutting', '/skills/woodcutting', undefined, { professionSpeed: 90 }),
      createItem('Celestial Hatchet', 'tools', 'tool', 'woodcutting', '/skills/woodcutting', undefined, { professionSpeed: 105, rareFind: 15, experience: 4 })
    ],
    foraging: [
      createItem('Cheese Shears', 'tools', 'tool', 'foraging', '/skills/foraging', undefined, { professionSpeed: 15 }),
      createItem('Verdant Shears', 'tools', 'tool', 'foraging', '/skills/foraging', undefined, { professionSpeed: 22.5 }),
      createItem('Azure Shears', 'tools', 'tool', 'foraging', '/skills/foraging', undefined, { professionSpeed: 30 }),
      createItem('Burble Shears', 'tools', 'tool', 'foraging', '/skills/foraging', undefined, { professionSpeed: 45 }),
      createItem('Crimson Shears', 'tools', 'tool', 'foraging', '/skills/foraging', undefined, { professionSpeed: 60 }),
      createItem('Rainbow Shears', 'tools', 'tool', 'foraging', '/skills/foraging', undefined, { professionSpeed: 75 }),
      createItem('Holy Shears', 'tools', 'tool', 'foraging', '/skills/foraging', undefined, { professionSpeed: 90 }),
      createItem('Celestial Shears', 'tools', 'tool', 'foraging', '/skills/foraging', undefined, { professionSpeed: 105, rareFind: 15, experience: 4 })
    ],
    cheesesmithing: [
      createItem('Cheese Hammer', 'tools', 'tool', 'cheesesmithing', '/skills/cheesesmithing'),
      createItem('Bronze Hammer', 'tools', 'tool', 'cheesesmithing', '/skills/cheesesmithing'),
      createItem('Iron Hammer', 'tools', 'tool', 'cheesesmithing', '/skills/cheesesmithing'),
      createItem('Silver Hammer', 'tools', 'tool', 'cheesesmithing', '/skills/cheesesmithing'),
      createItem('Gold Hammer', 'tools', 'tool', 'cheesesmithing', '/skills/cheesesmithing'),
      createItem('Astral Hammer', 'tools', 'tool', 'cheesesmithing', '/skills/cheesesmithing')
    ],
    crafting: [
      createItem('Cheese Chisel', 'tools', 'tool', 'crafting', '/skills/crafting'),
      createItem('Bronze Chisel', 'tools', 'tool', 'crafting', '/skills/crafting'),
      createItem('Iron Chisel', 'tools', 'tool', 'crafting', '/skills/crafting'),
      createItem('Silver Chisel', 'tools', 'tool', 'crafting', '/skills/crafting'),
      createItem('Gold Chisel', 'tools', 'tool', 'crafting', '/skills/crafting'),
      createItem('Astral Chisel', 'tools', 'tool', 'crafting', '/skills/crafting')
    ],
    tailoring: [
      createItem('Cheese Needle', 'tools', 'tool', 'tailoring', '/skills/tailoring'),
      createItem('Bronze Needle', 'tools', 'tool', 'tailoring', '/skills/tailoring'),
      createItem('Iron Needle', 'tools', 'tool', 'tailoring', '/skills/tailoring'),
      createItem('Silver Needle', 'tools', 'tool', 'tailoring', '/skills/tailoring'),
      createItem('Gold Needle', 'tools', 'tool', 'tailoring', '/skills/tailoring'),
      createItem('Astral Needle', 'tools', 'tool', 'tailoring', '/skills/tailoring')
    ],
    cooking: [
      createItem('Cheese Spatula', 'tools', 'tool', 'cooking', '/skills/cooking'),
      createItem('Bronze Spatula', 'tools', 'tool', 'cooking', '/skills/cooking'),
      createItem('Iron Spatula', 'tools', 'tool', 'cooking', '/skills/cooking'),
      createItem('Silver Spatula', 'tools', 'tool', 'cooking', '/skills/cooking'),
      createItem('Gold Spatula', 'tools', 'tool', 'cooking', '/skills/cooking'),
      createItem('Astral Spatula', 'tools', 'tool', 'cooking', '/skills/cooking')
    ],
    brewing: [
      createItem('Cheese Spoon', 'tools', 'tool', 'brewing', '/skills/brewing'),
      createItem('Bronze Spoon', 'tools', 'tool', 'brewing', '/skills/brewing'),
      createItem('Iron Spoon', 'tools', 'tool', 'brewing', '/skills/brewing'),
      createItem('Silver Spoon', 'tools', 'tool', 'brewing', '/skills/brewing'),
      createItem('Gold Spoon', 'tools', 'tool', 'brewing', '/skills/brewing'),
      createItem('Astral Spoon', 'tools', 'tool', 'brewing', '/skills/brewing')
    ],
    alchemy: [
      createItem('Cheese Tongs', 'tools', 'tool', 'alchemy', '/skills/alchemy'),
      createItem('Bronze Tongs', 'tools', 'tool', 'alchemy', '/skills/alchemy'),
      createItem('Iron Tongs', 'tools', 'tool', 'alchemy', '/skills/alchemy'),
      createItem('Silver Tongs', 'tools', 'tool', 'alchemy', '/skills/alchemy'),
      createItem('Gold Tongs', 'tools', 'tool', 'alchemy', '/skills/alchemy'),
      createItem('Astral Tongs', 'tools', 'tool', 'alchemy', '/skills/alchemy')
    ],
    enhancing: [
      createItem('Cheese Mallet', 'tools', 'tool', 'enhancing', '/skills/enhancing'),
      createItem('Bronze Mallet', 'tools', 'tool', 'enhancing', '/skills/enhancing'),
      createItem('Iron Mallet', 'tools', 'tool', 'enhancing', '/skills/enhancing'),
      createItem('Silver Mallet', 'tools', 'tool', 'enhancing', '/skills/enhancing'),
      createItem('Gold Mallet', 'tools', 'tool', 'enhancing', '/skills/enhancing'),
      createItem('Astral Mallet', 'tools', 'tool', 'enhancing', '/skills/enhancing')
    ]
  },

  equipment: {
    weapons: [
      // Main Hand Weapons
      createItem('Cheese Sword', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Bronze Sword', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Iron Sword', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Silver Sword', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Gold Sword', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Astral Sword', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      // Bows
      createItem('Cheese Bow', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Bronze Bow', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Iron Bow', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Silver Bow', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Gold Bow', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Astral Bow', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      // Staffs
      createItem('Cheese Staff', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Bronze Staff', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Iron Staff', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Silver Staff', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Gold Staff', 'equipment', 'weapon', 'weapons', undefined, 'main_hand'),
      createItem('Astral Staff', 'equipment', 'weapon', 'weapons', undefined, 'main_hand')
    ],
    shields: [
      createItem('Cheese Shield', 'equipment', 'shield', 'shields', undefined, 'off_hand'),
      createItem('Bronze Shield', 'equipment', 'shield', 'shields', undefined, 'off_hand'),
      createItem('Iron Shield', 'equipment', 'shield', 'shields', undefined, 'off_hand'),
      createItem('Silver Shield', 'equipment', 'shield', 'shields', undefined, 'off_hand'),
      createItem('Gold Shield', 'equipment', 'shield', 'shields', undefined, 'off_hand'),
      createItem('Astral Shield', 'equipment', 'shield', 'shields', undefined, 'off_hand')
    ],
    armor: [
      // Head
      createItem('Cheese Helmet', 'equipment', 'armor', 'armor', undefined, 'head'),
      createItem('Bronze Helmet', 'equipment', 'armor', 'armor', undefined, 'head'),
      createItem('Iron Helmet', 'equipment', 'armor', 'armor', undefined, 'head'),
      // Body
      createItem('Cheese Body', 'equipment', 'armor', 'armor', undefined, 'body'),
      createItem('Bronze Body', 'equipment', 'armor', 'armor', undefined, 'body'),
      createItem('Iron Body', 'equipment', 'armor', 'armor', undefined, 'body'),
      // Legs
      createItem('Cheese Legs', 'equipment', 'armor', 'armor', undefined, 'legs'),
      createItem('Bronze Legs', 'equipment', 'armor', 'armor', undefined, 'legs'),
      createItem('Iron Legs', 'equipment', 'armor', 'armor', undefined, 'legs'),
      // Hands
      createItem('Cheese Gloves', 'equipment', 'armor', 'armor', undefined, 'hands'),
      createItem('Bronze Gloves', 'equipment', 'armor', 'armor', undefined, 'hands'),
      createItem('Iron Gloves', 'equipment', 'armor', 'armor', undefined, 'hands'),
      // Feet
      createItem('Cheese Boots', 'equipment', 'armor', 'armor', undefined, 'feet'),
      createItem('Bronze Boots', 'equipment', 'armor', 'armor', undefined, 'feet'),
      createItem('Iron Boots', 'equipment', 'armor', 'armor', undefined, 'feet')
    ],
    jewelry: [
      createItem('Cheese Necklace', 'equipment', 'jewelry', 'jewelry', undefined, 'necklace'),
      createItem('Bronze Necklace', 'equipment', 'jewelry', 'jewelry', undefined, 'necklace'),
      createItem('Cheese Earrings', 'equipment', 'jewelry', 'jewelry', undefined, 'earrings'),
      createItem('Bronze Earrings', 'equipment', 'jewelry', 'jewelry', undefined, 'earrings'),
      createItem('Cheese Ring', 'equipment', 'jewelry', 'jewelry', undefined, 'ring'),
      createItem('Bronze Ring', 'equipment', 'jewelry', 'jewelry', undefined, 'ring')
    ]
  },

  materials: {
    milk: [
      createItem('Milk', 'materials', 'material', 'milk'),
      createItem('Verdant Milk', 'materials', 'material', 'milk'),
      createItem('Azure Milk', 'materials', 'material', 'milk'),
      createItem('Burble Milk', 'materials', 'material', 'milk'),
      createItem('Crimson Milk', 'materials', 'material', 'milk'),
      createItem('Void Milk', 'materials', 'material', 'milk')
    ],
    cheese: [
      createItem('Cheese', 'materials', 'material', 'cheese'),
      createItem('Verdant Cheese', 'materials', 'material', 'cheese'),
      createItem('Azure Cheese', 'materials', 'material', 'cheese'),
      createItem('Burble Cheese', 'materials', 'material', 'cheese'),
      createItem('Crimson Cheese', 'materials', 'material', 'cheese'),
      createItem('Void Cheese', 'materials', 'material', 'cheese')
    ],
    wood: [
      createItem('Logs', 'materials', 'material', 'wood'),
      createItem('Lumber', 'materials', 'material', 'wood'),
      createItem('Birch Logs', 'materials', 'material', 'wood'),
      createItem('Birch Lumber', 'materials', 'material', 'wood'),
      createItem('Cedar Logs', 'materials', 'material', 'wood'),
      createItem('Cedar Lumber', 'materials', 'material', 'wood'),
      createItem('Purpleheart Logs', 'materials', 'material', 'wood'),
      createItem('Purpleheart Lumber', 'materials', 'material', 'wood'),
      createItem('Stardust Logs', 'materials', 'material', 'wood'),
      createItem('Stardust Lumber', 'materials', 'material', 'wood'),
      createItem('Godshard Logs', 'materials', 'material', 'wood'),
      createItem('Godshard Lumber', 'materials', 'material', 'wood'),
      createItem('Ethereal Logs', 'materials', 'material', 'wood'),
      createItem('Ethereal Lumber', 'materials', 'material', 'wood'),
      createItem('Void Logs', 'materials', 'material', 'wood'),
      createItem('Void Lumber', 'materials', 'material', 'wood')
    ],
    foraging: [
      createItem('Berry', 'materials', 'material', 'foraging'),
      createItem('Verdant Berry', 'materials', 'material', 'foraging'),
      createItem('Azure Berry', 'materials', 'material', 'foraging'),
      createItem('Burble Berry', 'materials', 'material', 'foraging'),
      createItem('Crimson Berry', 'materials', 'material', 'foraging'),
      createItem('Void Berry', 'materials', 'material', 'foraging')
    ]
  },

  consumables: {
    food: [
      createItem('Berry Donut', 'consumables', 'food', 'food'),
      createItem('Verdant Berry Donut', 'consumables', 'food', 'food'),
      createItem('Azure Berry Donut', 'consumables', 'food', 'food'),
      createItem('Burble Berry Donut', 'consumables', 'food', 'food'),
      createItem('Crimson Berry Donut', 'consumables', 'food', 'food'),
      createItem('Void Berry Donut', 'consumables', 'food', 'food'),
      createItem('Berry Cake', 'consumables', 'food', 'food'),
      createItem('Berry Gummy', 'consumables', 'food', 'food'),
      createItem('Yogurt', 'consumables', 'food', 'food')
    ],
    drinks: [
      createItem('Tea', 'consumables', 'drink', 'drinks'),
      createItem('Super Tea', 'consumables', 'drink', 'drinks'),
      createItem('Ultra Tea', 'consumables', 'drink', 'drinks'),
      createItem('Coffee', 'consumables', 'drink', 'drinks'),
      createItem('Super Coffee', 'consumables', 'drink', 'drinks'),
      createItem('Ultra Coffee', 'consumables', 'drink', 'drinks')
    ]
  },

  books: {
    abilities: [
      createItem('Combat Ability Book', 'books', 'book', 'abilities'),
      createItem('Ranged Ability Book', 'books', 'book', 'abilities'),
      createItem('Magic Ability Book', 'books', 'book', 'abilities'),
      createItem('Healing Ability Book', 'books', 'book', 'abilities'),
      createItem('Support Ability Book', 'books', 'book', 'abilities')
    ]
  },

  loot: {
    containers: [
      createItem('Small Artisan\'s Crate', 'loot', 'container', 'containers'),
      createItem('Medium Artisan\'s Crate', 'loot', 'container', 'containers'),
      createItem('Large Artisan\'s Crate', 'loot', 'container', 'containers'),
      createItem('Small Meteorite Cache', 'loot', 'container', 'containers'),
      createItem('Medium Meteorite Cache', 'loot', 'container', 'containers'),
      createItem('Large Meteorite Cache', 'loot', 'container', 'containers'),
      createItem('Small Treasure Chest', 'loot', 'container', 'containers'),
      createItem('Medium Treasure Chest', 'loot', 'container', 'containers'),
      createItem('Large Treasure Chest', 'loot', 'container', 'containers')
    ],
    special: [
      createItem('Bag Of 10 Cowbells', 'loot', 'special', 'special'),
      createItem('Purple\'s Gift', 'loot', 'special', 'special'),
      createItem('Chimerical Chest', 'loot', 'special', 'special'),
      createItem('Sinister Chest', 'loot', 'special', 'special'),
      createItem('Enchanted Chest', 'loot', 'special', 'special')
    ]
  }
};

// Flattened list of all items
export const ALL_ITEMS: ItemInfo[] = Object.values(ITEMS_BY_CATEGORY)
  .flatMap(category => Object.values(category))
  .flat();

// Helper functions
export const getItemByHrid = (hrid: string): ItemInfo | undefined => {
  return ALL_ITEMS.find(item => item.itemHrid === hrid);
};

export const getItemByName = (name: string): ItemInfo | undefined => {
  return ALL_ITEMS.find(item => item.name === name);
};

export const getItemsByCategory = (category: string): ItemInfo[] => {
  const categoryData = ITEMS_BY_CATEGORY[category];
  if (!categoryData) return [];
  return Object.values(categoryData).flat();
};

export const getItemsBySubCategory = (category: string, subCategory: string): ItemInfo[] => {
  return ITEMS_BY_CATEGORY[category]?.[subCategory] || [];
};

export const getToolsBySkill = (skillHrid: string): ItemInfo[] => {
  return ALL_ITEMS.filter(item =>
    item.category === 'tools' && item.skillHrid === skillHrid
  );
};

export const getEquipmentBySlot = (slot: string): ItemInfo[] => {
  return ALL_ITEMS.filter(item =>
    item.category === 'equipment' && item.slot === slot
  );
};

// Category display names for UI
export const ITEM_CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  currencies: 'Currencies',
  tools: 'Tools',
  equipment: 'Equipment',
  materials: 'Materials',
  consumables: 'Consumables',
  books: 'Books',
  loot: 'Loot & Containers'
};

// Equipment slot display names
export const EQUIPMENT_SLOT_DISPLAY_NAMES: { [key: string]: string } = {
  main_hand: 'Main Hand',
  off_hand: 'Off Hand',
  head: 'Head',
  body: 'Body',
  legs: 'Legs',
  hands: 'Hands',
  feet: 'Feet',
  back: 'Back',
  pouch: 'Pouch',
  necklace: 'Necklace',
  earrings: 'Earrings',
  ring: 'Ring',
  trinket: 'Trinket'
};

/**
 * Get tool bonuses by item name
 * @param itemName - The display name of the tool (e.g., "Holy Brush")
 * @returns Tool bonuses if found, undefined otherwise
 */
export function getToolBonuses(itemName: string): ToolBonuses | undefined {
  // Search through all tool categories
  for (const categoryItems of Object.values(ITEMS_BY_CATEGORY.tools)) {
    const tool = categoryItems.find(item => item.displayName === itemName);
    if (tool?.toolBonuses) {
      return tool.toolBonuses;
    }
  }
  return undefined;
}

/**
 * Get all tools for a specific gathering skill
 * @param skillName - The gathering skill name ('milking', 'woodcutting', 'foraging')
 * @returns Array of tool items for that skill
 */
export function getGatheringTools(skillName: 'milking' | 'woodcutting' | 'foraging'): ItemInfo[] {
  return ITEMS_BY_CATEGORY.tools[skillName] || [];
}