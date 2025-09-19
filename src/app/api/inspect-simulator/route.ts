import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  try {
    console.log('Starting simulator page inspection...');

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

    try {
      // Navigate to the combat simulator
      console.log('Navigating to combat simulator...');
      await page.goto('https://shykai.github.io/MWICombatSimulatorTest/dist/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      console.log('Page loaded, inspecting elements...');

      // Take a screenshot for debugging
      await page.screenshot({ path: 'simulator-screenshot.png', fullPage: true });

      // Inspect the page structure
      const pageInspection = await page.evaluate(() => {
        interface FormElementInfo {
          index: number;
          id: string;
          className: string;
          action?: string;
          method?: string;
        }

        interface InputElementInfo {
          index: number;
          type: string;
          name: string;
          id: string;
          className: string;
          placeholder: string;
          value: string;
        }

        interface SelectElementInfo {
          index: number;
          name: string;
          id: string;
          className: string;
          optionCount: number;
          options: Array<{
            value: string;
            text: string;
            selected: boolean;
          }>;
        }

        interface ButtonElementInfo {
          index: number;
          type: string;
          id: string;
          className: string;
          textContent?: string;
          value?: string;
        }

        interface EquipmentSlotInfo {
          keyword: string;
          index: number;
          tagName: string;
          id: string;
          className: string;
          name?: string;
          textContent?: string;
        }

        interface AllElementsInfo {
          bodyClasses: string;
          headings: Array<{
            tagName: string;
            textContent?: string;
            id: string;
            className: string;
          }>;
          totalInputs: number;
          totalSelects: number;
          totalButtons: number;
          totalForms: number;
        }

        const inspection = {
          title: document.title,
          url: window.location.href,
          formElements: [] as FormElementInfo[],
          inputElements: [] as InputElementInfo[],
          selectElements: [] as SelectElementInfo[],
          buttonElements: [] as ButtonElementInfo[],
          equipmentSlots: [] as EquipmentSlotInfo[],
          allElements: {} as AllElementsInfo
        };

        // Find all form elements
        document.querySelectorAll('form').forEach((form, index) => {
          inspection.formElements.push({
            index,
            id: form.id,
            className: form.className,
            action: form.action,
            method: form.method
          });
        });

        // Find all input elements
        document.querySelectorAll('input').forEach((input, index) => {
          inspection.inputElements.push({
            index,
            type: input.type,
            name: input.name,
            id: input.id,
            className: input.className,
            placeholder: input.placeholder,
            value: input.value
          });
        });

        // Find all select elements
        document.querySelectorAll('select').forEach((select, index) => {
          const options = Array.from(select.options).map(opt => ({
            value: opt.value,
            text: opt.text,
            selected: opt.selected
          }));

          inspection.selectElements.push({
            index,
            name: select.name,
            id: select.id,
            className: select.className,
            optionCount: options.length,
            options: options.slice(0, 10) // Limit to first 10 options for readability
          });
        });

        // Find all button elements
        document.querySelectorAll('button, input[type="submit"], input[type="button"]').forEach((button, index) => {
          inspection.buttonElements.push({
            index,
            type: (button as HTMLInputElement).type || 'button',
            id: button.id,
            className: button.className,
            textContent: button.textContent?.trim(),
            value: (button as HTMLInputElement).value
          });
        });

        // Look for equipment-related elements
        const equipmentKeywords = ['equipment', 'gear', 'item', 'slot', 'weapon', 'armor', 'helmet', 'chest', 'leg'];
        equipmentKeywords.forEach(keyword => {
          document.querySelectorAll(`[id*="${keyword}"], [class*="${keyword}"], [name*="${keyword}"]`).forEach((el, index) => {
            inspection.equipmentSlots.push({
              keyword,
              index,
              tagName: el.tagName,
              id: el.id,
              className: el.className,
              name: (el as HTMLInputElement).name,
              textContent: el.textContent?.trim().substring(0, 100)
            });
          });
        });

        // Get overall page structure
        const bodyClasses = document.body.className;
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          tagName: h.tagName,
          textContent: h.textContent?.trim(),
          id: h.id,
          className: h.className
        }));

        inspection.allElements = {
          bodyClasses,
          headings,
          totalInputs: document.querySelectorAll('input').length,
          totalSelects: document.querySelectorAll('select').length,
          totalButtons: document.querySelectorAll('button').length,
          totalForms: document.querySelectorAll('form').length
        };

        return inspection;
      });

      console.log('Page inspection completed');

      // Keep browser open for manual inspection
      // Don't close the browser immediately for debugging
      setTimeout(() => {
        browser.close();
      }, 60000); // Close after 1 minute

      return NextResponse.json({
        success: true,
        inspection: pageInspection,
        message: 'Page inspection completed. Browser will remain open for 1 minute for manual inspection.'
      });

    } catch (error) {
      console.error('Page inspection error:', error);
      await browser.close();

      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown inspection error',
        details: 'Failed to inspect simulator page'
      });
    }

  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to inspect simulator',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}