'use client';

import React, { useState, useEffect } from 'react';
import { CharacterStats } from '@/types/character';
import { MarketData } from '@/types/marketplace';
import { ABILITIES_BY_TYPE, AbilityInfo, calculateAbilityBookCost, AbilityBookCostCalculation } from '@/constants/abilities';
import { HOUSE_COSTS, calculateHouseUpgradeCost, HouseUpgradeCostCalculation } from '@/constants/houseCosts';
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

            {/* Ability Upgrade Costs Section */}
            {abilityUpgradeCosts.length > 0 && (
              <div className="mb-6 space-y-4">
                {abilityUpgradeCosts.map((upgrade, index) => (
                  <div key={index} className="bg-black/30 rounded-lg p-4 border border-blue-500/30">
                    <h5 className="text-blue-200 font-medium mb-3">
                      In order to raise <span className="text-white font-bold">{upgrade.abilityName}</span> from level <span className="text-white font-bold">{upgrade.fromLevel}</span> to <span className="text-white font-bold">{upgrade.toLevel}</span>, it will require:
                    </h5>

                    <div className="space-y-3">
                      {/* Books Required */}
                      <div className="flex items-center gap-2">
                        <span className="text-purple-300 font-medium">📚 Books:</span>
                        <span className="text-white">{upgrade.booksRequired.toLocaleString()} {upgrade.bookName}</span>
                      </div>

                      {/* Experience Details */}
                      <div className="flex items-center gap-2">
                        <span className="text-green-300 font-medium">⭐ Experience:</span>
                        <span className="text-white">{upgrade.experienceNeeded.toLocaleString()} needed ({upgrade.bookExperienceValue} per book)</span>
                        {upgrade.excessExperience > 0 && (
                          <span className="text-gray-400 text-sm">({upgrade.excessExperience.toLocaleString()} excess)</span>
                        )}
                      </div>

                      {/* Cost from Marketplace */}
                      {upgrade.totalCost !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-300 font-medium">💰 Total Cost:</span>
                          <span className="text-white">{upgrade.totalCost.toLocaleString()} coins</span>
                          <span className="text-gray-400 text-sm">({upgrade.unitPrice?.toLocaleString()} per book)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-red-300 font-medium">❌ Cost:</span>
                          <span className="text-gray-400">Not available in marketplace</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show abilities in character import order - only equipped ones */}
            <div className="mb-6">
              <h5 className="text-lg font-bold text-blue-200 mb-3">
                Abilities
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {character.abilities.map((characterAbility) => {
                  // Only show abilities that are equipped (level > 0) and are in our state
                  if (characterAbility.level === 0 || !abilityLevels[characterAbility.abilityHrid]) return null;

                  const abilityInfo = Object.values(ABILITIES_BY_TYPE).flat().find(
                    ability => ability.hrid === characterAbility.abilityHrid
                  );

                  if (!abilityInfo) return null;

                  const abilityLevel = abilityLevels[abilityInfo.hrid];

                  return (
                    <div
                      key={abilityInfo.hrid}
                      className="bg-black/20 rounded-lg p-3 border border-blue-500/30 text-center"
                    >
                      <div className="space-y-2">
                        <h6 className="text-white font-medium text-sm">
                          {abilityInfo.displayName}
                        </h6>

                        <div className="flex justify-center">
                          <div className="w-12 h-12">
                            <AbilityIcon
                              abilityId={abilityInfo.name}
                              size={48}
                              className="rounded border border-blue-400/50"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-gray-300">
                            Current: <span className="text-white">{abilityLevel.currentLevel}</span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-300">Target:</label>
                            <input
                              type="number"
                              min="0"
                              max="200"
                              value={abilityLevel.targetLevel}
                              onChange={(e) => updateAbilityTarget(abilityInfo.hrid, parseInt(e.target.value) || abilityLevel.currentLevel)}
                              className="w-full px-2 py-1 bg-black/30 border border-blue-500/50 rounded text-white text-xs focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

      {/* Cost Summary Section - Placeholder */}
      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
        <h4 className="text-md font-bold text-yellow-200 mb-3">📊 Cost Summary</h4>
        <p className="text-yellow-100 text-sm">
          Cost calculations will be implemented based on the target levels set above.
        </p>
        <div className="mt-3 space-y-1 text-sm text-yellow-200">
          <p>• House upgrades: Will calculate material costs</p>
          <p>• Ability upgrades: Will calculate book requirements</p>
          <p>• Total investment: Will sum all costs</p>
        </div>
      </div>
    </div>
  );
}