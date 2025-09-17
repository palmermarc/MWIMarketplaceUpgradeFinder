# Milky Way Idle Marketplace Upgrade Finder

A Next.js application that helps Milky Way Idle players find optimal equipment upgrades from the marketplace data. Simply import your character data and the app will automatically fetch the latest marketplace prices to suggest the best upgrade opportunities.

## Features

- **Character Import**: Paste your character JSON data for instant analysis
- **Automatic Marketplace Data**: Fetches real-time pricing from the official API
- **Smart Caching**: Stores marketplace data locally with timestamp-based updates
- **Upgrade Analysis**: Finds cost-effective enhancement opportunities
- **Data Export**: Export combined character and upgrade data for combat simulation apps

## Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

3. **Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Export your character data** from Milky Way Idle game
2. **Paste the JSON** into the character import field
3. **Click "Import Character"** - marketplace data loads automatically
4. **Review upgrade opportunities** sorted by cost efficiency
5. **Export the data** for use in combat simulation tools

## Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **LocalStorage API** - Client-side data caching

## Data Sources

- Character data: User-provided JSON export from Milky Way Idle
- Marketplace data: `https://www.milkywayidle.com/game_data/marketplace.json`

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── services/           # API and data services
└── types/              # TypeScript type definitions
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run export` - Build for static export (GitHub Pages)
- `npm run lint` - Run ESLint
- `npm run start` - Start production server

## Deployment

This app is deployed to GitHub Pages using a dedicated `gh-pages` branch for reliable static hosting.

### Deployment Method
- **Source**: `gh-pages` branch (static files only)
- **Build**: Next.js static export (`npm run export`)
- **Assets**: All CSS, JS, and fonts served from GitHub Pages CDN

### Manual Deployment Process
```bash
# 1. Build the static export
npm run export

# 2. Switch to gh-pages branch
git checkout gh-pages

# 3. Replace content with new build
rm -rf * && cp -r out/* . && touch .nojekyll

# 4. Commit and push
git add . && git commit -m "Deploy latest build"
git push origin gh-pages

# 5. Switch back to main
git checkout main
```

### Or use the deployment script
```bash
./deploy.sh
```

### GitHub Pages Setup
1. Go to repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select branch: `gh-pages`
4. Select folder: `/ (root)`

## Live Demo

🌐 **[Try the app live](https://palmermarc.github.io/MWIMarketplaceUpgradeFinder/)**

*Note: All assets (CSS, JavaScript, fonts) now load correctly from the GitHub Pages CDN.*

## Contributing

This project was built to automate the process of finding equipment upgrades in Milky Way Idle. Feel free to submit issues or pull requests for improvements.
