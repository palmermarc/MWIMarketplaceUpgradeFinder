'use client';

import { useState, useCallback, useEffect } from 'react';
import { CombatSimulatorApiService, UpgradeAnalysisResult, UpgradeAnalysisRequest } from '@/services/combatSimulatorApi';
import { UpgradeOpportunity } from '@/types/marketplace';
import { CharacterStats } from '@/types/character';
import { CombatSlotItems, COMBAT_ITEMS } from '@/constants/combatItems';
import { ItemIcon } from './ItemIcon';
import { SkillIcon } from './SkillIcon';
import { AbilityIcon } from './AbilityIcon';
import { MarketplaceService } from '@/services/marketplace';

interface CombatUpgradeAnalysisProps {
  character: CharacterStats;
  upgrades: UpgradeOpportunity[];
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

// Zone name mapping for display
const ZONE_DISPLAY_NAMES: { [key: string]: string } = {
  '/actions/combat/fly': 'Fly',
  '/actions/combat/rat': 'Jerry',
  '/actions/combat/skunk': 'Skunk',
  '/actions/combat/porcupine': 'Porcupine',
  '/actions/combat/slimy': 'Slimy',
  '/actions/combat/smelly_planet': 'Smelly Planet',
  '/actions/combat/frog': 'Frogger',
  '/actions/combat/snake': 'Thnake',
  '/actions/combat/swampy': 'Swampy',
  '/actions/combat/alligator': 'Sherlock',
  '/actions/combat/swamp_planet': 'Swamp Planet',
  '/actions/combat/sea_snail': 'Gary',
  '/actions/combat/crab': 'I Pinch',
  '/actions/combat/aquahorse': 'Aquahorse',
  '/actions/combat/nom_nom': 'Nom Nom',
  '/actions/combat/turtle': 'Turuto',
  '/actions/combat/aqua_planet': 'Aqua Planet',
  '/actions/combat/jungle_sprite': 'Jungle Sprite',
  '/actions/combat/myconid': 'Myconid',
  '/actions/combat/treant': 'Treant',
  '/actions/combat/centaur_archer': 'Centaur Archer',
  '/actions/combat/jungle_planet': 'Jungle Planet',
  '/actions/combat/gobo_stabby': 'Stabby',
  '/actions/combat/gobo_slashy': 'Slashy',
  '/actions/combat/gobo_smashy': 'Smashy',
  '/actions/combat/gobo_shooty': 'Shooty',
  '/actions/combat/gobo_boomy': 'Boomy',
  '/actions/combat/gobo_planet': 'Gobo Planet',
  '/actions/combat/eye': 'Eye',
  '/actions/combat/eyes': 'Eyes',
  '/actions/combat/veyes': 'Veyes',
  '/actions/combat/planet_of_the_eyes': 'Planet Of The Eyes',
  '/actions/combat/novice_sorcerer': 'Novice Sorcerer',
  '/actions/combat/ice_sorcerer': 'Ice Sorcerer',
  '/actions/combat/flame_sorcerer': 'Flame Sorcerer',
  '/actions/combat/elementalist': 'Elementalist',
  '/actions/combat/sorcerers_tower': "Sorcerer's Tower",
  '/actions/combat/gummy_bear': 'Gummy Bear',
  '/actions/combat/panda': 'Panda',
  '/actions/combat/black_bear': 'Black Bear',
  '/actions/combat/grizzly_bear': 'Grizzly Bear',
  '/actions/combat/polar_bear': 'Polar Bear',
  '/actions/combat/bear_with_it': 'Bear With It',
  '/actions/combat/magnetic_golem': 'Magnetic Golem',
  '/actions/combat/stalactite_golem': 'Stalactite Golem',
  '/actions/combat/granite_golem': 'Granite Golem',
  '/actions/combat/golem_cave': 'Golem Cave',
  '/actions/combat/zombie': 'Zombie',
  '/actions/combat/vampire': 'Vampire',
  '/actions/combat/werewolf': 'Werewolf',
  '/actions/combat/twilight_zone': 'Twilight Zone',
  '/actions/combat/abyssal_imp': 'Abyssal Imp',
  '/actions/combat/soul_hunter': 'Soul Hunter',
  '/actions/combat/infernal_warlock': 'Infernal Warlock',
  '/actions/combat/infernal_abyss': 'Infernal Abyss'
};

export function CombatUpgradeAnalysisIframe({ character, upgrades, rawCharacterData, combatItems = COMBAT_ITEMS }: CombatUpgradeAnalysisProps) {
  const [zoneData, setZoneData] = useState<ZoneData[]>([]);
  const [upgradeResults, setUpgradeResults] = useState<UpgradeAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingUpgrades, setIsAnalyzingUpgrades] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [optimizeFor, setOptimizeFor] = useState<'profit' | 'exp'>('profit');
  const [maxEnhancementTiers, setMaxEnhancementTiers] = useState(5);
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

      const equipmentData = EQUIPMENT_SLOTS.map(slot => {
        // Map weapon slot to main_hand for import data lookup (import uses main_hand, simulation uses weapon)
        const lookupSlot = slot === 'weapon' ? 'main_hand' : slot;
        const equipmentItem = equipmentArray.find((item: { itemLocationHrid: string; itemHrid: string; enhancementLevel: number }) =>
          item.itemLocationHrid === `/item_locations/${lookupSlot}`
        );

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

  const runCombatAnalysis = async () => {
    setIsAnalyzing(true);
    setIsInitializing(true);
    setError(null);
    setProgress({ current: 0, total: 1 });

    try {
      console.log('🎯 BASELINE MODE: Testing current equipment setup...');

      setProgress({ current: 0, total: 1 });
      setIsInitializing(false);

      // Run baseline simulation to get zone data
      const results = await CombatSimulatorApiService.runCombatSimulation(character, undefined, rawCharacterData);

      console.log('📊 Zone Results:', results);

      // The results should now be an array of zone data
      if (Array.isArray(results)) {
        setZoneData(results);
      } else {
        setError('Unexpected data format received from simulation');
      }

      setProgress({ current: 1, total: 1 });

      // After baseline is established, show equipment slots for configuration
      const equipmentData = parseEquipmentData();
      setEquipmentTestingData(equipmentData);
      setShowEquipmentTesting(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to establish baseline');
    } finally {
      setIsAnalyzing(false);
      setIsInitializing(false);
    }
  };

  const getBestZoneForProfit = (): ZoneData | null => {
    if (zoneData.length === 0) return null;

    return zoneData.reduce((best, current) => {
      const currentProfit = parseFloat(current.no_rng_profit.replace(/,/g, '')) || 0;
      const bestProfit = parseFloat(best.no_rng_profit.replace(/,/g, '')) || 0;
      return currentProfit > bestProfit ? current : best;
    });
  };

  const getBestZoneForExp = (): ZoneData | null => {
    if (zoneData.length === 0) return null;

    return zoneData.reduce((best, current) => {
      const currentExp = parseFloat(current.total_experience) || 0;
      const bestExp = parseFloat(best.total_experience) || 0;
      return currentExp > bestExp ? current : best;
    });
  };

  // Function to fetch marketplace prices for all test levels
  const fetchMarketplacePrices = useCallback(async (slotsToTest: EquipmentItem[]) => {
    console.log('🛒 Fetching marketplace prices for test items...');

    for (const equipment of slotsToTest) {
      const selectedLevel = selectedEnhancementLevels[equipment.slot];
      if (selectedLevel === undefined || equipment.isEmpty) continue;

      // Calculate the range of levels that will be tested
      const testLevels = [];
      for (let level = equipment.enhancementLevel + 1; level <= selectedLevel; level++) {
        testLevels.push(level);
      }

      console.log(`🔍 Fetching prices for ${equipment.itemName} levels: ${testLevels.join(', ')}`);
      console.log(`📦 Equipment Details:`, {
        slot: equipment.slot,
        itemHrid: equipment.itemHrid,
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
  }, [selectedEnhancementLevels]);

  const handleFindUpgrades = async () => {
    if (zoneData.length === 0) {
      setError('Please run Zone Analysis first to establish baseline performance');
      return;
    }

    setIsAnalyzingUpgrades(true);
    setError(null);
    setUpgradeResults([]);

    // Determine which slots need testing (where selected level differs from current level)
    const slotsToTest = equipmentTestingData.filter(equipment => {
      if (equipment.isEmpty) return false;
      const selectedLevel = selectedEnhancementLevels[equipment.slot];
      return selectedLevel !== undefined && selectedLevel !== equipment.enhancementLevel;
    });

    if (slotsToTest.length === 0) {
      setError('No enhancement level changes detected. Please select different enhancement levels to test.');
      setIsAnalyzingUpgrades(false);
      return;
    }

    try {
      console.log(`🔧 Testing ${slotsToTest.length} equipment slots with changed enhancement levels...`);

      // Fetch marketplace prices for all test items first
      await fetchMarketplacePrices(slotsToTest);

      // Determine target zone based on optimization preference
      const targetZone = (() => {
        if (optimizeFor === 'profit') {
          const bestProfitZone = getBestZoneForProfit();
          if (bestProfitZone) {
            // Map zone name back to zone value
            return Object.entries(ZONE_DISPLAY_NAMES).find(([value, name]) =>
              name === bestProfitZone.zone_name
            )?.[0];
          }
        } else {
          const bestExpZone = getBestZoneForExp();
          if (bestExpZone) {
            // Map zone name back to zone value
            return Object.entries(ZONE_DISPLAY_NAMES).find(([value, name]) =>
              name === bestExpZone.zone_name
            )?.[0];
          }
        }
        // Fallback to first zone if mapping fails
        return '/actions/combat/fly';
      })();

      console.log(`🎯 Target zone for optimization: ${targetZone} (${ZONE_DISPLAY_NAMES[targetZone || '/actions/combat/fly']})`);

      // Create simplified request - we'll build the test plan on the backend
      const request = {
        optimizeFor,
        targetZone: targetZone || '/actions/combat/fly',
        selectedLevels: selectedEnhancementLevels
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

              // Convert recommendations to UpgradeAnalysisResult format
              const results = event.recommendations?.map((rec: {
                slot: string;
                currentEnhancement: number;
                recommendedEnhancement: number;
                profitIncrease: number;
                experienceIncrease: number;
                percentageIncrease: number;
                enhancementCost?: number;
                paybackDays?: number;
              }) => {
                console.log(`Processing recommendation for ${rec.slot}:`, rec);

                const slotTests = event.upgradeTests?.filter((test: {
                  slot: string;
                  testEnhancement: number;
                  profitPerDay: number;
                  experienceGain: number;
                }) => test.slot === rec.slot) || [];
                const allTestResults = slotTests.map((test: {
                  testEnhancement: number;
                  profitPerDay: number;
                  experienceGain: number;
                }) => ({
                  enhancement: test.testEnhancement,
                  profit: test.profitPerDay,
                  exp: test.experienceGain
                }));

                const result = {
                  slot: rec.slot,
                  currentEnhancement: rec.currentEnhancement,
                  recommendedEnhancement: rec.recommendedEnhancement,
                  improvement: {
                    profitIncrease: rec.profitIncrease,
                    expIncrease: rec.experienceIncrease,
                    percentageIncrease: rec.percentageIncrease
                  },
                  allTestResults,
                  enhancementCost: rec.enhancementCost,
                  paybackDays: rec.paybackDays
                };

                console.log(`Created result for ${rec.slot}:`, result);
                return result;
              }) || [];

              console.log('Final results array:', results);
              setUpgradeResults(results);
              console.log('upgradeResults state updated');
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

  const bestProfitZone = getBestZoneForProfit();
  const bestExpZone = getBestZoneForExp();

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
                            max="100"
                            value={ability.level}
                            readOnly
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
                            {equipmentItem.item}
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
                          value={displayEnhancementLevels[slot] || 0}
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

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-purple-200">Combat Zone Analysis</h3>
        <button
          onClick={runCombatAnalysis}
          disabled={isAnalyzing}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isAnalyzing
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isAnalyzing ? 'Analyzing Zones...' : 'Run Zone Analysis'}
        </button>
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
              {isInitializing ? 'Initializing combat simulator...' : 'Analyzing all combat zones...'}
            </span>
            <span className="text-purple-300">
              🎯 ZONE ANALYSIS
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
              : 'Testing all zones with your current equipment...'
            }
          </p>
        </div>
      )}

      {zoneData.length > 0 && (
        <div className="space-y-6">
          {/* Best Zone Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best Profit Zone */}
            {bestProfitZone && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <h4 className="text-lg font-bold text-green-200 mb-2">🪙 Best for Profit</h4>
                <p className="text-white">
                  Your best place for farming <strong>Profit</strong> is{' '}
                  <span className="text-green-300 font-semibold">{bestProfitZone.zone_name}</span>{' '}
                  (Difficulty {bestProfitZone.difficulty})
                </p>
                <p className="text-green-100 text-sm mt-1">
                  Earning <strong>{parseFloat(bestProfitZone.no_rng_profit.replace(/,/g, '')).toLocaleString()} coins/day</strong>
                </p>
              </div>
            )}

            {/* Best EXP Zone */}
            {bestExpZone && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <h4 className="text-lg font-bold text-blue-200 mb-2">⭐ Best for Experience</h4>
                <p className="text-white">
                  Your best place for farming <strong>EXP</strong> is{' '}
                  <span className="text-blue-300 font-semibold">{bestExpZone.zone_name}</span>{' '}
                  (Difficulty {bestExpZone.difficulty})
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Earning <strong>{parseFloat(bestExpZone.total_experience).toLocaleString()} EXP/hour</strong>
                </p>
              </div>
            )}
          </div>

          {/* Upgrade Analysis Form */}
          {!showEquipmentTesting && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-yellow-200 mb-4">🔧 Find Equipment Upgrades</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
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

              {/* Enhancement Tiers */}
              <div>
                <label className="block text-yellow-200 text-sm font-medium mb-2">
                  Max Enhancement Tiers:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxEnhancementTiers}
                  onChange={(e) => setMaxEnhancementTiers(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full p-2 bg-black/30 border border-yellow-500/50 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                />
                <p className="text-yellow-300 text-xs mt-1">How many enhancement levels to consider (1-20)</p>
              </div>

              {/* Find Upgrades Button */}
              <div>
                <label className="block text-yellow-200 text-sm font-medium mb-2">&nbsp;</label>
                <button
                  onClick={handleFindUpgrades}
                  disabled={isAnalyzingUpgrades || zoneData.length === 0}
                  className={`w-full px-4 py-2 font-medium rounded-lg transition-all ${
                    isAnalyzingUpgrades || zoneData.length === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {isAnalyzingUpgrades ? 'Analyzing Upgrades...' : 'Find My Best Upgrades'}
                </button>
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

          {/* Upgrade Results */}
          {upgradeResults.length > 0 && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
              <h4 className="text-lg font-bold text-green-200 mb-4">
                🎯 Equipment Upgrade Recommendations
              </h4>
              <p className="text-green-100 text-sm mb-4">
                Optimizing for <strong>{optimizeFor === 'profit' ? 'Coins/Day' : 'Experience/Hour'}</strong>
              </p>

              <div className="space-y-3">
                {upgradeResults.map((result, index) => (
                  <div
                    key={result.slot}
                    className="bg-black/20 rounded-lg p-4 border border-green-500/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="text-white font-medium capitalize">
                          {result.slot.replace('_', ' ')} Slot
                        </h5>
                        <p className="text-green-200 text-sm">
                          Current: +{result.currentEnhancement} → Recommended: +{result.recommendedEnhancement}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-300 font-bold">
                          +{result.improvement.percentageIncrease.toFixed(1)}%
                        </div>
                        <div className="text-green-200 text-sm">
                          {optimizeFor === 'profit'
                            ? `+${result.improvement.profitIncrease.toLocaleString()} coins/day`
                            : `+${result.improvement.expIncrease.toLocaleString()} exp/hr`
                          }
                        </div>
                        {optimizeFor === 'profit' && result.enhancementCost && (
                          <div className="text-yellow-300 text-xs mt-1">
                            <div>Cost: {result.enhancementCost.toLocaleString()}c</div>
                            {result.paybackDays && (
                              <div>Payback: {result.paybackDays} days</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Show all test results */}
                    <details className="mt-2">
                      <summary className="text-green-300 text-sm cursor-pointer hover:text-green-200">
                        View all enhancement levels tested ({result.allTestResults.length} levels)
                      </summary>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {result.allTestResults.map((test) => (
                          <div
                            key={test.enhancement}
                            className={`p-2 rounded text-xs text-center ${
                              test.enhancement === result.recommendedEnhancement
                                ? 'bg-green-600 text-white font-bold'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            <div>+{test.enhancement}</div>
                            <div>
                              {optimizeFor === 'profit'
                                ? test.profit.toLocaleString()
                                : test.exp.toLocaleString()
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-green-600/20 rounded-lg">
                <p className="text-green-200 text-sm">
                  💡 <strong>Summary:</strong> Found {upgradeResults.length} equipment upgrades that would improve your {optimizeFor} performance.
                  Total potential improvement: <strong>
                    {optimizeFor === 'profit'
                      ? `+${upgradeResults.reduce((sum, r) => sum + r.improvement.profitIncrease, 0).toLocaleString()} coins/day`
                      : `+${upgradeResults.reduce((sum, r) => sum + r.improvement.expIncrease, 0).toLocaleString()} exp/hour`
                    }
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* Zone Data Summary */}
          <div className="bg-gray-500/20 border border-gray-500/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-gray-200 mb-2">📊 Analysis Summary</h4>
                <p className="text-gray-300 text-sm">
                  Analyzed <strong>{zoneData.length} zones</strong> with your current equipment configuration.
                </p>
              </div>
              <button
                onClick={() => setShowZoneTable(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                View Full Data
              </button>
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
        <p>Analysis includes all difficulty levels for each combat zone</p>
      </div>
    </div>
  );
}