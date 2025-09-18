import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { CharacterStats } from '@/types/character';

export interface CombatSimulationResult {
  killsPerHour: number;
  expPerHour: number;
  profitPerHour: number;
  revenuePerHour: number;
  zone: string;
  success: boolean;
  error?: string;
}

interface SimulationRequest {
  character: CharacterStats;
  equipmentOverride?: { [slot: string]: { item: string; enhancement: number } };
  rawCharacterData?: string; // Add the original import string
}

export async function POST(request: NextRequest) {
  try {
    const { character, equipmentOverride, rawCharacterData }: SimulationRequest = await request.json();

    console.log('Starting combat simulation for character:', character);

    // Launch Puppeteer browser (HEADLESS for production)
    const browser = await puppeteer.launch({
      headless: true,  // Hide browser for production use
      slowMo: 100,     // Minimal slowdown for reliability
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--window-size=1280,720' // Set a reasonable window size
      ]
    });

    const page = await browser.newPage();

    // Set browser viewport to 1920x1080 for consistent table rendering
    await page.setViewport({ width: 1920, height: 1080 });

    try {
      // Navigate to the combat simulator
      console.log('Navigating to combat simulator...');
      await page.goto('https://shykai.github.io/MWICombatSimulatorTest/dist/', {
        waitUntil: 'networkidle2',
        timeout: 90000
      });

      console.log('Page loaded, using native import functionality...');

      // Step 1: Use the built-in import system instead of manual configuration
      console.log('📥 Opening Import/Export modal...');

      // Step 1a: Click Import/Export button
      const importExportResult = await page.evaluate(() => {
        const importExportButton = document.querySelector('#buttonImportExport') as HTMLElement;
        if (importExportButton) {
          importExportButton.click();
          return { success: true };
        }
        return { success: false };
      });

      if (!importExportResult.success) {
        throw new Error('Import/Export button not found');
      }

      console.log('📥 Import/Export modal opened');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for modal

      // Step 1b: Click solo-tab
      const soloTabResult = await page.evaluate(() => {
        const soloTab = document.querySelector('#solo-tab') as HTMLElement;
        if (soloTab) {
          soloTab.click();
          return { success: true };
        }
        return { success: false };
      });

      if (!soloTabResult.success) {
        throw new Error('Solo tab not found');
      }

      console.log('📝 Solo tab clicked');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for tab to load

      // Step 1c: Paste import data into the Solo input field
      const pasteResult = await page.evaluate((importData) => {
        // Target the specific Solo input field
        const soloInput = document.querySelector('#inputSetSolo') as HTMLInputElement;

        if (!soloInput) {
          // Fallback debugging if the specific field isn't found
          const allInputs = Array.from(document.querySelectorAll('input'));
          console.log('🔍 #inputSetSolo not found. All available inputs:', allInputs.map(inp => ({
            id: inp.id,
            type: inp.type,
            className: inp.className,
            placeholder: inp.placeholder
          })));

          return {
            success: false,
            error: '#inputSetSolo not found',
            debug: {
              inputs: allInputs.map(inp => ({ id: inp.id, type: inp.type, className: inp.className, placeholder: inp.placeholder }))
            }
          };
        }

        console.log('✅ Found Solo input field:', {
          id: soloInput.id,
          type: soloInput.type,
          className: soloInput.className,
          placeholder: soloInput.placeholder
        });

        // Clear and set the import data
        soloInput.value = '';
        soloInput.focus();
        soloInput.value = importData;

        // Trigger events to ensure the value is recognized
        soloInput.dispatchEvent(new Event('input', { bubbles: true }));
        soloInput.dispatchEvent(new Event('change', { bubbles: true }));
        soloInput.dispatchEvent(new Event('blur', { bubbles: true }));

        console.log(`📋 Import data pasted into #inputSetSolo (${importData.length} characters)`);

        return { success: true, length: importData.length, fieldInfo: { id: soloInput.id, type: soloInput.type } };
      }, rawCharacterData || JSON.stringify(character));

      if (!pasteResult.success) {
        console.error('Import field debugging info:', pasteResult.debug);
        throw new Error('Failed to paste import data: ' + pasteResult.error);
      }

      console.log(`📋 Import data pasted (${pasteResult.length} characters)`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 1d: Click the specific Import button
      const importButtonResult = await page.evaluate(() => {
        // Target the specific import button for the Solo tab
        const importButton = document.querySelector('#buttonImportSet') as HTMLElement;

        if (!importButton) {
          // Fallback debugging if the specific button isn't found
          const allButtons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
          console.log('🔍 #buttonImportSet not found. All available buttons:', allButtons.map(btn => ({
            id: btn.id,
            className: btn.className,
            textContent: btn.textContent?.trim(),
            type: (btn as HTMLInputElement).type,
            value: (btn as HTMLInputElement).value
          })));

          return {
            success: false,
            debug: {
              buttons: allButtons.map(btn => ({
                id: btn.id,
                className: btn.className,
                textContent: btn.textContent?.trim()
              }))
            }
          };
        }

        console.log('✅ Found Import Set button:', {
          id: importButton.id,
          className: importButton.className,
          textContent: importButton.textContent?.trim()
        });

        importButton.click();
        console.log('🚀 Import Set button clicked (#buttonImportSet)');

        return { success: true };
      });

      if (!importButtonResult.success) {
        console.error('Import button debugging info:', importButtonResult.debug);
        throw new Error('Import button (#buttonImportSet) not found');
      }

      console.log('✅ Import button clicked');

      // Wait for import to complete
      console.log('⏳ Waiting for import to complete...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 1e: Close the import/export modal
      console.log('🔒 Closing import/export modal...');
      const closeModalResult = await page.evaluate(() => {
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

      if (!closeModalResult.success) {
        console.error('Close button debugging info:', closeModalResult.debug);
        throw new Error('Import/Export modal close button not found');
      }

      console.log('✅ Import/Export modal closed successfully');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for modal to close

      console.log('✅ Native import completed successfully');

      // Step 3: Click #buttonGetPrices to load marketplace data
      console.log('💰 Loading marketplace data...');
      const getPricesResult = await page.evaluate(() => {
        const getPricesButton = document.querySelector('#buttonGetPrices') as HTMLElement;
        if (getPricesButton) {
          getPricesButton.click();
          return { success: true };
        }
        return { success: false };
      });

      if (!getPricesResult.success) {
        console.warn('⚠️ #buttonGetPrices not found - marketplace data may not be loaded');
      } else {
        console.log('✅ Marketplace data loading initiated');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for prices to load
      }

      // Step 4: Click the "Start Simulation" button
      console.log('Clicking Start Simulation button...');
      const startSimulationResult = await page.evaluate(() => {
        const startButton = document.querySelector('#buttonSimulationSetup') as HTMLElement;
        if (startButton) {
          startButton.click();
          return { clicked: true, button: 'buttonSimulationSetup' };
        }

        // Fallback to searching by text content
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
        const simButton = buttons.find(btn =>
          btn.textContent?.toLowerCase().includes('start simulation') ||
          btn.textContent?.toLowerCase().includes('simulate')
        ) as HTMLElement;

        if (simButton) {
          simButton.click();
          return { clicked: true, button: simButton.textContent || 'text-based' };
        }

        return { clicked: false, button: null };
      });

      if (!startSimulationResult.clicked) {
        throw new Error('Start Simulation button not found');
      }

      console.log(`Start Simulation button clicked: ${startSimulationResult.button}`);

      // Step 4: Wait for modal to appear and select "Sim All Zones"
      console.log('Waiting for simulation modal and selecting Sim All Zones...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for modal to appear

      const modalConfigResult = await page.evaluate(() => {
        const results = {
          simAllZonesSelected: false,
          experienceEnabled: false,
          combatDropEnabled: false,
          player1Selected: false,
          startClicked: false,
          message: ''
        };

        // Select #player1 for character simulation
        const player1Element = document.querySelector('#player1') as HTMLInputElement | HTMLSelectElement;
        if (player1Element) {
          if (player1Element.type === 'radio' || player1Element.type === 'checkbox') {
            // If it's a radio button or checkbox, check it
            (player1Element as HTMLInputElement).checked = true;
            player1Element.dispatchEvent(new Event('change', { bubbles: true }));
            player1Element.dispatchEvent(new Event('click', { bubbles: true }));
            results.player1Selected = true;
            results.message += 'Player 1 checked. ';
          } else if (player1Element.tagName === 'SELECT') {
            // If it's a select dropdown
            const selectElement = player1Element as HTMLSelectElement;
            if (selectElement.options && selectElement.options.length > 1) {
              selectElement.selectedIndex = 1; // Select first actual character
              selectElement.dispatchEvent(new Event('change', { bubbles: true }));
              results.player1Selected = true;
              results.message += 'Player 1 character selected from dropdown. ';
            } else {
              results.message += 'Player 1 dropdown found but no options available. ';
            }
          } else {
            results.message += `Player 1 element found but unknown type: ${player1Element.type || player1Element.tagName}. `;
          }
        } else {
          results.message += 'Player 1 element not found. ';
        }

        // Look for Sim All Zones toggle using the exact ID
        const simAllZoneToggle = document.querySelector('#simAllZoneToggle') as HTMLInputElement;
        if (simAllZoneToggle) {
          simAllZoneToggle.checked = true;
          simAllZoneToggle.dispatchEvent(new Event('change', { bubbles: true }));
          simAllZoneToggle.dispatchEvent(new Event('click', { bubbles: true }));
          results.simAllZonesSelected = true;
          results.message += 'Sim All Zones toggle (#simAllZoneToggle) enabled. ';
        } else {
          // Fallback to generic search if specific ID not found
          const simAllZonesOptions = Array.from(document.querySelectorAll('input[type="checkbox"], input[type="radio"]')).filter(el =>
            el.getAttribute('id')?.toLowerCase().includes('all') ||
            el.getAttribute('name')?.toLowerCase().includes('all') ||
            el.closest('label')?.textContent?.toLowerCase().includes('sim all zones')
          );

          if (simAllZonesOptions.length > 0) {
            const simAllOption = simAllZonesOptions[0] as HTMLInputElement;
            simAllOption.checked = true;
            simAllOption.dispatchEvent(new Event('change', { bubbles: true }));
            simAllOption.dispatchEvent(new Event('click', { bubbles: true }));
            results.simAllZonesSelected = true;
            results.message += 'Sim All Zones fallback option selected. ';
          } else {
            results.message += 'Sim All Zones toggle not found. ';
          }
        }

        // Look for Experience toggle
        const experienceToggles = Array.from(document.querySelectorAll('input[type="checkbox"], input[type="radio"]')).filter(el =>
          el.getAttribute('name')?.toLowerCase().includes('experience') ||
          el.getAttribute('id')?.toLowerCase().includes('experience') ||
          el.closest('label')?.textContent?.toLowerCase().includes('experience')
        );

        if (experienceToggles.length > 0) {
          const expToggle = experienceToggles[0] as HTMLInputElement;
          expToggle.checked = true;
          expToggle.dispatchEvent(new Event('change', { bubbles: true }));
          results.experienceEnabled = true;
          results.message += 'Experience enabled. ';
        }

        // Look for Combat Drop Quantity toggle
        const combatDropToggles = Array.from(document.querySelectorAll('input[type="checkbox"], input[type="radio"]')).filter(el =>
          el.getAttribute('name')?.toLowerCase().includes('combat') ||
          el.getAttribute('name')?.toLowerCase().includes('drop') ||
          el.getAttribute('id')?.toLowerCase().includes('combat') ||
          el.getAttribute('id')?.toLowerCase().includes('drop') ||
          el.closest('label')?.textContent?.toLowerCase().includes('combat drop') ||
          el.closest('label')?.textContent?.toLowerCase().includes('drop quantity')
        );

        if (combatDropToggles.length > 0) {
          const dropToggle = combatDropToggles[0] as HTMLInputElement;
          dropToggle.checked = true;
          dropToggle.dispatchEvent(new Event('change', { bubbles: true }));
          results.combatDropEnabled = true;
          results.message += 'Combat Drop Quantity enabled. ';
        }

        return results;
      });

      console.log('Modal configuration result:', modalConfigResult);

      // Step 5: Click the specific #buttonStartSimulation to actually start the simulation
      console.log('Clicking #buttonStartSimulation to start the actual simulation...');
      const startSimulationButtonResult = await page.evaluate(() => {
        const startButton = document.querySelector('#buttonStartSimulation') as HTMLElement;
        if (startButton) {
          startButton.click();
          return { success: true, clicked: '#buttonStartSimulation' };
        }

        // Fallback to any start simulation button in modal
        const modalStartButtons = Array.from(document.querySelectorAll('button, input[type="submit"]')).filter(btn =>
          btn.textContent?.toLowerCase().includes('start simulation') ||
          btn.getAttribute('id')?.toLowerCase().includes('start')
        );

        if (modalStartButtons.length > 0) {
          const modalStartButton = modalStartButtons[0] as HTMLElement;
          modalStartButton.click();
          return { success: true, clicked: 'fallback start button' };
        }

        return { success: false, clicked: null };
      });

      if (!startSimulationButtonResult.success) {
        throw new Error('#buttonStartSimulation not found and no fallback start button available');
      }

      console.log(`✅ Simulation started: ${startSimulationButtonResult.clicked}`);

      // Step 6: Monitor simulation progress bar until 100% complete
      console.log('⏳ Monitoring simulation progress bar for completion...');
      console.log('🕐 Watching #simulationProgressBar for 100% completion...');

      let simulationComplete = false;
      let attempts = 0;
      const maxAttempts = 120; // Wait up to 2 minutes for simulation to complete

      while (!simulationComplete && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;

        const progressResult = await page.evaluate(() => {
          const progressBar = document.querySelector('#simulationProgressBar');
          if (progressBar) {
            const progressText = progressBar.textContent || progressBar.innerHTML || '';
            const isComplete = progressText.includes('100%');
            return {
              found: true,
              progress: progressText.trim(),
              complete: isComplete
            };
          }
          return {
            found: false,
            progress: 'Progress bar not found',
            complete: false
          };
        });

        simulationComplete = progressResult.complete;

        // Log progress every 10 seconds to avoid spam
        if (attempts % 10 === 0 || progressResult.complete) {
          console.log(`Progress check ${attempts}: ${progressResult.progress} (complete: ${progressResult.complete})`);
        }
      }

      if (!simulationComplete) {
        throw new Error('Simulation did not reach 100% completion within 2 minutes');
      }

      console.log('✅ Simulation reached 100% completion! Looking for All Zones Data button...');

      // Step 7: Now look for the "All Zones Data" button (with shorter timeout)
      let allZonesButtonFound = false;
      let buttonAttempts = 0;
      const maxButtonAttempts = 10; // Only wait 10 seconds to find the button after simulation completes

      while (!allZonesButtonFound && buttonAttempts < maxButtonAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        buttonAttempts++;

        allZonesButtonFound = await page.evaluate(() => {
          const allZonesButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
            btn.textContent?.toLowerCase().includes('all zones data') ||
            btn.textContent?.toLowerCase().includes('zones data')
          );
          return allZonesButtons.length > 0;
        });

        console.log(`Looking for All Zones Data button - attempt ${buttonAttempts}: found: ${allZonesButtonFound}`);
      }

      if (!allZonesButtonFound) {
        throw new Error('All Zones Data button did not appear after simulation completion');
      }

      // Step 8: Click "All Zones Data" button and extract #allZonesData
      console.log('Clicking All Zones Data button and extracting #allZonesData...');
      const zoneDataResult = await page.evaluate(() => {
        // Click the All Zones Data button
        const allZonesButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
          btn.textContent?.toLowerCase().includes('all zones data') ||
          btn.textContent?.toLowerCase().includes('zones data')
        );

        if (allZonesButtons.length > 0) {
          (allZonesButtons[0] as HTMLElement).click();
        }

        // Wait a moment for the data to load
        return new Promise(resolve => {
          setTimeout(() => {
            // Extract data from #allZonesData element
            const allZonesDataElement = document.querySelector('#allZonesData');

            if (!allZonesDataElement) {
              resolve({
                success: false,
                error: '#allZonesData element not found',
                data: {}
              });
              return;
            }

            try {
              // The element IS the table (id="allZonesData" is on the table itself)
              const table = allZonesDataElement.tagName === 'TABLE' ? allZonesDataElement : allZonesDataElement.querySelector('table');

              if (!table) {
                resolve({
                  success: false,
                  error: 'No table found - element is not a table and contains no table',
                  data: []
                });
                return;
              }

              console.log('Found table element');

              // Get headers from thead section
              const thead = table.querySelector('thead');
              const tbody = table.querySelector('tbody');

              if (!thead || !tbody) {
                resolve({
                  success: false,
                  error: 'Table missing thead or tbody sections',
                  data: []
                });
                return;
              }

              // Extract headers from thead
              const headerRow = thead.querySelector('tr');
              if (!headerRow) {
                resolve({
                  success: false,
                  error: 'No header row found in thead',
                  data: []
                });
                return;
              }

              const headers = Array.from(headerRow.querySelectorAll('th')).map(th =>
                th.textContent.toLowerCase().replace(/\s+/g, '_')
              );

              console.log('Table headers found:', headers);

              // Extract data from tbody
              const dataRows = Array.from(tbody.querySelectorAll('tr'));
              const data = [];

              dataRows.forEach((row, rowIndex) => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length > 0) {
                  const rowObject = {};
                  cells.forEach((cell, cellIndex) => {
                    const header = headers[cellIndex] || `column_${cellIndex}`;
                    rowObject[header] = cell.textContent?.trim() || '';
                  });
                  data.push(rowObject);
                }
              });

              console.log(`Parsed ${data.length} rows of table data`);
              console.log('Sample row:', data[0]);

              resolve({
                success: true,
                data: data,
                source: 'table_parse'
              });

            } catch (error) {
              resolve({
                success: false,
                error: `Failed to parse table: ${error}`,
                data: []
              });
            }
          }, 3000); // Wait 3 seconds for data to load
        });
      });

      console.log('Zone data extraction completed:', zoneDataResult);

      console.log('▶️ Closing browser and returning results...');
      await browser.close();

      // Return the zone data regardless of success/failure
      const zoneDataResult_typed = zoneDataResult as {
        success: boolean;
        data: any;
        error?: string;
        source?: string;
      };

      console.log('Final zone data result:', zoneDataResult_typed);

      // Always return the data - even if extraction failed, return empty array
      if (!zoneDataResult_typed.success || !zoneDataResult_typed.data) {
        console.log('Zone extraction failed, returning empty array');
        return NextResponse.json([]);
      }

      // Return the structured zone data
      return NextResponse.json(zoneDataResult_typed.data);

    } catch (error) {
      console.error('Simulation error:', error);
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }

      // Return empty array on any failure to maintain consistent format
      console.log('Simulation failed, returning empty array');
      return NextResponse.json([]);
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