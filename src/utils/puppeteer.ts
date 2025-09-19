import type { Browser, LaunchOptions } from 'puppeteer-core';

export interface PuppeteerLaunchOptions extends LaunchOptions {
  timeout?: number;
}

export async function launchBrowser(options: PuppeteerLaunchOptions = {}): Promise<Browser> {
  console.error('🚨 LAUNCHBROWSER FUNCTION CALLED - START');
  console.error('🚨 This should appear in Vercel logs if the function is called');

  // FORCE Vercel path for all production environments
  const isVercel = !!process.env.VERCEL;
  const isServerless = process.env.NODE_ENV === 'production' || isVercel;
  const forceChromium = true; // Force use of @sparticuz/chromium

  console.error('🔍 PUPPETEER UTILITY CALLED - Environment check:', {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    isVercel,
    isServerless,
    forceChromium
  });

  if (forceChromium || isServerless) {
    // Vercel production environment - use puppeteer-core with @sparticuz/chromium
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = await import('puppeteer-core');

    const launchOptions: LaunchOptions = {
      ...options,
      args: chromium.args,
      executablePath: await chromium.executablePath(),
    };

    console.error('🔧 Launching browser with @sparticuz/chromium for serverless environment');
    return puppeteer.launch(launchOptions);
  } else {
    // Local development - use regular puppeteer
    const puppeteer = await import('puppeteer');

    const launchOptions: LaunchOptions = {
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
      timeout: 60000,
      ...options,
    };

    console.error('🔧 Launching browser with standard puppeteer for local development');
    return puppeteer.launch(launchOptions);
  }
}