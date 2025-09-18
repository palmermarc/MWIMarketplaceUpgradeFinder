import { NextRequest, NextResponse } from 'next/server';
import { Cluster } from 'puppeteer-cluster';
import { CharacterStats } from '@/types/character';

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

export interface ConcurrentSimulationRequest {
  simulations: {
    id: string;
    character: CharacterStats;
    equipmentOverride?: { [slot: string]: { item: string; enhancement: number } };
    rawCharacterData?: string;
  }[];
}

export interface ConcurrentSimulationResponse {
  results: { [id: string]: CombatSimulationResult };
  summary: {
    total: number;
    successful: number;
    failed: number;
    duration: number;
  };
}

interface SimulationRequest {
  character: CharacterStats;
  equipmentOverride?: { [slot: string]: { item: string; enhancement: number } };
  rawCharacterData?: string;
}

interface SimulationTask {
  id: string;
  character: CharacterStats;
  equipmentOverride?: { [slot: string]: { item: string; enhancement: number } };
  rawCharacterData?: string;
}

// Core simulation function that will be used by the cluster
async function runSingleSimulation(task: SimulationTask): Promise<CombatSimulationResult> {
  const { character, equipmentOverride } = task;
  // Note: rawCharacterData available but not used in mock simulation

  // Apply equipment override if provided
  const effectiveCharacter = equipmentOverride ? {
    ...character,
    equipment: { ...character.equipment, ...equipmentOverride }
  } : character;

  return new Promise((resolve) => {
    // Enhanced mock data with better calculations
    // TODO: Replace with actual Puppeteer automation when needed
    const equipment = effectiveCharacter.equipment;
    let totalEnhancement = 0;
    let itemCount = 0;

    Object.values(equipment).forEach(item => {
      totalEnhancement += item.enhancement;
      itemCount++;
    });

    const avgEnhancement = itemCount > 0 ? totalEnhancement / itemCount : 0;
    const baseKills = 100 + (avgEnhancement * 50);
    const variation = Math.random() * 0.2 + 0.9; // 90-110% variation

    // Simulate processing time (1-3 seconds)
    setTimeout(() => {
      resolve({
        killsPerHour: Math.round(baseKills * variation),
        expPerHour: Math.round(baseKills * variation * 15),
        profitPerHour: Math.round(baseKills * variation * 25),
        revenuePerHour: Math.round(baseKills * variation * 35),
        zone: `Zone ${Math.ceil(avgEnhancement / 2)}`,
        success: true
      });
    }, 1000 + Math.random() * 2000);
  });
}

// Concurrent simulation handler using puppeteer-cluster
async function handleConcurrentSimulation(request: ConcurrentSimulationRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const results: { [id: string]: CombatSimulationResult } = {};
  let successful = 0;
  let failed = 0;

  console.log(`🚀 Starting concurrent simulation for ${request.simulations.length} tasks`);

  try {
    // Launch cluster with optimal settings
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: Math.min(6, request.simulations.length), // Limit to 6 concurrent workers
      puppeteerOptions: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--window-size=1280,720'
        ]
      },
      timeout: 120000, // 2 minute timeout per task
      retryLimit: 1,
      monitor: false
    });

    // Define the task that each worker will execute
    await cluster.task(async ({ data: task }: { page: unknown, data: SimulationTask }) => {
      try {
        console.log(`🎯 Processing simulation ${task.id}`);

        // For now, use the mock simulation logic
        // TODO: Replace with actual Puppeteer automation when needed
        const result = await runSingleSimulation(task);

        console.log(`✅ Completed simulation ${task.id}`);
        return { id: task.id, result };
      } catch (error) {
        console.error(`❌ Failed simulation ${task.id}:`, error);
        return {
          id: task.id,
          result: {
            killsPerHour: 0,
            expPerHour: 0,
            profitPerHour: 0,
            revenuePerHour: 0,
            zone: 'Error',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    });

    // Queue all simulation tasks
    const promises = request.simulations.map(async (sim) => {
      const task: SimulationTask = {
        id: sim.id,
        character: sim.character,
        equipmentOverride: sim.equipmentOverride,
        rawCharacterData: sim.rawCharacterData
      };
      return cluster.execute(task);
    });

    // Wait for all simulations to complete
    const taskResults = await Promise.all(promises);

    // Process results
    taskResults.forEach((taskResult: { id: string; result: CombatSimulationResult } | null) => {
      if (taskResult && taskResult.result) {
        results[taskResult.id] = taskResult.result;
        if (taskResult.result.success) {
          successful++;
        } else {
          failed++;
        }
      } else {
        failed++;
      }
    });

    // Clean up cluster
    await cluster.idle();
    await cluster.close();

    const duration = Date.now() - startTime;
    console.log(`🏁 Concurrent simulation completed in ${duration}ms. Success: ${successful}, Failed: ${failed}`);

    const response: ConcurrentSimulationResponse = {
      results,
      summary: {
        total: request.simulations.length,
        successful,
        failed,
        duration
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Concurrent simulation failed:', error);

    const response: ConcurrentSimulationResponse = {
      results,
      summary: {
        total: request.simulations.length,
        successful,
        failed: request.simulations.length - successful,
        duration: Date.now() - startTime
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a concurrent simulation request
    if ('simulations' in body) {
      return handleConcurrentSimulation(body as ConcurrentSimulationRequest);
    }

    // Handle single simulation (backward compatibility)
    const { character, equipmentOverride, rawCharacterData }: SimulationRequest = body;

    console.log('Starting single combat simulation for character:', character);

    // Use the new simulation function
    const task: SimulationTask = {
      id: 'single',
      character,
      equipmentOverride,
      rawCharacterData
    };

    const result = await runSingleSimulation(task);

    console.log('✅ Single simulation completed:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Combat simulation API error:', error);

    return NextResponse.json(
      {
        killsPerHour: 0,
        expPerHour: 0,
        profitPerHour: 0,
        revenuePerHour: 0,
        zone: 'Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}