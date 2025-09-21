export interface HouseMaterial {
  itemHrid: string;
  itemName: string;
  quantity: number;
}

export interface HouseLevelCost {
  level: number;
  coins: number;
  materials: HouseMaterial[];
}

export interface HouseRoomCosts {
  roomHrid: string;
  roomName: string;
  skillHrid: string;
  skillName: string;
  levels: HouseLevelCost[];
}

export interface HouseCostsData {
  [roomHrid: string]: HouseRoomCosts;
}

// Helper function to create material
const createMaterial = (itemName: string, quantity: number): HouseMaterial => ({
  itemHrid: `/items/${itemName.toLowerCase().replace(/\s+/g, '_')}`,
  itemName,
  quantity
});

// Complete house upgrade costs from wiki data
export const HOUSE_COSTS: HouseCostsData = {
  '/house_rooms/log_shed': {
    roomHrid: '/house_rooms/log_shed',
    roomName: 'Log Shed',
    skillHrid: '/skills/woodcutting',
    skillName: 'Woodcutting',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Log', 1500),
          createMaterial('Cheese Hatchet', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Log', 3000),
          createMaterial('Birch Log', 3000),
          createMaterial('Cheese Hatchet', 9),
          createMaterial('Verdant Hatchet', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Birch Log', 6000),
          createMaterial('Cedar Log', 6000),
          createMaterial('Verdant Hatchet', 12),
          createMaterial('Azure Hatchet', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Cedar Log', 12000),
          createMaterial('Purpleheart Log', 12000),
          createMaterial('Azure Hatchet', 15),
          createMaterial('Burble Hatchet', 15),
          createMaterial('Woodcutting Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Purpleheart Log', 24000),
          createMaterial('Ginkgo Log', 24000),
          createMaterial('Burble Hatchet', 18),
          createMaterial('Crimson Hatchet', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Ginkgo Log', 48000),
          createMaterial('Redwood Log', 48000),
          createMaterial('Crimson Hatchet', 21),
          createMaterial('Rainbow Hatchet', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Redwood Log', 96000),
          createMaterial('Arcane Log', 96000),
          createMaterial('Rainbow Hatchet', 24),
          createMaterial('Holy Hatchet', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Arcane Log', 240000),
          createMaterial('Holy Hatchet', 60),
          createMaterial('Super Woodcutting Tea', 2000)
        ]
      }
    ]
  },

  '/house_rooms/dairy_barn': {
    roomHrid: '/house_rooms/dairy_barn',
    roomName: 'Dairy Barn',
    skillHrid: '/skills/milking',
    skillName: 'Milking',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Milk', 1500),
          createMaterial('Cheese Brush', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Milk', 3000),
          createMaterial('Verdant Milk', 3000),
          createMaterial('Cheese Brush', 9),
          createMaterial('Verdant Brush', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Verdant Milk', 6000),
          createMaterial('Azure Milk', 6000),
          createMaterial('Verdant Brush', 12),
          createMaterial('Azure Brush', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Azure Milk', 12000),
          createMaterial('Burble Milk', 12000),
          createMaterial('Azure Brush', 15),
          createMaterial('Burble Brush', 15),
          createMaterial('Milking Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Burble Milk', 24000),
          createMaterial('Crimson Milk', 24000),
          createMaterial('Burble Brush', 18),
          createMaterial('Crimson Brush', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Crimson Milk', 48000),
          createMaterial('Rainbow Milk', 48000),
          createMaterial('Crimson Brush', 21),
          createMaterial('Rainbow Brush', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Rainbow Milk', 96000),
          createMaterial('Holy Milk', 96000),
          createMaterial('Rainbow Brush', 24),
          createMaterial('Holy Brush', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Holy Milk', 240000),
          createMaterial('Holy Brush', 60),
          createMaterial('Super Milking Tea', 2000)
        ]
      }
    ]
  },

  '/house_rooms/garden': {
    roomHrid: '/house_rooms/garden',
    roomName: 'Garden',
    skillHrid: '/skills/foraging',
    skillName: 'Foraging',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Egg', 500),
          createMaterial('Wheat', 500),
          createMaterial('Cotton', 750),
          createMaterial('Cheese Shears', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Egg', 1000),
          createMaterial('Blueberry', 1000),
          createMaterial('Wheat', 1000),
          createMaterial('Apple', 500),
          createMaterial('Cotton', 1500),
          createMaterial('Flax', 1500),
          createMaterial('Cheese Shears', 9),
          createMaterial('Verdant Shears', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Blueberry', 2000),
          createMaterial('Blackberry', 2000),
          createMaterial('Apple', 1000),
          createMaterial('Orange', 1000),
          createMaterial('Flax', 6000),
          createMaterial('Verdant Shears', 12),
          createMaterial('Azure Shears', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Blackberry', 4000),
          createMaterial('Strawberry', 4000),
          createMaterial('Orange', 2000),
          createMaterial('Plum', 2000),
          createMaterial('Flax', 6000),
          createMaterial('Bamboo Branch', 6000),
          createMaterial('Azure Shears', 15),
          createMaterial('Burble Shears', 15),
          createMaterial('Foraging Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Strawberry', 8000),
          createMaterial('Mooberry', 8000),
          createMaterial('Plum', 4000),
          createMaterial('Peach', 4000),
          createMaterial('Bamboo Branch', 24000),
          createMaterial('Burble Shears', 18),
          createMaterial('Crimson Shears', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Mooberry', 16000),
          createMaterial('Marsberry', 16000),
          createMaterial('Peach', 8000),
          createMaterial('Dragon Fruit', 8000),
          createMaterial('Bamboo Branch', 24000),
          createMaterial('Cocoon', 24000),
          createMaterial('Crimson Shears', 21),
          createMaterial('Rainbow Shears', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Marsberry', 32000),
          createMaterial('Spaceberry', 32000),
          createMaterial('Dragon Fruit', 16000),
          createMaterial('Star Fruit', 16000),
          createMaterial('Cocoon', 48000),
          createMaterial('Radiant Fiber', 48000),
          createMaterial('Rainbow Shears', 24),
          createMaterial('Holy Shears', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Spaceberry', 80000),
          createMaterial('Star Fruit', 40000),
          createMaterial('Radiant Fiber', 120000),
          createMaterial('Holy Shears', 60),
          createMaterial('Super Foraging Tea', 2000)
        ]
      }
    ]
  },

  '/house_rooms/forge': {
    roomHrid: '/house_rooms/forge',
    roomName: 'Forge',
    skillHrid: '/skills/cheesesmithing',
    skillName: 'Cheesesmithing',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Cheese', 375),
          createMaterial('Cheese Hammer', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Cheese', 750),
          createMaterial('Verdant Cheese', 750),
          createMaterial('Cheese Hammer', 9),
          createMaterial('Verdant Hammer', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Verdant Cheese', 1500),
          createMaterial('Azure Cheese', 1500),
          createMaterial('Verdant Hammer', 12),
          createMaterial('Azure Hammer', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Azure Cheese', 3000),
          createMaterial('Burble Cheese', 3000),
          createMaterial('Azure Hammer', 15),
          createMaterial('Burble Hammer', 15),
          createMaterial('Cheesesmithing Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Burble Cheese', 6000),
          createMaterial('Crimson Cheese', 6000),
          createMaterial('Burble Hammer', 18),
          createMaterial('Crimson Hammer', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Crimson Cheese', 12000),
          createMaterial('Rainbow Cheese', 12000),
          createMaterial('Crimson Hammer', 21),
          createMaterial('Rainbow Hammer', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Rainbow Cheese', 24000),
          createMaterial('Holy Cheese', 24000),
          createMaterial('Rainbow Hammer', 24),
          createMaterial('Holy Hammer', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Holy Cheese', 60000),
          createMaterial('Holy Hammer', 60),
          createMaterial('Super Cheesesmithing Tea', 2000)
        ]
      }
    ]
  },

  '/house_rooms/workshop': {
    roomHrid: '/house_rooms/workshop',
    roomName: 'Workshop',
    skillHrid: '/skills/crafting',
    skillName: 'Crafting',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 450),
          createMaterial('Cheese Chisel', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 900),
          createMaterial('Birch Lumber', 900),
          createMaterial('Cheese Chisel', 9),
          createMaterial('Verdant Chisel', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 1800),
          createMaterial('Cedar Lumber', 1800),
          createMaterial('Verdant Chisel', 12),
          createMaterial('Azure Chisel', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 3600),
          createMaterial('Purpleheart Lumber', 3600),
          createMaterial('Azure Chisel', 15),
          createMaterial('Burble Chisel', 15),
          createMaterial('Crafting Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 7200),
          createMaterial('Ginkgo Lumber', 7200),
          createMaterial('Burble Chisel', 18),
          createMaterial('Crimson Chisel', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 14400),
          createMaterial('Redwood Lumber', 14400),
          createMaterial('Crimson Chisel', 21),
          createMaterial('Rainbow Chisel', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 28800),
          createMaterial('Arcane Lumber', 28800),
          createMaterial('Rainbow Chisel', 24),
          createMaterial('Holy Chisel', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 72000),
          createMaterial('Holy Chisel', 60),
          createMaterial('Super Crafting Tea', 2000)
        ]
      }
    ]
  },

  '/house_rooms/sewing_parlor': {
    roomHrid: '/house_rooms/sewing_parlor',
    roomName: 'Sewing Parlor',
    skillHrid: '/skills/tailoring',
    skillName: 'Tailoring',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Rough Leather', 180),
          createMaterial('Cotton Fabric', 180),
          createMaterial('Cheese Needle', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Rough Leather', 360),
          createMaterial('Reptile Leather', 360),
          createMaterial('Cotton Fabric', 360),
          createMaterial('Linen Fabric', 360),
          createMaterial('Cheese Needle', 9),
          createMaterial('Verdant Needle', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Reptile Leather', 1440),
          createMaterial('Linen Fabric', 1440),
          createMaterial('Verdant Needle', 12),
          createMaterial('Azure Needle', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Reptile Leather', 1440),
          createMaterial('Gobo Leather', 1440),
          createMaterial('Linen Fabric', 1440),
          createMaterial('Bamboo Fabric', 1440),
          createMaterial('Azure Needle', 15),
          createMaterial('Burble Needle', 15),
          createMaterial('Tailoring Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Gobo Leather', 5760),
          createMaterial('Bamboo Fabric', 5760),
          createMaterial('Burble Needle', 18),
          createMaterial('Crimson Needle', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Gobo Leather', 5760),
          createMaterial('Beast Leather', 5760),
          createMaterial('Bamboo Fabric', 5760),
          createMaterial('Silk Fabric', 5760),
          createMaterial('Crimson Needle', 21),
          createMaterial('Rainbow Needle', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Beast Leather', 11520),
          createMaterial('Umbral Leather', 11520),
          createMaterial('Silk Fabric', 11520),
          createMaterial('Radiant Fabric', 11520),
          createMaterial('Rainbow Needle', 24),
          createMaterial('Holy Needle', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Umbral Leather', 28800),
          createMaterial('Radiant Fabric', 28800),
          createMaterial('Holy Needle', 60),
          createMaterial('Super Tailoring Tea', 2000)
        ]
      }
    ]
  },

  '/house_rooms/kitchen': {
    roomHrid: '/house_rooms/kitchen',
    roomName: 'Kitchen',
    skillHrid: '/skills/cooking',
    skillName: 'Cooking',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Sugar', 2000),
          createMaterial('Egg', 500),
          createMaterial('Wheat', 500),
          createMaterial('Cheese Spatula', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Sugar', 8000),
          createMaterial('Egg', 1000),
          createMaterial('Blueberry', 1000),
          createMaterial('Wheat', 1000),
          createMaterial('Apple', 500),
          createMaterial('Cheese Spatula', 9),
          createMaterial('Verdant Spatula', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Sugar', 20000),
          createMaterial('Blueberry', 2000),
          createMaterial('Blackberry', 2000),
          createMaterial('Apple', 1000),
          createMaterial('Orange', 1000),
          createMaterial('Verdant Spatula', 12),
          createMaterial('Azure Spatula', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Sugar', 48000),
          createMaterial('Blackberry', 4000),
          createMaterial('Strawberry', 4000),
          createMaterial('Orange', 2000),
          createMaterial('Plum', 2000),
          createMaterial('Azure Spatula', 15),
          createMaterial('Burble Spatula', 15),
          createMaterial('Cooking Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Sugar', 100000),
          createMaterial('Strawberry', 8000),
          createMaterial('Mooberry', 8000),
          createMaterial('Plum', 4000),
          createMaterial('Peach', 4000),
          createMaterial('Burble Spatula', 18),
          createMaterial('Crimson Spatula', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Sugar', 200000),
          createMaterial('Mooberry', 16000),
          createMaterial('Marsberry', 16000),
          createMaterial('Peach', 8000),
          createMaterial('Dragon Fruit', 8000),
          createMaterial('Crimson Spatula', 21),
          createMaterial('Rainbow Spatula', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Sugar', 360000),
          createMaterial('Marsberry', 32000),
          createMaterial('Spaceberry', 32000),
          createMaterial('Dragon Fruit', 16000),
          createMaterial('Star Fruit', 16000),
          createMaterial('Rainbow Spatula', 24),
          createMaterial('Holy Spatula', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Sugar', 640000),
          createMaterial('Spaceberry', 80000),
          createMaterial('Star Fruit', 40000),
          createMaterial('Holy Spatula', 60),
          createMaterial('Super Cooking Tea', 2000)
        ]
      }
    ]
  },

  '/house_rooms/brewery': {
    roomHrid: '/house_rooms/brewery',
    roomName: 'Brewery',
    skillHrid: '/skills/brewing',
    skillName: 'Brewing',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Green Tea Leaf', 300),
          createMaterial('Arabica Coffee Bean', 300),
          createMaterial('Cheese Pot', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Green Tea Leaf', 600),
          createMaterial('Black Tea Leaf', 600),
          createMaterial('Arabica Coffee Bean', 600),
          createMaterial('Robusta Coffee Bean', 600),
          createMaterial('Cheese Pot', 9),
          createMaterial('Verdant Pot', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Black Tea Leaf', 2400),
          createMaterial('Robusta Coffee Bean', 2400),
          createMaterial('Verdant Pot', 12),
          createMaterial('Azure Pot', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Black Tea Leaf', 2400),
          createMaterial('Burble Tea Leaf', 2400),
          createMaterial('Robusta Coffee Bean', 2400),
          createMaterial('Liberica Coffee Bean', 2400),
          createMaterial('Azure Pot', 15),
          createMaterial('Burble Pot', 15),
          createMaterial('Brewing Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Burble Tea Leaf', 4800),
          createMaterial('Moolong Tea Leaf', 4800),
          createMaterial('Liberica Coffee Bean', 4800),
          createMaterial('Excelsa Coffee Bean', 4800),
          createMaterial('Burble Pot', 18),
          createMaterial('Crimson Pot', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Moolong Tea Leaf', 9600),
          createMaterial('Red Tea Leaf', 9600),
          createMaterial('Excelsa Coffee Bean', 9600),
          createMaterial('Fieriosa Coffee Bean', 9600),
          createMaterial('Crimson Pot', 21),
          createMaterial('Rainbow Pot', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Red Tea Leaf', 19200),
          createMaterial('Emp Tea Leaf', 19200),
          createMaterial('Fieriosa Coffee Bean', 19200),
          createMaterial('Spacia Coffee Bean', 19200),
          createMaterial('Rainbow Pot', 24),
          createMaterial('Holy Pot', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Emp Tea Leaf', 48000),
          createMaterial('Spacia Coffee Bean', 48000),
          createMaterial('Holy Pot', 60),
          createMaterial('Super Brewing Tea', 2000)
        ]
      }
    ]
  },

  '/house_rooms/laboratory': {
    roomHrid: '/house_rooms/laboratory',
    roomName: 'Laboratory',
    skillHrid: '/skills/alchemy',
    skillName: 'Alchemy',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Milking Essence', 100),
          createMaterial('Foraging Essence', 100),
          createMaterial('Woodcutting Essence', 100),
          createMaterial('Cheese Alembic', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Cheesesmithing Essence', 200),
          createMaterial('Crafting Essence', 200),
          createMaterial('Tailoring Essence', 200),
          createMaterial('Cheese Alembic', 9),
          createMaterial('Verdant Alembic', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Cooking Essence', 500),
          createMaterial('Brewing Essence', 500),
          createMaterial('Verdant Alembic', 12),
          createMaterial('Azure Alembic', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Alchemy Essence', 1000),
          createMaterial('Enhancing Essence', 1000),
          createMaterial('Azure Alembic', 15),
          createMaterial('Burble Alembic', 15),
          createMaterial('Alchemy Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Milking Essence', 1600),
          createMaterial('Foraging Essence', 1600),
          createMaterial('Woodcutting Essence', 1600),
          createMaterial('Burble Alembic', 18),
          createMaterial('Crimson Alembic', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Cheesesmithing Essence', 3200),
          createMaterial('Crafting Essence', 3200),
          createMaterial('Tailoring Essence', 3200),
          createMaterial('Crimson Alembic', 21),
          createMaterial('Rainbow Alembic', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Cooking Essence', 8000),
          createMaterial('Brewing Essence', 8000),
          createMaterial('Rainbow Alembic', 24),
          createMaterial('Holy Alembic', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Alchemy Essence', 12000),
          createMaterial('Enhancing Essence', 12000),
          createMaterial('Holy Alembic', 60),
          createMaterial('Super Alchemy Tea', 2000)
        ]
      }
    ]
  },

  '/house_rooms/observatory': {
    roomHrid: '/house_rooms/observatory',
    roomName: 'Observatory',
    skillHrid: '/skills/enhancing',
    skillName: 'Enhancing',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Swamp Essence', 750),
          createMaterial('Cheese Enhancer', 6)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Swamp Essence', 1500),
          createMaterial('Aqua Essence', 1500),
          createMaterial('Cheese Enhancer', 9),
          createMaterial('Verdant Enhancer', 9)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Aqua Essence', 3000),
          createMaterial('Jungle Essence', 3000),
          createMaterial('Verdant Enhancer', 12),
          createMaterial('Azure Enhancer', 12)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Jungle Essence', 6000),
          createMaterial('Gobo Essence', 6000),
          createMaterial('Azure Enhancer', 15),
          createMaterial('Burble Enhancer', 15),
          createMaterial('Enhancing Tea', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Gobo Essence', 12000),
          createMaterial('Eyessence', 12000),
          createMaterial('Burble Enhancer', 18),
          createMaterial('Crimson Enhancer', 18)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Eyessence', 24000),
          createMaterial('Sorcerer Essence', 24000),
          createMaterial('Crimson Enhancer', 21),
          createMaterial('Rainbow Enhancer', 21)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Sorcerer Essence', 48000),
          createMaterial('Bear Essence', 48000),
          createMaterial('Rainbow Enhancer', 24),
          createMaterial('Holy Enhancer', 24)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Bear Essence', 120000),
          createMaterial('Holy Enhancer', 60),
          createMaterial('Super Enhancing Tea', 2000)
        ]
      }
    ]
  },

  // Combat houses
  '/house_rooms/dining_room': {
    roomHrid: '/house_rooms/dining_room',
    roomName: 'Dining Room',
    skillHrid: '/skills/stamina',
    skillName: 'Stamina',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Donut', 125),
          createMaterial('Cupcake', 125),
          createMaterial('Small Pouch', 1)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Donut', 250),
          createMaterial('Blueberry Donut', 250),
          createMaterial('Cupcake', 250),
          createMaterial('Blueberry Cake', 250),
          createMaterial('Small Pouch', 3)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Blueberry Donut', 500),
          createMaterial('Blackberry Donut', 500),
          createMaterial('Blueberry Cake', 500),
          createMaterial('Blackberry Cake', 500),
          createMaterial('Medium Pouch', 1)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Blackberry Donut', 1000),
          createMaterial('Strawberry Donut', 1000),
          createMaterial('Blackberry Cake', 1000),
          createMaterial('Strawberry Cake', 1000),
          createMaterial('Medium Pouch', 3),
          createMaterial('Stamina Coffee', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Strawberry Donut', 2000),
          createMaterial('Mooberry Donut', 2000),
          createMaterial('Strawberry Cake', 2000),
          createMaterial('Mooberry Cake', 2000),
          createMaterial('Large Pouch', 1)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Mooberry Donut', 4000),
          createMaterial('Marsberry Donut', 4000),
          createMaterial('Mooberry Cake', 4000),
          createMaterial('Marsberry Cake', 4000),
          createMaterial('Large Pouch', 3)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Marsberry Donut', 8000),
          createMaterial('Spaceberry Donut', 8000),
          createMaterial('Marsberry Cake', 8000),
          createMaterial('Spaceberry Cake', 8000),
          createMaterial('Giant Pouch', 1)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Spaceberry Donut', 20000),
          createMaterial('Spaceberry Cake', 20000),
          createMaterial('Giant Pouch', 3),
          createMaterial('Super Stamina Coffee', 2000)
        ]
      }
    ]
  },

  '/house_rooms/library': {
    roomHrid: '/house_rooms/library',
    roomName: 'Library',
    skillHrid: '/skills/intelligence',
    skillName: 'Intelligence',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Gummy', 250),
          createMaterial('Yogurt', 250),
          createMaterial('Poke', 2),
          createMaterial('Scratch', 2),
          createMaterial('Smack', 2)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Gummy', 500),
          createMaterial('Apple Gummy', 250),
          createMaterial('Yogurt', 500),
          createMaterial('Apple Yogurt', 250),
          createMaterial('Quick Shot', 2),
          createMaterial('Water Strike', 2),
          createMaterial('Entangle', 2),
          createMaterial('Fireball', 2)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Apple Gummy', 500),
          createMaterial('Orange Gummy', 500),
          createMaterial('Apple Yogurt', 500),
          createMaterial('Orange Yogurt', 500),
          createMaterial('Toughness', 2),
          createMaterial('Precision', 2)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Orange Gummy', 1000),
          createMaterial('Plum Gummy', 1000),
          createMaterial('Orange Yogurt', 1000),
          createMaterial('Plum Yogurt', 1000),
          createMaterial('Impale', 2),
          createMaterial('Cleave', 2),
          createMaterial('Sweep', 2),
          createMaterial('Intelligence Coffee', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Plum Gummy', 2000),
          createMaterial('Peach Gummy', 2000),
          createMaterial('Plum Yogurt', 2000),
          createMaterial('Peach Yogurt', 2000),
          createMaterial('Rain Of Arrows', 2),
          createMaterial('Ice Spear', 2),
          createMaterial('Flame Blast', 2),
          createMaterial('Toxic Pollen', 2)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Peach Gummy', 4000),
          createMaterial('Dragon Fruit Gummy', 4000),
          createMaterial('Peach Yogurt', 4000),
          createMaterial('Dragon Fruit Yogurt', 4000),
          createMaterial('Berserk', 2),
          createMaterial('Frenzy', 2),
          createMaterial('Elemental Affinity', 2)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Dragon Fruit Gummy', 8000),
          createMaterial('Star Fruit Gummy', 8000),
          createMaterial('Dragon Fruit Yogurt', 8000),
          createMaterial('Star Fruit Yogurt', 8000),
          createMaterial('Puncture', 2),
          createMaterial('Maim', 2),
          createMaterial('Stunning Blow', 2)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Star Fruit Gummy', 20000),
          createMaterial('Star Fruit Yogurt', 20000),
          createMaterial('Silencing Shot', 2),
          createMaterial('Frost Surge', 2),
          createMaterial('Nature\'s Veil', 2),
          createMaterial('Firestorm', 2),
          createMaterial('Super Intelligence Coffee', 2000)
        ]
      }
    ]
  },

  '/house_rooms/dojo': {
    roomHrid: '/house_rooms/dojo',
    roomName: 'Dojo',
    skillHrid: '/skills/melee',
    skillName: 'Melee',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Cheese Spear', 16),
          createMaterial('Cheese Sword', 8)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Cheese Spear', 24),
          createMaterial('Verdant Spear', 24),
          createMaterial('Cheese Sword', 12),
          createMaterial('Verdant Sword', 12)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Verdant Spear', 32),
          createMaterial('Azure Spear', 32),
          createMaterial('Verdant Sword', 16),
          createMaterial('Azure Sword', 16)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Azure Spear', 40),
          createMaterial('Burble Spear', 40),
          createMaterial('Azure Sword', 20),
          createMaterial('Burble Sword', 20),
          createMaterial('Attack Coffee', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Burble Spear', 48),
          createMaterial('Crimson Spear', 48),
          createMaterial('Burble Sword', 24),
          createMaterial('Crimson Sword', 24)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Crimson Spear', 56),
          createMaterial('Rainbow Spear', 56),
          createMaterial('Crimson Sword', 28),
          createMaterial('Rainbow Sword', 28)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Rainbow Spear', 64),
          createMaterial('Holy Spear', 64),
          createMaterial('Rainbow Sword', 32),
          createMaterial('Holy Sword', 32)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Holy Spear', 160),
          createMaterial('Holy Sword', 80),
          createMaterial('Super Attack Coffee', 2000)
        ]
      }
    ]
  },

  '/house_rooms/armory': {
    roomHrid: '/house_rooms/armory',
    roomName: 'Armory',
    skillHrid: '/skills/defense',
    skillName: 'Defense',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Cheese Helmet', 8),
          createMaterial('Cheese Plate Body', 8),
          createMaterial('Cheese Plate Legs', 8),
          createMaterial('Cheese Gauntlets', 8),
          createMaterial('Cheese Boots', 8)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Cheese Helmet', 12),
          createMaterial('Verdant Helmet', 12),
          createMaterial('Cheese Plate Body', 12),
          createMaterial('Verdant Plate Body', 12),
          createMaterial('Cheese Plate Legs', 12),
          createMaterial('Verdant Plate Legs', 12),
          createMaterial('Cheese Gauntlets', 12),
          createMaterial('Verdant Gauntlets', 12),
          createMaterial('Cheese Boots', 12),
          createMaterial('Verdant Boots', 12)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Verdant Helmet', 16),
          createMaterial('Azure Helmet', 16),
          createMaterial('Verdant Plate Body', 16),
          createMaterial('Azure Plate Body', 16),
          createMaterial('Verdant Plate Legs', 16),
          createMaterial('Azure Plate Legs', 16),
          createMaterial('Verdant Gauntlets', 16),
          createMaterial('Azure Gauntlets', 16),
          createMaterial('Verdant Boots', 16),
          createMaterial('Azure Boots', 16)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Azure Helmet', 20),
          createMaterial('Burble Helmet', 20),
          createMaterial('Azure Plate Body', 20),
          createMaterial('Burble Plate Body', 20),
          createMaterial('Azure Plate Legs', 20),
          createMaterial('Burble Plate Legs', 20),
          createMaterial('Azure Gauntlets', 20),
          createMaterial('Burble Gauntlets', 20),
          createMaterial('Azure Boots', 20),
          createMaterial('Burble Boots', 20),
          createMaterial('Defense Coffee', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Burble Helmet', 24),
          createMaterial('Crimson Helmet', 24),
          createMaterial('Burble Plate Body', 24),
          createMaterial('Crimson Plate Body', 24),
          createMaterial('Burble Plate Legs', 24),
          createMaterial('Crimson Plate Legs', 24),
          createMaterial('Burble Gauntlets', 24),
          createMaterial('Crimson Gauntlets', 24),
          createMaterial('Burble Boots', 24),
          createMaterial('Crimson Boots', 24)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Crimson Helmet', 28),
          createMaterial('Rainbow Helmet', 28),
          createMaterial('Crimson Plate Body', 28),
          createMaterial('Rainbow Plate Body', 28),
          createMaterial('Crimson Plate Legs', 28),
          createMaterial('Rainbow Plate Legs', 28),
          createMaterial('Crimson Gauntlets', 28),
          createMaterial('Rainbow Gauntlets', 28),
          createMaterial('Crimson Boots', 28),
          createMaterial('Rainbow Boots', 28)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Rainbow Helmet', 32),
          createMaterial('Holy Helmet', 32),
          createMaterial('Rainbow Plate Body', 32),
          createMaterial('Holy Plate Body', 32),
          createMaterial('Rainbow Plate Legs', 32),
          createMaterial('Holy Plate Legs', 32),
          createMaterial('Rainbow Gauntlets', 32),
          createMaterial('Holy Gauntlets', 32),
          createMaterial('Rainbow Boots', 32),
          createMaterial('Holy Boots', 32)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Holy Helmet', 80),
          createMaterial('Holy Plate Body', 80),
          createMaterial('Holy Plate Legs', 80),
          createMaterial('Holy Gauntlets', 80),
          createMaterial('Holy Boots', 80),
          createMaterial('Super Defense Coffee', 2000)
        ]
      }
    ]
  },

  '/house_rooms/gym': {
    roomHrid: '/house_rooms/gym',
    roomName: 'Gym',
    skillHrid: '/skills/attack',
    skillName: 'Attack',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Cheese Mace', 16),
          createMaterial('Cheese Sword', 8)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Cheese Mace', 24),
          createMaterial('Verdant Mace', 24),
          createMaterial('Cheese Sword', 12),
          createMaterial('Verdant Sword', 12)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Verdant Mace', 32),
          createMaterial('Azure Mace', 32),
          createMaterial('Verdant Sword', 16),
          createMaterial('Azure Sword', 16)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Azure Mace', 40),
          createMaterial('Burble Mace', 40),
          createMaterial('Azure Sword', 20),
          createMaterial('Burble Sword', 20),
          createMaterial('Power Coffee', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Burble Mace', 48),
          createMaterial('Crimson Mace', 48),
          createMaterial('Burble Sword', 24),
          createMaterial('Crimson Sword', 24)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Crimson Mace', 56),
          createMaterial('Rainbow Mace', 56),
          createMaterial('Crimson Sword', 28),
          createMaterial('Rainbow Sword', 28)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Rainbow Mace', 64),
          createMaterial('Holy Mace', 64),
          createMaterial('Rainbow Sword', 32),
          createMaterial('Holy Sword', 32)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Holy Mace', 160),
          createMaterial('Holy Sword', 80),
          createMaterial('Super Power Coffee', 2000)
        ]
      }
    ]
  },

  '/house_rooms/archery_range': {
    roomHrid: '/house_rooms/archery_range',
    roomName: 'Archery Range',
    skillHrid: '/skills/ranged',
    skillName: 'Ranged',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Wooden Crossbow', 6),
          createMaterial('Wooden Bow', 4),
          createMaterial('Rough Hood', 4),
          createMaterial('Rough Tunic', 4),
          createMaterial('Rough Chaps', 4),
          createMaterial('Rough Bracers', 4),
          createMaterial('Rough Boots', 4)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Wooden Crossbow', 9),
          createMaterial('Birch Crossbow', 9),
          createMaterial('Wooden Bow', 6),
          createMaterial('Birch Bow', 6),
          createMaterial('Reptile Hood', 8),
          createMaterial('Reptile Tunic', 8),
          createMaterial('Reptile Chaps', 8),
          createMaterial('Reptile Bracers', 8),
          createMaterial('Reptile Boots', 8)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Birch Crossbow', 12),
          createMaterial('Cedar Crossbow', 12),
          createMaterial('Birch Bow', 8),
          createMaterial('Cedar Bow', 8),
          createMaterial('Reptile Hood', 16),
          createMaterial('Reptile Tunic', 16),
          createMaterial('Reptile Chaps', 16),
          createMaterial('Reptile Bracers', 16),
          createMaterial('Reptile Boots', 16)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Cedar Crossbow', 15),
          createMaterial('Purpleheart Crossbow', 15),
          createMaterial('Cedar Bow', 10),
          createMaterial('Purpleheart Bow', 10),
          createMaterial('Gobo Hood', 16),
          createMaterial('Gobo Tunic', 16),
          createMaterial('Gobo Chaps', 16),
          createMaterial('Gobo Bracers', 16),
          createMaterial('Gobo Boots', 16),
          createMaterial('Ranged Coffee', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Purpleheart Crossbow', 18),
          createMaterial('Ginkgo Crossbow', 18),
          createMaterial('Purpleheart Bow', 12),
          createMaterial('Ginkgo Bow', 12),
          createMaterial('Gobo Hood', 32),
          createMaterial('Gobo Tunic', 32),
          createMaterial('Gobo Chaps', 32),
          createMaterial('Gobo Bracers', 32),
          createMaterial('Gobo Boots', 32)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Ginkgo Crossbow', 21),
          createMaterial('Redwood Crossbow', 21),
          createMaterial('Ginkgo Bow', 14),
          createMaterial('Redwood Bow', 14),
          createMaterial('Beast Hood', 24),
          createMaterial('Beast Tunic', 24),
          createMaterial('Beast Chaps', 24),
          createMaterial('Beast Bracers', 24),
          createMaterial('Beast Boots', 24)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Redwood Crossbow', 24),
          createMaterial('Arcane Crossbow', 24),
          createMaterial('Redwood Bow', 16),
          createMaterial('Arcane Bow', 16),
          createMaterial('Beast Hood', 48),
          createMaterial('Beast Tunic', 48),
          createMaterial('Beast Chaps', 48),
          createMaterial('Beast Bracers', 48),
          createMaterial('Beast Boots', 48)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Arcane Crossbow', 60),
          createMaterial('Arcane Bow', 40),
          createMaterial('Umbral Hood', 40),
          createMaterial('Umbral Tunic', 40),
          createMaterial('Umbral Chaps', 40),
          createMaterial('Umbral Bracers', 40),
          createMaterial('Umbral Boots', 40),
          createMaterial('Super Ranged Coffee', 2000)
        ]
      }
    ]
  },

  '/house_rooms/mystical_study': {
    roomHrid: '/house_rooms/mystical_study',
    roomName: 'Mystical Study',
    skillHrid: '/skills/magic',
    skillName: 'Magic',
    levels: [
      {
        level: 1,
        coins: 500000,
        materials: [
          createMaterial('Lumber', 75),
          createMaterial('Wooden Water Staff', 4),
          createMaterial('Wooden Nature Staff', 4),
          createMaterial('Wooden Fire Staff', 4),
          createMaterial('Cotton Hat', 4),
          createMaterial('Cotton Robe Top', 4),
          createMaterial('Cotton Robe Bottoms', 4),
          createMaterial('Cotton Gloves', 4),
          createMaterial('Cotton Boots', 4)
        ]
      },
      {
        level: 2,
        coins: 2000000,
        materials: [
          createMaterial('Lumber', 150),
          createMaterial('Birch Lumber', 150),
          createMaterial('Wooden Water Staff', 6),
          createMaterial('Birch Water Staff', 6),
          createMaterial('Wooden Nature Staff', 6),
          createMaterial('Birch Nature Staff', 6),
          createMaterial('Wooden Fire Staff', 6),
          createMaterial('Birch Fire Staff', 6),
          createMaterial('Linen Hat', 8),
          createMaterial('Linen Robe Top', 8),
          createMaterial('Linen Robe Bottoms', 8),
          createMaterial('Linen Gloves', 8),
          createMaterial('Linen Boots', 8)
        ]
      },
      {
        level: 3,
        coins: 5000000,
        materials: [
          createMaterial('Birch Lumber', 300),
          createMaterial('Cedar Lumber', 300),
          createMaterial('Birch Water Staff', 8),
          createMaterial('Cedar Water Staff', 8),
          createMaterial('Birch Nature Staff', 8),
          createMaterial('Cedar Nature Staff', 8),
          createMaterial('Birch Fire Staff', 8),
          createMaterial('Cedar Fire Staff', 8),
          createMaterial('Linen Hat', 16),
          createMaterial('Linen Robe Top', 16),
          createMaterial('Linen Robe Bottoms', 16),
          createMaterial('Linen Gloves', 16),
          createMaterial('Linen Boots', 16)
        ]
      },
      {
        level: 4,
        coins: 12000000,
        materials: [
          createMaterial('Cedar Lumber', 600),
          createMaterial('Purpleheart Lumber', 600),
          createMaterial('Cedar Water Staff', 10),
          createMaterial('Purpleheart Water Staff', 10),
          createMaterial('Cedar Nature Staff', 10),
          createMaterial('Purpleheart Nature Staff', 10),
          createMaterial('Cedar Fire Staff', 10),
          createMaterial('Purpleheart Fire Staff', 10),
          createMaterial('Bamboo Hat', 16),
          createMaterial('Bamboo Robe Top', 16),
          createMaterial('Bamboo Robe Bottoms', 16),
          createMaterial('Bamboo Gloves', 16),
          createMaterial('Bamboo Boots', 16),
          createMaterial('Magic Coffee', 1000)
        ]
      },
      {
        level: 5,
        coins: 25000000,
        materials: [
          createMaterial('Purpleheart Lumber', 1200),
          createMaterial('Ginkgo Lumber', 1200),
          createMaterial('Purpleheart Water Staff', 12),
          createMaterial('Ginkgo Water Staff', 12),
          createMaterial('Purpleheart Nature Staff', 12),
          createMaterial('Ginkgo Nature Staff', 12),
          createMaterial('Purpleheart Fire Staff', 12),
          createMaterial('Ginkgo Fire Staff', 12),
          createMaterial('Bamboo Hat', 32),
          createMaterial('Bamboo Robe Top', 32),
          createMaterial('Bamboo Robe Bottoms', 32),
          createMaterial('Bamboo Gloves', 32),
          createMaterial('Bamboo Boots', 32)
        ]
      },
      {
        level: 6,
        coins: 50000000,
        materials: [
          createMaterial('Ginkgo Lumber', 2400),
          createMaterial('Redwood Lumber', 2400),
          createMaterial('Ginkgo Water Staff', 14),
          createMaterial('Redwood Water Staff', 14),
          createMaterial('Ginkgo Nature Staff', 14),
          createMaterial('Redwood Nature Staff', 14),
          createMaterial('Ginkgo Fire Staff', 14),
          createMaterial('Redwood Fire Staff', 14),
          createMaterial('Silk Hat', 24),
          createMaterial('Silk Robe Top', 24),
          createMaterial('Silk Robe Bottoms', 24),
          createMaterial('Silk Gloves', 24),
          createMaterial('Silk Boots', 24)
        ]
      },
      {
        level: 7,
        coins: 90000000,
        materials: [
          createMaterial('Redwood Lumber', 4800),
          createMaterial('Arcane Lumber', 4800),
          createMaterial('Redwood Water Staff', 16),
          createMaterial('Arcane Water Staff', 16),
          createMaterial('Redwood Nature Staff', 16),
          createMaterial('Arcane Nature Staff', 16),
          createMaterial('Redwood Fire Staff', 16),
          createMaterial('Arcane Fire Staff', 16),
          createMaterial('Silk Hat', 48),
          createMaterial('Silk Robe Top', 48),
          createMaterial('Silk Robe Bottoms', 48),
          createMaterial('Silk Gloves', 48),
          createMaterial('Silk Boots', 48)
        ]
      },
      {
        level: 8,
        coins: 160000000,
        materials: [
          createMaterial('Arcane Lumber', 12000),
          createMaterial('Arcane Water Staff', 40),
          createMaterial('Arcane Nature Staff', 40),
          createMaterial('Arcane Fire Staff', 40),
          createMaterial('Radiant Hat', 40),
          createMaterial('Radiant Robe Top', 40),
          createMaterial('Radiant Robe Bottoms', 40),
          createMaterial('Radiant Gloves', 40),
          createMaterial('Radiant Boots', 40),
          createMaterial('Super Magic Coffee', 2000)
        ]
      }
    ]
  }
};

// Helper functions
export const getHouseCostsByRoom = (roomHrid: string): HouseRoomCosts | undefined => {
  return HOUSE_COSTS[roomHrid];
};

export const getHouseLevelCost = (roomHrid: string, level: number): HouseLevelCost | undefined => {
  const houseCosts = HOUSE_COSTS[roomHrid];
  if (!houseCosts) return undefined;
  return houseCosts.levels.find(l => l.level === level);
};

export const getAllHouseRooms = (): HouseRoomCosts[] => {
  return Object.values(HOUSE_COSTS);
};

export const getHouseRoomsBySkill = (skillHrid: string): HouseRoomCosts[] => {
  return Object.values(HOUSE_COSTS).filter(house => house.skillHrid === skillHrid);
};

export interface HouseUpgradeCostCalculation {
  roomHrid: string;
  roomName: string;
  skillHrid: string;
  skillName: string;
  fromLevel: number;
  toLevel: number;
  totalCoins: number;
  totalMaterials: { [itemHrid: string]: { itemName: string; quantity: number } };
  levelBreakdown: Array<{
    level: number;
    coins: number;
    materials: HouseMaterial[];
  }>;
  isValid: boolean;
  error?: string;
}

export interface HouseUpgradeWithMarketplaceCosts extends HouseUpgradeCostCalculation {
  materialCosts: { [itemHrid: string]: { itemName: string; unitPrice?: number; totalCost?: number; available: boolean } };
  totalMaterialCost?: number;
  totalUpgradeCost?: number;
  hasAllPrices: boolean;
}

// Calculate total cost for upgrading from current level to target level
export const calculateUpgradeCost = (roomHrid: string, fromLevel: number, toLevel: number): {
  totalCoins: number;
  totalMaterials: { [itemHrid: string]: { itemName: string; quantity: number } };
} => {
  const houseCosts = HOUSE_COSTS[roomHrid];
  if (!houseCosts) {
    return { totalCoins: 0, totalMaterials: {} };
  }

  let totalCoins = 0;
  const totalMaterials: { [itemHrid: string]: { itemName: string; quantity: number } } = {};

  for (let level = fromLevel + 1; level <= toLevel; level++) {
    const levelCost = houseCosts.levels.find(l => l.level === level);
    if (levelCost) {
      totalCoins += levelCost.coins;

      levelCost.materials.forEach(material => {
        if (!totalMaterials[material.itemHrid]) {
          totalMaterials[material.itemHrid] = {
            itemName: material.itemName,
            quantity: 0
          };
        }
        totalMaterials[material.itemHrid].quantity += material.quantity;
      });
    }
  }

  return { totalCoins, totalMaterials };
};

/**
 * Calculate detailed house upgrade costs with level-by-level breakdown
 */
export const calculateHouseUpgradeCost = (
  roomHrid: string,
  currentLevel: number,
  targetLevel: number
): HouseUpgradeCostCalculation => {
  const houseCosts = HOUSE_COSTS[roomHrid];

  // Validation
  if (!houseCosts) {
    return {
      roomHrid,
      roomName: 'Unknown Room',
      skillHrid: '',
      skillName: '',
      fromLevel: currentLevel,
      toLevel: targetLevel,
      totalCoins: 0,
      totalMaterials: {},
      levelBreakdown: [],
      isValid: false,
      error: `House room '${roomHrid}' not found in database`
    };
  }

  if (currentLevel >= targetLevel) {
    return {
      roomHrid,
      roomName: houseCosts.roomName,
      skillHrid: houseCosts.skillHrid,
      skillName: houseCosts.skillName,
      fromLevel: currentLevel,
      toLevel: targetLevel,
      totalCoins: 0,
      totalMaterials: {},
      levelBreakdown: [],
      isValid: false,
      error: `Current level (${currentLevel}) must be less than target level (${targetLevel})`
    };
  }

  if (targetLevel > 8) {
    return {
      roomHrid,
      roomName: houseCosts.roomName,
      skillHrid: houseCosts.skillHrid,
      skillName: houseCosts.skillName,
      fromLevel: currentLevel,
      toLevel: targetLevel,
      totalCoins: 0,
      totalMaterials: {},
      levelBreakdown: [],
      isValid: false,
      error: `Target level (${targetLevel}) cannot exceed maximum house level (8)`
    };
  }

  // Calculate costs
  let totalCoins = 0;
  const totalMaterials: { [itemHrid: string]: { itemName: string; quantity: number } } = {};
  const levelBreakdown: Array<{ level: number; coins: number; materials: HouseMaterial[] }> = [];

  for (let level = currentLevel + 1; level <= targetLevel; level++) {
    const levelCost = houseCosts.levels.find(l => l.level === level);

    if (!levelCost) {
      return {
        roomHrid,
        roomName: houseCosts.roomName,
        skillHrid: houseCosts.skillHrid,
        skillName: houseCosts.skillName,
        fromLevel: currentLevel,
        toLevel: targetLevel,
        totalCoins: 0,
        totalMaterials: {},
        levelBreakdown: [],
        isValid: false,
        error: `Cost data not available for ${houseCosts.roomName} level ${level}`
      };
    }

    // Add to totals
    totalCoins += levelCost.coins;

    // Add materials to totals
    levelCost.materials.forEach(material => {
      if (!totalMaterials[material.itemHrid]) {
        totalMaterials[material.itemHrid] = {
          itemName: material.itemName,
          quantity: 0
        };
      }
      totalMaterials[material.itemHrid].quantity += material.quantity;
    });

    // Add to level breakdown
    levelBreakdown.push({
      level,
      coins: levelCost.coins,
      materials: [...levelCost.materials]
    });
  }

  return {
    roomHrid,
    roomName: houseCosts.roomName,
    skillHrid: houseCosts.skillHrid,
    skillName: houseCosts.skillName,
    fromLevel: currentLevel,
    toLevel: targetLevel,
    totalCoins,
    totalMaterials,
    levelBreakdown,
    isValid: true
  };
};

/**
 * Calculate house upgrade costs with marketplace pricing for materials
 */
export const calculateHouseUpgradeCostWithMarketplace = (
  roomHrid: string,
  currentLevel: number,
  targetLevel: number,
  marketplaceData?: { [itemHrid: string]: { price: number; available: boolean } }
): HouseUpgradeWithMarketplaceCosts => {
  const baseCost = calculateHouseUpgradeCost(roomHrid, currentLevel, targetLevel);

  const result: HouseUpgradeWithMarketplaceCosts = {
    ...baseCost,
    materialCosts: {},
    hasAllPrices: false
  };

  if (!baseCost.isValid) {
    return result;
  }

  // Calculate material costs from marketplace
  let totalMaterialCost = 0;
  let hasAllPrices = true;

  Object.entries(baseCost.totalMaterials).forEach(([itemHrid, materialInfo]) => {
    const marketplaceItem = marketplaceData?.[itemHrid];

    result.materialCosts[itemHrid] = {
      itemName: materialInfo.itemName,
      available: marketplaceItem?.available || false
    };

    if (marketplaceItem?.available && marketplaceItem.price) {
      result.materialCosts[itemHrid].unitPrice = marketplaceItem.price;
      result.materialCosts[itemHrid].totalCost = marketplaceItem.price * materialInfo.quantity;
      totalMaterialCost += result.materialCosts[itemHrid].totalCost!;
    } else {
      hasAllPrices = false;
    }
  });

  result.hasAllPrices = hasAllPrices;

  if (hasAllPrices) {
    result.totalMaterialCost = totalMaterialCost;
    result.totalUpgradeCost = baseCost.totalCoins + totalMaterialCost;
  }

  return result;
};

/**
 * Calculate upgrade costs for multiple house rooms
 */
export const calculateMultipleHouseUpgradeCosts = (
  upgrades: Array<{ roomHrid: string; currentLevel: number; targetLevel: number }>,
  marketplaceData?: { [itemHrid: string]: { price: number; available: boolean } }
): {
  calculations: HouseUpgradeWithMarketplaceCosts[];
  summary: {
    totalCoins: number;
    totalMaterialCost?: number;
    totalUpgradeCost?: number;
    validUpgrades: number;
    invalidUpgrades: number;
    materialsSummary: { [itemHrid: string]: { itemName: string; totalQuantity: number; totalCost?: number } };
  };
} => {
  const calculations = upgrades.map(({ roomHrid, currentLevel, targetLevel }) =>
    calculateHouseUpgradeCostWithMarketplace(roomHrid, currentLevel, targetLevel, marketplaceData)
  );

  const validUpgrades = calculations.filter(calc => calc.isValid).length;
  const invalidUpgrades = calculations.length - validUpgrades;

  let totalCoins = 0;
  let totalMaterialCost = 0;
  let hasAllCosts = true;
  const materialsSummary: { [itemHrid: string]: { itemName: string; totalQuantity: number; totalCost?: number } } = {};

  calculations.forEach(calc => {
    if (calc.isValid) {
      totalCoins += calc.totalCoins;

      // Aggregate materials
      Object.entries(calc.totalMaterials).forEach(([itemHrid, materialInfo]) => {
        if (!materialsSummary[itemHrid]) {
          materialsSummary[itemHrid] = {
            itemName: materialInfo.itemName,
            totalQuantity: 0,
            totalCost: 0
          };
        }

        materialsSummary[itemHrid].totalQuantity += materialInfo.quantity;

        const materialCost = calc.materialCosts[itemHrid];
        if (materialCost?.totalCost !== undefined && materialsSummary[itemHrid].totalCost !== undefined) {
          materialsSummary[itemHrid].totalCost! += materialCost.totalCost;
          totalMaterialCost += materialCost.totalCost;
        } else {
          materialsSummary[itemHrid].totalCost = undefined;
          hasAllCosts = false;
        }
      });
    }
  });

  return {
    calculations,
    summary: {
      totalCoins,
      totalMaterialCost: hasAllCosts ? totalMaterialCost : undefined,
      totalUpgradeCost: hasAllCosts ? totalCoins + totalMaterialCost : undefined,
      validUpgrades,
      invalidUpgrades,
      materialsSummary
    }
  };
};