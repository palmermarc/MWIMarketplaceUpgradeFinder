# MWI Marketplace Upgrade Finder

A Next.js application that analyzes combat equipment upgrades for Milky Way Idle using automated browser simulation with Puppeteer.

## Features

- **Combat Simulation**: Automated testing of equipment configurations using Puppeteer
- **Upgrade Analysis**: Real-time streaming analysis of equipment upgrade effectiveness
- **Equipment Comparison**: Side-by-side comparison of different equipment setups
- **Progress Tracking**: Live progress updates during simulation runs
- **Vercel Deployment**: Optimized for serverless deployment with API routes

## Prerequisites (Windows Setup)

### 1. Install Node.js

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (recommended for most users)
3. Run the installer (.msi file)
4. During installation, make sure "Add to PATH" is checked
5. Restart your computer after installation

### 2. Verify Installation

Open Command Prompt (cmd) or PowerShell and run:

```bash
node --version
npm --version
```

You should see version numbers for both commands.

### 3. Install Git (Optional but Recommended)

1. Go to [git-scm.com](https://git-scm.com/)
2. Download Git for Windows
3. Run the installer with default settings
4. Restart your computer

## Setup Instructions

### 1. Clone or Download the Repository

**Option A: Using Git (if installed)**
```bash
git clone <repository-url>
cd mwimarketplaceupgradefinder
```

**Option B: Download ZIP**
1. Download the repository as a ZIP file
2. Extract it to your desired location
3. Open Command Prompt and navigate to the folder:
```bash
cd path\to\mwimarketplaceupgradefinder
```

### 2. Install Dependencies

In the project folder, run:

```bash
npm install
```

This will install all required packages including:
- Next.js (React framework)
- Puppeteer (browser automation)
- TypeScript (type safety)
- Tailwind CSS (styling)

**Note**: The first install may take several minutes as it downloads Chromium browser for Puppeteer.

### 3. Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production (Optional)

To create a production build:

```bash
npm run build
```

## Deployment

### Local Production Server (Recommended)

```bash
npm run build
npm start
```

## API Endpoints

- `GET/POST /api/combat-simulation` - Run combat simulations
- `GET/POST /api/combat-upgrade-simulation` - Analyze equipment upgrades
- `GET /api/combat-upgrade-simulation/stream` - Streaming upgrade analysis
- `GET /api/inspect-simulator` - Inspect simulator state
- `GET /api/test-puppeteer` - Test Puppeteer functionality

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── combat-simulation/
│   │   ├── combat-upgrade-simulation/
│   │   └── inspect-simulator/
│   ├── page.tsx               # Main page
│   └── layout.tsx             # Root layout
├── components/
│   └── CombatUpgradeAnalysisIframe.tsx  # Main analysis component
└── services/
    └── combatSimulatorApi.ts  # API service layer
```

## Configuration Files

- `next.config.ts` - Next.js configuration optimized for Vercel
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration

## Troubleshooting

### Common Issues

**1. "npm is not recognized"**
- Restart your computer after installing Node.js
- Ensure Node.js was installed with "Add to PATH" checked

**2. "Permission denied" errors**
- Run Command Prompt as Administrator
- Or use PowerShell with execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**3. Puppeteer installation fails**
- Ensure you have a stable internet connection
- Try: `npm install puppeteer --no-optional`

**4. Build errors with Puppeteer**
- The project is configured for Vercel deployment
- Local builds may show warnings but should still work

**5. Port 3000 already in use**
- Kill existing Node processes in Task Manager
- Or use a different port: `npm run dev -- -p 3001`

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Export static files
npm run export
```

## Technology Stack

- **Framework**: Next.js 15.5.3
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Automation**: Puppeteer 24.22.0
- **Deployment**: Vercel (serverless)
- **Browser**: @sparticuz/chromium (Vercel-optimized)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Build to ensure no errors: `npm run build`
6. Submit a pull request

## License

This project is private and intended for Milky Way Idle community use.

---

For support or questions, please open an issue in the repository.
