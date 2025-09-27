import { ApiMarketData, MarketData, AuctionItem } from '@/types/marketplace';

const MARKETPLACE_API_URL = 'https://www.milkywayidle.com/game_data/marketplace.json';
const STORAGE_KEY = 'mwi_marketplace_data';
const TIMESTAMP_KEY = 'mwi_marketplace_timestamp';

export class MarketplaceService {
  private static parseItemName(itemHrid: string): string {
    return itemHrid.replace('/items/', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private static transformApiData(apiData: ApiMarketData): MarketData {
    const items: AuctionItem[] = [];
    let itemId = 0;

    Object.entries(apiData.marketData).forEach(([itemPath, itemLevels]) => {
      Object.entries(itemLevels).forEach(([level, prices]) => {
        // Skip entries with -1 prices (unavailable)
        if (prices.a === -1 || prices.b === -1) return;

        const enhancementLevel = parseInt(level);
        const askPrice = prices.a;

        // Only create entries for ask prices (immediate purchase prices)
        items.push({
          id: `${itemId++}`,
          itemHrid: itemPath,
          itemName: this.parseItemName(itemPath),
          enhancementLevel,
          quantity: 1,
          price: askPrice,
          pricePerUnit: askPrice,
          seller: 'Market',
          timeRemaining: 0,
          timestamp: new Date(apiData.timestamp * 1000).toISOString(),
        });
      });
    });

    return {
      items,
      lastUpdated: new Date(apiData.timestamp * 1000).toISOString(),
      totalItems: items.length,
    };
  }

  private static getStoredData(): { data: MarketData | null; timestamp: number | null } {
    // Check if we're running on the server (no localStorage)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return { data: null, timestamp: null };
    }

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const storedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

      return {
        data: storedData ? JSON.parse(storedData) : null,
        timestamp: storedTimestamp ? parseInt(storedTimestamp) : null,
      };
    } catch (error) {
      console.error('Error reading stored marketplace data:', error);
      return { data: null, timestamp: null };
    }
  }

  private static storeData(data: MarketData, timestamp: number): void {
    // Check if we're running on the server (no localStorage)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // Skip storing on server-side
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(TIMESTAMP_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error storing marketplace data:', error);
    }
  }

  public static async getMarketplaceData(): Promise<MarketData> {
    const { data: storedData, timestamp: storedTimestamp } = this.getStoredData();

    try {
      // Fetch fresh data to check timestamp
      const response = await fetch(MARKETPLACE_API_URL, {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch marketplace data: ${response.status} ${response.statusText}`);
      }

      const apiData: ApiMarketData = await response.json();

      // Validate API data structure
      if (!apiData.marketData || typeof apiData.timestamp !== 'number') {
        throw new Error('Invalid API response format');
      }

      const apiTimestamp = apiData.timestamp;

      // If we have stored data and it's current, use it
      if (storedData && storedTimestamp && storedTimestamp >= apiTimestamp) {
        console.log('Using cached marketplace data');
        return storedData;
      }

      // Transform and store fresh data
      console.log('Fetching fresh marketplace data');
      const transformedData = this.transformApiData(apiData);
      this.storeData(transformedData, apiTimestamp);

      return transformedData;
    } catch (error) {
      console.error('Error fetching marketplace data:', error);

      // Fall back to stored data if available
      if (storedData) {
        console.warn('Using cached data due to fetch error');
        return storedData;
      }

      // Return empty data if no stored data available
      console.warn('No marketplace data available, returning empty data');
      return {
        items: [],
        lastUpdated: new Date().toISOString(),
        totalItems: 0,
      };
    }
  }

  public static clearStoredData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error clearing stored marketplace data:', error);
    }
  }

  /**
   * Get the marketplace price for a specific item by name and enhancement level
   */
  public static async getItemPrice(itemName: string, enhancementLevel: number): Promise<number | null> {
    try {
      const marketData = await this.getMarketplaceData();

      // Convert item name to itemHrid format (reverse of parseItemName)
      const itemHrid = `/items/${itemName.toLowerCase().replace(/ /g, '_')}`;

      console.log(`🔍 MARKETPLACE SEARCH:`);
      console.log(`   Input: itemName="${itemName}", enhancementLevel=${enhancementLevel}`);
      console.log(`   Converted to: itemHrid="${itemHrid}"`);
      console.log(`   Total marketplace items: ${marketData.items.length}`);

      // Find matching items by itemHrid (ignore enhancement level first)
      const matchingItems = marketData.items.filter(item => item.itemHrid === itemHrid);
      console.log(`   Items with matching itemHrid: ${matchingItems.length}`);

      if (matchingItems.length > 0) {
        console.log(`   Available enhancement levels for this item:`, matchingItems.map(item => `+${item.enhancementLevel} (${item.price.toLocaleString()}c)`).join(', '));

        // Show all matching items with full details
        console.log(`   📋 All matching marketplace entries:`);
        matchingItems.forEach((item, index) => {
          console.log(`      [${index}] +${item.enhancementLevel}: ${item.price.toLocaleString()}c (itemHrid: "${item.itemHrid}", itemName: "${item.itemName}")`);
        });

        // Now find the specific enhancement level
        console.log(`   🎯 Looking for exact match: enhancementLevel === ${enhancementLevel}`);
        const exactMatch = matchingItems.find(item => {
          const isMatch = item.enhancementLevel === enhancementLevel;
          console.log(`      Checking: ${item.enhancementLevel} === ${enhancementLevel} ? ${isMatch}`);
          return isMatch;
        });

        if (exactMatch) {
          console.log(`💰 FOUND EXACT MATCH: ${exactMatch.price.toLocaleString()}c for ${itemName} +${enhancementLevel}`);
          console.log(`   ✅ Match details:`, {
            itemHrid: exactMatch.itemHrid,
            itemName: exactMatch.itemName,
            enhancementLevel: exactMatch.enhancementLevel,
            price: exactMatch.price,
            priceFormatted: exactMatch.price.toLocaleString() + 'c'
          });
          return exactMatch.price;
        } else {
          console.log(`❌ ENHANCEMENT LEVEL NOT FOUND: ${itemName} +${enhancementLevel} (item exists but not at this level)`);
          console.log(`   Available levels: ${matchingItems.map(item => item.enhancementLevel).sort((a, b) => a - b).join(', ')}`);
          return null;
        }
      } else {
        console.log(`❌ ITEM NOT FOUND: No items found with itemHrid="${itemHrid}"`);

        // Show a sample of available items for debugging
        const sampleItems = marketData.items.slice(0, 10).map(item => `${item.itemHrid} +${item.enhancementLevel} (${item.price.toLocaleString()}c)`);
        console.log(`   📋 Sample marketplace items (first 10):`, sampleItems);

        // Show items with similar names for debugging
        const similarItems = marketData.items
          .filter(item => item.itemName.toLowerCase().includes(itemName.toLowerCase()) || item.itemHrid.toLowerCase().includes(itemName.toLowerCase()))
          .slice(0, 5)
          .map(item => `"${item.itemName}" (${item.itemHrid}) +${item.enhancementLevel}`);

        if (similarItems.length > 0) {
          console.log(`   🔍 Items with similar names:`, similarItems);
        }

        return null;
      }
    } catch (error) {
      console.error(`❌ ERROR getting price for ${itemName} +${enhancementLevel}:`, error);
      return null;
    }
  }
}