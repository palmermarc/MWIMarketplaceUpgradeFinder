import { getItemByName } from '@/constants/items';

export interface ItemCostResult {
  itemName: string;
  itemHrid: string;
  enhancementLevel: number;
  unitPrice?: number;
  totalCost?: number;
  marketplaceAvailable: boolean;
  found: boolean;
  error?: string;
}

export interface MarketplaceItemData {
  itemHrid: string;
  itemName: string;
  enhancementLevel: number;
  price: number;
  pricePerUnit: number;
  quantity: number;
  timestamp: string;
}

export interface MarketplaceData {
  items: MarketplaceItemData[];
  lastUpdated: string;
  totalItems: number;
}

/**
 * Calculate the cost of an item based on its name and enhancement level from marketplace data
 * @param itemName - The display name of the item (e.g., "Iron Sword", "Bronze Helmet")
 * @param enhancementLevel - The enhancement level of the item (0-20)
 * @param marketplaceData - The marketplace data containing current prices
 * @param quantity - Number of items to calculate cost for (default: 1)
 * @returns ItemCostResult with pricing information
 */
export const calculateItemCost = (
  itemName: string,
  enhancementLevel: number = 0,
  marketplaceData?: MarketplaceData,
  quantity: number = 1
): ItemCostResult => {
  // Normalize item name and find item info
  const normalizedItemName = itemName.trim();
  const itemInfo = getItemByName(normalizedItemName);

  if (!itemInfo) {
    return {
      itemName: normalizedItemName,
      itemHrid: `/items/${normalizedItemName.toLowerCase().replace(/\s+/g, '_')}`,
      enhancementLevel,
      marketplaceAvailable: false,
      found: false,
      error: `Item "${normalizedItemName}" not found in item database`
    };
  }

  const result: ItemCostResult = {
    itemName: itemInfo.displayName,
    itemHrid: itemInfo.itemHrid,
    enhancementLevel,
    marketplaceAvailable: false,
    found: true
  };

  // If no marketplace data provided, return basic info
  if (!marketplaceData) {
    result.error = 'No marketplace data provided';
    return result;
  }

  // Find matching items in marketplace data
  const matchingItems = marketplaceData.items.filter(item =>
    item.itemHrid === itemInfo.itemHrid &&
    item.enhancementLevel === enhancementLevel
  );

  if (matchingItems.length === 0) {
    result.error = `Item "${itemInfo.displayName}" +${enhancementLevel} not found in marketplace`;
    return result;
  }

  // Find the cheapest available option
  const cheapestItem = matchingItems.reduce((cheapest, current) =>
    current.pricePerUnit < cheapest.pricePerUnit ? current : cheapest
  );

  result.marketplaceAvailable = true;
  result.unitPrice = cheapestItem.pricePerUnit;
  result.totalCost = cheapestItem.pricePerUnit * quantity;

  return result;
};

/**
 * Calculate costs for multiple items with different enhancement levels
 */
export const calculateMultipleItemCosts = (
  items: Array<{ itemName: string; enhancementLevel: number; quantity?: number }>,
  marketplaceData?: MarketplaceData
): {
  calculations: ItemCostResult[];
  summary: {
    totalItems: number;
    totalCost?: number;
    availableItems: number;
    unavailableItems: number;
  };
} => {
  const calculations = items.map(({ itemName, enhancementLevel, quantity = 1 }) =>
    calculateItemCost(itemName, enhancementLevel, marketplaceData, quantity)
  );

  const availableItems = calculations.filter(calc => calc.marketplaceAvailable).length;
  const unavailableItems = calculations.length - availableItems;
  const totalItems = calculations.reduce((sum, calc) => sum + (calc.totalCost ? 1 : 0), 0);

  let totalCost: number | undefined;
  const hasAllCosts = calculations.every(calc => calc.totalCost !== undefined);

  if (hasAllCosts) {
    totalCost = calculations.reduce((sum, calc) => sum + (calc.totalCost || 0), 0);
  }

  return {
    calculations,
    summary: {
      totalItems,
      totalCost,
      availableItems,
      unavailableItems
    }
  };
};

/**
 * Find the cheapest enhancement level for an item within a range
 */
export const findCheapestEnhancementLevel = (
  itemName: string,
  minLevel: number = 0,
  maxLevel: number = 20,
  marketplaceData?: MarketplaceData
): {
  cheapestLevel?: number;
  cheapestPrice?: number;
  allLevels: Array<{ level: number; price?: number; available: boolean }>;
} => {
  const allLevels: Array<{ level: number; price?: number; available: boolean }> = [];
  let cheapestLevel: number | undefined;
  let cheapestPrice: number | undefined;

  for (let level = minLevel; level <= maxLevel; level++) {
    const result = calculateItemCost(itemName, level, marketplaceData);

    allLevels.push({
      level,
      price: result.unitPrice,
      available: result.marketplaceAvailable
    });

    if (result.marketplaceAvailable && result.unitPrice !== undefined) {
      if (cheapestPrice === undefined || result.unitPrice < cheapestPrice) {
        cheapestPrice = result.unitPrice;
        cheapestLevel = level;
      }
    }
  }

  return {
    cheapestLevel,
    cheapestPrice,
    allLevels
  };
};

/**
 * Calculate cost efficiency (price per enhancement level) for an item
 */
export const calculateItemCostEfficiency = (
  itemName: string,
  enhancementLevel: number,
  marketplaceData?: MarketplaceData
): {
  costPerLevel?: number;
  totalCost?: number;
  enhancementLevel: number;
  available: boolean;
} => {
  const result = calculateItemCost(itemName, enhancementLevel, marketplaceData);

  return {
    costPerLevel: result.unitPrice && enhancementLevel > 0
      ? result.unitPrice / enhancementLevel
      : result.unitPrice,
    totalCost: result.unitPrice,
    enhancementLevel,
    available: result.marketplaceAvailable
  };
};

/**
 * Compare costs between different enhancement levels of the same item
 */
export const compareEnhancementLevelCosts = (
  itemName: string,
  levels: number[],
  marketplaceData?: MarketplaceData
): Array<{
  level: number;
  price?: number;
  costPerLevel?: number;
  available: boolean;
  costEfficiencyRank?: number;
}> => {
  const comparisons = levels.map(level => {
    const result = calculateItemCost(itemName, level, marketplaceData);
    const costPerLevel = result.unitPrice && level > 0 ? result.unitPrice / level : undefined;

    return {
      level,
      price: result.unitPrice,
      costPerLevel,
      available: result.marketplaceAvailable,
      costEfficiencyRank: undefined as number | undefined
    };
  });

  // Rank by cost efficiency (lower cost per level is better)
  const availableComparisons = comparisons.filter(comp => comp.available && comp.costPerLevel);
  availableComparisons.sort((a, b) => (a.costPerLevel || Infinity) - (b.costPerLevel || Infinity));

  availableComparisons.forEach((comp, index) => {
    const original = comparisons.find(c => c.level === comp.level);
    if (original) {
      original.costEfficiencyRank = index + 1;
    }
  });

  return comparisons;
};