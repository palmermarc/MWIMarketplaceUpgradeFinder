import { NextResponse } from 'next/server';
import chromium from 'chrome-aws-lambda';

export async function GET() {
  try {
    console.log('Testing chrome-aws-lambda...');

    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    console.log('Chrome launched successfully with chrome-aws-lambda');

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
      message: 'chrome-aws-lambda test completed successfully'
    });

  } catch (error) {
    console.error('chrome-aws-lambda test failed:', error);
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