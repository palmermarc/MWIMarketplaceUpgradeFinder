import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { CharacterStats } from '@/types/character';

export interface CombatSimulationResult {
  killsPerHour: number;
  expPerHour: number;
  profitPerHour: number;
  zone: string;
  success: boolean;
  error?: string;
}

interface SimulationRequest {
  character: CharacterStats;
  equipmentOverride?: { [slot: string]: { item: string; enhancement: number } };
}

export async function POST(request: NextRequest) {
  try {
    const { character, equipmentOverride }: SimulationRequest = await request.json();

    console.log('Starting combat simulation for character:', character);

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    try {
      // Navigate to the combat simulator
      console.log('Navigating to combat simulator...');
      await page.goto('https://shykai.github.io/MWICombatSimulatorTest/dist/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      console.log('Page loaded, configuring character...');

      // Use equipment override if provided, otherwise use character's equipment
      const equipment = equipmentOverride || character.equipment;

      // Configure character stats
      await page.evaluate((combatStats) => {
        // Fill in combat stats - these selectors need to be determined from the actual simulator
        const attackInput = document.querySelector('input[name="attack"]') as HTMLInputElement;
        const meleeInput = document.querySelector('input[name="melee"]') as HTMLInputElement;
        const defenseInput = document.querySelector('input[name="defense"]') as HTMLInputElement;
        const magicInput = document.querySelector('input[name="magic"]') as HTMLInputElement;
        const rangedInput = document.querySelector('input[name="ranged"]') as HTMLInputElement;
        const intelligenceInput = document.querySelector('input[name="intelligence"]') as HTMLInputElement;
        const staminaInput = document.querySelector('input[name="stamina"]') as HTMLInputElement;

        if (attackInput) attackInput.value = combatStats.attack?.toString() || '1';
        if (meleeInput) meleeInput.value = combatStats.melee?.toString() || '1';
        if (defenseInput) defenseInput.value = combatStats.defense?.toString() || '1';
        if (magicInput) magicInput.value = combatStats.magic?.toString() || '1';
        if (rangedInput) rangedInput.value = combatStats.ranged?.toString() || '1';
        if (intelligenceInput) intelligenceInput.value = combatStats.intelligence?.toString() || '1';
        if (staminaInput) staminaInput.value = combatStats.stamina?.toString() || '1';
      }, character.combat);

      // Configure equipment
      await page.evaluate((equip) => {
        // Configure equipment - selectors need to be determined from actual simulator
        Object.entries(equip).forEach(([slot, item]) => {
          const itemSelect = document.querySelector(`select[name="${slot}"]`) as HTMLSelectElement;
          const enhanceInput = document.querySelector(`input[name="${slot}_enhancement"]`) as HTMLInputElement;

          if (itemSelect) {
            // Find option that matches the item name
            const option = Array.from(itemSelect.options).find(opt =>
              opt.text.toLowerCase().includes(item.item.toLowerCase())
            );
            if (option) itemSelect.value = option.value;
          }

          if (enhanceInput) {
            enhanceInput.value = item.enhancement.toString();
          }
        });
      }, equipment);

      console.log('Character configured, starting simulation...');

      // Start the simulation
      const simulateButton = await page.waitForSelector('button[id*="simulate"], button[class*="simulate"], input[type="submit"]', {
        timeout: 10000
      });

      if (simulateButton) {
        await simulateButton.click();
      }

      // Wait for results with extended timeout (up to 2 minutes)
      console.log('Waiting for simulation results...');
      await page.waitForSelector('.results, #results, [class*="result"]', {
        timeout: 120000 // 2 minutes timeout
      });

      // Extract results
      const results = await page.evaluate(() => {
        // Extract simulation results - these selectors need to be determined from actual simulator
        const killsElement = document.querySelector('[class*="kills"], [id*="kills"]');
        const expElement = document.querySelector('[class*="exp"], [id*="experience"]');
        const profitElement = document.querySelector('[class*="profit"], [id*="gold"]');
        const zoneElement = document.querySelector('[class*="zone"], [id*="zone"]');

        return {
          killsPerHour: killsElement ? parseFloat(killsElement.textContent || '0') : 0,
          expPerHour: expElement ? parseFloat(expElement.textContent || '0') : 0,
          profitPerHour: profitElement ? parseFloat(profitElement.textContent || '0') : 0,
          zone: zoneElement ? zoneElement.textContent || 'Unknown' : 'Unknown',
          success: true
        };
      });

      console.log('Simulation completed:', results);

      await browser.close();

      return NextResponse.json(results as CombatSimulationResult);

    } catch (error) {
      console.error('Simulation error:', error);
      await browser.close();

      // Return mock data as fallback
      const mockResult: CombatSimulationResult = {
        killsPerHour: 150 + Math.random() * 100,
        expPerHour: 2000 + Math.random() * 1000,
        profitPerHour: 500 + Math.random() * 300,
        zone: 'Mock Zone',
        success: false,
        error: `Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };

      return NextResponse.json(mockResult);
    }

  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to run simulation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}