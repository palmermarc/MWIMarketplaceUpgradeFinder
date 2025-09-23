import { CharacterStats } from '@/types/character';

export interface UpgradeAnalysisRequest {
  optimizeFor: 'profit' | 'exp';
  targetZone: string;
  targetTier?: string;
  selectedLevels: { [slot: string]: number };
  abilityTargetLevels?: { [abilityHrid: string]: number };
  houseTargetLevels?: { [roomHrid: string]: number };
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
  booksRequired?: number;
  costPerBook?: number;
  bookName?: string;
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
  equipmentTests?: {
    slot: string;
    currentLevel: number;
    testLevel: number;
    profitPerDay: number;
    experienceGain: number;
    enhancementCost?: number;
    paybackDays?: number;
    itemName?: string;
    itemHrid?: string;
  }[];
  abilityTests?: {
    abilityHrid: string;
    abilityName: string;
    currentLevel: number;
    testLevel: number;
    profitPerDay: number;
    experienceGain: number;
  }[];
  houseTests?: {
    roomHrid: string;
    roomName: string;
    currentLevel: number;
    testLevel: number;
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
  abilityRecommendations?: {
    abilityHrid: string;
    abilityName: string;
    currentLevel: number;
    recommendedLevel: number;
    profitIncrease: number;
    experienceIncrease: number;
    percentageIncrease: number;
    enhancementCost?: number;
    paybackDays?: number;
    booksRequired?: number;
    costPerBook?: number;
    bookName?: string;
  }[];
  houseRecommendations?: {
    roomHrid: string;
    roomName: string;
    currentLevel: number;
    recommendedLevel: number;
    profitIncrease: number;
    experienceIncrease: number;
    percentageIncrease: number;
    enhancementCost?: number;
    paybackDays?: number;
  }[];
}

export class CombatSimulatorApiService {

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
          targetTier: request.targetTier,
          optimizeFor: request.optimizeFor,
          selectedLevels: request.selectedLevels,
          abilityTargetLevels: request.abilityTargetLevels,
          houseTargetLevels: request.houseTargetLevels
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