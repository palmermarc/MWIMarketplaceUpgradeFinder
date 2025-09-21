import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for Vercel hosting with API routes
  // output: 'export' is not needed for Vercel

  // Exclude Puppeteer packages from bundling for Vercel serverless
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "puppeteer"],

  webpack: (config, { isServer }) => {
    // Server-side: Allow Puppeteer
    // Client-side: Exclude Puppeteer to prevent bundling issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };

      config.externals = [
        ...(config.externals || []),
        'puppeteer',
        'puppeteer-core',
        '@sparticuz/chromium',
      ];
    }

    return config;
  },
};

export default nextConfig;
