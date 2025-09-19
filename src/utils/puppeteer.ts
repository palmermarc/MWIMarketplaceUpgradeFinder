import type { Browser, LaunchOptions } from 'puppeteer-core';

export interface PuppeteerLaunchOptions extends LaunchOptions {
  timeout?: number;
}

export async function launchBrowser(options: PuppeteerLaunchOptions = {}): Promise<Browser> {
  // Use @sparticuz/chromium only in actual serverless environments
  const isVercel = !!process.env.VERCEL;
  const isServerless = process.env.NODE_ENV === 'production' || isVercel;

  console.log('🔍 Environment check:', {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    isVercel,
    isServerless
  });

  if (isServerless) {
    // Vercel production environment - use puppeteer-core with @sparticuz/chromium
    try {
      const chromium = (await import('@sparticuz/chromium')).default;
      const puppeteer = await import('puppeteer-core');

      // Get the executable path and validate it exists
      const executablePath = await chromium.executablePath();
      console.log('🔧 @sparticuz/chromium executable path:', executablePath);

      // Check if the binary exists
      const fs = await import('fs');
      if (!fs.existsSync(executablePath)) {
        throw new Error(`Chromium binary not found at ${executablePath}`);
      }

      const launchOptions: LaunchOptions = {
        ...options,
        args: chromium.args,
        executablePath: executablePath,
      };

      console.log('🔧 Launching browser with @sparticuz/chromium for serverless environment');
      return await puppeteer.launch(launchOptions);
    } catch (error) {
      console.error('❌ @sparticuz/chromium failed, falling back to regular puppeteer:', error);
      // Fallback to regular puppeteer if @sparticuz/chromium fails
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

      console.log('🔧 Launching browser with fallback puppeteer');
      return puppeteer.launch(launchOptions);
    }
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

    console.log('🔧 Launching browser with standard puppeteer for local development');
    return puppeteer.launch(launchOptions);
  }
}