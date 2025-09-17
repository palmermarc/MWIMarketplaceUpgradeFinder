import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages serves from subdirectory - must match repository name
  basePath: '/MWIMarketplaceUpgradeFinder',
  assetPrefix: '/MWIMarketplaceUpgradeFinder',

  // Disable server-side features for static export
  experimental: {
    // No experimental features needed for static export
  },
};

export default nextConfig;
