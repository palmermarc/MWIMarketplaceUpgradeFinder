import { CharacterStats } from '@/types/character';
import { UpgradeOpportunity } from '@/types/marketplace';
import { ConcurrentSimulationRequest, ConcurrentSimulationResponse } from '@/app/api/combat-simulation/route';

export interface CombatSimulationResult {
  killsPerHour: number;
  expPerHour: number;
  profitPerHour: number;
  revenuePerHour: number;
  zone: string;
  success: boolean;
  error?: string;
  allZonesData?: { [key: string]: { [key: string]: string | number } };
}

export interface CombatUpgradeAnalysis extends UpgradeOpportunity {
  combatResults?: {
    current: CombatSimulationResult;
    upgraded: CombatSimulationResult;
    improvement: {
      killsPerHourIncrease: number;
      expPerHourIncrease: number;
      profitPerHourIncrease: number;
      percentageIncrease: number;
    };
  };
}

export interface ConcurrentUpgradeAnalysisProgress {
  total: number;
  completed: number;
  inProgress: number;
  results: CombatUpgradeAnalysis[];
  summary?: {
    successful: number;
    failed: number;
    duration: number;
  };
}

export class CombatSimulatorApiService {
  private static readonly API_ENDPOINT = '/api/combat-simulation';

  /**
   * Run combat simulation for a character configuration
   */
  static async runCombatSimulation(
    character: CharacterStats,
    equipmentOverride?: { [slot: string]: { item: string; enhancement: number } },
    rawCharacterData?: string | null
  ): Promise<CombatSimulationResult> {
    try {
      console.log('Calling combat simulation API...');

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character,
          equipmentOverride,
          rawCharacterData
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API response received:', result);

      return result;

    } catch (error) {
      console.error('Combat simulation API call failed:', error);

      // Return mock data as fallback
      const equipment = equipmentOverride || character.equipment;
      let totalEnhancement = 0;
      let itemCount = 0;

      Object.values(equipment).forEach(item => {
        totalEnhancement += item.enhancement;
        itemCount++;
      });

      const avgEnhancement = itemCount > 0 ? totalEnhancement / itemCount : 0;
      const baseKills = 100 + (avgEnhancement * 50);
      const variation = Math.random() * 0.2 + 0.9; // 90-110% variation

      return {
        killsPerHour: Math.round(baseKills * variation),
        expPerHour: Math.round(baseKills * variation * 15),
        profitPerHour: Math.round(baseKills * variation * 25),
        revenuePerHour: Math.round(baseKills * variation * 35),
        zone: 'Mock Zone (API Failed)',
        success: false,
        error: error instanceof Error ? error.message : 'API call failed'
      };
    }
  }

  /**
   * Run multiple combat simulations concurrently
   */
  static async runConcurrentSimulations(
    simulations: {
      id: string;
      character: CharacterStats;
      equipmentOverride?: { [slot: string]: { item: string; enhancement: number } };
      rawCharacterData?: string;
    }[]
  ): Promise<ConcurrentSimulationResponse> {
    try {
      console.log(`🚀 Starting ${simulations.length} concurrent simulations...`);

      const request: ConcurrentSimulationRequest = { simulations };

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Concurrent simulation failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Concurrent simulations completed:`, result.summary);

      return result;

    } catch (error) {
      console.error('❌ Concurrent simulation API call failed:', error);

      // Return fallback response
      const mockResults: { [id: string]: CombatSimulationResult } = {};
      simulations.forEach(sim => {
        mockResults[sim.id] = {
          killsPerHour: 0,
          expPerHour: 0,
          profitPerHour: 0,
          revenuePerHour: 0,
          zone: 'Error',
          success: false,
          error: error instanceof Error ? error.message : 'API call failed'
        };
      });

      return {
        results: mockResults,
        summary: {
          total: simulations.length,
          successful: 0,
          failed: simulations.length,
          duration: 0
        }
      };
    }
  }

  /**
   * Analyze combat upgrades using concurrent simulations for much faster results
   */
  static async analyzeCombatUpgradesConcurrent(
    character: CharacterStats,
    upgrades: UpgradeOpportunity[],
    progressCallback?: (progress: ConcurrentUpgradeAnalysisProgress) => void
  ): Promise<CombatUpgradeAnalysis[]> {
    const startTime = Date.now();
    const results: CombatUpgradeAnalysis[] = [];

    try {
      console.log(`🚀 Starting concurrent combat upgrade analysis for ${upgrades.length} upgrades...`);

      // Prepare simulations for current + all upgrades
      const simulations = [
        // Current equipment baseline
        {
          id: 'current',
          character
        },
        // Each upgrade configuration
        ...upgrades.map((upgrade, index) => {
          const upgradedEquipment = { ...character.equipment };
          upgradedEquipment[upgrade.currentItem.slot] = {
            item: upgrade.suggestedUpgrade.itemName,
            enhancement: upgrade.suggestedUpgrade.enhancementLevel
          };

          return {
            id: `upgrade_${index}`,
            character,
            equipmentOverride: upgradedEquipment
          };
        })
      ];

      // Update progress
      progressCallback?.({
        total: upgrades.length,
        completed: 0,
        inProgress: simulations.length,
        results: []
      });

      // Run all simulations concurrently
      const concurrentResults = await this.runConcurrentSimulations(simulations);

      // Get the current equipment baseline result
      const currentResults = concurrentResults.results['current'];

      if (!currentResults?.success) {
        throw new Error('Failed to get baseline simulation results');
      }

      // Process upgrade results
      upgrades.forEach((upgrade, index) => {
        const upgradeId = `upgrade_${index}`;
        const upgradedResults = concurrentResults.results[upgradeId];

        if (upgradedResults?.success) {
          // Calculate improvements
          const improvement = {
            killsPerHourIncrease: upgradedResults.killsPerHour - currentResults.killsPerHour,
            expPerHourIncrease: upgradedResults.expPerHour - currentResults.expPerHour,
            profitPerHourIncrease: upgradedResults.profitPerHour - currentResults.profitPerHour,
            percentageIncrease: currentResults.killsPerHour > 0
              ? ((upgradedResults.killsPerHour - currentResults.killsPerHour) / currentResults.killsPerHour) * 100
              : 0
          };

          results.push({
            ...upgrade,
            combatResults: {
              current: currentResults,
              upgraded: upgradedResults,
              improvement
            }
          });
        } else {
          // Add failed result
          results.push({
            ...upgrade,
            combatResults: {
              current: currentResults,
              upgraded: { killsPerHour: 0, expPerHour: 0, profitPerHour: 0, revenuePerHour: 0, zone: 'Error', success: false },
              improvement: { killsPerHourIncrease: 0, expPerHourIncrease: 0, profitPerHourIncrease: 0, percentageIncrease: 0 }
            }
          });
        }
      });

      const duration = Date.now() - startTime;

      // Final progress update
      progressCallback?.({
        total: upgrades.length,
        completed: upgrades.length,
        inProgress: 0,
        results,
        summary: {
          successful: concurrentResults.summary.successful,
          failed: concurrentResults.summary.failed,
          duration
        }
      });

      console.log(`✅ Concurrent upgrade analysis completed in ${duration}ms. Results: ${results.length}`);

    } catch (error) {
      console.error('❌ Failed to analyze combat upgrades concurrently:', error);

      // Fallback to sequential method if concurrent fails
      console.log('🔄 Falling back to sequential analysis...');
      return this.analyzeCombatUpgrades(character, upgrades);
    }

    return results;
  }

  /**
   * Analyze combat upgrades by comparing current vs upgraded equipment (LEGACY - Sequential)
   */
  static async analyzeCombatUpgrades(
    character: CharacterStats,
    upgrades: UpgradeOpportunity[]
  ): Promise<CombatUpgradeAnalysis[]> {
    const results: CombatUpgradeAnalysis[] = [];

    try {
      console.log('Starting combat upgrade analysis...');

      // Run simulation with current equipment first
      const currentResults = await this.runCombatSimulation(character);

      // Analyze each upgrade
      for (const upgrade of upgrades) {
        try {
          console.log(`Analyzing upgrade for ${upgrade.currentItem.slot}...`);

          // Create equipment override with the upgrade
          const upgradedEquipment = { ...character.equipment };
          upgradedEquipment[upgrade.currentItem.slot] = {
            item: upgrade.suggestedUpgrade.itemName,
            enhancement: upgrade.suggestedUpgrade.enhancementLevel
          };

          // Run simulation with upgraded equipment
          const upgradedResults = await this.runCombatSimulation(character, upgradedEquipment);

          // Calculate improvements
          const improvement = {
            killsPerHourIncrease: upgradedResults.killsPerHour - currentResults.killsPerHour,
            expPerHourIncrease: upgradedResults.expPerHour - currentResults.expPerHour,
            profitPerHourIncrease: upgradedResults.profitPerHour - currentResults.profitPerHour,
            percentageIncrease: currentResults.killsPerHour > 0
              ? ((upgradedResults.killsPerHour - currentResults.killsPerHour) / currentResults.killsPerHour) * 100
              : 0
          };

          results.push({
            ...upgrade,
            combatResults: {
              current: currentResults,
              upgraded: upgradedResults,
              improvement
            }
          });

        } catch (error) {
          console.error(`Failed to analyze upgrade for ${upgrade.currentItem.slot}:`, error);

          // Add failed result
          results.push({
            ...upgrade,
            combatResults: {
              current: { killsPerHour: 0, expPerHour: 0, profitPerHour: 0, revenuePerHour: 0, zone: 'unknown', success: false },
              upgraded: { killsPerHour: 0, expPerHour: 0, profitPerHour: 0, revenuePerHour: 0, zone: 'unknown', success: false },
              improvement: { killsPerHourIncrease: 0, expPerHourIncrease: 0, profitPerHourIncrease: 0, percentageIncrease: 0 }
            }
          });
        }
      }

    } catch (error) {
      console.error('Failed to analyze combat upgrades:', error);
    }

    return results;
  }
}