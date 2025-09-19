import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  try {
    console.log('Testing Puppeteer launch...');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
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
      timeout: 30000
    });

    console.log('Puppeteer launched successfully');

    const page = await browser.newPage();
    console.log('New page created');

    await page.goto('https://example.com');
    console.log('Navigated to example.com');

    const title = await page.title();
    console.log('Page title:', title);

    await browser.close();
    console.log('Browser closed');

    return NextResponse.json({
      success: true,
      title,
      message: 'Puppeteer test completed successfully'
    });

  } catch (error) {
    console.error('Puppeteer test failed:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorStack: error instanceof Error ? error.stack : 'No stack available'
    }, { status: 500 });
  }
}