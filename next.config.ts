import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Set base path for GitHub Pages (will be repository name)
  basePath: '/MWIMarketplaceUpgradeFinder',

  // Ensure trailing slash for GitHub Pages
  trailingSlash: true,

  webpack: (config, { isServer }) => {
    // Client-side: Exclude server-only packages
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
