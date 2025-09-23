'use client';

import { useState, useCallback, useEffect } from 'react';
import { CombatSimulatorApiService } from '@/services/combatSimulatorApi';
import { CharacterStats } from '@/types/character';
import { CombatSlotItems, COMBAT_ITEMS } from '@/constants/combatItems';
import { ItemIcon } from './ItemIcon';
import { SkillIcon } from './SkillIcon';
import { AbilityIcon } from './AbilityIcon';
import { MarketplaceService } from '@/services/marketplace';
import { combatSimulationStorage, SavedCombatSimulation } from '@/services/combatSimulationStorage';

interface CombatUpgradeAnalysisProps {
  character: CharacterStats;
  rawCharacterData?: string | null;
  combatItems?: CombatSlotItems | null;
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

interface EquipmentItem {
  slot: string;
  itemHrid: string;
  itemName: string;
  enhancementLevel: number;
  isEmpty: boolean;
  skipReason?: string;
  testLevels: number[];
  testResults: { [level: number]: { exp: number; profit: number; status: 'pending' | 'testing' | 'completed' | 'failed'; cost?: number; paybackDays?: number } };
  marketplacePrices: { [level: number]: number | null };
}

// Combat zones and their display names
const COMBAT_ZONES = [
  { value: '/actions/combat/fly', label: 'Fly' },
  { value: '/actions/combat/rat', label: 'Jerry' },
  { value: '/actions/combat/skunk', label: 'Skunk' },
  { value: '/actions/combat/porcupine', label: 'Porcupine' },
  { value: '/actions/combat/slimy', label: 'Slimy' },
  { value: '/actions/combat/smelly_planet', label: 'Smelly Planet' },
  { value: '/actions/combat/frog', label: 'Frogger' },
  { value: '/actions/combat/snake', label: 'Thnake' },
  { value: '/actions/combat/swampy', label: 'Swampy' },
  { value: '/actions/combat/alligator', label: 'Sherlock' },
  { value: '/actions/combat/swamp_planet', label: 'Swamp Planet' },
  { value: '/actions/combat/sea_snail', label: 'Gary' },
  { value: '/actions/combat/crab', label: 'I Pinch' },
  { value: '/actions/combat/aquahorse', label: 'Aquahorse' },
  { value: '/actions/combat/nom_nom', label: 'Nom Nom' },
  { value: '/actions/combat/turtle', label: 'Turuto' },
  { value: '/actions/combat/aqua_planet', label: 'Aqua Planet' },
  { value: '/actions/combat/jungle_sprite', label: 'Jungle Sprite' },
  { value: '/actions/combat/myconid', label: 'Myconid' },
  { value: '/actions/combat/treant', label: 'Treant' },
  { value: '/actions/combat/centaur_archer', label: 'Centaur Archer' },
  { value: '/actions/combat/jungle_planet', label: 'Jungle Planet' },
  { value: '/actions/combat/gobo_stabby', label: 'Stabby' },
  { value: '/actions/combat/gobo_slashy', label: 'Slashy' },
  { value: '/actions/combat/gobo_smashy', label: 'Smashy' },
  { value: '/actions/combat/gobo_shooty', label: 'Shooty' },
  { value: '/actions/combat/gobo_boomy', label: 'Boomy' },
  { value: '/actions/combat/gobo_planet', label: 'Gobo Planet' },
  { value: '/actions/combat/eye', label: 'Eye' },
  { value: '/actions/combat/eyes', label: 'Eyes' },
  { value: '/actions/combat/veyes', label: 'Veyes' },
  { value: '/actions/combat/planet_of_the_eyes', label: 'Planet Of The Eyes' },
  { value: '/actions/combat/novice_sorcerer', label: 'Novice Sorcerer' },
  { value: '/actions/combat/ice_sorcerer', label: 'Ice Sorcerer' },
  { value: '/actions/combat/flame_sorcerer', label: 'Flame Sorcerer' },
  { value: '/actions/combat/elementalist', label: 'Elementalist' },
  { value: '/actions/combat/sorcerers_tower', label: 'Sorcerer\'s Tower' },
  { value: '/actions/combat/gummy_bear', label: 'Gummy Bear' },
  { value: '/actions/combat/panda', label: 'Panda' },
  { value: '/actions/combat/black_bear', label: 'Black Bear' },
  { value: '/actions/combat/grizzly_bear', label: 'Grizzly Bear' },
  { value: '/actions/combat/polar_bear', label: 'Polar Bear' },
  { value: '/actions/combat/bear_with_it', label: 'Bear With It' },
  { value: '/actions/combat/magnetic_golem', label: 'Magnetic Golem' },
  { value: '/actions/combat/stalactite_golem', label: 'Stalactite Golem' },
  { value: '/actions/combat/granite_golem', label: 'Granite Golem' },
  { value: '/actions/combat/golem_cave', label: 'Golem Cave' },
  { value: '/actions/combat/zombie', label: 'Zombie' },
  { value: '/actions/combat/vampire', label: 'Vampire' },
  { value: '/actions/combat/werewolf', label: 'Werewolf' },
  { value: '/actions/combat/twilight_zone', label: 'Twilight Zone' },
  { value: '/actions/combat/abyssal_imp', label: 'Abyssal Imp' },
  { value: '/actions/combat/soul_hunter', label: 'Soul Hunter' },
  { value: '/actions/combat/infernal_warlock', label: 'Infernal Warlock' },
  { value: '/actions/combat/infernal_abyss', label: 'Infernal Abyss' }
];

// Combat tiers
const COMBAT_TIERS = [
  { value: '0', label: 'T0' },
  { value: '1', label: 'T1' },
  { value: '2', label: 'T2' },
  { value: '3', label: 'T3' },
  { value: '4', label: 'T4' },
  { value: '5', label: 'T5' }
];

// Zone name mapping for backward compatibility
const ZONE_DISPLAY_NAMES: { [key: string]: string } = Object.fromEntries(
  COMBAT_ZONES.map(zone => [zone.value, zone.label])
);


export function CombatUpgradeAnalysisIframe({ character, rawCharacterData, combatItems = COMBAT_ITEMS }: CombatUpgradeAnalysisProps) {
  const [zoneData, setZoneData] = useState<ZoneData[]>([]);
  const [equipmentTestResults, setEquipmentTestResults] = useState<{ [slot: string]: { level: number; profit: number; exp: number; enhancementCost?: number; paybackDays?: number; itemName?: string; itemHrid?: string }[] }>({});
  const [abilityTestResults, setAbilityTestResults] = useState<{ [abilityHrid: string]: { level: number; profit: number; exp: number }[] }>({});
  const [houseTestResults, setHouseTestResults] = useState<{ [roomHrid: string]: { level: number; profit: number; exp: number }[] }>({});
  const [equipmentRecommendations, setEquipmentRecommendations] = useState<Record<string, unknown>[]>([]);
  const [abilityRecommendations, setAbilityRecommendations] = useState<Record<string, unknown>[]>([]);
  const [houseRecommendations, setHouseRecommendations] = useState<Record<string, unknown>[]>([]);
  const [savedSimulations, setSavedSimulations] = useState<SavedCombatSimulation[]>([]);
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingUpgrades, setIsAnalyzingUpgrades] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [optimizeFor, setOptimizeFor] = useState<'profit' | 'exp'>('profit');
  const [showZoneTable, setShowZoneTable] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('no_rng_profit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [equipmentTestingData, setEquipmentTestingData] = useState<EquipmentItem[]>([]);
  const [showEquipmentTesting, setShowEquipmentTesting] = useState(false);
  const [baselineResults, setBaselineResults] = useState<{ experienceGain: number; profitPerDay: number } | null>(null);
  const [selectedEnhancementLevels, setSelectedEnhancementLevels] = useState<{ [slot: string]: number }>({});
  const [displayEnhancementLevels, setDisplayEnhancementLevels] = useState<{ [slot: string]: number }>({});
  const [additionalSimSlots, setAdditionalSimSlots] = useState<{
    id: string;
    slot: string;
    selectedItem: string;
    enhancementLevel: number;
  }[]>([]);
  const [houseMaxLevels, setHouseMaxLevels] = useState<{ [roomHrid: string]: number }>({});
  const [showHouses, setShowHouses] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
  const [showGear, setShowGear] = useState(true);
  const [selectedCombatZone, setSelectedCombatZone] = useState<string>('/actions/combat/fly');
  const [selectedCombatTier, setSelectedCombatTier] = useState<string>('0');
  const [abilityTargetLevels, setAbilityTargetLevels] = useState<{ [abilityHrid: string]: number }>({});

  // Equipment slots to test
  const EQUIPMENT_SLOTS = ['head', 'neck', 'earrings', 'body', 'legs', 'feet', 'hands', 'ring', 'weapon', 'off_hand', 'pouch'];

  // Initialize display enhancement levels when combat items are loaded
  useEffect(() => {
    if (Object.keys(displayEnhancementLevels).length === 0) {
      const initialLevels: { [slot: string]: number } = {};

      EQUIPMENT_SLOTS.forEach((slot) => {
        // Map slots to match character equipment data
        let lookupSlot = slot;
        if (slot === 'weapon') {
          lookupSlot = 'main_hand';
        }

        // Format the slot name for lookup
        const formattedSlotName = lookupSlot.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const equipmentItem = character.equipment[formattedSlotName];

        // Set to current enhancement level or 0 if no item equipped
        initialLevels[slot] = equipmentItem?.enhancement || 0;
      });

      setDisplayEnhancementLevels(initialLevels);
    }
  }, [combatItems, character.equipment, displayEnhancementLevels]);

  // Initialize house max levels when character data is available
  useEffect(() => {
    if (character.houseRooms && Object.keys(houseMaxLevels).length === 0) {
      const initialHouseLevels: { [roomHrid: string]: number } = {};

      Object.entries(character.houseRooms).forEach(([roomHrid, currentLevel]) => {
        initialHouseLevels[roomHrid] = currentLevel;
      });

      setHouseMaxLevels(initialHouseLevels);
    }
  }, [character.houseRooms, houseMaxLevels]);

  // Initialize ability target levels when character data is available
  useEffect(() => {
    if (character.abilities && Object.keys(abilityTargetLevels).length === 0) {
      const initialAbilityLevels: { [abilityHrid: string]: number } = {};

      character.abilities.forEach((ability) => {
        initialAbilityLevels[ability.abilityHrid] = ability.level;
      });

      setAbilityTargetLevels(initialAbilityLevels);
    }
  }, [character.abilities, abilityTargetLevels]);

  // Initialize equipment testing data when rawCharacterData is available
  useEffect(() => {
    if (rawCharacterData && equipmentTestingData.length === 0) {
      const equipmentData = parseEquipmentData();
      setEquipmentTestingData(equipmentData);
    }
  }, [rawCharacterData, equipmentTestingData.length]);

  // Function to parse house name from roomHrid
  const parseHouseName = (roomHrid: string): string => {
    return roomHrid.replace('/house_rooms/', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Function to map house room to skill icon
  const getHouseRoomIcon = (roomHrid: string): string => {
    const roomType = roomHrid.replace('/house_rooms/', '').toLowerCase();

    // Map house room types to their associated skillsets
    const iconMap: { [key: string]: string } = {
      'dairy_barn': 'milking',
      'garden': 'foraging',
      'log_shed': 'woodcutting',
      'forge': 'cheesesmithing', // Note: using cheesesmithing instead of cheesemaking
      'workshop': 'crafting',
      'sewing_parlor': 'tailoring',
      'kitchen': 'cooking',
      'brewery': 'brewing',
      'laboratory': 'alchemy',
      'observatory': 'enhancing',
      'dining_room': 'stamina',
      'library': 'intelligence',
      'dojo': 'attack',
      'armory': 'defense',
      'gym': 'melee',
      'archery_range': 'ranged',
      'mystical_study': 'magic'
    };

    return iconMap[roomType] || 'crafting'; // Default to crafting icon for unmapped rooms
  };

  // Function to get ordered house rooms
  const getOrderedHouseRooms = (): [string, number][] => {
    const roomOrder = [
      'dairy_barn',
      'garden',
      'log_shed',
      'forge',
      'workshop',
      'sewing_parlor',
      'kitchen',
      'brewery',
      'laboratory',
      'observatory',
      'dining_room',
      'library',
      'dojo',
      'armory',
      'gym',
      'archery_range',
      'mystical_study'
    ];

    const orderedRooms: [string, number][] = [];

    // Add rooms in the specified order if they exist in character data
    roomOrder.forEach(roomType => {
      const roomHrid = `/house_rooms/${roomType}`;
      if (character.houseRooms[roomHrid] !== undefined) {
        orderedRooms.push([roomHrid, character.houseRooms[roomHrid]]);
      }
    });

    // Add any remaining rooms that weren't in the ordered list
    Object.entries(character.houseRooms).forEach(([roomHrid, level]) => {
      const roomType = roomHrid.replace('/house_rooms/', '');
      if (!roomOrder.includes(roomType)) {
        orderedRooms.push([roomHrid, level]);
      }
    });

    return orderedRooms;
  };

  // Function to add a new sim slot for a specific equipment slot
  const addSimSlot = (slot: string) => {
    const newId = `${slot}_sim_${Date.now()}`;
    const newSimSlot = {
      id: newId,
      slot: slot,
      selectedItem: '', // Will be set to first available item
      enhancementLevel: 0
    };

    setAdditionalSimSlots(prev => [...prev, newSimSlot]);
  };

  // Function to remove a sim slot
  const removeSimSlot = (id: string) => {
    setAdditionalSimSlots(prev => prev.filter(slot => slot.id !== id));
  };

  // Function to update a sim slot
  const updateSimSlot = (id: string, updates: Partial<{ selectedItem: string; enhancementLevel: number }>) => {
    setAdditionalSimSlots(prev =>
      prev.map(slot =>
        slot.id === id ? { ...slot, ...updates } : slot
      )
    );
  };

  // Function to parse raw character data and create equipment display data
  const parseEquipmentData = (): EquipmentItem[] => {
    if (!rawCharacterData) return [];

    try {
      const parsedData = JSON.parse(rawCharacterData);
      const equipmentArray = parsedData.player?.equipment || [];
      const initialSelectedLevels: { [slot: string]: number } = {};

      console.log('🔍 Debug - Available equipment in raw data:', equipmentArray.map((item: { itemLocationHrid: string; itemHrid: string; enhancementLevel: number }) => ({
        location: item.itemLocationHrid,
        item: item.itemHrid,
        level: item.enhancementLevel
      })));

      const equipmentData = EQUIPMENT_SLOTS.map(slot => {
        // Map weapon slot to main_hand for import data lookup (import uses main_hand, simulation uses weapon)
        const lookupSlot = slot === 'weapon' ? 'main_hand' : slot;
        const equipmentItem = equipmentArray.find((item: { itemLocationHrid: string; itemHrid: string; enhancementLevel: number }) =>
          item.itemLocationHrid === `/item_locations/${lookupSlot}`
        );

        console.log(`🔍 Debug - Slot '${slot}' -> lookupSlot '${lookupSlot}' -> Found: ${equipmentItem ? `${equipmentItem.itemHrid} (+${equipmentItem.enhancementLevel})` : 'NOT FOUND'}`);

        if (!equipmentItem || !equipmentItem.itemHrid) {
          initialSelectedLevels[slot] = 0;
          return {
            slot,
            itemHrid: '',
            itemName: '',
            enhancementLevel: 0,
            isEmpty: true,
            skipReason: 'No item equipped',
            testLevels: [],
            testResults: {},
            marketplacePrices: {}
          };
        }

        const currentLevel = equipmentItem.enhancementLevel;
        const itemName = equipmentItem.itemHrid.replace('/items/', '');

        // Initialize selected level to current level
        initialSelectedLevels[slot] = currentLevel;

        return {
          slot,
          itemHrid: equipmentItem.itemHrid,
          itemName,
          enhancementLevel: currentLevel,
          isEmpty: false,
          testLevels: [], // No longer pre-calculating test levels
          testResults: {}, // Will be populated dynamically when tests run
          marketplacePrices: {} // Will be populated when prices are fetched
        };
      });

      // Set initial selected enhancement levels
      setSelectedEnhancementLevels(initialSelectedLevels);

      return equipmentData;
    } catch (error) {
      console.error('Failed to parse character data:', error);
      return [];
    }
  };

  // runCombatAnalysis function removed - everything now goes through handleFindUpgrades


  // Function to save simulation results to IndexedDB
  const saveSimulationResults = useCallback(async (targetZone: string, targetTier: string, optimizeFor: 'profit' | 'exp') => {
    try {
      if (!baselineResults || !character) {
        console.log('⚠️ Cannot save simulation - missing baseline results or character data');
        return;
      }

      // Calculate summary stats
      const totalTests = Object.keys(equipmentTestResults).length +
                        Object.keys(abilityTestResults).length +
                        Object.keys(houseTestResults).length;

      const bestEquipmentUpgrade = equipmentRecommendations.length > 0 ? (equipmentRecommendations[0] as Record<string, unknown>).slot as string : undefined;
      const bestAbilityUpgrade = abilityRecommendations.length > 0 ? (abilityRecommendations[0] as Record<string, unknown>).abilityName as string : undefined;
      const bestHouseUpgrade = houseRecommendations.length > 0 ? (houseRecommendations[0] as Record<string, unknown>).roomName as string : undefined;

      const totalPotentialIncrease = [...equipmentRecommendations, ...abilityRecommendations, ...houseRecommendations]
        .reduce((sum, rec) => sum + ((rec as Record<string, unknown>).profitIncrease as number || 0), 0);

      const simulationData: Omit<SavedCombatSimulation, 'id' | 'timestamp'> = {
        characterName: 'Combat Character',
        targetZone,
        targetTier,
        optimizeFor,
        baselineResults,
        equipmentRecommendations: equipmentRecommendations,
        abilityRecommendations,
        houseRecommendations,
        equipmentTests: equipmentTestResults,
        abilityTests: abilityTestResults,
        houseTests: houseTestResults,
        summary: {
          totalTests,
          bestEquipmentUpgrade,
          bestAbilityUpgrade,
          bestHouseUpgrade,
          totalPotentialIncrease
        }
      };

      const simulationId = await combatSimulationStorage.saveSimulation(simulationData);
      setCurrentSimulationId(simulationId);

      console.log(`💾 Saved simulation with ID: ${simulationId}`);

      // Refresh saved simulations list
      loadSavedSimulations();

    } catch (error) {
      console.error('Failed to save simulation:', error);
    }
  }, [baselineResults, character, equipmentTestResults, abilityTestResults, houseTestResults, equipmentRecommendations, abilityRecommendations, houseRecommendations]);

  // Function to load saved simulations
  const loadSavedSimulations = useCallback(async () => {
    try {
      const simulations = await combatSimulationStorage.getAllSimulations();
      setSavedSimulations(simulations);
    } catch (error) {
      console.error('Failed to load saved simulations:', error);
    }
  }, []);

  // Load saved simulations on component mount
  useEffect(() => {
    loadSavedSimulations();
  }, [loadSavedSimulations]);

  // Function to load a specific simulation
  const loadSimulation = useCallback(async (simulationId: string) => {
    try {
      const simulation = await combatSimulationStorage.getSimulationById(simulationId);
      if (!simulation) {
        console.error('Simulation not found:', simulationId);
        return;
      }

      // Load the simulation data into the component state
      setBaselineResults(simulation.baselineResults);
      setEquipmentTestResults(simulation.equipmentTests as unknown as { [slot: string]: { level: number; profit: number; exp: number; enhancementCost?: number; paybackDays?: number; itemName?: string; itemHrid?: string }[] });
      setEquipmentRecommendations(simulation.equipmentRecommendations);
      setAbilityRecommendations(simulation.abilityRecommendations);
      setHouseRecommendations(simulation.houseRecommendations);
      setAbilityTestResults(simulation.abilityTests as unknown as { [abilityHrid: string]: { level: number; profit: number; exp: number }[] });
      setHouseTestResults(simulation.houseTests as unknown as { [roomHrid: string]: { level: number; profit: number; exp: number }[] });
      setCurrentSimulationId(simulationId);

      // Set zone data if available
      const zoneData = [{
        zone_name: ZONE_DISPLAY_NAMES[simulation.targetZone] || simulation.targetZone,
        difficulty: simulation.targetTier,
        player: 'Loaded Character',
        encounters: '0',
        deaths_per_hour: '0',
        total_experience: simulation.baselineResults.experienceGain.toString(),
        stamina: '0',
        intelligence: '0',
        attack: '0',
        magic: '0',
        ranged: '0',
        melee: '0',
        defense: '0',
        no_rng_revenue: '0',
        expense: '0',
        no_rng_profit: simulation.baselineResults.profitPerDay.toString()
      }];
      setZoneData(zoneData);

      console.log(`📊 Loaded simulation: ${simulationId}`);
    } catch (error) {
      console.error('Failed to load simulation:', error);
    }
  }, []);

  // Function to delete a simulation
  const deleteSimulation = useCallback(async (simulationId: string) => {
    try {
      await combatSimulationStorage.deleteSimulation(simulationId);

      // If we're currently viewing the deleted simulation, clear the current ID
      if (currentSimulationId === simulationId) {
        setCurrentSimulationId(null);
      }

      // Refresh the saved simulations list
      loadSavedSimulations();

      console.log(`🗑️ Deleted simulation: ${simulationId}`);
    } catch (error) {
      console.error('Failed to delete simulation:', error);
    }
  }, [currentSimulationId, loadSavedSimulations]);

  // Function to fetch marketplace prices for all test levels
  const fetchMarketplacePrices = useCallback(async (slotsToTest: { slot: string; itemName: string; enhancementLevel: number; isEmpty: boolean }[]) => {
    console.log('🛒 Fetching marketplace prices for test items...');

    for (const equipment of slotsToTest) {
      const targetLevel = displayEnhancementLevels[equipment.slot];
      if (targetLevel === undefined || equipment.isEmpty) continue;

      // Calculate the range of levels that will be tested
      const testLevels = [];
      for (let level = equipment.enhancementLevel + 1; level <= targetLevel; level++) {
        testLevels.push(level);
      }

      console.log(`🔍 Fetching prices for ${equipment.itemName} levels: ${testLevels.join(', ')}`);
      console.log(`📦 Equipment Details:`, {
        slot: equipment.slot,
        itemName: equipment.itemName,
        currentLevel: equipment.enhancementLevel,
        testLevels: testLevels
      });

      // Fetch prices for all test levels
      const prices: { [level: number]: number | null } = {};
      for (const level of testLevels) {
        console.log(`🏪 Calling MarketplaceService.getItemPrice("${equipment.itemName}", ${level})`);
        const price = await MarketplaceService.getItemPrice(equipment.itemName, level);
        prices[level] = price;
        console.log(`🏪 Result: ${price !== null ? price.toLocaleString() + 'c' : 'null'}`);
      }

      // Update the equipment data with marketplace prices
      setEquipmentTestingData(prevData =>
        prevData.map(item => {
          if (item.slot === equipment.slot) {
            return { ...item, marketplacePrices: { ...item.marketplacePrices, ...prices } };
          }
          return item;
        })
      );
    }
  }, [displayEnhancementLevels]);

  const handleFindUpgrades = async () => {
    // No need to check zoneData - the upgrade simulation handles baseline internally
    setIsAnalyzingUpgrades(true);
    setError(null);
    setEquipmentTestResults({});
    setAbilityTestResults({});
    setHouseTestResults({});
    setEquipmentRecommendations([]);
    setAbilityRecommendations([]);
    setHouseRecommendations([]);
    setZoneData([]); // Reset zone data since we're doing a fresh analysis

    // Determine which slots need testing (where selected level differs from current level)
    const slotsToTest = EQUIPMENT_SLOTS.filter(slot => {
      // Map slots to match character equipment data
      let lookupSlot = slot;
      if (slot === 'weapon') {
        lookupSlot = 'main_hand';
      } else if (slot === 'off_hand') {
        lookupSlot = 'off_hand';
      }

      // Format the slot name for lookup (convert to Title Case like the import does)
      const formattedSlotName = lookupSlot.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      const equipmentItem = character.equipment[formattedSlotName];

      // Skip if no item equipped
      if (!equipmentItem || !equipmentItem.item || equipmentItem.item === '') {
        return false;
      }

      // Get the target level from input
      const targetLevel = displayEnhancementLevels[slot];
      const currentLevel = equipmentItem.enhancement;

      console.log(`🔍 Debug - Equipment change detection for ${slot}:`, {
        formattedSlotName,
        item: equipmentItem.item,
        currentLevel,
        targetLevel,
        hasChange: targetLevel !== undefined && targetLevel !== currentLevel
      });

      return targetLevel !== undefined && targetLevel !== currentLevel;
    }).map(slot => {
      // Convert slot info to the format expected by the rest of the function
      let lookupSlot = slot;
      if (slot === 'weapon') {
        lookupSlot = 'main_hand';
      } else if (slot === 'off_hand') {
        lookupSlot = 'off_hand';
      }

      const formattedSlotName = lookupSlot.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      const equipmentItem = character.equipment[formattedSlotName];

      return {
        slot,
        itemName: equipmentItem.item,
        enhancementLevel: equipmentItem.enhancement,
        isEmpty: false
      };
    });

    // Check for ability changes
    const abilityChanges = character.abilities.filter(ability => {
      const targetLevel = abilityTargetLevels[ability.abilityHrid];
      return targetLevel !== undefined && targetLevel !== ability.level;
    });

    // Check for house changes
    const houseChanges = Object.entries(character.houseRooms).filter(([roomHrid, currentLevel]) => {
      const targetLevel = houseMaxLevels[roomHrid];
      return targetLevel !== undefined && targetLevel !== currentLevel;
    });

    // Check if there are any changes to test
    const hasChanges = slotsToTest.length > 0 || abilityChanges.length > 0 || houseChanges.length > 0;

    if (!hasChanges) {
      setError('No changes detected. Please modify enhancement levels, ability levels, or house levels to test.');
      setIsAnalyzingUpgrades(false);
      return;
    }

    try {
      console.log(`🔧 Testing changes:`, {
        equipment: `${slotsToTest.length} slots`,
        abilities: `${abilityChanges.length} abilities`,
        houses: `${houseChanges.length} rooms`
      });

      // Fetch marketplace prices for all test items first
      await fetchMarketplacePrices(slotsToTest);

      // Use the selected zone and tier for optimization
      const targetZone = selectedCombatZone;
      const targetTier = selectedCombatTier;

      console.log(`🎯 Target zone for optimization: ${targetZone} (${ZONE_DISPLAY_NAMES[targetZone]}) - Tier ${targetTier}`);

      // Create simplified request - we'll build the test plan on the backend
      const request = {
        optimizeFor,
        targetZone,
        targetTier,
        selectedLevels: displayEnhancementLevels,
        abilityTargetLevels,
        houseTargetLevels: houseMaxLevels
      };

      // Calculate total tests that will be run
      const totalTests = slotsToTest.length; // Just one test per modified slot
      console.log(`🎯 Total tests planned: ${totalTests}`);

      // Start streaming upgrade analysis with real-time updates
      console.log('🚀 Starting streaming upgrade analysis...');
      console.log('Character:', character);
      console.log('Request:', request);
      console.log('Raw character data length:', rawCharacterData?.length || 0);

      await CombatSimulatorApiService.analyzeEquipmentUpgradesStream(
        character,
        request,
        rawCharacterData || null,
        (event) => {
          console.log('📡 Stream event received:', event.type, event);

          switch (event.type) {
            case 'status':
              // Update general status messages
              console.log(`Status: ${event.message} (${event.progress}%)`);
              break;

            case 'equipment_info':
              // This confirms our equipment data matches the server
              console.log('Equipment info received:', event.testPlan);
              break;

            case 'baseline_complete':
              console.log('Baseline simulation complete:', event.baselineResults);
              if (event.baselineResults) {
                setBaselineResults({
                  experienceGain: event.baselineResults.experienceGain,
                  profitPerDay: event.baselineResults.profitPerDay
                });

                // Also populate zone data for results display
                const currentZoneName = ZONE_DISPLAY_NAMES[selectedCombatZone] || 'Unknown Zone';
                setZoneData([{
                  zone_name: currentZoneName,
                  difficulty: selectedCombatTier,
                  player: 'Current Character',
                  encounters: '0',
                  deaths_per_hour: '0',
                  total_experience: event.baselineResults.experienceGain.toString(),
                  stamina: '0',
                  intelligence: '0',
                  attack: '0',
                  magic: '0',
                  ranged: '0',
                  melee: '0',
                  defense: '0',
                  no_rng_revenue: '0',
                  expense: '0',
                  no_rng_profit: event.baselineResults.profitPerDay.toString()
                }]);
              }
              break;

            case 'test_starting':
              // Mark the specific test as "testing"
              setEquipmentTestingData(prevData =>
                prevData.map(equipment => {
                  if (equipment.slot === event.slot && event.testLevel) {
                    const updatedTestResults = { ...equipment.testResults };
                    // Create the test result entry if it doesn't exist
                    updatedTestResults[event.testLevel] = {
                      exp: 0,
                      profit: 0,
                      status: 'testing'
                    };
                    return { ...equipment, testResults: updatedTestResults };
                  }
                  return equipment;
                })
              );
              break;

            case 'test_complete':
              // Update the specific test result with actual values
              setEquipmentTestingData(prevData =>
                prevData.map(equipment => {
                  if (equipment.slot === event.slot && event.result) {
                    const updatedTestResults = { ...equipment.testResults };
                    const testLevel = event.result.testEnhancement;
                    // Create or update the test result entry
                    updatedTestResults[testLevel] = {
                      exp: event.result.experienceGain,
                      profit: event.result.profitPerDay,
                      status: 'completed',
                      cost: event.enhancementCost,
                      paybackDays: event.paybackDays
                    };
                    return { ...equipment, testResults: updatedTestResults };
                  }
                  return equipment;
                })
              );
              break;

            case 'test_failed':
              // Mark test as failed
              setEquipmentTestingData(prevData =>
                prevData.map(equipment => {
                  if (equipment.slot === event.slot && event.result) {
                    const updatedTestResults = { ...equipment.testResults };
                    const testLevel = event.result.testEnhancement;
                    // Create or update the test result entry as failed
                    updatedTestResults[testLevel] = {
                      exp: 0,
                      profit: 0,
                      status: 'failed'
                    };
                    return { ...equipment, testResults: updatedTestResults };
                  }
                  return equipment;
                })
              );
              break;

            case 'simulation_complete':
              console.log('🔧 Upgrade analysis complete!');
              console.log('Recommendations:', event.recommendations);
              console.log('Upgrade tests:', event.upgradeTests);
              console.log('Ability tests:', event.abilityTests);
              console.log('House tests:', event.houseTests);
              console.log('Ability recommendations:', event.abilityRecommendations);
              console.log('House recommendations:', event.houseRecommendations);

              // Process equipment test results
              if (event.equipmentTests) {
                const equipmentTestData: { [slot: string]: { level: number; profit: number; exp: number; enhancementCost?: number; paybackDays?: number; itemName?: string; itemHrid?: string }[] } = {};
                event.equipmentTests.forEach((test: {
                  slot: string;
                  currentLevel: number;
                  testLevel: number;
                  profitPerDay: number;
                  experienceGain: number;
                  enhancementCost?: number;
                  paybackDays?: number;
                  itemName?: string;
                  itemHrid?: string;
                }) => {
                  if (!equipmentTestData[test.slot]) {
                    equipmentTestData[test.slot] = [];
                  }
                  equipmentTestData[test.slot].push({
                    level: test.testLevel,
                    profit: test.profitPerDay,
                    exp: test.experienceGain,
                    enhancementCost: test.enhancementCost,
                    paybackDays: test.paybackDays,
                    itemName: test.itemName,
                    itemHrid: test.itemHrid
                  });
                });
                setEquipmentTestResults(equipmentTestData);
              }

              // Process ability test results
              if (event.abilityTests) {
                const abilityTestData: { [abilityHrid: string]: { level: number; profit: number; exp: number }[] } = {};
                event.abilityTests.forEach((test: {
                  abilityHrid: string;
                  abilityName: string;
                  currentLevel: number;
                  testLevel: number;
                  profitPerDay: number;
                  experienceGain: number;
                }) => {
                  if (!abilityTestData[test.abilityHrid]) {
                    abilityTestData[test.abilityHrid] = [];
                  }
                  abilityTestData[test.abilityHrid].push({
                    level: test.testLevel,
                    profit: test.profitPerDay,
                    exp: test.experienceGain
                  });
                });
                setAbilityTestResults(abilityTestData);
              }

              // Process house test results
              if (event.houseTests) {
                const houseTestData: { [roomHrid: string]: { level: number; profit: number; exp: number }[] } = {};
                event.houseTests.forEach((test: {
                  roomHrid: string;
                  roomName: string;
                  currentLevel: number;
                  testLevel: number;
                  profitPerDay: number;
                  experienceGain: number;
                }) => {
                  if (!houseTestData[test.roomHrid]) {
                    houseTestData[test.roomHrid] = [];
                  }
                  houseTestData[test.roomHrid].push({
                    level: test.testLevel,
                    profit: test.profitPerDay,
                    exp: test.experienceGain
                  });
                });
                setHouseTestResults(houseTestData);
              }

              // Store equipment, ability and house recommendations
              if (event.recommendations) {
                setEquipmentRecommendations(event.recommendations);
              }
              if (event.abilityRecommendations) {
                setAbilityRecommendations(event.abilityRecommendations);
              }
              if (event.houseRecommendations) {
                setHouseRecommendations(event.houseRecommendations);
              }

              console.log('Simulation complete');

              // Save simulation results to IndexedDB
              saveSimulationResults(selectedCombatZone, selectedCombatTier, optimizeFor);
              break;

            case 'error':
              console.error('Stream error:', event.error);
              setError(event.error || 'Unknown streaming error');
              break;
          }
        }
      );

      console.log('🔧 Streaming upgrade analysis complete');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze equipment upgrades');
      console.error('Upgrade analysis error:', err);
    } finally {
      setIsAnalyzingUpgrades(false);
    }
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


  return (
    <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6">
      {/* Currently Equipped Items - Always show since we have combat items constants */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-purple-200">⚔️ Combat Simulations</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGear(!showGear)}
                className="px-3 py-1 text-xs bg-purple-600/20 border border-purple-500/50 rounded text-purple-200 hover:bg-purple-600/30 transition-colors"
              >
                {showGear ? 'Hide Gear' : 'Show Gear'}
              </button>
              <button
                onClick={() => setShowHouses(!showHouses)}
                className="px-3 py-1 text-xs bg-green-600/20 border border-green-500/50 rounded text-green-200 hover:bg-green-600/30 transition-colors"
              >
                {showHouses ? 'Hide Houses' : 'Show Houses'}
              </button>
              <button
                onClick={() => setShowAbilities(!showAbilities)}
                className="px-3 py-1 text-xs bg-blue-600/20 border border-blue-500/50 rounded text-blue-200 hover:bg-blue-600/30 transition-colors"
              >
                {showAbilities ? 'Hide Abilities' : 'Show Abilities'}
              </button>
            </div>
          </div>

          {/* Houses Section */}
          {showHouses && Object.keys(character.houseRooms).length > 0 && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
              <h4 className="text-md font-bold text-green-200 mb-3">🏠 Houses</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
                {getOrderedHouseRooms().map(([roomHrid, currentLevel]) => (
                  <div
                    key={roomHrid}
                    className="bg-black/20 rounded-lg p-3 border border-green-500/30 text-center"
                  >
                    <div className="space-y-2">
                      {/* House Name */}
                      <h5 className="text-white font-medium capitalize text-sm">
                        {parseHouseName(roomHrid)}
                      </h5>

                      {/* House Icon */}
                      <div className="flex justify-center">
                        <div className="w-10 h-10">
                          <SkillIcon
                            skillId={getHouseRoomIcon(roomHrid)}
                            size={40}
                            className="rounded border border-green-400/50"
                          />
                        </div>
                      </div>

                      {/* Maximum Level Input */}
                      <div className="flex justify-center">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          value={houseMaxLevels[roomHrid] || 0}
                          onChange={(e) => {
                            const newLevel = Math.min(8, Math.max(0, parseInt(e.target.value) || 0));
                            setHouseMaxLevels(prev => ({
                              ...prev,
                              [roomHrid]: newLevel
                            }));
                          }}
                          className="w-16 px-2 py-1 bg-black/30 border border-green-500/50 rounded text-white text-xs text-center focus:border-green-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abilities Section */}
          {showAbilities && character.abilities.length > 0 && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4">
              <h4 className="text-md font-bold text-blue-200 mb-3 text-center">⚡ Abilities</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-items-center">
                {/* Empty first column for centering */}
                <div className="hidden lg:block"></div>
                {character.abilities.map((ability, index) => {
                  // Extract ability name from "/abilities/ability_name" format
                  const abilityName = ability.abilityHrid.replace('/abilities/', '');
                  // Format name for display: capitalize and replace underscores with spaces
                  const displayName = abilityName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                  return (
                    <div
                      key={index}
                      className="bg-black/20 rounded-lg p-3 border border-blue-500/30 text-center w-full"
                    >
                      <div className="space-y-2">
                        {/* Ability Name */}
                        <h5 className="text-white font-medium text-sm">
                          {displayName}
                        </h5>

                        {/* Ability Icon */}
                        <div className="flex justify-center">
                          <div className="w-12 h-12">
                            <AbilityIcon
                              abilityId={abilityName}
                              size={48}
                              className="rounded border border-blue-400/50"
                            />
                          </div>
                        </div>

                        {/* Ability Level Input */}
                        <div className="flex justify-center">
                          <input
                            type="number"
                            min="0"
                            max="200"
                            value={abilityTargetLevels[ability.abilityHrid] || ability.level}
                            onChange={(e) => {
                              const newLevel = Math.min(200, Math.max(0, parseInt(e.target.value) || 0));
                              setAbilityTargetLevels(prev => ({
                                ...prev,
                                [ability.abilityHrid]: newLevel
                              }));
                            }}
                            className="w-16 px-2 py-1 bg-black/30 border border-blue-500/50 rounded text-white text-xs text-center focus:border-blue-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gear Section */}
          {showGear && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EQUIPMENT_SLOTS.map((slot) => {
              // Map slots to match character equipment data
              // The character import converts /item_locations/main_hand to "Main Hand" but we use "weapon" in EQUIPMENT_SLOTS
              let lookupSlot = slot;
              if (slot === 'weapon') {
                lookupSlot = 'main_hand';
              } else if (slot === 'off_hand') {
                lookupSlot = 'off_hand'; // This should already match
              }

              // Format the slot name for lookup (convert to Title Case like the import does)
              const formattedSlotName = lookupSlot.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
              const equipmentItem = character.equipment[formattedSlotName];

              return (
                <div
                  key={slot}
                  className="bg-black/20 rounded-lg p-3 border border-purple-500/30"
                >
                  <div className="flex items-center gap-3">
                    {/* Item Icon */}
                    <div className="w-10 h-10 flex-shrink-0">
                      {equipmentItem && equipmentItem.item !== '' ? (
                        <ItemIcon
                          itemHrid={`/items/${equipmentItem.item.toLowerCase().replace(/\s+/g, '_')}`}
                          size={40}
                          className="rounded border border-purple-400/50"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-600 rounded border border-gray-500 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Empty</span>
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1">
                      <h5 className="text-white font-medium capitalize text-sm">
                        {slot.replace('_', ' ')}
                      </h5>
                      {equipmentItem && equipmentItem.item !== '' ? (
                        <div>
                          <p className="text-purple-200 text-xs">
                            {equipmentItem.item} (+{equipmentItem.enhancement})
                          </p>
                          <button
                            onClick={() => addSimSlot(slot)}
                            className="text-blue-400 hover:text-blue-300 text-xs mt-1 underline transition-colors"
                          >
                            Sim another {slot.replace('_', ' ')}
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xs">No item equipped</p>
                      )}
                    </div>

                    {/* Enhancement Level Input - Right Side */}
                    {equipmentItem && equipmentItem.item !== '' && (
                      <div className="flex items-center gap-2">
                        <label className="text-purple-200 text-xs font-medium">
                          Enhancement:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={displayEnhancementLevels[slot] !== undefined ? displayEnhancementLevels[slot] : (equipmentItem.enhancement || 0)}
                          onChange={(e) => {
                            const newLevel = Math.min(20, Math.max(0, parseInt(e.target.value) || 0));
                            setDisplayEnhancementLevels(prev => ({
                              ...prev,
                              [slot]: newLevel
                            }));
                          }}
                          className="w-16 px-2 py-1 bg-black/30 border border-purple-500/50 rounded text-white text-xs focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Sim Slots */}
          {additionalSimSlots.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-bold text-purple-200 mb-3">⚙️ Additional Simulations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {additionalSimSlots.map((simSlot) => {
                  // Get available items for this slot from combat items
                  const availableItems = combatItems?.[simSlot.slot] || {};
                  const itemOptions = Object.entries(availableItems);

                  return (
                    <div
                      key={simSlot.id}
                      className="bg-black/20 rounded-lg p-3 border border-blue-500/30"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {/* Item Icon */}
                          <div className="w-10 h-10 flex-shrink-0">
                            {simSlot.selectedItem ? (
                              <ItemIcon
                                itemHrid={simSlot.selectedItem}
                                size={40}
                                className="rounded border border-blue-400/50"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-600 rounded border border-gray-500 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">Select</span>
                              </div>
                            )}
                          </div>

                          {/* Slot Info */}
                          <div className="flex-1">
                            <h5 className="text-white font-medium capitalize text-sm">
                              {simSlot.slot.replace('_', ' ')} Simulation
                            </h5>
                            <button
                              onClick={() => removeSimSlot(simSlot.id)}
                              className="text-red-400 hover:text-red-300 text-xs underline transition-colors"
                            >
                              Remove simulation
                            </button>
                          </div>
                        </div>

                        {/* Item Selection Dropdown */}
                        <div>
                          <select
                            value={simSlot.selectedItem}
                            onChange={(e) => updateSimSlot(simSlot.id, { selectedItem: e.target.value })}
                            className="w-full p-2 bg-black/30 border border-blue-500/50 rounded text-white text-xs focus:border-blue-400 focus:outline-none"
                          >
                            <option value="">Select an item...</option>
                            {itemOptions.map(([itemHrid, itemName]) => (
                              <option key={itemHrid} value={itemHrid}>
                                {itemName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Max Enhancement Level Input */}
                        <div className="flex items-center gap-2">
                          <label className="text-blue-200 text-xs font-medium">
                            Max Enhancement:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={simSlot.enhancementLevel}
                            onChange={(e) => {
                              const newLevel = Math.min(20, Math.max(0, parseInt(e.target.value) || 0));
                              updateSimSlot(simSlot.id, { enhancementLevel: newLevel });
                            }}
                            className="w-16 px-2 py-1 bg-black/30 border border-blue-500/50 rounded text-white text-xs focus:border-blue-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </>
          )}
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
              {isInitializing ? 'Initializing combat simulator...' : `Analyzing ${ZONE_DISPLAY_NAMES[selectedCombatZone]} (Tier ${selectedCombatTier})...`}
            </span>
            <span className="text-purple-300">
              🎯 TARGETED ANALYSIS
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
              : `Testing ${ZONE_DISPLAY_NAMES[selectedCombatZone]} with your current equipment...`
            }
          </p>
        </div>
      )}

      {/* Saved Simulations Section */}
      {savedSimulations.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📊 Recent Combat Simulations ({savedSimulations.length})
          </h3>
          <div className="grid gap-3 max-h-60 overflow-y-auto">
            {savedSimulations.slice(0, 10).map((simulation) => (
              <div
                key={simulation.id}
                className={`bg-gray-700/50 border rounded-lg p-3 cursor-pointer transition-colors hover:bg-gray-600/50 ${
                  currentSimulationId === simulation.id ? 'border-blue-500 bg-blue-900/30' : 'border-gray-600'
                }`}
                onClick={() => loadSimulation(simulation.id)}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <div className="text-blue-300 font-medium">{simulation.characterName}</div>
                    <div className="text-gray-400 text-xs">
                      {new Date(simulation.timestamp).toLocaleDateString()} {new Date(simulation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-300">{ZONE_DISPLAY_NAMES[simulation.targetZone] || simulation.targetZone}</div>
                    <div className="text-gray-400 text-xs">Tier {simulation.targetTier} • {simulation.optimizeFor}</div>
                  </div>
                  <div>
                    <div className="text-yellow-300">{simulation.baselineResults.profitPerDay.toLocaleString()}/day</div>
                    <div className="text-gray-400 text-xs">{simulation.summary.totalTests} tests run</div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSimulation(simulation.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {savedSimulations.length > 10 && (
            <div className="text-gray-400 text-xs text-center mt-2">
              Showing 10 of {savedSimulations.length} simulations
            </div>
          )}
        </div>
      )}

      {/* Find My Best Upgrades - Unified Analysis */}
      {!showEquipmentTesting && (
      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-bold text-yellow-200 mb-4">🔧 Find My Best Upgrades</h4>
        <p className="text-yellow-100 text-sm mb-4">
          Analyze your current gear to find optimal enhancement levels for maximum {optimizeFor === 'profit' ? 'profit' : 'experience'}.
          This includes baseline testing and upgrade analysis for the selected zone and tier.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Combat Zone Selection */}
          <div>
            <label className="block text-yellow-200 text-sm font-medium mb-2">
              Target Combat Zone:
            </label>
            <select
              value={selectedCombatZone}
              onChange={(e) => setSelectedCombatZone(e.target.value)}
              className="w-full p-2 bg-black/30 border border-yellow-500/50 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
            >
              {COMBAT_ZONES.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>

          {/* Combat Tier Selection */}
          <div>
            <label className="block text-yellow-200 text-sm font-medium mb-2">
              Target Combat Tier:
            </label>
            <select
              value={selectedCombatTier}
              onChange={(e) => setSelectedCombatTier(e.target.value)}
              className="w-full p-2 bg-black/30 border border-yellow-500/50 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
            >
              {COMBAT_TIERS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>

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
              <option value="profit">Profit (Coins/Day)</option>
              <option value="exp">Experience (EXP/Hour)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleFindUpgrades}
            disabled={isAnalyzingUpgrades}
            className={`px-8 py-3 font-medium rounded-lg transition-all ${
              isAnalyzingUpgrades
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            {isAnalyzingUpgrades ? 'Analyzing Upgrades...' : 'Find My Best Upgrades'}
          </button>
        </div>

        <div className="mt-3 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-200 text-sm text-center">
            📍 Will analyze: <strong>{ZONE_DISPLAY_NAMES[selectedCombatZone]} (Tier {selectedCombatTier})</strong> with your current gear configuration
          </p>
        </div>
      </div>
      )}

      {zoneData.length > 0 && (
        <div className="space-y-6">
          {/* Baseline Results */}
          {baselineResults && (
            <div className="bg-gray-500/20 border border-gray-500/50 rounded-lg p-4">
              <h4 className="text-lg font-bold text-gray-200 mb-2">📊 Baseline Results</h4>
              <p className="text-white mb-2">
                Current performance in <strong>{ZONE_DISPLAY_NAMES[selectedCombatZone]} (Tier {selectedCombatTier})</strong>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-600/20 p-3 rounded">
                  <div className="text-blue-300 text-sm font-medium">Experience Gain</div>
                  <div className="text-white text-lg font-bold">{baselineResults.experienceGain.toLocaleString()}/hr</div>
                </div>
                <div className="bg-yellow-600/20 p-3 rounded">
                  <div className="text-yellow-300 text-sm font-medium">Profit</div>
                  <div className="text-white text-lg font-bold">{baselineResults.profitPerDay.toLocaleString()}/day</div>
                </div>
              </div>
            </div>
          )}


          {/* Equipment Configuration */}
          {showEquipmentTesting && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
              <h4 className="text-lg font-bold text-blue-200 mb-4">
                ⚙️ Equipment Configuration
              </h4>
              <p className="text-blue-100 text-sm mb-4">
                Select enhancement levels to test for each equipped item:
              </p>

              <div className="space-y-4">
                {equipmentTestingData.map((equipment) => (
                  <div
                    key={equipment.slot}
                    className="bg-black/20 rounded-lg p-4 border border-blue-500/30"
                  >
                    <div className="flex items-center gap-4">
                      {/* Item Icon */}
                      <div className="w-12 h-12 flex-shrink-0">
                        {!equipment.isEmpty ? (
                          <ItemIcon
                            itemHrid={equipment.itemHrid}
                            size={48}
                            className="rounded border border-blue-400/50"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-600 rounded border border-gray-500 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Empty</span>
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1">
                        <h5 className="text-white font-medium capitalize">
                          {equipment.slot.replace('_', ' ')}
                        </h5>
                        {!equipment.isEmpty ? (
                          <p className="text-blue-200 text-sm">
                            {equipment.itemName.replace(/_/g, ' ')} (+{equipment.enhancementLevel})
                          </p>
                        ) : (
                          <p className="text-gray-400 text-sm">No item equipped</p>
                        )}
                      </div>

                      {/* Enhancement Level Dropdown */}
                      <div className="w-32">
                        {!equipment.isEmpty ? (
                          <select
                            value={selectedEnhancementLevels[equipment.slot] || equipment.enhancementLevel}
                            onChange={(e) => {
                              const newLevel = parseInt(e.target.value);
                              setSelectedEnhancementLevels(prev => ({
                                ...prev,
                                [equipment.slot]: newLevel
                              }));
                            }}
                            className="w-full p-2 bg-black/30 border border-blue-500/50 rounded text-white focus:border-blue-400 focus:outline-none"
                          >
                            {Array.from({ length: 21 }, (_, i) => i).map(level => (
                              <option
                                key={level}
                                value={level}
                                disabled={level < equipment.enhancementLevel}
                              >
                                +{level}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="w-full p-2 bg-gray-600/50 border border-gray-500/50 rounded text-gray-400 text-center">
                            N/A
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status and Results Display */}
                    {!equipment.isEmpty && isAnalyzingUpgrades && (
                      <div className="mt-3 p-3 bg-black/30 rounded border border-blue-500/30">
                        {(() => {
                          const selectedLevel = selectedEnhancementLevels[equipment.slot];
                          const hasChanged = selectedLevel !== undefined && selectedLevel !== equipment.enhancementLevel;

                          if (!hasChanged) {
                            return (
                              <p className="text-gray-400 text-sm">
                                No changes - skipping this slot
                              </p>
                            );
                          }

                          // Calculate the range of levels being tested
                          const currentLevel = equipment.enhancementLevel;
                          const testLevels = [];
                          for (let level = currentLevel + 1; level <= selectedLevel; level++) {
                            testLevels.push(level);
                          }

                          // Check testing status across all levels
                          const testResults = testLevels.map(level => ({
                            level,
                            result: equipment.testResults[level]
                          }));

                          const completedTests = testResults.filter(t => t.result?.status === 'completed');
                          const testingLevel = testResults.find(t => t.result?.status === 'testing');
                          const failedTests = testResults.filter(t => t.result?.status === 'failed');

                          if (completedTests.length === testLevels.length) {
                            // All tests complete - show final results
                            const finalResult = equipment.testResults[selectedLevel];
                            return (
                              <div className="text-green-300">
                                <div className="font-medium mb-2">✅ All Tests Complete</div>
                                <div className="text-sm text-gray-300 mb-2">
                                  Tested levels: {testLevels.join(', ')}
                                </div>
                                {baselineResults && finalResult && (
                                  <div className="text-sm space-y-1">
                                    <div className="font-medium">Final Result (+{selectedLevel}):</div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <div className="bg-blue-600/20 p-2 rounded">
                                        <div className="text-xs text-blue-300">Experience</div>
                                        <div className="text-white font-medium">{finalResult.exp.toLocaleString()}/hr</div>
                                        <div className={`text-xs ${(finalResult.exp - baselineResults.experienceGain) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {(finalResult.exp - baselineResults.experienceGain) >= 0 ? '+' : ''}{(finalResult.exp - baselineResults.experienceGain).toLocaleString()} vs baseline
                                        </div>
                                      </div>
                                      <div className="bg-yellow-600/20 p-2 rounded">
                                        <div className="text-xs text-yellow-300">Profit</div>
                                        <div className="text-white font-medium">{finalResult.profit.toLocaleString()}/day</div>
                                        <div className={`text-xs ${(finalResult.profit - baselineResults.profitPerDay) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {(finalResult.profit - baselineResults.profitPerDay) >= 0 ? '+' : ''}{(finalResult.profit - baselineResults.profitPerDay).toLocaleString()} vs baseline
                                        </div>
                                        {equipment.marketplacePrices[selectedLevel] !== undefined && (
                                          <div className="text-xs text-orange-300 mt-1 border-t border-yellow-500/30 pt-1">
                                            {equipment.marketplacePrices[selectedLevel] !== null ? (
                                              <>💰 {equipment.marketplacePrices[selectedLevel]!.toLocaleString()}c</>
                                            ) : (
                                              <>❌ Not available</>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {optimizeFor === 'profit' && finalResult.cost && finalResult.paybackDays && (
                                      <div className="text-yellow-300 mt-2 text-xs">
                                        <div>Enhancement Cost: {finalResult.cost.toLocaleString()}c</div>
                                        <div>Payback Period: {finalResult.paybackDays} days</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          } else if (testingLevel) {
                            return (
                              <div className="text-blue-300">
                                <div className="font-medium">⚙️ Testing +{testingLevel.level}...</div>
                                <div className="text-sm">
                                  Progress: {completedTests.length}/{testLevels.length} levels tested
                                </div>
                                {completedTests.length > 0 && baselineResults && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-400 mb-1">
                                      Completed: {completedTests.map(t => `+${t.level}`).join(', ')}
                                    </div>
                                    {/* Show best result so far */}
                                    {(() => {
                                      const bestTest = completedTests.reduce((best, current) => {
                                        const bestMetric = optimizeFor === 'profit'
                                          ? best.result?.profit || 0
                                          : best.result?.exp || 0;
                                        const currentMetric = optimizeFor === 'profit'
                                          ? current.result?.profit || 0
                                          : current.result?.exp || 0;
                                        return currentMetric > bestMetric ? current : best;
                                      });

                                      if (bestTest.result) {
                                        return (
                                          <div className="bg-black/30 p-2 rounded text-xs">
                                            <div className="text-green-400 font-medium">Best so far (+{bestTest.level}):</div>
                                            <div className="grid grid-cols-2 gap-1 mt-1">
                                              <div>
                                                <span className="text-blue-300">EXP:</span> {bestTest.result.exp.toLocaleString()}/hr
                                                <div className={`text-xs ${(bestTest.result.exp - baselineResults.experienceGain) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                  {(bestTest.result.exp - baselineResults.experienceGain) >= 0 ? '+' : ''}{(bestTest.result.exp - baselineResults.experienceGain).toLocaleString()}
                                                </div>
                                              </div>
                                              <div>
                                                <span className="text-yellow-300">Profit:</span> {bestTest.result.profit.toLocaleString()}/day
                                                <div className={`text-xs ${(bestTest.result.profit - baselineResults.profitPerDay) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                  {(bestTest.result.profit - baselineResults.profitPerDay) >= 0 ? '+' : ''}{(bestTest.result.profit - baselineResults.profitPerDay).toLocaleString()}
                                                </div>
                                                {equipment.marketplacePrices[bestTest.level] !== undefined && (
                                                  <div className="text-xs text-orange-300 mt-1">
                                                    {equipment.marketplacePrices[bestTest.level] !== null ? (
                                                      <>💰 {equipment.marketplacePrices[bestTest.level]!.toLocaleString()}c</>
                                                    ) : (
                                                      <>❌ N/A</>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          } else if (failedTests.length > 0) {
                            return (
                              <div className="text-red-300">
                                <div className="font-medium">❌ Some Tests Failed</div>
                                <div className="text-sm">
                                  Failed: {failedTests.map(t => `+${t.level}`).join(', ')}
                                </div>
                                {completedTests.length > 0 && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Completed: {completedTests.map(t => `+${t.level}`).join(', ')}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <div className="text-yellow-300">
                                <div className="font-medium">⏳ Preparing...</div>
                                <div className="text-sm">
                                  Will test levels: {testLevels.join(', ')}
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Optimize For Selection - moved below equipment */}
              <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <h5 className="text-yellow-200 font-medium mb-3">Optimization Settings</h5>
                <div className="flex items-center gap-4">
                  <label className="text-yellow-200 text-sm font-medium">
                    Optimize For:
                  </label>
                  <select
                    value={optimizeFor}
                    onChange={(e) => setOptimizeFor(e.target.value as 'profit' | 'exp')}
                    className="p-2 bg-black/30 border border-yellow-500/50 rounded text-white focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="profit">Profit (Coins/Day)</option>
                    <option value="exp">Experience (EXP/Hour)</option>
                  </select>
                </div>
              </div>

              {/* Run Analysis Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleFindUpgrades}
                  disabled={isAnalyzingUpgrades}
                  className={`px-6 py-3 font-medium rounded-lg transition-all ${
                    isAnalyzingUpgrades
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isAnalyzingUpgrades ? 'Running Analysis...' : 'Run Enhancement Analysis'}
                </button>
              </div>

              {isAnalyzingUpgrades && (
                <div className="mt-4 p-3 bg-blue-600/20 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    🔄 <strong>Status:</strong> Running enhancement tests for modified slots...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Unified Upgrade Results */}
          {(Object.keys(equipmentTestResults).length > 0 || Object.keys(abilityTestResults).length > 0 || Object.keys(houseTestResults).length > 0) && (
            <div className="space-y-4">
                {(() => {
                  // Combine all upgrade types into a single array
                  const allUpgrades: Array<{
                    type: 'equipment' | 'ability' | 'house';
                    key: string;
                    recommendation: Record<string, unknown>;
                    testResults?: unknown;
                    percentageIncrease: number;
                  }> = [];

                  // Add equipment upgrades
                  Object.entries(equipmentTestResults).forEach(([slot, testResults]) => {
                    const recommendation = equipmentRecommendations.find((rec: Record<string, unknown>) => rec.slot === slot);
                    if (recommendation) {
                      allUpgrades.push({
                        type: 'equipment',
                        key: slot,
                        recommendation,
                        testResults,
                        percentageIncrease: (recommendation.percentageIncrease as number) || 0
                      });
                    }
                  });

                  // Add ability upgrades
                  Object.entries(abilityTestResults).forEach(([abilityHrid, testResults]) => {
                    const recommendation = abilityRecommendations.find((rec: Record<string, unknown>) => rec.abilityHrid === abilityHrid);
                    if (recommendation) {
                      allUpgrades.push({
                        type: 'ability',
                        key: abilityHrid,
                        recommendation,
                        testResults,
                        percentageIncrease: (recommendation.percentageIncrease as number) || 0
                      });
                    }
                  });

                  // Add house upgrades
                  Object.entries(houseTestResults).forEach(([roomHrid, testResults]) => {
                    const recommendation = houseRecommendations.find((rec: Record<string, unknown>) => rec.roomHrid === roomHrid);
                    if (recommendation) {
                      allUpgrades.push({
                        type: 'house',
                        key: roomHrid,
                        recommendation,
                        testResults,
                        percentageIncrease: (recommendation.percentageIncrease as number) || 0
                      });
                    }
                  });

                  // Sort by highest percentage increase (descending)
                  allUpgrades.sort((a, b) => b.percentageIncrease - a.percentageIncrease);

                  return allUpgrades.map((upgrade, index) => {
                    if (upgrade.type === 'equipment') {
                      const slotName = upgrade.key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                      const recommendation = upgrade.recommendation;
                      const testResults = (upgrade.testResults as unknown[])?.[0] as Record<string, unknown> || {};

                      const rawItemName = recommendation?.itemName as string || testResults.itemName || `${slotName} Item`;
                      const itemName = rawItemName && typeof rawItemName === 'string' ? rawItemName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : `${slotName} Item`;
                      const itemHrid = recommendation?.itemHrid as string || testResults.itemHrid;

                      return (
                        <div key={`equipment-${upgrade.key}`} className="bg-black/20 rounded-lg p-4 border border-orange-500/30">
                          <div className="grid grid-cols-3 gap-4 items-start">
                            {/* Column 1: Equipment Name and Levels */}
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8">
                                {itemHrid && typeof itemHrid === 'string' ? (
                                  <ItemIcon
                                    itemHrid={itemHrid}
                                    size={32}
                                    className="rounded border border-orange-400/50"
                                  />
                                ) : (
                                  <SkillIcon
                                    skillId="combat"
                                    size={32}
                                    className="rounded border border-orange-400/50"
                                  />
                                )}
                              </div>
                              <div>
                                <h5 className="text-white font-medium">{itemName}</h5>
                                <p className="text-orange-200 text-sm">{slotName} Equipment</p>
                                <div className="text-orange-200 text-sm mt-1">
                                  <div>Current: +{recommendation.currentLevel as number}</div>
                                  <div className="text-orange-300 font-medium">Best: +{recommendation.recommendedLevel as number}</div>
                                </div>
                              </div>
                            </div>

                            {/* Column 2: Cost Information */}
                            <div className="text-center">
                              {recommendation.enhancementCost !== undefined && recommendation.enhancementCost !== null && (recommendation.enhancementCost as number) > 0 ? (
                                <div className="text-yellow-300 text-sm">
                                  <div className="font-medium mb-1">Total Cost: {(recommendation.enhancementCost as number).toLocaleString()}c</div>
                                  <div className="text-xs mb-1">Enhancement materials from AH</div>
                                  {recommendation.paybackDays !== undefined && (
                                    <div className="text-orange-300 text-xs">
                                      Payback: {(recommendation.paybackDays as number) === 0 ? 'Immediate' : `${recommendation.paybackDays} days`}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No cost</div>
                              )}
                            </div>

                            {/* Column 3: Benefits and Total */}
                            <div className="text-right">
                              <div className="text-orange-300 font-bold mb-1">
                                +{((recommendation.percentageIncrease as number) || 0).toFixed(1)}%
                              </div>
                              <div className="text-orange-200 text-sm mb-1">
                                Increase: {optimizeFor === 'profit'
                                  ? `+${((recommendation.profitIncrease as number) || 0).toLocaleString()} coins/day`
                                  : `+${((recommendation.experienceIncrease as number) || 0).toLocaleString()} exp/hr`
                                }
                              </div>
                              {baselineResults && (
                                <div className="text-yellow-300 text-sm font-medium">
                                  Total: {optimizeFor === 'profit'
                                    ? `${(baselineResults.profitPerDay + ((recommendation.profitIncrease as number) || 0)).toLocaleString()}/day`
                                    : `${(baselineResults.experienceGain + ((recommendation.experienceIncrease as number) || 0)).toLocaleString()}/hr`
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else if (upgrade.type === 'ability') {
                      const abilityName = upgrade.key.replace('/abilities/', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      const currentAbility = character.abilities.find(a => a.abilityHrid === upgrade.key);
                      const currentLevel = currentAbility?.level || 0;
                      const recommendation = upgrade.recommendation;

                      return (
                        <div key={`ability-${upgrade.key}`} className="bg-black/20 rounded-lg p-4 border border-blue-500/30">
                          <div className="grid grid-cols-3 gap-4 items-start">
                            {/* Column 1: Ability Name and Levels */}
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8">
                                <AbilityIcon
                                  abilityId={upgrade.key.replace('/abilities/', '')}
                                  size={32}
                                  className="rounded border border-blue-400/50"
                                />
                              </div>
                              <div>
                                <h5 className="text-white font-medium">{abilityName}</h5>
                                <p className="text-blue-200 text-sm">Ability</p>
                                <p className="text-blue-200 text-sm">
                                  Current Level: {currentLevel} → Target: {recommendation.recommendedLevel as number}
                                </p>
                              </div>
                            </div>

                            {/* Column 2: Cost Information */}
                            <div className="text-center">
                              {recommendation.enhancementCost !== undefined && recommendation.enhancementCost !== null && (recommendation.enhancementCost as number) > 0 ? (
                                <div className="text-yellow-300 text-sm">
                                  <div className="font-medium mb-1">Total Cost: {(recommendation.enhancementCost as number).toLocaleString()}c</div>
                                  <div className="text-xs mb-1">
                                    {(() => {
                                      if (recommendation.booksRequired && recommendation.costPerBook) {
                                        return `${(recommendation.costPerBook as number).toLocaleString()}c per book (${recommendation.booksRequired} books)`;
                                      } else {
                                        const levelDiff = (recommendation.recommendedLevel as number) - currentLevel;
                                        const estimatedBooks = Math.ceil(levelDiff * 2.5);
                                        const costPerBook = Math.round((recommendation.enhancementCost as number) / estimatedBooks);
                                        return `~${costPerBook.toLocaleString()}c per book (~${estimatedBooks} books)`;
                                      }
                                    })()}
                                  </div>
                                  {recommendation.paybackDays !== undefined && (
                                    <div className="text-orange-300 text-xs">
                                      Payback: {(recommendation.paybackDays as number) === 0 ? 'Immediate' : `${recommendation.paybackDays} days`}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No cost</div>
                              )}
                            </div>

                            {/* Column 3: Benefits and Total */}
                            <div className="text-right">
                              <div className="text-blue-300 font-bold mb-1">
                                +{((recommendation.percentageIncrease as number) || 0).toFixed(1)}%
                              </div>
                              <div className="text-blue-200 text-sm mb-1">
                                Increase: {optimizeFor === 'profit'
                                  ? `+${((recommendation.profitIncrease as number) || 0).toLocaleString()} coins/day`
                                  : `+${((recommendation.experienceIncrease as number) || 0).toLocaleString()} exp/hr`
                                }
                              </div>
                              {baselineResults && (
                                <div className="text-yellow-300 text-sm font-medium">
                                  Total: {optimizeFor === 'profit'
                                    ? `${(baselineResults.profitPerDay + ((recommendation.profitIncrease as number) || 0)).toLocaleString()}/day`
                                    : `${(baselineResults.experienceGain + ((recommendation.experienceIncrease as number) || 0)).toLocaleString()}/hr`
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else { // house
                      const roomName = parseHouseName(upgrade.key);
                      const currentLevel = character.houseRooms[upgrade.key] || 0;
                      const recommendation = upgrade.recommendation;

                      return (
                        <div key={`house-${upgrade.key}`} className="bg-black/20 rounded-lg p-4 border border-green-500/30">
                          <div className="grid grid-cols-3 gap-4 items-start">
                            {/* Column 1: House Name and Levels */}
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8">
                                <SkillIcon
                                  skillId="house"
                                  size={32}
                                  className="rounded border border-green-400/50"
                                />
                              </div>
                              <div>
                                <h5 className="text-white font-medium">{roomName}</h5>
                                <p className="text-green-200 text-sm">House Room</p>
                                <p className="text-green-200 text-sm">
                                  Current Level: {currentLevel} → Target: {recommendation.recommendedLevel as number}
                                </p>
                              </div>
                            </div>

                            {/* Column 2: Cost Information */}
                            <div className="text-center">
                              {recommendation.enhancementCost !== undefined && recommendation.enhancementCost !== null && (recommendation.enhancementCost as number) > 0 ? (
                                <div className="text-yellow-300 text-sm">
                                  <div className="font-medium mb-1">Total Cost: {(recommendation.enhancementCost as number).toLocaleString()}c</div>
                                  <div className="text-xs mb-1">Construction materials</div>
                                  {recommendation.paybackDays !== undefined && (
                                    <div className="text-orange-300 text-xs">
                                      Payback: {(recommendation.paybackDays as number) === 0 ? 'Immediate' : `${recommendation.paybackDays} days`}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No cost</div>
                              )}
                            </div>

                            {/* Column 3: Benefits and Total */}
                            <div className="text-right">
                              <div className="text-green-300 font-bold mb-1">
                                +{((recommendation.percentageIncrease as number) || 0).toFixed(1)}%
                              </div>
                              <div className="text-green-200 text-sm mb-1">
                                Increase: {optimizeFor === 'profit'
                                  ? `+${((recommendation.profitIncrease as number) || 0).toLocaleString()} coins/day`
                                  : `+${((recommendation.experienceIncrease as number) || 0).toLocaleString()} exp/hr`
                                }
                              </div>
                              {baselineResults && (
                                <div className="text-yellow-300 text-sm font-medium">
                                  Total: {optimizeFor === 'profit'
                                    ? `${(baselineResults.profitPerDay + ((recommendation.profitIncrease as number) || 0)).toLocaleString()}/day`
                                    : `${(baselineResults.experienceGain + ((recommendation.experienceIncrease as number) || 0)).toLocaleString()}/hr`
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  });
                })()}
            </div>
          )}


          {/* Zone Data Summary */}
          <div className="bg-gray-500/20 border border-gray-500/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-gray-200 mb-2">📊 Analysis Summary</h4>
                <p className="text-gray-300 text-sm">
                  Analyzed <strong>{ZONE_DISPLAY_NAMES[selectedCombatZone]} (Tier {selectedCombatTier})</strong> with your current equipment configuration.
                  {baselineResults && (
                    <>
                      <br/>
                      <span className="text-green-300">Baseline Results: </span>
                      {baselineResults.experienceGain.toLocaleString()} EXP/hr, {baselineResults.profitPerDay.toLocaleString()} coins/day
                    </>
                  )}
                </p>
              </div>
              {zoneData.length > 0 && (
                <button
                  onClick={() => setShowZoneTable(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  View Details
                </button>
              )}
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
        <p>🎯 Unified analysis: Zone baseline + equipment upgrade testing in one streamlined workflow</p>
        <p>⚡ Supports gear, abilities, and house testing with real-time progress updates</p>
      </div>
    </div>
  );
}