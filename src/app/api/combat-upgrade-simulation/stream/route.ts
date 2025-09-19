import { NextRequest } from 'next/server';
import puppeteer, { Page } from 'puppeteer';
import { CharacterStats } from '@/types/character';
import { MarketplaceService } from '@/services/marketplace';

export interface UpgradeTestResult {
  slot: string;
  currentEnhancement: number;
  testEnhancement: number;
  experienceGain: number;
  profitPerDay: number;
  success: boolean;
  enhancementCost?: number;
  profitIncrease?: number;
  paybackDays?: number;
}

interface UpgradeSimulationRequest {
  character: CharacterStats;
  rawCharacterData?: string;
  targetZone: string;
  optimizeFor: 'profit' | 'exp';
  selectedLevels: { [slot: string]: number };
}

// Enhancement cost calculation function - uses MarketplaceService for consistent pricing
async function calculateEnhancementCost(fromLevel: number, toLevel: number, itemHrid: string): Promise<number> {
  let totalCost = 0;

  // Extract item name from itemHrid for marketplace lookup
  const itemName = itemHrid.replace('/items/', '');

  console.log(`💰 Calculating enhancement cost for ${itemName}: ${fromLevel} → ${toLevel}`);

  // Get the actual market price for the item at each enhancement level
  for (let level = fromLevel + 1; level <= toLevel; level++) {
    const levelCost = await getMarketPrice(itemName, level);
    totalCost += levelCost;
    console.log(`  - Level +${level}: ${levelCost.toLocaleString()}c`);
  }

  console.log(`  - Total Cost: ${totalCost.toLocaleString()}c`);
  return totalCost;
}

// Get actual market price using our MarketplaceService
async function getMarketPrice(itemName: string, enhancementLevel: number): Promise<number> {
  try {
    const price = await MarketplaceService.getItemPrice(itemName, enhancementLevel);

    if (price !== null && price > 0) {
      return price;
    }

    // Fallback calculation if price not found in marketplace
    console.log(`⚠️ No marketplace price found for ${itemName} +${enhancementLevel}, using fallback calculation`);
    const baseValue = 10000; // Conservative estimate
    const fallbackPrice = Math.floor(baseValue * Math.pow(1.5, enhancementLevel - 1) * 0.1);
    console.log(`⚠️ Fallback price: ${fallbackPrice.toLocaleString()}c`);
    return fallbackPrice;
  } catch (error) {
    console.error(`❌ Failed to get market price for ${itemName} +${enhancementLevel}:`, error);
    // Fallback calculation
    const baseValue = 10000;
    const fallbackPrice = Math.floor(baseValue * Math.pow(1.5, enhancementLevel - 1) * 0.1);
    console.log(`❌ Error fallback price: ${fallbackPrice.toLocaleString()}c`);
    return fallbackPrice;
  }
}

export async function POST(request: NextRequest) {
  const { character, rawCharacterData, targetZone, optimizeFor, selectedLevels }: UpgradeSimulationRequest = await request.json();

  // Create a readable stream for Server-Sent Events
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Helper function to safely enqueue data
      const safeEnqueue = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          return true;
        } catch (error) {
          console.error('Controller enqueue error:', error);
          return false;
        }
      };
      try {
        console.log('🔧 Starting streamed equipment upgrade simulation...');

        // Send initial status
        safeEnqueue({
          type: 'status',
          message: 'Starting simulation...',
          progress: 0
        });

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

        // Calculate total number of simulations needed
        let totalSimulations = 1; // Baseline
        const testPlan: { slot: string; currentLevel: number; testLevels: number[]; itemName: string; itemHrid: string }[] = [];

        EQUIPMENT_SLOTS.forEach(slot => {
          // Map weapon slot to main_hand for import data lookup (import uses main_hand, simulation uses weapon)
          const lookupSlot = slot === 'weapon' ? 'main_hand' : slot;
          const equipmentItem = equipmentArray.find(item =>
            item.itemLocationHrid === `/item_locations/${lookupSlot}`
          );

          if (equipmentItem && equipmentItem.itemHrid) {
            const currentLevel = equipmentItem.enhancementLevel;
            const selectedLevel = selectedLevels[slot];

            // Only test if a level was selected and it's different from current
            if (selectedLevel !== undefined && selectedLevel > currentLevel) {
              const testLevels: number[] = [];
              for (let level = currentLevel + 1; level <= selectedLevel; level++) {
                testLevels.push(level);
                totalSimulations++;
              }

              if (testLevels.length > 0) {
                const itemName = equipmentItem.itemHrid.replace('/items/', '');
                testPlan.push({
                  slot,
                  currentLevel,
                  testLevels,
                  itemName,
                  itemHrid: equipmentItem.itemHrid
                });
                console.log(`📈 ${slot}: Testing levels ${testLevels.join(', ')} (${testLevels.length} tests)`);
              }
            } else if (selectedLevel !== undefined && selectedLevel === currentLevel) {
              console.log(`⚡ ${slot}: No change - staying at +${currentLevel}`);
            } else {
              console.log(`🔲 ${slot}: No level selected or invalid level`);
            }
          } else {
            console.log(`🔲 ${slot}: Empty slot - skipping`);
          }
        });

        // Send equipment info
        safeEnqueue({
          type: 'equipment_info',
          testPlan,
          totalSimulations
        });

        // Launch Puppeteer browser
        const browser = await puppeteer.launch({
          headless: true,
          slowMo: 100,
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
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        try {
          // Navigate to combat simulator
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Navigating to combat simulator...',
            progress: 5
          })}\n\n`));

          await page.goto('https://shykai.github.io/MWICombatSimulatorTest/dist/', {
            waitUntil: 'networkidle2',
            timeout: 90000
          });

          // Load marketplace prices first
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Loading marketplace prices...',
            progress: 10
          })}\n\n`));

          await page.evaluate(() => {
            const getPricesButton = document.querySelector('#buttonGetPrices') as HTMLElement;
            if (getPricesButton) {
              getPricesButton.click();
            }
          });

          await new Promise(resolve => setTimeout(resolve, 3000));

          // Import character data
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Importing character data...',
            progress: 15
          })}\n\n`));

          await importCharacterData(page, rawCharacterData || JSON.stringify(character));

          // Run baseline simulation
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Running baseline simulation...',
            progress: 20
          })}\n\n`));

          const baselineResults = await runSingleSimulation(page, targetZone);

          safeEnqueue({
            type: 'baseline_complete',
            baselineResults: baselineResults
          });

          const upgradeTests: UpgradeTestResult[] = [];
          let simulationCount = 1;

          // Test each equipment upgrade with real-time updates
          for (const plan of testPlan) {
            for (const testLevel of plan.testLevels) {
              const progress = 20 + ((simulationCount / totalSimulations) * 75);

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'test_starting',
                slot: plan.slot,
                testLevel,
                currentLevel: plan.currentLevel,
                progress,
                simulationCount,
                totalSimulations
              })}\n\n`));

              try {
                // Update enhancement level field
                await updateEnhancementField(page, plan.slot, testLevel);

                // Run simulation
                const testResult = await runSingleSimulation(page, targetZone);

                // Calculate enhancement cost and payback period using MarketplaceService
                const enhancementCost = await calculateEnhancementCost(plan.currentLevel, testLevel, plan.itemHrid);
                const profitIncreasePerDay = testResult.profitPerDay - baselineResults.profitPerDay;
                const paybackDays = profitIncreasePerDay > 0 ? Math.ceil(enhancementCost / profitIncreasePerDay) : Infinity;

                // Log profit per day calculation math
                console.log(`💰 Profit Per Day Calculation for ${plan.slot} +${testLevel}:`);
                console.log(`  - Market Enhancement Cost (${plan.currentLevel} → ${testLevel}): ${enhancementCost.toLocaleString()}`);
                console.log(`  - Baseline Profit Per Day: ${baselineResults.profitPerDay.toLocaleString()}`);
                console.log(`  - Test Result Profit Per Day: ${testResult.profitPerDay.toLocaleString()}`);
                console.log(`  - Profit Increase Per Day: ${profitIncreasePerDay.toLocaleString()}`);
                console.log(`  - Payback Days: ${paybackDays === Infinity ? 'Never (no profit increase)' : paybackDays.toLocaleString()}`);
                if (paybackDays !== Infinity) {
                  console.log(`  - Math: ${enhancementCost.toLocaleString()} cost ÷ ${profitIncreasePerDay.toLocaleString()} profit/day = ${(enhancementCost / profitIncreasePerDay).toFixed(2)} days`);
                }

                const upgradeTest: UpgradeTestResult = {
                  slot: plan.slot,
                  currentEnhancement: plan.currentLevel,
                  testEnhancement: testLevel,
                  experienceGain: testResult.experienceGain,
                  profitPerDay: testResult.profitPerDay,
                  success: true,
                  enhancementCost,
                  profitIncrease: profitIncreasePerDay,
                  paybackDays: paybackDays === Infinity ? undefined : paybackDays
                };

                upgradeTests.push(upgradeTest);

                // Send individual test result immediately
                safeEnqueue({
                  type: 'test_complete',
                  result: upgradeTest,
                  progress,
                  simulationCount,
                  totalSimulations,
                  expIncrease: testResult.experienceGain - baselineResults.experienceGain,
                  profitIncrease: profitIncreasePerDay,
                  enhancementCost,
                  paybackDays: paybackDays === Infinity ? undefined : paybackDays
                });

                // Reset enhancement level for next test
                await updateEnhancementField(page, plan.slot, plan.currentLevel);

              } catch (error) {
                console.error(`❌ Failed to test ${plan.slot} +${testLevel}:`, error);

                const failedTest: UpgradeTestResult = {
                  slot: plan.slot,
                  currentEnhancement: plan.currentLevel,
                  testEnhancement: testLevel,
                  experienceGain: 0,
                  profitPerDay: 0,
                  success: false
                };

                upgradeTests.push(failedTest);

                safeEnqueue({
                  type: 'test_failed',
                  result: failedTest,
                  error: error instanceof Error ? error.message : 'Unknown error',
                  progress,
                  simulationCount,
                  totalSimulations
                });
              }

              simulationCount++;
            }
          }

          // Calculate and send final recommendations
          const recommendations = calculateRecommendations(baselineResults, upgradeTests, optimizeFor);

          safeEnqueue({
            type: 'simulation_complete',
            baselineResults,
            upgradeTests,
            recommendations,
            progress: 100
          });

          await browser.close();

        } catch (error) {
          await browser.close();
          safeEnqueue({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

      } catch (error) {
        safeEnqueue({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Helper functions (reused from the original route)
async function importCharacterData(page: Page, characterData: string) {
  await page.evaluate(() => {
    const importExportButton = document.querySelector('#buttonImportExport') as HTMLElement;
    if (importExportButton) {
      importExportButton.click();
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  await page.evaluate(() => {
    const soloTab = document.querySelector('#solo-tab') as HTMLElement;
    if (soloTab) {
      soloTab.click();
    }
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

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

  await page.evaluate(() => {
    const importButton = document.querySelector('#buttonImportSet') as HTMLElement;
    if (importButton) {
      importButton.click();
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  await page.evaluate(() => {
    console.log('🔒 Closing import/export modal...');
        const closeButton = document.querySelector('#importExportModal .btn-close') as HTMLElement;

        if (!closeButton) {
          // Fallback debugging if the close button isn't found
          const allCloseButtons = Array.from(document.querySelectorAll('.btn-close, .close, button[aria-label="Close"], [data-dismiss="modal"]'));
          console.log('🔍 #importExportModal .btn-close not found. All close buttons:', allCloseButtons.map(btn => ({
            id: btn.id,
            className: btn.className,
            textContent: btn.textContent?.trim(),
            ariaLabel: btn.getAttribute('aria-label')
          })));

          return {
            success: false,
            debug: {
              closeButtons: allCloseButtons.map(btn => ({
                id: btn.id,
                className: btn.className,
                textContent: btn.textContent?.trim()
              }))
            }
          };
        }

        console.log('✅ Found modal close button:', {
          id: closeButton.id,
          className: closeButton.className,
          textContent: closeButton.textContent?.trim()
        });

        closeButton.click();
        console.log('🚪 Import/Export modal closed');

        return { success: true };
  });

  await new Promise(resolve => setTimeout(resolve, 2000));
}

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

async function runSingleSimulation(page: Page, targetZone: string) {
  await page.evaluate((targetZone) => {
    const selectZone = document.querySelector('#selectZone') as HTMLSelectElement;
    if (selectZone) {
      selectZone.value = targetZone;
      selectZone.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const player1Element = document.querySelector('#player1') as HTMLInputElement;
    if (player1Element) {
      player1Element.checked = true;
      player1Element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, targetZone);

  await new Promise(resolve => setTimeout(resolve, 500));

  await page.evaluate(() => {
    const startButton = document.querySelector('#buttonStartSimulation') as HTMLElement;
    if (startButton) {
      startButton.click();
    }
  });

  await new Promise(resolve => setTimeout(resolve, 10000));

  return await page.evaluate(() => {
    const expElement = document.querySelector('#simulationResultExperienceGain .row div.text-end');
    const experienceGain = expElement ? parseFloat(expElement.textContent?.replace(/,/g, '') || '0') : 0;

    const profitElement = document.querySelector('#noRngProfitPreview');
    const profitPerDay = profitElement ? parseFloat(profitElement.textContent?.replace(/,/g, '') || '0') : 0;

    // Log detailed data field information
    console.log('🔍 Experience Data Fields:');
    console.log('  - Element:', expElement);
    console.log('  - Raw Text Content:', expElement?.textContent);
    console.log('  - Parsed Experience Gain:', experienceGain);

    console.log('🔍 Profit Data Fields:');
    console.log('  - Element:', profitElement);
    console.log('  - Raw Text Content:', profitElement?.textContent);
    console.log('  - Parsed Profit Per Day:', profitPerDay);

    return {
      experienceGain,
      profitPerDay
    };
  });
}

function calculateRecommendations(
  baseline: { experienceGain: number; profitPerDay: number },
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
    enhancementCost?: number;
    paybackDays?: number;
  }[] = [];
  const baselineMetric = optimizeFor === 'profit' ? baseline.profitPerDay : baseline.experienceGain;

  const slotGroups = upgradeTests.reduce((groups, test) => {
    if (!groups[test.slot]) {
      groups[test.slot] = [];
    }
    groups[test.slot].push(test);
    return groups;
  }, {} as Record<string, UpgradeTestResult[]>);

  Object.entries(slotGroups).forEach(([slot, tests]) => {
    let bestTest: UpgradeTestResult | null = null;
    let bestImprovement = 0;

    tests.forEach(test => {
      if (test.success) {
        const testMetric = optimizeFor === 'profit' ? test.profitPerDay : test.experienceGain;
        const improvement = testMetric - baselineMetric;

        if (improvement > bestImprovement) {
          bestImprovement = improvement;
          bestTest = test;
        }
      }
    });

    if (bestTest && bestImprovement > 0) {
      const experienceIncrease = (bestTest as UpgradeTestResult).experienceGain - baseline.experienceGain;
      const profitIncrease = (bestTest as UpgradeTestResult).profitPerDay - baseline.profitPerDay;
      const percentageIncrease = baselineMetric > 0 ? (bestImprovement / baselineMetric) * 100 : 0;

      recommendations.push({
        slot,
        currentEnhancement: (bestTest as UpgradeTestResult).currentEnhancement,
        recommendedEnhancement: (bestTest as UpgradeTestResult).testEnhancement,
        experienceIncrease,
        profitIncrease,
        percentageIncrease,
        enhancementCost: (bestTest as UpgradeTestResult).enhancementCost,
        paybackDays: (bestTest as UpgradeTestResult).paybackDays
      });
    }
  });

  // Sort recommendations by optimization criteria
  if (optimizeFor === 'profit') {
    // For profit optimization, consider both profit increase and payback period
    recommendations.sort((a, b) => {
      // Primary sort: Higher profit increase
      const profitDiff = b.profitIncrease - a.profitIncrease;
      if (Math.abs(profitDiff) > 100) return profitDiff; // Significant profit difference

      // Secondary sort: Shorter payback period (if both have payback data)
      if (a.paybackDays && b.paybackDays) {
        return a.paybackDays - b.paybackDays;
      }

      return profitDiff;
    });
  } else {
    // For experience optimization, sort by experience increase
    recommendations.sort((a, b) => b.experienceIncrease - a.experienceIncrease);
  }

  return recommendations;
}