import { NextRequest } from 'next/server';
import { Page } from 'puppeteer-core';
import { CharacterStats } from '@/types/character';
import { MarketplaceService } from '@/services/marketplace';
import { launchBrowser } from '@/utils/puppeteer';
import { calculateAbilityBookCost, getAbilityByHrid } from '@/constants/abilities';
import { calculateHouseUpgradeCostWithMarketplace } from '@/constants/houseCosts';

// Import regular puppeteer for local development
let puppeteer: typeof import('puppeteer') | null = null;

// Detect environment and import appropriate puppeteer
// Force local mode detection - check for local development environment
// Also allow forcing local mode with FORCE_LOCAL_PUPPETEER=true
const isLocal = (process.env.NODE_ENV === 'development' &&
                 (process.env.VERCEL_ENV !== 'development') &&
                 (!process.env.VERCEL || process.env.VERCEL !== '1')) ||
                 process.env.FORCE_LOCAL_PUPPETEER === 'true';

console.log('🔍 Environment Detection:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  VERCEL: ${process.env.VERCEL}`);
console.log(`  VERCEL_ENV: ${process.env.VERCEL_ENV}`);
console.log(`  isLocal: ${isLocal}`);

if (isLocal) {
  console.log('🐛 LOCAL MODE: Using regular Puppeteer for debugging');
  try {
    puppeteer = await import('puppeteer');
    console.log('✅ Regular Puppeteer loaded for local development');
  } catch (error) {
    console.log('❌ Failed to load regular Puppeteer, falling back to Vercel mode:', error);
  }
} else {
  console.log('☁️ PRODUCTION MODE: Using Vercel-compatible Puppeteer');
}

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
  abilityName?: string;
  roomName?: string;
  booksRequired?: number;
  costPerBook?: number;
  bookName?: string;
  itemName?: string;
  itemHrid?: string;
}

interface UpgradeSimulationRequest {
  character: CharacterStats;
  rawCharacterData?: string;
  targetZone: string;
  targetTier?: string;
  optimizeFor: 'profit' | 'exp';
  selectedLevels: { [slot: string]: number };
  equipmentOverrides?: { [slot: string]: string }; // For "Set another X" functionality
  abilityTargetLevels?: { [abilityHrid: string]: number };
  houseTargetLevels?: { [roomHrid: string]: number };
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

// Calculate ability upgrade cost using book requirements
async function calculateAbilityCost(abilityHrid: string, fromLevel: number, toLevel: number): Promise<{
  totalCost: number;
  booksRequired: number;
  costPerBook: number;
  bookName: string;
}> {
  try {
    console.log(`🧠 Calculating ability cost for ${abilityHrid}: level ${fromLevel} → ${toLevel}`);

    const ability = getAbilityByHrid(abilityHrid);
    if (!ability) {
      console.log(`❌ Ability not found: ${abilityHrid}`);
      return { totalCost: 0, booksRequired: 0, costPerBook: 0, bookName: 'Unknown' };
    }

    // Get marketplace data for the ability book
    const marketplaceData: { [itemHrid: string]: { price: number; available: boolean } } = {};
    const bookItemHrid = abilityHrid.replace('/abilities/', '/items/');

    try {
      const bookPrice = await MarketplaceService.getItemPrice(bookItemHrid.replace('/items/', ''), 0);
      if (bookPrice !== null && bookPrice > 0) {
        marketplaceData[bookItemHrid] = { price: bookPrice, available: true };
        console.log(`📚 Found marketplace price for ${bookItemHrid}: ${bookPrice}c`);
      } else {
        console.log(`⚠️ No marketplace price found for ${bookItemHrid}`);
        marketplaceData[bookItemHrid] = { price: 0, available: false };
      }
    } catch (error) {
      console.error(`❌ Failed to get marketplace price for ${bookItemHrid}:`, error);
      marketplaceData[bookItemHrid] = { price: 0, available: false };
    }

    // Calculate the cost using the ability cost calculator
    const costCalculation = calculateAbilityBookCost(abilityHrid, fromLevel, toLevel, marketplaceData);

    if (costCalculation && costCalculation.totalCost !== undefined) {
      console.log(`💰 Ability upgrade cost: ${costCalculation.totalCost.toLocaleString()}c (${costCalculation.booksRequired} books)`);
      return {
        totalCost: costCalculation.totalCost,
        booksRequired: costCalculation.booksRequired,
        costPerBook: costCalculation.unitPrice || 0,
        bookName: costCalculation.bookName
      };
    } else {
      console.log(`⚠️ Unable to calculate ability cost - books not available in marketplace`);
      return { totalCost: 0, booksRequired: 0, costPerBook: 0, bookName: ability.displayName };
    }
  } catch (error) {
    console.error(`❌ Failed to calculate ability cost for ${abilityHrid}:`, error);
    return { totalCost: 0, booksRequired: 0, costPerBook: 0, bookName: 'Unknown' };
  }
}

// Calculate house upgrade cost using materials + coins
async function calculateHouseCost(roomHrid: string, fromLevel: number, toLevel: number): Promise<number> {
  try {
    console.log(`🏠 Calculating house cost for ${roomHrid}: level ${fromLevel} → ${toLevel}`);

    // Get marketplace data for all materials needed
    const marketplaceData: { [itemHrid: string]: { price: number; available: boolean } } = {};

    // First, get the base cost calculation to see what materials we need
    const baseCost = calculateHouseUpgradeCostWithMarketplace(roomHrid, fromLevel, toLevel);

    if (!baseCost.isValid) {
      console.log(`❌ House cost calculation failed: ${baseCost.error}`);
      return 0;
    }

    // Fetch marketplace prices for all required materials
    for (const [itemHrid, materialInfo] of Object.entries(baseCost.totalMaterials)) {
      try {
        const itemName = itemHrid.replace('/items/', '');
        const marketPrice = await MarketplaceService.getItemPrice(itemName, 0);

        if (marketPrice !== null && marketPrice > 0) {
          marketplaceData[itemHrid] = { price: marketPrice, available: true };
          console.log(`🛒 Found marketplace price for ${materialInfo.itemName}: ${marketPrice}c`);
        } else {
          console.log(`⚠️ No marketplace price found for ${materialInfo.itemName}`);
          marketplaceData[itemHrid] = { price: 0, available: false };
        }
      } catch (error) {
        console.error(`❌ Failed to get marketplace price for ${itemHrid}:`, error);
        marketplaceData[itemHrid] = { price: 0, available: false };
      }
    }

    // Recalculate with marketplace data
    const finalCost = calculateHouseUpgradeCostWithMarketplace(roomHrid, fromLevel, toLevel, marketplaceData);

    if (finalCost.totalUpgradeCost !== undefined) {
      console.log(`💰 House upgrade cost: ${finalCost.totalUpgradeCost.toLocaleString()}c (${finalCost.totalCoins.toLocaleString()}c coins + ${finalCost.totalMaterialCost?.toLocaleString()}c materials)`);
      return finalCost.totalUpgradeCost;
    } else {
      console.log(`⚠️ Unable to calculate complete house cost - some materials not available in marketplace`);
      // Return just the coin cost if materials aren't available
      console.log(`💰 House upgrade cost (coins only): ${finalCost.totalCoins.toLocaleString()}c`);
      return finalCost.totalCoins;
    }
  } catch (error) {
    console.error(`❌ Failed to calculate house cost for ${roomHrid}:`, error);
    return 0;
  }
}

// Helper function to launch browser based on environment
async function launchBrowserForEnvironment() {
  console.log(`🚀 launchBrowserForEnvironment called - isLocal: ${isLocal}, puppeteer available: ${!!puppeteer}`);

  if (isLocal && puppeteer) {
    console.log('🐛 LOCAL MODE CONFIRMED: Launching local Puppeteer browser for debugging...');
    console.log('🔧 Browser settings: headless=false, devtools=true, slowMo=250ms');

    const browser = await puppeteer.launch({
      headless: false,           // ABSOLUTELY NO HEADLESS - show the browser window
      devtools: true,           // Open DevTools automatically
      slowMo: 500,              // Even slower for better visibility (500ms between actions)
      defaultViewport: null,    // Use full screen viewport
      ignoreDefaultArgs: ['--disable-extensions'], // Allow extensions for visibility
      args: [
        '--start-maximized',    // Start browser maximized
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security', // Allow cross-origin for debugging
        '--no-first-run',
        '--no-default-browser-check',
        '--force-device-scale-factor=1',
        '--window-size=1920,1080',
        '--disable-background-mode',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
    console.log('✅ Local browser launched successfully with debugging enabled');
    console.log('👀 You should see a Chrome window open now!');

    // Additional debugging - check if browser is actually connected
    const isConnected = browser.isConnected();
    console.log(`🔗 Browser connection status: ${isConnected}`);

    // Get browser version for confirmation
    try {
      const version = await browser.version();
      console.log(`🌐 Browser version: ${version}`);
    } catch (error) {
      console.log(`❌ Failed to get browser version: ${error}`);
    }

    return browser;
  } else {
    console.log('☁️ PRODUCTION MODE: Launching Vercel-compatible browser...');
    console.log(`   Reason: isLocal=${isLocal}, puppeteer=${!!puppeteer}`);
    return await launchBrowser({
      timeout: 60000
    });
  }
}

export async function POST(request: NextRequest) {
  const { character, rawCharacterData, targetZone, targetTier, optimizeFor, selectedLevels, equipmentOverrides, abilityTargetLevels, houseTargetLevels }: UpgradeSimulationRequest = await request.json();

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
        const abilityTestPlan: { abilityHrid: string; currentLevel: number; targetLevel: number; abilityName: string }[] = [];
        const houseTestPlan: { roomHrid: string; currentLevel: number; targetLevel: number; roomName: string }[] = [];

        // Plan equipment tests
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
            if (selectedLevel !== undefined && selectedLevel !== currentLevel) {
              const itemName = equipmentItem.itemHrid.replace('/items/', '');
              testPlan.push({
                slot,
                currentLevel,
                testLevels: [selectedLevel], // Only test the user-selected level
                itemName,
                itemHrid: equipmentItem.itemHrid
              });
              totalSimulations++; // Only one test per equipment slot
              console.log(`📈 ${slot}: Testing selected level +${selectedLevel} (1 test)`);
            } else if (selectedLevel !== undefined && selectedLevel === currentLevel) {
              console.log(`⚡ ${slot}: No change - staying at +${currentLevel}`);
            } else {
              console.log(`🔲 ${slot}: No level selected or invalid level`);
            }
          } else {
            console.log(`🔲 ${slot}: Empty slot - skipping`);
          }
        });

        // Plan ability tests (one test per ability with different target level)
        if (abilityTargetLevels && character.abilities) {
          character.abilities.forEach(ability => {
            const targetLevel = abilityTargetLevels[ability.abilityHrid];
            if (targetLevel !== undefined && targetLevel !== ability.level) {
              const abilityName = ability.abilityHrid.replace('/abilities/', '').replace(/_/g, ' ');
              abilityTestPlan.push({
                abilityHrid: ability.abilityHrid,
                currentLevel: ability.level,
                targetLevel,
                abilityName
              });
              totalSimulations++; // One test per ability
              console.log(`🧠 ${abilityName}: Testing level ${ability.level} → ${targetLevel}`);
            }
          });
        }

        // Plan house tests (one test per house with different target level)
        if (houseTargetLevels && character.houseRooms) {
          Object.entries(character.houseRooms).forEach(([roomHrid, currentLevel]) => {
            const targetLevel = houseTargetLevels[roomHrid];
            if (targetLevel !== undefined && targetLevel !== currentLevel) {
              const roomName = roomHrid.replace('/house_rooms/', '').replace(/_/g, ' ');
              houseTestPlan.push({
                roomHrid,
                currentLevel,
                targetLevel,
                roomName
              });
              totalSimulations++; // One test per house
              console.log(`🏠 ${roomName}: Testing level ${currentLevel} → ${targetLevel}`);
            }
          });
        }

        // Send equipment info
        safeEnqueue({
          type: 'equipment_info',
          testPlan,
          totalSimulations
        });

        // Launch Puppeteer browser using environment-appropriate configuration
        const browser = await launchBrowserForEnvironment();

        const page = await browser.newPage();

        // Set viewport based on environment
        if (isLocal) {
          console.log('🐛 LOCAL DEBUG: Using full screen viewport for better visibility');

          // Force browser window to be visible by bringing it to front
          try {
            await page.bringToFront();
            console.log('🔝 Brought browser window to front');
          } catch (error) {
            console.log('⚠️ Could not bring browser to front:', error);
          }

          // Test that the browser is actually visible by taking a screenshot
          try {
            console.log('📸 Taking test screenshot to verify browser visibility...');
            await page.goto('data:text/html,<h1>Test - Browser is working!</h1>');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
            console.log('✅ Browser should be visible now with test page');
          } catch (error) {
            console.log('❌ Browser visibility test failed:', error);
          }
        } else {
          await page.setViewport({ width: 1920, height: 1080 });
        }

        try {
          // Navigate to combat simulator
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Navigating to combat simulator...',
            progress: 5
          })}\n\n`));

          if (isLocal) {
            console.log('🌐 LOCAL DEBUG: Navigating to combat simulator...');
          }

          await page.goto('https://shykai.github.io/MWICombatSimulatorTest/dist/', {
            waitUntil: 'networkidle2',
            timeout: 90000
          });

          if (isLocal) {
            console.log('✅ LOCAL DEBUG: Combat simulator loaded successfully');
            console.log('⏸️ LOCAL DEBUG: Taking a pause to let you see the page...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

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

          // Extract total items for each combat slot after character import
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Reading total items for each combat slot...',
            progress: 17
          })}\n\n`));

          const combatSlotItems = await extractCombatSlotItems(page);

          // Run baseline simulation
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Running baseline simulation...',
            progress: 20
          })}\n\n`));

          const baselineResults = await runSingleSimulation(page, targetZone, targetTier);

          safeEnqueue({
            type: 'baseline_complete',
            baselineResults: baselineResults,
            combatSlotItems: combatSlotItems
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
                // Set equipment item if there's an override for this slot
                if (equipmentOverrides && equipmentOverrides[plan.slot]) {
                  console.log(`🔄 Testing with equipment override for ${plan.slot}: ${equipmentOverrides[plan.slot]}`);

                  // Create modified character data with the new item
                  if (rawCharacterData) {
                    try {
                      const parsedData = JSON.parse(rawCharacterData);
                      const equipmentArray = parsedData.player?.equipment || [];

                      // Map the slot name for the equipment location
                      const lookupSlot = plan.slot === 'weapon' ? 'main_hand' : plan.slot;
                      const itemLocationHrid = `/item_locations/${lookupSlot}`;

                      // Create a copy of the equipment array
                      const modifiedEquipment = equipmentArray.map((item: { itemLocationHrid: string; itemHrid: string; enhancementLevel: number }) => {
                        if (item.itemLocationHrid === itemLocationHrid) {
                          return {
                            ...item,
                            itemHrid: equipmentOverrides[plan.slot],
                            enhancementLevel: testLevel
                          };
                        }
                        return item;
                      });

                      // If item doesn't exist, add it
                      if (!modifiedEquipment.find((item: { itemLocationHrid: string; itemHrid: string; enhancementLevel: number }) => item.itemLocationHrid === itemLocationHrid)) {
                        modifiedEquipment.push({
                          itemLocationHrid,
                          itemHrid: equipmentOverrides[plan.slot],
                          enhancementLevel: testLevel
                        });
                      }

                      const modifiedCharacterData = JSON.stringify({
                        ...parsedData,
                        player: {
                          ...parsedData.player,
                          equipment: modifiedEquipment
                        }
                      });

                      console.log(`📝 Re-importing character data with new equipment for test`);
                      await importCharacterData(page, modifiedCharacterData);
                    } catch (error) {
                      console.error('❌ Failed to create modified character data:', error);
                    }
                  } else {
                    // Fallback to the old method if no raw character data
                    await updateEquipmentSelection(page, plan.slot, equipmentOverrides[plan.slot]);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                  }
                } else {
                  // Update enhancement level field for regular tests
                  await updateEnhancementField(page, plan.slot, testLevel);
                }

                // Run simulation (abilities stay at baseline for equipment tests)
                const testResult = await runSingleSimulation(page, targetZone, targetTier);

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
                  paybackDays: paybackDays === Infinity ? undefined : paybackDays,
                  itemName: plan.itemName,
                  itemHrid: plan.itemHrid
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

                // Reset to baseline character data if we used an equipment override
                if (equipmentOverrides && equipmentOverrides[plan.slot] && rawCharacterData) {
                  console.log(`🔄 Resetting to baseline character data after equipment override test`);
                  await importCharacterData(page, rawCharacterData);
                } else {
                  // Reset enhancement level for regular tests
                  await updateEnhancementField(page, plan.slot, plan.currentLevel);
                }

              } catch (error) {
                console.error(`❌ Failed to test ${plan.slot} +${testLevel}:`, error);

                const failedTest: UpgradeTestResult = {
                  slot: plan.slot,
                  currentEnhancement: plan.currentLevel,
                  testEnhancement: testLevel,
                  experienceGain: 0,
                  profitPerDay: 0,
                  success: false,
                  itemName: plan.itemName,
                  itemHrid: plan.itemHrid
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

          // Test each ability upgrade individually
          for (const abilityPlan of abilityTestPlan) {
            const progress = 20 + ((simulationCount / totalSimulations) * 75);

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'test_starting',
              slot: 'ability',
              testLevel: abilityPlan.targetLevel,
              currentLevel: abilityPlan.currentLevel,
              progress,
              simulationCount,
              totalSimulations,
              abilityName: abilityPlan.abilityName
            })}\n\n`));

            try {
              // Set only this specific ability to its target level, reset all others to baseline
              await setAbilityLevels(page, character, abilityTargetLevels, abilityPlan.abilityHrid);

              // Run simulation
              const testResult = await runSingleSimulation(page, targetZone, targetTier);

              // Calculate ability upgrade cost and payback period
              const abilityCostInfo = await calculateAbilityCost(abilityPlan.abilityHrid, abilityPlan.currentLevel, abilityPlan.targetLevel);
              const profitIncreasePerDay = testResult.profitPerDay - baselineResults.profitPerDay;
              const expIncreasePerHour = testResult.experienceGain - baselineResults.experienceGain;
              const paybackDays = abilityCostInfo.totalCost > 0 && profitIncreasePerDay > 0 ? Math.ceil(abilityCostInfo.totalCost / profitIncreasePerDay) : (abilityCostInfo.totalCost > 0 ? Infinity : 0);

              console.log(`🧠 Ability Test for ${abilityPlan.abilityName} (${abilityPlan.currentLevel} → ${abilityPlan.targetLevel}):`);
              console.log(`  - Baseline Experience Per Hour: ${baselineResults.experienceGain.toLocaleString()}`);
              console.log(`  - Test Result Experience Per Hour: ${testResult.experienceGain.toLocaleString()}`);
              console.log(`  - Experience Increase Per Hour: ${expIncreasePerHour.toLocaleString()}`);
              console.log(`  - Baseline Profit Per Day: ${baselineResults.profitPerDay.toLocaleString()}`);
              console.log(`  - Test Result Profit Per Day: ${testResult.profitPerDay.toLocaleString()}`);
              console.log(`  - Profit Increase Per Day: ${profitIncreasePerDay.toLocaleString()}`);
              console.log(`  - Ability Upgrade Cost: ${abilityCostInfo.totalCost.toLocaleString()}c (${abilityCostInfo.booksRequired} books at ${abilityCostInfo.costPerBook.toLocaleString()}c each)`);
              console.log(`  - Payback Days: ${paybackDays === Infinity ? 'Never (no profit increase)' : paybackDays.toLocaleString()}`);
              if (paybackDays !== Infinity && paybackDays !== 0) {
                console.log(`  - Math: ${abilityCostInfo.totalCost.toLocaleString()} cost ÷ ${profitIncreasePerDay.toLocaleString()} profit/day = ${(abilityCostInfo.totalCost / profitIncreasePerDay).toFixed(2)} days`);
              }

              const abilityUpgradeTest: UpgradeTestResult = {
                slot: `ability_${abilityPlan.abilityHrid}`,
                currentEnhancement: abilityPlan.currentLevel,
                testEnhancement: abilityPlan.targetLevel,
                experienceGain: testResult.experienceGain,
                profitPerDay: testResult.profitPerDay,
                success: true,
                enhancementCost: abilityCostInfo.totalCost,
                profitIncrease: profitIncreasePerDay,
                paybackDays: paybackDays === Infinity ? undefined : paybackDays,
                abilityName: abilityPlan.abilityName,
                booksRequired: abilityCostInfo.booksRequired,
                costPerBook: abilityCostInfo.costPerBook,
                bookName: abilityCostInfo.bookName
              };

              upgradeTests.push(abilityUpgradeTest);

              // Send individual test result immediately
              safeEnqueue({
                type: 'test_complete',
                result: abilityUpgradeTest,
                progress,
                simulationCount,
                totalSimulations,
                expIncrease: expIncreasePerHour,
                profitIncrease: profitIncreasePerDay,
                enhancementCost: abilityCostInfo.totalCost,
                paybackDays: paybackDays === Infinity ? undefined : paybackDays,
                abilityName: abilityPlan.abilityName,
                booksRequired: abilityCostInfo.booksRequired,
                costPerBook: abilityCostInfo.costPerBook,
                bookName: abilityCostInfo.bookName
              });

              // Reset ability to baseline level for next test
              await setAbilityLevels(page, character, {});

            } catch (error) {
              console.error(`❌ Failed to test ability ${abilityPlan.abilityName}:`, error);

              const failedAbilityTest: UpgradeTestResult = {
                slot: `ability_${abilityPlan.abilityHrid}`,
                currentEnhancement: abilityPlan.currentLevel,
                testEnhancement: abilityPlan.targetLevel,
                experienceGain: 0,
                profitPerDay: 0,
                success: false
              };

              upgradeTests.push(failedAbilityTest);

              safeEnqueue({
                type: 'test_failed',
                result: failedAbilityTest,
                error: error instanceof Error ? error.message : 'Unknown error',
                progress,
                simulationCount,
                totalSimulations,
                abilityName: abilityPlan.abilityName
              });
            }

            simulationCount++;
          }

          // Test each house upgrade individually
          for (const housePlan of houseTestPlan) {
            const progress = 20 + ((simulationCount / totalSimulations) * 75);

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'test_starting',
              slot: 'house',
              testLevel: housePlan.targetLevel,
              currentLevel: housePlan.currentLevel,
              progress,
              simulationCount,
              totalSimulations,
              roomName: housePlan.roomName
            })}\n\n`));

            try {
              // Set only this specific house to its target level, reset all others to baseline
              const singleHouseTest = { [housePlan.roomHrid]: housePlan.targetLevel };
              await setHouseLevels(page, character, singleHouseTest, housePlan.roomHrid);

              // Run simulation
              const testResult = await runSingleSimulation(page, targetZone, targetTier);

              // Calculate actual house upgrade cost (coins + materials from marketplace)
              const houseCost = await calculateHouseCost(housePlan.roomHrid, housePlan.currentLevel, housePlan.targetLevel);
              const profitIncreasePerDay = testResult.profitPerDay - baselineResults.profitPerDay;
              const expIncreasePerHour = testResult.experienceGain - baselineResults.experienceGain;
              const paybackDays = houseCost > 0 && profitIncreasePerDay > 0 ? Math.ceil(houseCost / profitIncreasePerDay) : (houseCost > 0 ? Infinity : 0);

              console.log(`🏠 House Test for ${housePlan.roomName} (${housePlan.currentLevel} → ${housePlan.targetLevel}):`);
              console.log(`  - Baseline Experience Per Hour: ${baselineResults.experienceGain.toLocaleString()}`);
              console.log(`  - Test Result Experience Per Hour: ${testResult.experienceGain.toLocaleString()}`);
              console.log(`  - Experience Increase Per Hour: ${expIncreasePerHour.toLocaleString()}`);
              console.log(`  - Baseline Profit Per Day: ${baselineResults.profitPerDay.toLocaleString()}`);
              console.log(`  - Test Result Profit Per Day: ${testResult.profitPerDay.toLocaleString()}`);
              console.log(`  - Profit Increase Per Day: ${profitIncreasePerDay.toLocaleString()}`);
              console.log(`  - House Upgrade Cost: ${houseCost.toLocaleString()}c (coins + materials from marketplace)`);
              console.log(`  - Payback Days: ${paybackDays === Infinity ? 'Never (no profit increase)' : paybackDays.toLocaleString()}`);
              if (paybackDays !== Infinity && paybackDays !== 0) {
                console.log(`  - Math: ${houseCost.toLocaleString()} cost ÷ ${profitIncreasePerDay.toLocaleString()} profit/day = ${(houseCost / profitIncreasePerDay).toFixed(2)} days`);
              }

              const houseUpgradeTest: UpgradeTestResult = {
                slot: `house_${housePlan.roomHrid}`,
                currentEnhancement: housePlan.currentLevel,
                testEnhancement: housePlan.targetLevel,
                experienceGain: testResult.experienceGain,
                profitPerDay: testResult.profitPerDay,
                success: true,
                enhancementCost: houseCost,
                profitIncrease: profitIncreasePerDay,
                paybackDays: paybackDays === Infinity ? undefined : paybackDays,
                roomName: housePlan.roomName
              };

              upgradeTests.push(houseUpgradeTest);

              // Send individual test result immediately
              safeEnqueue({
                type: 'test_complete',
                result: houseUpgradeTest,
                progress,
                simulationCount,
                totalSimulations,
                expIncrease: expIncreasePerHour,
                profitIncrease: profitIncreasePerDay,
                enhancementCost: houseCost,
                paybackDays: paybackDays === Infinity ? undefined : paybackDays,
                roomName: housePlan.roomName
              });

              // Reset house to baseline level for next test
              await setHouseLevels(page, character, {});

            } catch (error) {
              console.error(`❌ Failed to test house ${housePlan.roomName}:`, error);

              const failedHouseTest: UpgradeTestResult = {
                slot: `house_${housePlan.roomHrid}`,
                currentEnhancement: housePlan.currentLevel,
                testEnhancement: housePlan.targetLevel,
                experienceGain: 0,
                profitPerDay: 0,
                success: false
              };

              upgradeTests.push(failedHouseTest);

              safeEnqueue({
                type: 'test_failed',
                result: failedHouseTest,
                error: error instanceof Error ? error.message : 'Unknown error',
                progress,
                simulationCount,
                totalSimulations,
                roomName: housePlan.roomName
              });
            }

            simulationCount++;
          }

          // Calculate and send final recommendations
          const recommendations = calculateRecommendations(baselineResults, upgradeTests, optimizeFor);

          // Split recommendations by type
          const equipmentRecommendations = recommendations.filter(rec => !rec.slot.startsWith('ability_') && !rec.slot.startsWith('house_')).map(rec => ({
            slot: rec.slot,
            currentLevel: rec.currentEnhancement,
            recommendedLevel: rec.recommendedEnhancement,
            profitIncrease: rec.profitIncrease,
            experienceIncrease: rec.experienceIncrease,
            percentageIncrease: rec.percentageIncrease,
            enhancementCost: rec.enhancementCost,
            paybackDays: rec.paybackDays,
            itemName: (rec as Record<string, unknown>).itemName as string | undefined,
            itemHrid: (rec as Record<string, unknown>).itemHrid as string | undefined
          }));
          const abilityRecommendations = recommendations.filter(rec => rec.slot.startsWith('ability_')).map(rec => {
            // Extract the original abilityHrid from the slot name
            const abilityHrid = rec.slot.replace('ability_', '');
            console.log(`🔄 Creating ability recommendation - slot: ${rec.slot}, abilityHrid: ${abilityHrid}`);

            return {
              abilityHrid: abilityHrid,
              abilityName: rec.abilityName || 'Unknown Ability',
              currentLevel: rec.currentEnhancement,
              recommendedLevel: rec.recommendedEnhancement,
              profitIncrease: rec.profitIncrease,
              experienceIncrease: rec.experienceIncrease,
              percentageIncrease: rec.percentageIncrease,
              enhancementCost: rec.enhancementCost,
              paybackDays: rec.paybackDays,
              booksRequired: rec.booksRequired,
              costPerBook: rec.costPerBook,
              bookName: rec.bookName
            };
          });
          const houseRecommendations = recommendations.filter(rec => rec.slot.startsWith('house_')).map(rec => ({
            roomHrid: rec.slot.replace('house_', ''),
            roomName: rec.roomName || 'Unknown Room',
            currentLevel: rec.currentEnhancement,
            recommendedLevel: rec.recommendedEnhancement,
            profitIncrease: rec.profitIncrease,
            experienceIncrease: rec.experienceIncrease,
            percentageIncrease: rec.percentageIncrease,
            enhancementCost: rec.enhancementCost,
            paybackDays: rec.paybackDays
          }));

          console.log(`🎯 Final ability recommendations count: ${abilityRecommendations.length}`);
          abilityRecommendations.forEach(rec => console.log(`   - ${rec.abilityHrid}: ${rec.abilityName}`));

          // Split upgradeTests into equipment, ability and house test results for frontend processing
          const equipmentTests = upgradeTests.filter(test => !test.slot.startsWith('ability_') && !test.slot.startsWith('house_')).map(test => ({
            slot: test.slot,
            currentLevel: test.currentEnhancement,
            testLevel: test.testEnhancement,
            profitPerDay: test.profitPerDay,
            experienceGain: test.experienceGain,
            enhancementCost: test.enhancementCost,
            paybackDays: test.paybackDays,
            itemName: test.itemName,
            itemHrid: test.itemHrid
          }));

          const abilityTests = upgradeTests.filter(test => test.slot.startsWith('ability_')).map(test => ({
            abilityHrid: test.slot.replace('ability_', ''),
            abilityName: test.abilityName || 'Unknown Ability',
            currentLevel: test.currentEnhancement,
            testLevel: test.testEnhancement,
            profitPerDay: test.profitPerDay,
            experienceGain: test.experienceGain
          }));

          const houseTests = upgradeTests.filter(test => test.slot.startsWith('house_')).map(test => ({
            roomHrid: test.slot.replace('house_', ''),
            roomName: test.roomName || 'Unknown Room',
            currentLevel: test.currentEnhancement,
            testLevel: test.testEnhancement,
            profitPerDay: test.profitPerDay,
            experienceGain: test.experienceGain
          }));

          console.log(`🎯 Final equipment tests count: ${equipmentTests.length}`);
          console.log(`🎯 Final ability tests count: ${abilityTests.length}`);
          console.log(`🎯 Final house tests count: ${houseTests.length}`);

          safeEnqueue({
            type: 'simulation_complete',
            baselineResults,
            upgradeTests,
            recommendations: equipmentRecommendations,
            abilityRecommendations,
            houseRecommendations,
            equipmentTests,
            abilityTests,
            houseTests,
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

async function updateEquipmentSelection(page: Page, slot: string, itemHrid: string) {
  return await page.evaluate((slot, itemHrid) => {
    const equipmentSelectId = `#selectEquipment_${slot}`;
    const equipmentSelect = document.querySelector(equipmentSelectId) as HTMLSelectElement;

    if (equipmentSelect) {
      console.log(`🔄 Setting equipment for ${slot} to: ${itemHrid}`);

      // Set the value
      equipmentSelect.value = itemHrid;

      // Dispatch comprehensive events to ensure the change is recognized
      equipmentSelect.dispatchEvent(new Event('input', { bubbles: true }));
      equipmentSelect.dispatchEvent(new Event('change', { bubbles: true }));
      equipmentSelect.dispatchEvent(new Event('blur', { bubbles: true }));

      // Also try focus/focusout events in case they're needed
      equipmentSelect.dispatchEvent(new Event('focus', { bubbles: true }));
      equipmentSelect.dispatchEvent(new Event('focusout', { bubbles: true }));

      // Trigger any custom events the simulator might be listening for
      equipmentSelect.dispatchEvent(new CustomEvent('equipment-changed', {
        bubbles: true,
        detail: { slot, itemHrid }
      }));

      console.log(`✅ Equipment set for ${slot}: ${equipmentSelect.value}`);
      return true;
    } else {
      console.log(`❌ Equipment selector not found: ${equipmentSelectId}`);
    }
    return false;
  }, slot, itemHrid);
}

async function setAbilityLevels(page: Page, character: CharacterStats, abilityTargetLevels?: { [abilityHrid: string]: number }, testOnlyAbilityHrid?: string) {
  if (!character.abilities || !abilityTargetLevels) {
    console.log('⚙️ No ability levels to set - skipping ability configuration');
    return;
  }

  if (testOnlyAbilityHrid) {
    console.log(`⚙️ Setting ability level for single ability test: ${testOnlyAbilityHrid}`);
  } else {
    console.log('⚙️ Setting ability levels for upgrade simulation...');
  }

  // Add extra wait time for local debugging
  if (isLocal) {
    console.log('🐛 LOCAL DEBUG: Adding extra wait time before setting abilities...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return await page.evaluate((abilities, targetLevels, testOnlyAbility) => {
    let successCount = 0;
    let failureCount = 0;

    abilities.forEach((ability, index) => {
      const targetLevel = targetLevels[ability.abilityHrid];

      // If we're testing only one ability, only set that one
      if (testOnlyAbility && ability.abilityHrid !== testOnlyAbility) {
        // Reset all other abilities to their original level
        const abilityFieldId = `#inputAbilityLevel_${index}`;
        const abilityField = document.querySelector(abilityFieldId) as HTMLInputElement;
        if (abilityField) {
          abilityField.value = ability.level.toString();
          abilityField.dispatchEvent(new Event('input', { bubbles: true }));
          abilityField.dispatchEvent(new Event('change', { bubbles: true }));
          abilityField.dispatchEvent(new Event('blur', { bubbles: true }));
        }
        return;
      }

      // If we're testing only one ability and this is it, OR if we're not testing only one ability
      if (targetLevel !== undefined && targetLevel !== ability.level) {
        const abilityFieldId = `#inputAbilityLevel_${index}`;
        const abilityField = document.querySelector(abilityFieldId) as HTMLInputElement;

        if (abilityField) {
          console.log(`  ✅ Setting ${ability.abilityHrid} (index ${index}) from ${ability.level} to ${targetLevel}`);
          abilityField.value = targetLevel.toString();
          abilityField.dispatchEvent(new Event('input', { bubbles: true }));
          abilityField.dispatchEvent(new Event('change', { bubbles: true }));
          abilityField.dispatchEvent(new Event('blur', { bubbles: true }));
          successCount++;
        } else {
          console.log(`  ❌ Ability field not found: ${abilityFieldId} for ${ability.abilityHrid}`);
          failureCount++;
        }
      } else if (!testOnlyAbility) {
        console.log(`  ⚡ ${ability.abilityHrid} (index ${index}): No change needed (staying at ${ability.level})`);
      }
    });

    console.log(`⚙️ Ability level setting complete: ${successCount} successful, ${failureCount} failed`);
    return { successCount, failureCount };
  }, character.abilities, abilityTargetLevels, testOnlyAbilityHrid);
}

async function setHouseLevels(page: Page, character: CharacterStats, houseTargetLevels?: { [roomHrid: string]: number }, testOnlyRoomHrid?: string) {
  if (!character.houseRooms || !houseTargetLevels) {
    console.log('🏠 No house levels to set - skipping house configuration');
    return;
  }

  if (testOnlyRoomHrid) {
    console.log(`🏠 Setting house level for single house test: ${testOnlyRoomHrid}`);
  } else {
    console.log('🏠 Setting house levels for upgrade simulation...');
  }

  // Add extra wait time for local debugging
  if (isLocal) {
    console.log('🐛 LOCAL DEBUG: Adding extra wait time before opening house modal...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Open house rooms modal
  await page.evaluate(() => {
    const houseButton = document.querySelector('#buttonHouseRoomsModal') as HTMLElement;
    if (houseButton) {
      houseButton.click();
      console.log('✅ Opened house rooms modal');
    } else {
      console.log('❌ House rooms modal button not found');
    }
  });

  // Wait for modal to open (longer wait for local debugging)
  const modalWaitTime = isLocal ? 3000 : 1000;
  console.log(`⏱️ Waiting ${modalWaitTime}ms for house modal to open...`);
  await new Promise(resolve => setTimeout(resolve, modalWaitTime));

  return await page.evaluate((houseRooms, targetLevels, testOnlyRoom) => {
    let successCount = 0;
    let failureCount = 0;

    Object.entries(houseRooms).forEach(([roomHrid, currentLevel]) => {
      const targetLevel = targetLevels[roomHrid];

      // If we're testing only one house, only set that one
      if (testOnlyRoom && roomHrid !== testOnlyRoom) {
        // Reset all other houses to their original level
        const houseInput = document.querySelector(`input[data-house-hrid="${roomHrid}"]`) as HTMLInputElement;
        if (houseInput) {
          houseInput.value = currentLevel.toString();
          houseInput.dispatchEvent(new Event('input', { bubbles: true }));
          houseInput.dispatchEvent(new Event('change', { bubbles: true }));
          houseInput.dispatchEvent(new Event('blur', { bubbles: true }));
        }
        return;
      }

      // If we're testing only one house and this is it, OR if we're not testing only one house
      if (targetLevel !== undefined && targetLevel !== currentLevel) {
        const houseInput = document.querySelector(`input[data-house-hrid="${roomHrid}"]`) as HTMLInputElement;

        if (houseInput) {
          const roomName = roomHrid.replace('/house_rooms/', '').replace(/_/g, ' ');
          console.log(`  ✅ Setting ${roomName} from level ${currentLevel} to ${targetLevel}`);
          houseInput.value = targetLevel.toString();
          houseInput.dispatchEvent(new Event('input', { bubbles: true }));
          houseInput.dispatchEvent(new Event('change', { bubbles: true }));
          houseInput.dispatchEvent(new Event('blur', { bubbles: true }));
          successCount++;
        } else {
          console.log(`  ❌ House input not found for ${roomHrid}`);
          failureCount++;
        }
      } else if (!testOnlyRoom) {
        const roomName = roomHrid.replace('/house_rooms/', '').replace(/_/g, ' ');
        console.log(`  ⚡ ${roomName}: No change needed (staying at level ${currentLevel})`);
      }
    });

    console.log(`🏠 House level setting complete: ${successCount} successful, ${failureCount} failed`);
    return { successCount, failureCount };
  }, character.houseRooms, houseTargetLevels, testOnlyRoomHrid).then(async (result) => {
    // Close the house rooms modal
    await page.evaluate(() => {
      const closeButton = document.querySelector('#houseRoomsModal .btn-close') as HTMLElement;
      if (closeButton) {
        closeButton.click();
        console.log('🚪 Closed house rooms modal');
      } else {
        console.log('❌ House rooms modal close button not found');
      }
    });

    // Wait for modal to close (longer wait for local debugging)
    const closeWaitTime = isLocal ? 3000 : 1000;
    console.log(`⏱️ Waiting ${closeWaitTime}ms for house modal to close...`);
    await new Promise(resolve => setTimeout(resolve, closeWaitTime));

    return result;
  });
}

// Extract total available items for each combat slot from combat simulator
async function extractCombatSlotItems(page: Page) {
  console.log('📋 Extracting total available items for each combat slot...');

  const combatSlotItems = await page.evaluate(() => {
    const COMBAT_SLOTS = ['head', 'neck', 'earrings', 'body', 'legs', 'feet', 'hands', 'ring', 'weapon', 'off_hand', 'pouch'];
    const slotItems: { [slot: string]: Array<{ itemHrid: string; itemName: string; }> } = {};

    COMBAT_SLOTS.forEach(slot => {
      const selectId = `#selectEquipment_${slot}`;
      const selectElement = document.querySelector(selectId) as HTMLSelectElement;

      console.log(`🔍 Reading all items for slot: ${slot} (${selectId})`);

      if (selectElement) {
        const items = Array.from(selectElement.options)
          .filter(opt => opt.value !== '') // Exclude "Empty" option
          .map(opt => ({
            itemHrid: opt.value,
            itemName: opt.text
          }));

        slotItems[slot] = items;
        console.log(`  ✅ Found ${items.length} items for ${slot}`);
      } else {
        console.log(`  ❌ Select element not found for ${slot}: ${selectId}`);
        slotItems[slot] = [];
      }
    });

    return slotItems;
  });

  // Log all items found for each slot
  console.log('🎯 TOTAL COMBAT SLOT ITEMS EXTRACTED:');
  Object.entries(combatSlotItems).forEach(([slot, items]) => {
    console.log(`  📦 ${slot.toUpperCase()}: ${items.length} total items available`);
    items.forEach((item, index) => {
      console.log(`     [${index + 1}] ${item.itemHrid} - "${item.itemName}"`);
    });
    console.log(''); // Empty line for readability
  });

  console.log('✅ Combat slot items extraction completed');
  console.log(`📊 SUMMARY: Total items found across all slots: ${Object.values(combatSlotItems).reduce((total, items) => total + items.length, 0)}`);

  return combatSlotItems;
}

async function runSingleSimulation(page: Page, targetZone: string, targetTier?: string) {
  if (isLocal) {
    console.log(`🎯 LOCAL DEBUG: Setting zone to ${targetZone} and running simulation...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await page.evaluate((targetZone, targetTier) => {
    const selectZone = document.querySelector('#selectZone') as HTMLSelectElement;
    if (selectZone) {
      console.log(`🎯 Setting combat zone to: ${targetZone}`);
      selectZone.value = targetZone;
      selectZone.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      console.log('❌ Zone selector not found');
    }

    // Set difficulty tier to the selected value (default to tier_1 if not provided)
    const selectDifficulty = document.querySelector('#selectDifficulty') as HTMLSelectElement;
    if (selectDifficulty) {
      const tierValue = targetTier || 'tier_1';
      console.log(`🎯 Setting combat difficulty to: ${tierValue}`);
      selectDifficulty.value = tierValue;
      selectDifficulty.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      console.log('❌ Difficulty selector not found');
    }

    const player1Element = document.querySelector('#player1') as HTMLInputElement;
    if (player1Element) {
      console.log('✅ Enabling player 1 checkbox');
      player1Element.checked = true;
      player1Element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      console.log('❌ Player 1 checkbox not found');
    }
  }, targetZone, targetTier);

  await new Promise(resolve => setTimeout(resolve, 500));

  await page.evaluate(() => {
    const startButton = document.querySelector('#buttonStartSimulation') as HTMLElement;
    if (startButton) {
      console.log('🚀 Starting combat simulation...');
      startButton.click();
    } else {
      console.log('❌ Start simulation button not found');
    }
  });

  // Wait for simulation to complete (longer for local debugging)
  const simulationWaitTime = isLocal ? 15000 : 10000;
  console.log(`⏱️ Waiting ${simulationWaitTime}ms for simulation to complete...`);
  await new Promise(resolve => setTimeout(resolve, simulationWaitTime));

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
    booksRequired?: number;
    costPerBook?: number;
    bookName?: string;
    abilityName?: string;
    roomName?: string;
    itemName?: string;
    itemHrid?: string;
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

    if (bestTest) {
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
        paybackDays: (bestTest as UpgradeTestResult).paybackDays,
        booksRequired: (bestTest as UpgradeTestResult).booksRequired,
        costPerBook: (bestTest as UpgradeTestResult).costPerBook,
        bookName: (bestTest as UpgradeTestResult).bookName,
        abilityName: (bestTest as UpgradeTestResult).abilityName,
        roomName: (bestTest as UpgradeTestResult).roomName,
        itemName: (bestTest as UpgradeTestResult).itemName,
        itemHrid: (bestTest as UpgradeTestResult).itemHrid
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