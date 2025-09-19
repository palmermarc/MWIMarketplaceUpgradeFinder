import { NextResponse } from 'next/server';
import { launchBrowser } from '@/utils/puppeteer';

export async function GET() {
  try {
    console.log('Testing Vercel-compatible Puppeteer launch...');

    const browser = await launchBrowser({ timeout: 30000 });

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