import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Page } from 'puppeteer';
import { CharacterStats } from '@/types/character';

export interface UpgradeTestResult {
  slot: string;
  currentEnhancement: number;
  testEnhancement: number;
  experienceGain: number;
  profitPerHour: number;
  success: boolean;
}

export interface UpgradeSimulationResult {
  success: boolean;
  baselineResults: {
    experienceGain: number;
    profitPerHour: number;
  };
  upgradeTests: UpgradeTestResult[];
  recommendations: {
    slot: string;
    currentEnhancement: number;
    recommendedEnhancement: number;
    experienceIncrease: number;
    profitIncrease: number;
    percentageIncrease: number;
  }[];
  error?: string;
}

interface UpgradeSimulationRequest {
  character: CharacterStats;
  rawCharacterData?: string;
  targetZone: string;
  targetTier?: string;
  optimizeFor: 'profit' | 'exp';
  maxEnhancementTiers: number;
  selectedLevels?: { [slot: string]: number };
  equipmentOverrides?: { [slot: string]: string }; // For "Set another X" functionality
}

export async function POST(request: NextRequest) {
  try {
    const { character, rawCharacterData, targetZone, targetTier, optimizeFor, maxEnhancementTiers }: UpgradeSimulationRequest = await request.json();

    console.log('🔧 Starting equipment upgrade simulation...');
    console.log('Target zone:', targetZone);
    console.log('Optimize for:', optimizeFor);
    console.log('Max enhancement tiers:', maxEnhancementTiers);

    // Define equipment slots to test
    const EQUIPMENT_SLOTS = ['head', 'neck', 'earrings', 'body', 'legs', 'feet', 'hands', 'ring', 'weapon', 'off_hand', 'pouch'];

    // Parse character data to get actual equipment array
    let equipmentArray: { itemLocationHrid: string; itemHrid: string; enhancementLevel: number; }[] = [];

    if (rawCharacterData) {
      try {
        const parsedData = JSON.parse(rawCharacterData);
        equipmentArray = parsedData.player?.equipment || [];
      } catch (error) {
        console.error('Failed to parse raw character data:', error);
      }
    }

    // Display currently equipped items
    console.log('📦 Currently equipped items:');
    EQUIPMENT_SLOTS.forEach(slot => {
      const equipmentItem = equipmentArray.find(item =>
        item.itemLocationHrid === `/item_locations/${slot}`
      );

      if (equipmentItem && equipmentItem.itemHrid) {
        // Extract item name from itemHrid (remove "/items/" prefix)
        const itemName = equipmentItem.itemHrid.replace('/items/', '');
        console.log(`  ${slot}: ${itemName} +${equipmentItem.enhancementLevel}`);
      } else {
        console.log(`  ${slot}: Empty`);
      }
    });

    // Calculate total number of simulations needed
    let totalSimulations = 1; // Baseline
    const testPlan: { slot: string; currentLevel: number; testLevels: number[] }[] = [];

    EQUIPMENT_SLOTS.forEach(slot => {
      const equipmentItem = equipmentArray.find(item =>
        item.itemLocationHrid === `/item_locations/${slot}`
      );

      if (equipmentItem && equipmentItem.itemHrid) {
        const currentLevel = equipmentItem.enhancementLevel;
        const maxLevel = Math.min(maxEnhancementTiers, 20);

        if (currentLevel < maxLevel) {
          const testLevels: number[] = [];
          for (let level = currentLevel + 1; level <= maxLevel; level++) {
            testLevels.push(level);
            totalSimulations++;
          }

          if (testLevels.length > 0) {
            testPlan.push({
              slot,
              currentLevel,
              testLevels
            });
            console.log(`📈 ${slot}: Testing levels ${testLevels.join(', ')} (${testLevels.length} tests)`);
          }
        } else {
          console.log(`⚡ ${slot}: Already at max level +${currentLevel}`);
        }
      } else {
        console.log(`🔲 ${slot}: Empty slot - skipping`);
      }
    });

    console.log(`🎯 Total simulations planned: ${totalSimulations}`);

    // Launch Puppeteer browser with Vercel-optimized settings
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-gpu-sandbox',
        '--disable-software-rasterizer',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-component-extensions-with-background-pages',
        '--window-size=1920,1080'
      ],
      timeout: 60000
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
      // Navigate to combat simulator
      console.log('🌐 Navigating to combat simulator...');
      await page.goto('https://shykai.github.io/MWICombatSimulatorTest/dist/', {
        waitUntil: 'networkidle2',
        timeout: 90000
      });

      // First thing: Load marketplace prices
      console.log('📈 Loading marketplace prices...');
      await page.evaluate(() => {
        const getPricesButton = document.querySelector('#buttonGetPrices') as HTMLElement;
        if (getPricesButton) {
          getPricesButton.click();
        }
      });

      // Wait for prices to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Marketplace prices loaded');

      // Import character data
      console.log('📥 Importing character data...');
      await importCharacterData(page, rawCharacterData || JSON.stringify(character));

      // Run baseline simulation
      console.log('📊 Running baseline simulation...');
      const baselineResults = await runSingleSimulation(page, targetZone, targetTier);

      const upgradeTests: UpgradeTestResult[] = [];
      let simulationCount = 1;

      // Test each equipment upgrade
      for (const plan of testPlan) {
        console.log(`🔧 Testing upgrades for ${plan.slot}...`);

        for (const testLevel of plan.testLevels) {
          console.log(`📈 Testing ${plan.slot} +${testLevel} (${simulationCount}/${totalSimulations})`);

          try {
            // Update enhancement level field
            await updateEnhancementField(page, plan.slot, testLevel);

            // Run simulation
            const testResult = await runSingleSimulation(page, targetZone, targetTier);

            upgradeTests.push({
              slot: plan.slot,
              currentEnhancement: plan.currentLevel,
              testEnhancement: testLevel,
              experienceGain: testResult.experienceGain,
              profitPerHour: testResult.profitPerHour,
              success: true
            });

            console.log(`✅ ${plan.slot} +${testLevel}: EXP=${testResult.experienceGain}, Profit=${testResult.profitPerHour}`);

            // Reset enhancement level for next test
            await updateEnhancementField(page, plan.slot, plan.currentLevel);

          } catch (error) {
            console.error(`❌ Failed to test ${plan.slot} +${testLevel}:`, error);
            upgradeTests.push({
              slot: plan.slot,
              currentEnhancement: plan.currentLevel,
              testEnhancement: testLevel,
              experienceGain: 0,
              profitPerHour: 0,
              success: false
            });
          }

          simulationCount++;
        }
      }

      // Calculate recommendations
      const recommendations = calculateRecommendations(baselineResults, upgradeTests, optimizeFor);

      await browser.close();

      return NextResponse.json({
        success: true,
        baselineResults,
        upgradeTests,
        recommendations
      } as UpgradeSimulationResult);

    } catch (error) {
      await browser.close();
      throw error;
    }

  } catch (error) {
    console.error('❌ Upgrade simulation failed:', error);
    return NextResponse.json({
      success: false,
      baselineResults: { experienceGain: 0, profitPerHour: 0 },
      upgradeTests: [],
      recommendations: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    } as UpgradeSimulationResult);
  }
}

// Helper function to import character data
async function importCharacterData(page: Page, characterData: string) {
  // Open Import/Export modal
  await page.evaluate(() => {
    const importExportButton = document.querySelector('#buttonImportExport') as HTMLElement;
    if (importExportButton) {
      importExportButton.click();
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Click solo tab
  await page.evaluate(() => {
    const soloTab = document.querySelector('#solo-tab') as HTMLElement;
    if (soloTab) {
      soloTab.click();
    }
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Paste character data
  await page.evaluate((importData) => {
    const soloInput = document.querySelector('#inputSetSolo') as HTMLInputElement;
    if (soloInput) {
      soloInput.value = '';
      soloInput.focus();
      soloInput.value = importData;
      soloInput.dispatchEvent(new Event('input', { bubbles: true }));
      soloInput.dispatchEvent(new Event('change', { bubbles: true }));
      soloInput.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  }, characterData);

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Click import button
  await page.evaluate(() => {
    const importButton = document.querySelector('#buttonImportSet') as HTMLElement;
    if (importButton) {
      importButton.click();
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Close modal properly using .btn-close
  await page.evaluate(() => {
    const closeButton = document.querySelector('.btn-close') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Helper function to update enhancement level field
async function updateEnhancementField(page: Page, slot: string, level: number) {
  return await page.evaluate((slot, level) => {
    const enhancementFieldId = `#inputEquipmentEnhancementLevel_${slot}`;
    const enhancementField = document.querySelector(enhancementFieldId) as HTMLInputElement;

    if (enhancementField) {
      enhancementField.value = level.toString();
      enhancementField.dispatchEvent(new Event('input', { bubbles: true }));
      enhancementField.dispatchEvent(new Event('change', { bubbles: true }));
      enhancementField.dispatchEvent(new Event('blur', { bubbles: true }));
      return true;
    }
    return false;
  }, slot, level);
}

// Helper function to run a single simulation
async function updateEquipmentSelection(page: Page, slot: string, itemHrid: string) {
  return await page.evaluate((slot, itemHrid) => {
    const equipmentSelectId = `#selectEquipment_${slot}`;
    const equipmentSelect = document.querySelector(equipmentSelectId) as HTMLSelectElement;

    if (equipmentSelect) {
      console.log(`🔄 Setting equipment for ${slot} to: ${itemHrid}`);
      equipmentSelect.value = itemHrid;
      equipmentSelect.dispatchEvent(new Event('input', { bubbles: true }));
      equipmentSelect.dispatchEvent(new Event('change', { bubbles: true }));
      equipmentSelect.dispatchEvent(new Event('blur', { bubbles: true }));
      return true;
    } else {
      console.log(`❌ Equipment selector not found: ${equipmentSelectId}`);
    }
    return false;
  }, slot, itemHrid);
}

async function runSingleSimulation(page: Page, targetZone: string, targetTier?: string) {
  // Configure simulation settings
  await page.evaluate((targetZone, targetTier) => {
    // Select target zone
    const selectZone = document.querySelector('#selectZone') as HTMLSelectElement;
    if (selectZone) {
      selectZone.value = targetZone;
      selectZone.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Set difficulty tier to the selected value (default to tier_1 if not provided)
    const selectDifficulty = document.querySelector('#selectDifficulty') as HTMLSelectElement;
    if (selectDifficulty) {
      const tierValue = targetTier || 'tier_1';
      selectDifficulty.value = tierValue;
      selectDifficulty.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Select player 1
    const player1Element = document.querySelector('#player1') as HTMLInputElement;
    if (player1Element) {
      player1Element.checked = true;
      player1Element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, targetZone, targetTier);

  await new Promise(resolve => setTimeout(resolve, 500));

  // Start simulation
  await page.evaluate(() => {
    const startButton = document.querySelector('#buttonStartSimulation') as HTMLElement;
    if (startButton) {
      startButton.click();
    }
  });

  // Wait for simulation to complete
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Extract results
  return await page.evaluate(() => {
    // Extract experience gain
    const expElement = document.querySelector('#simulationResultExperienceGain .row div.text-end');
    const experienceGain = expElement ? parseFloat(expElement.textContent?.replace(/,/g, '') || '0') : 0;

    // Extract profit
    const profitElement = document.querySelector('div#script_revenue');
    const profitPerHour = profitElement ? parseFloat(profitElement.textContent?.replace(/,/g, '') || '0') : 0;

    return {
      experienceGain,
      profitPerHour
    };
  });
}

// Helper function to calculate recommendations
function calculateRecommendations(
  baseline: { experienceGain: number; profitPerHour: number },
  upgradeTests: UpgradeTestResult[],
  optimizeFor: 'profit' | 'exp'
) {
  const recommendations: {
    slot: string;
    currentEnhancement: number;
    recommendedEnhancement: number;
    experienceIncrease: number;
    profitIncrease: number;
    percentageIncrease: number;
  }[] = [];
  const baselineMetric = optimizeFor === 'profit' ? baseline.profitPerHour : baseline.experienceGain;

  // Group tests by slot
  const slotGroups = upgradeTests.reduce((groups, test) => {
    if (!groups[test.slot]) {
      groups[test.slot] = [];
    }
    groups[test.slot].push(test);
    return groups;
  }, {} as Record<string, UpgradeTestResult[]>);

  // Find best enhancement for each slot
  Object.entries(slotGroups).forEach(([slot, tests]) => {
    let bestTest: UpgradeTestResult | null = null;
    let bestImprovement = 0;

    tests.forEach(test => {
      if (test.success) {
        const testMetric = optimizeFor === 'profit' ? test.profitPerHour : test.experienceGain;
        const improvement = testMetric - baselineMetric;

        if (improvement > bestImprovement) {
          bestImprovement = improvement;
          bestTest = test;
        }
      }
    });

    if (bestTest && bestImprovement > 0) {
      const experienceIncrease = (bestTest as UpgradeTestResult).experienceGain - baseline.experienceGain;
      const profitIncrease = (bestTest as UpgradeTestResult).profitPerHour - baseline.profitPerHour;
      const percentageIncrease = baselineMetric > 0 ? (bestImprovement / baselineMetric) * 100 : 0;

      recommendations.push({
        slot,
        currentEnhancement: (bestTest as UpgradeTestResult).currentEnhancement,
        recommendedEnhancement: (bestTest as UpgradeTestResult).testEnhancement,
        experienceIncrease,
        profitIncrease,
        percentageIncrease
      });
    }
  });

  // Sort by improvement
  const sortMetric = optimizeFor === 'profit' ? 'profitIncrease' : 'experienceIncrease';
  recommendations.sort((a, b) => b[sortMetric] - a[sortMetric]);

  return recommendations;
}