export interface Equipment {
  itemLocationHrid: string;
  itemHrid: string;
  enhancementLevel: number;
}

export interface Player {
  defenseLevel: number;
  magicLevel: number;
  attackLevel: number;
  meleeLevel: number;
  intelligenceLevel: number;
  staminaLevel: number;
  rangedLevel: number;
  equipment: Equipment[];
}

export interface ConsumableItem {
  itemHrid: string;
}

export interface Food {
  [actionType: string]: ConsumableItem[];
}

export interface Drinks {
  [actionType: string]: ConsumableItem[];
}

export interface Ability {
  abilityHrid: string;
  level: number;
}

export interface TriggerCondition {
  dependencyHrid: string;
  conditionHrid: string;
  comparatorHrid: string;
  value: number;
}

export interface TriggerMap {
  [triggerHrid: string]: TriggerCondition[];
}

export interface HouseRooms {
  [roomHrid: string]: number;
}

export interface CharacterData {
  player: Player;
  food: Food;
  drinks: Drinks;
  abilities: Ability[];
  triggerMap: TriggerMap;
  houseRooms: HouseRooms;
}

export interface CharacterStats {
  combat: {
    attack: number;
    defense: number;
    magic: number;
    melee: number;
    intelligence: number;
    stamina: number;
    ranged: number;
  };
  equipment: {
    [slot: string]: {
      item: string;
      enhancement: number;
    };
  };
  abilities: Ability[];
  consumables: {
    food: ConsumableItem[];
    drinks: ConsumableItem[];
  };
  houseRooms: HouseRooms;
}