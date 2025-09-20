# Client-Side Browser Simulation Implementation Plan

## Overview
Replace server-side Puppeteer with client-side browser automation using the user's browser directly.

## Architecture

### Current (Vercel + Puppeteer)
```
User Browser → Vercel API → Puppeteer → Combat Simulator → JSON Response
- 60+ second timeouts
- Server resource constraints
- Cold start delays
```

### Proposed (Client-Side)
```
User Browser → Direct iframe/window → Combat Simulator → Real-time Updates
- No timeout limits
- User's full browser capabilities
- Instant feedback
```

## Implementation Strategy

### 1. Combat Simulator Integration
- Embed combat simulator in iframe OR open in popup window
- Use postMessage API for communication
- Direct DOM manipulation within same origin

### 2. Real-time Progress Updates
```typescript
// Progress tracking
interface SimulationProgress {
  stage: 'importing' | 'configuring' | 'simulating' | 'extracting' | 'complete';
  progress: number; // 0-100
  currentTest?: string;
  results?: SimulationResult[];
}
```

### 3. Cross-Frame Communication
```typescript
// Parent window listens for updates
window.addEventListener('message', (event) => {
  if (event.origin === 'https://shykai.github.io') {
    const { type, data } = event.data;
    if (type === 'SIMULATION_PROGRESS') {
      updateProgressUI(data);
    }
  }
});

// Send commands to simulator
simulatorFrame.postMessage({
  type: 'START_SIMULATION',
  payload: { character, equipment, zones }
}, 'https://shykai.github.io');
```

## Advantages

### Performance
- ✅ No 60-second Vercel timeout
- ✅ Uses user's full browser capabilities
- ✅ Real-time progress updates
- ✅ No server resource costs
- ✅ Instant startup (no cold start)

### User Experience
- ✅ Visual progress indication
- ✅ Ability to cancel/restart
- ✅ No mysterious "waiting" periods
- ✅ Works offline once loaded

### Development
- ✅ Easier debugging (runs in user's browser)
- ✅ No serverless deployment complexity
- ✅ Simpler architecture
- ✅ No Puppeteer dependency issues

## Implementation Components

### 1. Simulation Manager Component
```typescript
export const BrowserSimulationManager = () => {
  const [progress, setProgress] = useState<SimulationProgress>();
  const [simulatorRef, setSimulatorRef] = useState<HTMLIFrameElement>();

  const startSimulation = async (character: Character) => {
    // Send character data to simulator
    simulatorRef?.contentWindow?.postMessage({
      type: 'IMPORT_CHARACTER',
      payload: character
    }, 'https://shykai.github.io');
  };

  return (
    <div>
      <iframe
        ref={setSimulatorRef}
        src="https://shykai.github.io/MWICombatSimulatorTest/dist/"
        onLoad={setupCommunication}
      />
      <ProgressDisplay progress={progress} />
    </div>
  );
};
```

### 2. Simulator Integration Script
```typescript
// Inject into combat simulator to enable communication
class SimulationBridge {
  private parentWindow: Window;

  constructor() {
    this.parentWindow = window.parent;
    this.setupEventListeners();
  }

  private sendProgress(stage: string, progress: number) {
    this.parentWindow.postMessage({
      type: 'SIMULATION_PROGRESS',
      data: { stage, progress }
    }, '*');
  }

  async importCharacter(characterData: Character) {
    this.sendProgress('importing', 0);
    // Import logic here
    this.sendProgress('importing', 100);
  }

  async runSimulation(config: SimConfig) {
    this.sendProgress('simulating', 0);
    // Simulation logic with progress updates
    this.sendProgress('simulating', 50);
    // ...
    this.sendProgress('complete', 100);
  }
}
```

### 3. Progress UI Component
```typescript
const ProgressDisplay = ({ progress }: { progress?: SimulationProgress }) => {
  if (!progress) return <div>Ready to simulate...</div>;

  return (
    <div className="simulation-progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      <div className="progress-text">
        {progress.stage}: {progress.progress}%
        {progress.currentTest && <div>Testing: {progress.currentTest}</div>}
      </div>
      {progress.results && (
        <div className="results-preview">
          {progress.results.map(result => (
            <div key={result.id}>{result.summary}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Migration Path

### Phase 1: Parallel Implementation
- Keep current Vercel API as fallback
- Add client-side option as "Fast Mode"
- A/B test with users

### Phase 2: Full Migration
- Make client-side the default
- Remove Vercel API dependencies
- Deploy to GitHub Pages

### Phase 3: Enhanced Features
- Multiple browser tab support
- Background simulation
- Advanced progress tracking
- Export/import simulation results

## Technical Considerations

### CORS & Security
- Combat simulator is on different domain
- Need iframe sandboxing for security
- PostMessage API for safe communication

### Error Handling
- Network issues (combat simulator down)
- Browser compatibility
- User blocks popups/iframes

### Fallback Strategy
- Detect if iframe is blocked
- Offer popup window alternative
- Graceful degradation to server-side

## File Changes Required

### New Files
- `src/components/BrowserSimulation/`
  - `SimulationManager.tsx`
  - `ProgressDisplay.tsx`
  - `SimulatorBridge.ts`
  - `types.ts`

### Modified Files
- `src/app/page.tsx` - Add client-side option
- `src/components/CombatUpgradeAnalysisIframe.tsx` - Integrate new simulation
- `next.config.ts` - Update for GitHub Pages deployment
- `package.json` - Remove server dependencies

### Removed Files
- `src/app/api/combat-simulation/` - No longer needed
- `src/app/api/combat-upgrade-simulation/` - No longer needed
- `src/utils/puppeteer.ts` - No longer needed

## Estimated Timeline
- **Phase 1**: 2-3 days (parallel implementation)
- **Phase 2**: 1 day (migration)
- **Phase 3**: 1-2 days (enhancements)

## Risk Mitigation
- Keep server-side as emergency fallback
- Extensive browser compatibility testing
- Progressive enhancement approach