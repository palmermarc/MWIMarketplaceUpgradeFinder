import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages configuration - only apply for production builds
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '/MWIMarketplaceUpgradeFinder',
    assetPrefix: '/MWIMarketplaceUpgradeFinder',
  }),

  webpack: (config, { isServer }) => {
    // Exclude puppeteer from client-side bundle
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
      ];
    }

    return config;
  },

  // Disable server-side features for static export
  experimental: {
    // No experimental features needed for static export
  },
};

export default nextConfig;
