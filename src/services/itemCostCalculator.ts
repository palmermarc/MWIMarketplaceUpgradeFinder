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
  console.log('🏪 MARKETPLACE COST CALCULATOR: Starting calculation...');
  console.log(`📋 Items to calculate: ${items.length}`);

  const result: ItemCostCalculationResult = {
    items: [],
    totalCost: 0,
    hasAllPrices: true,
    unavailableItems: []
  };

  if (!marketData) {
    console.warn('⚠️ No marketplace data available for cost calculation');
    result.hasAllPrices = false;
    result.unavailableItems = items.map(item => item.itemName);
    return result;
  }

  console.log(`🛒 Marketplace data contains ${marketData.totalItems} items`);

  items.forEach((item, index) => {
    console.log(`\n--- Processing Item ${index + 1}/${items.length} ---`);
    console.log(`📦 Item: ${item.itemName} (${item.itemHrid})`);
    console.log(`🔢 Quantity needed: ${item.quantity.toLocaleString()}`);

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

      console.log(`✅ Found in marketplace!`);
      console.log(`💰 Unit price: ${marketplaceItem.pricePerUnit.toLocaleString()} coins`);
      console.log(`🧮 Calculation: ${marketplaceItem.pricePerUnit.toLocaleString()} × ${item.quantity.toLocaleString()} = ${itemResult.totalCost.toLocaleString()} coins`);

      result.totalCost += itemResult.totalCost;
    } else {
      console.log(`❌ Not available in marketplace or price is 0`);
      result.hasAllPrices = false;
      result.unavailableItems.push(item.itemName);
    }

    result.items.push(itemResult);
  });

  console.log(`\n📊 FINAL CALCULATION SUMMARY:`);
  console.log(`✅ Available items: ${result.items.filter(i => i.available).length}/${items.length}`);
  console.log(`❌ Unavailable items: ${result.unavailableItems.length}`);
  console.log(`💰 Total marketplace cost: ${result.totalCost.toLocaleString()} coins`);
  console.log(`🎯 All prices available: ${result.hasAllPrices ? 'YES' : 'NO'}`);

  if (result.unavailableItems.length > 0) {
    console.log(`⚠️ Unavailable items: ${result.unavailableItems.join(', ')}`);
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
  console.log('\n🏠 HOUSE MATERIAL COST CALCULATOR: Starting...');

  const itemsArray = Object.entries(materials).map(([itemHrid, data]) => ({
    itemHrid,
    itemName: data.itemName,
    quantity: data.quantity
  }));

  return calculateMarketplaceCosts(itemsArray, marketData);
}