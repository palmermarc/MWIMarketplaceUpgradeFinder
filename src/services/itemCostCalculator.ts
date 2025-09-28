/**
 * Item Cost Calculator Service
 *
 * Provides reusable functions for calculating marketplace costs for items
 */

import { MarketData } from '@/types/marketplace';

export interface ItemCostResult {
  itemHrid: string;
  itemName: string;
  quantityNeeded: number;
  unitPrice?: number;
  totalCost?: number;
  available: boolean;
  costEfficiencyRank?: number;
}

export interface ItemCostCalculationResult {
  items: ItemCostResult[];
  totalCost: number;
  hasAllPrices: boolean;
  unavailableItems: string[];
}

/**
 * Calculate marketplace costs for a list of items
 * @param items Array of items with their required quantities
 * @param marketData Marketplace data containing item prices
 * @returns Calculation result with costs and availability
 */
export function calculateMarketplaceCosts(
  items: Array<{ itemHrid: string; itemName: string; quantity: number }>,
  marketData?: MarketData | null
): ItemCostCalculationResult {
  // Starting marketplace cost calculation

  const result: ItemCostCalculationResult = {
    items: [],
    totalCost: 0,
    hasAllPrices: true,
    unavailableItems: []
  };

  if (!marketData) {
    // No marketplace data available for cost calculation
    result.hasAllPrices = false;
    result.unavailableItems = items.map(item => item.itemName);
    return result;
  }

  // Processing marketplace data

  items.forEach((item, index) => {
    // Processing item

    // Find the item in marketplace data
    const marketplaceItem = marketData.items.find(marketItem => marketItem.itemHrid === item.itemHrid);

    const itemResult: ItemCostResult = {
      itemHrid: item.itemHrid,
      itemName: item.itemName,
      quantityNeeded: item.quantity,
      available: false,
      costEfficiencyRank: undefined as number | undefined
    };

    if (marketplaceItem && marketplaceItem.pricePerUnit && marketplaceItem.pricePerUnit > 0) {
      itemResult.unitPrice = marketplaceItem.pricePerUnit;
      itemResult.totalCost = Math.ceil(marketplaceItem.pricePerUnit * item.quantity);
      itemResult.available = true;

      // Found in marketplace

      result.totalCost += itemResult.totalCost;
    } else {
      // Not available in marketplace
      result.hasAllPrices = false;
      result.unavailableItems.push(item.itemName);
    }

    result.items.push(itemResult);
  });

  // Final calculation summary complete

  if (result.unavailableItems.length > 0) {
    // Some items unavailable
  }

  return result;
}

/**
 * Calculate costs specifically for house upgrade materials
 * @param materials Materials needed for house upgrades
 * @param marketData Marketplace data
 * @returns Calculation result formatted for house upgrades
 */
export function calculateHouseMaterialCosts(
  materials: { [itemHrid: string]: { itemName: string; quantity: number } },
  marketData?: MarketData | null
): ItemCostCalculationResult {
  // Starting house material cost calculation

  const itemsArray = Object.entries(materials).map(([itemHrid, data]) => ({
    itemHrid,
    itemName: data.itemName,
    quantity: data.quantity
  }));

  return calculateMarketplaceCosts(itemsArray, marketData);
}