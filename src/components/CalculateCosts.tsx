'use client';

import React, { useState, useEffect } from 'react';
import { CharacterStats } from '@/types/character';
import { MarketData } from '@/types/marketplace';
import { ABILITIES_BY_TYPE, AbilityInfo, calculateAbilityBookCost, AbilityBookCostCalculation } from '@/constants/abilities';
import { HOUSE_COSTS, calculateHouseUpgradeCost, HouseUpgradeCostCalculation } from '@/constants/houseCosts';
import { calculateHouseMaterialCosts, ItemCostCalculationResult } from '@/services/itemCostCalculator';
import { AbilityIcon } from './AbilityIcon';
import { SkillIcon } from './SkillIcon';

interface CalculateCostsProps {
  character: CharacterStats;
  marketData?: MarketData | null;
}

interface HouseRoom {
  roomHrid: string;
  currentLevel: number;
  targetLevel: number;
}

interface AbilityLevel {
  abilityInfo: AbilityInfo;
  currentLevel: number;
  targetLevel: number;
}

export function CalculateCosts({ character, marketData }: CalculateCostsProps) {
  const [houseRooms, setHouseRooms] = useState<{ [roomHrid: string]: HouseRoom }>({});
  const [abilityLevels, setAbilityLevels] = useState<{ [abilityHrid: string]: AbilityLevel }>({});
  const [houseMaterialCosts, setHouseMaterialCosts] = useState<{ [roomHrid: string]: ItemCostCalculationResult }>({});

  // Convert marketplace data to format expected by ability calculations
  const getMarketplaceData = () => {
    if (!marketData || !marketData.items) return undefined;

    const marketplaceItemMap: { [itemHrid: string]: { price: number; available: boolean } } = {};

    marketData.items.forEach(item => {
      if (!marketplaceItemMap[item.itemHrid]) {
        marketplaceItemMap[item.itemHrid] = {
          price: item.pricePerUnit,
          available: true
        };
      } else if (item.pricePerUnit < marketplaceItemMap[item.itemHrid].price) {
        marketplaceItemMap[item.itemHrid].price = item.pricePerUnit;
      }
    });

    return marketplaceItemMap;
  };

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
      'forge': 'cheesesmithing',
      'workshop': 'crafting',
      'sewing_parlor': 'tailoring',
      'kitchen': 'cooking',
      'brewery': 'brewing',
      'laboratory': 'alchemy',
      'observatory': 'enhancing',
      'dining_room': 'stamina',
      'library': 'intelligence',
      'dojo': 'melee',
      'armory': 'defense',
      'gym': 'attack',
      'archery_range': 'ranged',
      'mystical_study': 'magic'
    };

    return iconMap[roomType] || 'milking';
  };

  // Get ordered house rooms (same order as Combat Simulations)
  const getOrderedHouseRooms = (): [string, HouseRoom][] => {
    const roomOrder = [
      '/house_rooms/dairy_barn',
      '/house_rooms/garden',
      '/house_rooms/log_shed',
      '/house_rooms/forge',
      '/house_rooms/workshop',
      '/house_rooms/sewing_parlor',
      '/house_rooms/kitchen',
      '/house_rooms/brewery',
      '/house_rooms/laboratory',
      '/house_rooms/observatory',
      '/house_rooms/dining_room',
      '/house_rooms/library',
      '/house_rooms/dojo',
      '/house_rooms/armory',
      '/house_rooms/gym',
      '/house_rooms/archery_range',
      '/house_rooms/mystical_study'
    ];

    return roomOrder
      .map(roomHrid => [roomHrid, houseRooms[roomHrid]])
      .filter(([, room]) => room !== undefined) as [string, HouseRoom][];
  };

  // Initialize house rooms with current levels
  useEffect(() => {
    const initialHouseRooms: { [roomHrid: string]: HouseRoom } = {};

    // Define all possible house rooms
    const allRoomHrids = [
      '/house_rooms/dairy_barn',
      '/house_rooms/garden',
      '/house_rooms/log_shed',
      '/house_rooms/forge',
      '/house_rooms/workshop',
      '/house_rooms/sewing_parlor',
      '/house_rooms/kitchen',
      '/house_rooms/brewery',
      '/house_rooms/laboratory',
      '/house_rooms/observatory',
      '/house_rooms/dining_room',
      '/house_rooms/library',
      '/house_rooms/dojo',
      '/house_rooms/armory',
      '/house_rooms/gym',
      '/house_rooms/archery_range',
      '/house_rooms/mystical_study'
    ];

    allRoomHrids.forEach(roomHrid => {
      const currentLevel = character.houseRooms[roomHrid] || 0;
      initialHouseRooms[roomHrid] = {
        roomHrid,
        currentLevel,
        targetLevel: currentLevel
      };
    });

    setHouseRooms(initialHouseRooms);
  }, [character.houseRooms]);

  // Initialize abilities with current levels - only show equipped abilities
  useEffect(() => {
    const initialAbilityLevels: { [abilityHrid: string]: AbilityLevel } = {};

    // Only show abilities that the character actually has equipped
    character.abilities.forEach(characterAbility => {
      const abilityInfo = Object.values(ABILITIES_BY_TYPE).flat().find(
        ability => ability.hrid === characterAbility.abilityHrid
      );

      if (abilityInfo && characterAbility.level > 0) {
        initialAbilityLevels[abilityInfo.hrid] = {
          abilityInfo,
          currentLevel: characterAbility.level,
          targetLevel: characterAbility.level
        };
      }
    });

    setAbilityLevels(initialAbilityLevels);
  }, [character.abilities]);

  const updateHouseTarget = (roomHrid: string, targetLevel: number) => {
    setHouseRooms(prev => ({
      ...prev,
      [roomHrid]: {
        ...prev[roomHrid],
        targetLevel: Math.max(0, Math.min(8, targetLevel))
      }
    }));
  };

  const updateAbilityTarget = (abilityHrid: string, targetLevel: number) => {
    setAbilityLevels(prev => {
      // If target level is below current level, don't update
      if (targetLevel < prev[abilityHrid].currentLevel) {
        return prev;
      }

      return {
        ...prev,
        [abilityHrid]: {
          ...prev[abilityHrid],
          targetLevel: Math.min(200, targetLevel)
        }
      };
    });
  };

  // Calculate house upgrade costs - using useMemo to recalculate when houseRooms changes
  const houseUpgradeCosts = React.useMemo((): HouseUpgradeCostCalculation[] => {
    const upgrades: HouseUpgradeCostCalculation[] = [];

    Object.values(houseRooms).forEach(room => {
      if (room.targetLevel > room.currentLevel) {
        const cost = calculateHouseUpgradeCost(room.roomHrid, room.currentLevel, room.targetLevel);
        if (cost.isValid) {
          upgrades.push(cost);
        }
      }
    });

    return upgrades;
  }, [houseRooms]);

  // Calculate ability upgrade costs - using useMemo to recalculate when abilityLevels or marketData changes
  const abilityUpgradeCosts = React.useMemo((): AbilityBookCostCalculation[] => {
    const upgrades: AbilityBookCostCalculation[] = [];
    const marketplaceItemData = getMarketplaceData();

    Object.values(abilityLevels).forEach(ability => {
      if (ability.targetLevel > ability.currentLevel) {
        const cost = calculateAbilityBookCost(
          ability.abilityInfo.hrid,
          ability.currentLevel,
          ability.targetLevel,
          marketplaceItemData
        );
        if (cost) {
          upgrades.push(cost);
        }
      }
    });

    return upgrades;
  }, [abilityLevels, marketData]);

  // Calculate house material costs when house upgrades or marketplace data changes
  useEffect(() => {
    const newMaterialCosts: { [roomHrid: string]: ItemCostCalculationResult } = {};

    houseUpgradeCosts.forEach(upgrade => {
      console.log(`\n🏠 Calculating marketplace costs for ${upgrade.roomName} upgrade...`);
      const costs = calculateHouseMaterialCosts(upgrade.totalMaterials, marketData);
      newMaterialCosts[upgrade.roomHrid] = costs;
    });

    setHouseMaterialCosts(newMaterialCosts);
  }, [houseUpgradeCosts, marketData]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">💰 Calculate Costs</h2>
        <p className="text-blue-200">
          Calculate upgrade costs for equipment, abilities, and house improvements.
        </p>
      </div>


      {/* Houses Section */}
      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
            <h4 className="text-md font-bold text-green-200 mb-3">🏠 Houses</h4>

            {/* House Upgrade Costs Section */}
            {houseUpgradeCosts.length > 0 && (
              <div className="mb-6 space-y-4">
                {houseUpgradeCosts.map((upgrade, index) => (
                  <div key={index} className="bg-black/30 rounded-lg p-4 border border-green-500/30">
                    <h5 className="text-green-200 font-medium mb-3">
                      In order to raise <span className="text-white font-bold">{upgrade.roomName}</span> from level <span className="text-white font-bold">{upgrade.fromLevel}</span> to <span className="text-white font-bold">{upgrade.toLevel}</span>, it will require:
                    </h5>

                    <div className="space-y-3">
                      {/* Coins Required */}
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-300 font-medium">💰 Coins:</span>
                        <span className="text-white">{upgrade.totalCoins.toLocaleString()}</span>
                      </div>

                      {/* Materials Required */}
                      {Object.keys(upgrade.totalMaterials).length > 0 && (
                        <div>
                          <span className="text-green-300 font-medium mb-2 block">📦 Materials:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
                            {Object.entries(upgrade.totalMaterials).map(([itemHrid, material]) => (
                              <div key={itemHrid} className="flex items-center gap-2 text-sm">
                                <span className="text-gray-300">•</span>
                                <span className="text-white">{material.quantity.toLocaleString()}</span>
                                <span className="text-gray-300">{material.itemName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional Items from Auction House */}
                      {houseMaterialCosts[upgrade.roomHrid] && (
                        <div>
                          <span className="text-blue-300 font-medium mb-2 block">🏪 Additional Items Purchased from AH:</span>
                          <div className="ml-4 space-y-1">
                            {houseMaterialCosts[upgrade.roomHrid].hasAllPrices ? (
                              <div className="flex items-center gap-2">
                                <span className="text-blue-300">Total Cost:</span>
                                <span className="text-white font-bold">{houseMaterialCosts[upgrade.roomHrid].totalCost.toLocaleString()} coins</span>
                              </div>
                            ) : (
                              <div className="text-red-300 text-sm">
                                Some items not available in marketplace
                              </div>
                            )}
                            {houseMaterialCosts[upgrade.roomHrid].unavailableItems.length > 0 && (
                              <div className="text-orange-300 text-xs">
                                Not available: {houseMaterialCosts[upgrade.roomHrid].unavailableItems.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Additional Items if Crafted Yourself */}
                      <div>
                        <span className="text-purple-300 font-medium mb-2 block">🔨 Additional Items if Crafted Yourself:</span>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-300">Total Cost:</span>
                            <span className="text-white">0 coins</span>
                            <span className="text-gray-400 text-xs">(Future calculation)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
              {getOrderedHouseRooms().map(([roomHrid, room]) => (
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

                    <div className="space-y-1">
                      <div className="text-xs text-gray-300">
                        Current: <span className="text-white">{room.currentLevel}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-300">Target:</label>
                        <input
                          type="number"
                          min="0"
                          max="8"
                          value={room.targetLevel}
                          onChange={(e) => updateHouseTarget(roomHrid, parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-black/30 border border-green-500/50 rounded text-white text-xs focus:border-green-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

      {/* Abilities Section */}
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4">
            <h4 className="text-md font-bold text-blue-200 mb-3 text-center">⚡ Abilities</h4>

            {/* Abilities Grid with Cost Information */}
            <div className="mb-6 overflow-x-auto">
              <div className="min-w-full">
                {/* Header Row */}
                <div className="grid grid-cols-5 gap-4 mb-4 text-sm font-medium text-blue-200 border-b border-blue-500/30 pb-2">
                  <div className="text-center">Ability</div>
                  <div className="text-center">Current → Target</div>
                  <div className="text-center">Books Required</div>
                  <div className="text-center">Experience Needed</div>
                  <div className="text-center">Total Cost</div>
                </div>

                {/* Ability Rows */}
                <div className="space-y-3">
                  {character.abilities.map((characterAbility) => {
                    // Only show abilities that are equipped (level > 0) and are in our state
                    if (characterAbility.level === 0 || !abilityLevels[characterAbility.abilityHrid]) return null;

                    const abilityInfo = Object.values(ABILITIES_BY_TYPE).flat().find(
                      ability => ability.hrid === characterAbility.abilityHrid
                    );

                    if (!abilityInfo) return null;

                    const abilityLevel = abilityLevels[abilityInfo.hrid];

                    // Find the cost calculation for this ability
                    const upgrade = abilityUpgradeCosts.find(u => u.abilityHrid === abilityInfo.hrid);

                    return (
                      <div
                        key={abilityInfo.hrid}
                        className="grid grid-cols-5 gap-4 items-center bg-black/20 rounded-lg p-3 border border-blue-500/30"
                      >
                        {/* Column 1: Ability Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0">
                            <AbilityIcon
                              abilityId={abilityInfo.name}
                              size={40}
                              className="rounded border border-blue-400/50"
                            />
                          </div>
                          <div className="min-w-0">
                            <h6 className="text-white font-medium text-sm truncate">
                              {abilityInfo.displayName}
                            </h6>
                          </div>
                        </div>

                        {/* Column 2: Current → Target Levels */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-white font-medium">{abilityLevel.currentLevel}</span>
                            <span className="text-gray-400">→</span>
                            <input
                              type="number"
                              min="0"
                              max="200"
                              value={abilityLevel.targetLevel}
                              onChange={(e) => updateAbilityTarget(abilityInfo.hrid, parseInt(e.target.value) || abilityLevel.currentLevel)}
                              className="w-16 px-2 py-1 bg-black/30 border border-blue-500/50 rounded text-white text-xs text-center focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Column 3: Books Required */}
                        <div className="text-center">
                          {upgrade ? (
                            <div>
                              <div className="text-white font-medium">{upgrade.booksRequired.toLocaleString()}</div>
                              <div className="text-purple-300 text-xs truncate">{upgrade.bookName}</div>
                            </div>
                          ) : abilityLevel.targetLevel > abilityLevel.currentLevel ? (
                            <div className="text-gray-400 text-sm">Calculating...</div>
                          ) : (
                            <div className="text-gray-500 text-sm">-</div>
                          )}
                        </div>

                        {/* Column 4: Experience Needed */}
                        <div className="text-center">
                          {upgrade ? (
                            <div>
                              <div className="text-white font-medium">{upgrade.experienceNeeded.toLocaleString()}</div>
                              <div className="text-green-300 text-xs">({upgrade.bookExperienceValue} per book)</div>
                              {upgrade.excessExperience > 0 && (
                                <div className="text-gray-400 text-xs">+{upgrade.excessExperience.toLocaleString()} excess</div>
                              )}
                            </div>
                          ) : abilityLevel.targetLevel > abilityLevel.currentLevel ? (
                            <div className="text-gray-400 text-sm">Calculating...</div>
                          ) : (
                            <div className="text-gray-500 text-sm">-</div>
                          )}
                        </div>

                        {/* Column 5: Total Cost */}
                        <div className="text-center">
                          {upgrade ? (
                            upgrade.totalCost !== undefined ? (
                              <div>
                                <div className="text-yellow-300 font-medium">{upgrade.totalCost.toLocaleString()}</div>
                                <div className="text-gray-400 text-xs">({upgrade.unitPrice?.toLocaleString()} per book)</div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-red-300 text-sm">Not available</div>
                                <div className="text-gray-400 text-xs">in marketplace</div>
                              </div>
                            )
                          ) : abilityLevel.targetLevel > abilityLevel.currentLevel ? (
                            <div className="text-gray-400 text-sm">Calculating...</div>
                          ) : (
                            <div className="text-gray-500 text-sm">-</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

    </div>
  );
}