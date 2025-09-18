import { CharacterStats } from '@/types/character';
import { UpgradeOpportunity } from '@/types/marketplace';

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
   * Analyze combat upgrades by comparing current vs upgraded equipment
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