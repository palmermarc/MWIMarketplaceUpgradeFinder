# Browser Storage System

This document explains the comprehensive browser storage system implemented for the Milky Way Idle Marketplace Upgrade Finder.

## Overview

The application now uses **IndexedDB** for persistent, long-term storage of user data. This provides significant advantages over traditional localStorage:

- **Large Capacity**: Can store 50MB+ of data (vs 5-10MB for localStorage)
- **Structured Data**: Supports complex objects, arrays, and relationships
- **Schema Versioning**: Built-in upgrade system for future changes
- **Performance**: Asynchronous operations for better UX
- **Transactions**: ACID compliance for data integrity
- **Indexing**: Fast queries on multiple fields

## Storage Architecture

### Database Structure
- **Database Name**: `MWIUpgradeFinderDB`
- **Current Version**: 1
- **Location**: Browser's IndexedDB (persistent across sessions)

### Object Stores (Tables)

1. **`characterData`** - Imported character information
   - Stores complete character stats, equipment, abilities
   - Includes original raw JSON data for backup
   - Indexed by name, timestamp, and last accessed
   - Automatic cleanup of old unused characters

2. **`marketplaceData`** - Marketplace API responses
   - Caches marketplace data with TTL (Time To Live)
   - Automatic expiration and cleanup
   - Indexed by timestamp, expiration, and source
   - Reduces API calls and improves performance

3. **`combatItems`** - Combat equipment data
   - Stores available items for each equipment slot
   - Source tracking (constants, API, user-defined)
   - Version control for data format changes

4. **`userPreferences`** - User settings and preferences
   - Theme, language, auto-save settings
   - Data retention policies
   - Favorite characters list
   - Analysis preferences

5. **`cacheMetadata`** - Storage statistics and management
   - Storage usage tracking
   - Cleanup schedules
   - Performance metrics

6. **`analysisHistory`** - Combat simulation history
   - Stores past analysis results
   - Links to character data
   - Performance tracking
   - Export capabilities

## Key Features

### Automatic Data Management
- **Smart Caching**: Checks for fresh data before making API calls
- **TTL System**: Marketplace data expires after 24 hours (configurable)
- **Cleanup**: Automatic removal of expired and old data
- **Compression**: Efficient storage of large datasets

### Data Persistence
- **Cross-Session**: Data survives browser restarts
- **Offline Support**: Access cached data without internet
- **Import/Export**: Backup and restore capabilities
- **Migration**: Automatic schema upgrades

### Performance Optimization
- **Lazy Loading**: Data loaded only when needed
- **Indexing**: Fast queries on common fields
- **Batching**: Efficient bulk operations
- **Background Cleanup**: Non-blocking maintenance

## Usage Examples

### Basic Usage with React Hooks

```typescript
import { useCharacterStorage, useMarketplaceStorage } from '@/hooks/useBrowserStorage';

function MyComponent() {
  const { characters, saveCharacter, isLoading } = useCharacterStorage();
  const { marketData, isMarketDataFresh } = useMarketplaceStorage();

  // Save character data
  const handleSave = async (character, rawData) => {
    const id = await saveCharacter(character, rawData, 'My Character');
    console.log(`Saved with ID: ${id}`);
  };

  // Check data freshness
  const needsRefresh = !isMarketDataFresh(6); // 6 hours
}
```

### Advanced Storage Operations

```typescript
import { browserStorage } from '@/services/browserStorage';

// Export all data for backup
const exportData = async () => {
  const allData = await browserStorage.exportAllData();
  // Download or process the data
};

// Perform maintenance cleanup
const cleanup = async () => {
  await browserStorage.performMaintenanceCleanup();
};

// Get storage statistics
const stats = await browserStorage.getStorageStats();
console.log(`Characters: ${stats.characterData}`);
```

## Data Types and Interfaces

### Character Data
```typescript
interface StoredCharacterData {
  id: string;
  name: string;
  data: CharacterStats;
  rawData?: string;
  timestamp: number;
  lastAccessed: number;
  version: string;
}
```

### Marketplace Data
```typescript
interface StoredMarketplaceData {
  id: string;
  data: MarketData;
  timestamp: number;
  expiresAt: number;
  version: string;
  source: 'api' | 'manual' | 'cache';
}
```

### User Preferences
```typescript
interface UserPreferences {
  autoSave: boolean;
  dataRetentionDays: number;
  defaultAnalysisSettings: Record<string, any>;
  favoriteCharacters: string[];
  theme: string;
  language: string;
}
```

## Storage Lifecycle

### Import Process
1. **Character Import**: Parse JSON and validate
2. **Save to Storage**: Store character with metadata
3. **Load Marketplace**: Check cache first, then API
4. **Cache Marketplace**: Save fresh data with TTL
5. **Load Combat Items**: Use stored data or constants

### Data Expiration
- **Marketplace Data**: 24-hour TTL (configurable)
- **Character Data**: Based on last accessed time
- **Analysis History**: Configurable retention period
- **Combat Items**: Never expires (updated manually)

### Cleanup Process
- **Automatic**: Runs during maintenance operations
- **Manual**: Available through UI or API
- **Configurable**: Retention policies in user preferences
- **Safe**: Always preserves recent and favorited data

## Browser Compatibility

### Supported Browsers
- **Chrome**: 24+ (full support)
- **Firefox**: 16+ (full support)
- **Safari**: 10+ (full support)
- **Edge**: 12+ (full support)
- **Mobile**: iOS Safari 10+, Chrome Mobile 25+

### Fallback Strategy
If IndexedDB is not available:
- Graceful degradation to localStorage
- Limited functionality warning
- Session-only storage as last resort

## Security and Privacy

### Data Protection
- **Local Only**: No data sent to external servers
- **User Control**: Full export/import capabilities
- **Transparent**: Open source implementation
- **Secure**: No sensitive data exposure

### Privacy Features
- **Optional Storage**: Users can opt out
- **Data Ownership**: Full user control over data
- **Export Rights**: Complete data portability
- **Deletion**: Permanent data removal options

## Configuration Options

### TTL Settings
```typescript
// Marketplace data freshness
const MARKETPLACE_TTL = 24; // hours

// Character data retention
const CHARACTER_RETENTION = 30; // days

// Analysis history retention
const HISTORY_RETENTION = 7; // days
```

### Storage Limits
```typescript
// Recommended limits
const MAX_CHARACTERS = 50;
const MAX_HISTORY_ENTRIES = 1000;
const MAX_STORAGE_SIZE = 50; // MB
```

## Future Enhancements

### Planned Features
- **Sync Across Devices**: Cloud backup integration
- **Sharing**: Export/import character builds
- **Analytics**: Storage usage insights
- **Optimization**: Compression algorithms
- **Collaboration**: Team analysis features

### Extensibility
- **Plugin System**: Custom storage adapters
- **Schema Evolution**: Automated migrations
- **Custom Fields**: User-defined data types
- **Integration**: Third-party tool support

## Troubleshooting

### Common Issues
1. **Storage Full**: Automatic cleanup or manual deletion
2. **Corrupted Data**: Validation and recovery tools
3. **Performance**: Optimization and indexing
4. **Compatibility**: Fallback mechanisms

### Debug Tools
- Storage statistics in UI
- Console logging for operations
- Export functionality for analysis
- Clear all data for reset

## Migration Guide

### From localStorage (if applicable)
```typescript
// Automatic migration on first load
const migrateFromLocalStorage = async () => {
  const oldData = localStorage.getItem('characterData');
  if (oldData) {
    await browserStorage.saveCharacterData(JSON.parse(oldData));
    localStorage.removeItem('characterData');
  }
};
```

This storage system provides a robust, scalable foundation for the application's data persistence needs while maintaining excellent performance and user experience.