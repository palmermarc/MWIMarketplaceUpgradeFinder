import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages uses a subdirectory, but we'll handle this with basePath if needed
  // basePath: '/mwimarketplaceupgradefinder',

  // Disable server-side features for static export
  experimental: {
    // No experimental features needed for static export
  },
};

export default nextConfig;
