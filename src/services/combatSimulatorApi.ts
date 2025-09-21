import { CharacterStats } from '@/types/character';
import { UpgradeOpportunity } from '@/types/marketplace';

export interface CombatSimulationResult {
  killsPerHour: number;
  expPerHour: number;
  profitPerDay: number;
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
      profitPerDayIncrease: number;
      percentageIncrease: number;
    };
  };
}

export interface EnhancementUpgradeTest {
  slot: string;
  currentEnhancement: number;
  testEnhancement: number;
  item: string;
}

export interface UpgradeAnalysisRequest {
  optimizeFor: 'profit' | 'exp';
  targetZone: string;
  selectedLevels: { [slot: string]: number };
}

export interface UpgradeAnalysisResult {
  slot: string;
  currentEnhancement: number;
  recommendedEnhancement: number;
  improvement: {
    profitIncrease: number;
    expIncrease: number;
    percentageIncrease: number;
  };
  allTestResults: {
    enhancement: number;
    profit: number;
    exp: number;
  }[];
  enhancementCost?: number;
  paybackDays?: number;
}

export interface StreamEvent {
  type: 'status' | 'equipment_info' | 'baseline_complete' | 'test_starting' | 'test_complete' | 'test_failed' | 'simulation_complete' | 'error';
  message?: string;
  progress?: number;
  slot?: string;
  testLevel?: number;
  currentLevel?: number;
  simulationCount?: number;
  totalSimulations?: number;
  result?: {
    testEnhancement: number;
    experienceGain: number;
    profitPerDay: number;
  };
  expIncrease?: number;
  profitIncrease?: number;
  enhancementCost?: number;
  paybackDays?: number;
  error?: string;
  testPlan?: {
    slot: string;
    currentLevel: number;
    testLevels: number[];
  }[];
  baselineResults?: {
    experienceGain: number;
    profitPerDay: number;
  };
  combatSlotItems?: {
    [slot: string]: Array<{ itemHrid: string; itemName: string; }>;
  };
  upgradeTests?: {
    slot: string;
    testEnhancement: number;
    profitPerDay: number;
    experienceGain: number;
  }[];
  recommendations?: {
    slot: string;
    currentEnhancement: number;
    recommendedEnhancement: number;
    profitIncrease: number;
    experienceIncrease: number;
    percentageIncrease: number;
    enhancementCost?: number;
    paybackDays?: number;
  }[];
}

export class CombatSimulatorApiService {
  private static readonly API_ENDPOINT = '/api/combat-simulation';
  private static readonly UPGRADE_API_ENDPOINT = '/api/combat-upgrade-simulation';

  // Combat equipment slots to test for upgrades
  private static readonly COMBAT_SLOTS = [
    'head', 'neck', 'earrings', 'body', 'legs', 'feet', 'hands',
    'ring', 'weapon', 'off_hand', 'pouch'
  ];

  /**
   * Run combat simulation for a character configuration
   */
  static async runCombatSimulation(
    character: CharacterStats,
    equipmentOverride?: { [slot: string]: { item: string; enhancement: number } },
    rawCharacterData?: string | null,
    targetZone?: string,
    enhancementSlot?: string,
    enhancementLevel?: number
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
          rawCharacterData,
          targetZone,
          enhancementSlot,
          enhancementLevel
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
        profitPerDay: Math.round(baseKills * variation * 25),
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
            profitPerDayIncrease: upgradedResults.profitPerDay - currentResults.profitPerDay,
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
              current: { killsPerHour: 0, expPerHour: 0, profitPerDay: 0, revenuePerHour: 0, zone: 'unknown', success: false },
              upgraded: { killsPerHour: 0, expPerHour: 0, profitPerDay: 0, revenuePerHour: 0, zone: 'unknown', success: false },
              improvement: { killsPerHourIncrease: 0, expPerHourIncrease: 0, profitPerDayIncrease: 0, percentageIncrease: 0 }
            }
          });
        }
      }

    } catch (error) {
      console.error('Failed to analyze combat upgrades:', error);
    }

    return results;
  }

  /**
   * Analyze equipment upgrades using the bulk upgrade simulation API
   */
  static async analyzeEquipmentUpgrades(
    character: CharacterStats,
    request: UpgradeAnalysisRequest,
    rawCharacterData?: string | null
  ): Promise<UpgradeAnalysisResult[]> {
    try {
      console.log('🔧 Starting bulk equipment upgrade analysis...');

      const response = await fetch(this.UPGRADE_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character,
          rawCharacterData,
          targetZone: request.targetZone,
          optimizeFor: request.optimizeFor,
          selectedLevels: request.selectedLevels
        }),
      });

      if (!response.ok) {
        throw new Error(`Upgrade simulation API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔧 Bulk upgrade analysis complete:', result);

      if (!result.success) {
        throw new Error(result.error || 'Upgrade simulation failed');
      }

      // Convert API response to expected format
      const upgradeResults: UpgradeAnalysisResult[] = result.recommendations.map((rec: {
        slot: string;
        currentEnhancement: number;
        recommendedEnhancement: number;
        profitIncrease: number;
        experienceIncrease: number;
        percentageIncrease: number;
      }) => {
        // Get all test results for this slot
        const slotTests = result.upgradeTests.filter((test: {
          slot: string;
          testEnhancement: number;
          profitPerDay: number;
          experienceGain: number;
        }) => test.slot === rec.slot);
        const allTestResults = slotTests.map((test: {
          testEnhancement: number;
          profitPerDay: number;
          experienceGain: number;
        }) => ({
          enhancement: test.testEnhancement,
          profit: test.profitPerDay,
          exp: test.experienceGain
        }));

        return {
          slot: rec.slot,
          currentEnhancement: rec.currentEnhancement,
          recommendedEnhancement: rec.recommendedEnhancement,
          improvement: {
            profitIncrease: rec.profitIncrease,
            expIncrease: rec.experienceIncrease,
            percentageIncrease: rec.percentageIncrease
          },
          allTestResults
        };
      });

      return upgradeResults;

    } catch (error) {
      console.error('Failed to analyze equipment upgrades:', error);
      return [];
    }
  }

  /**
   * Analyze equipment upgrades with real-time streaming updates
   */
  static async analyzeEquipmentUpgradesStream(
    character: CharacterStats,
    request: UpgradeAnalysisRequest,
    rawCharacterData: string | null,
    onUpdate: (event: StreamEvent) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/combat-upgrade-simulation/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character,
          rawCharacterData,
          targetZone: request.targetZone,
          optimizeFor: request.optimizeFor,
          selectedLevels: request.selectedLevels
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body for stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete messages in the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = line.slice(6); // Remove 'data: ' prefix
                if (jsonData.trim()) {
                  const data = JSON.parse(jsonData);
                  onUpdate(data);

                  if (data.type === 'simulation_complete' || data.type === 'error') {
                    if (data.type === 'error') {
                      throw new Error(data.error);
                    }
                    return;
                  }
                }
              } catch (parseError) {
                console.error('Failed to parse stream data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }

}