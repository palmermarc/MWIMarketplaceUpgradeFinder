#!/bin/bash

# Deploy script for GitHub Pages
set -e

echo "🚀 Starting deployment to GitHub Pages..."

# Build the application
echo "📦 Building application..."
npm run export

# Add .nojekyll file to prevent Jekyll processing
echo "🔧 Adding .nojekyll file..."
touch out/.nojekyll

# Create CNAME file if you have a custom domain (optional)
# echo "yourdomain.com" > out/CNAME

echo "✅ Build complete! Static files are in the 'out' directory."
echo "📁 Files ready for GitHub Pages deployment:"
echo "   - index.html"
echo "   - Static assets in _next/"
echo "   - .nojekyll file"

echo ""
echo "📋 Next steps:"
echo "1. Commit and push your changes to the main branch"
echo "2. GitHub Actions will automatically deploy to GitHub Pages"
echo "3. Your app will be available at: https://palmermarc.github.io/MWIMarketplaceUpgradeFinder/"
echo ""
echo "💡 Make sure GitHub Pages is enabled in your repository settings:"
echo "   Repository Settings > Pages > Source: GitHub Actions"