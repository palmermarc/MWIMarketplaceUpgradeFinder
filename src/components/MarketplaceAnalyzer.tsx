'use client';

import { useState, useEffect } from 'react';
import { MarketData, AuctionItem, ItemAnalysis, UpgradeOpportunity } from '@/types/marketplace';
import { CharacterStats } from '@/types/character';

interface MarketplaceAnalyzerProps {
  character: CharacterStats;
  marketData: MarketData;
}

export function MarketplaceAnalyzer({ character, marketData }: MarketplaceAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ItemAnalysis[]>([]);
  const [upgrades, setUpgrades] = useState<UpgradeOpportunity[]>([]);

  useEffect(() => {
    if (marketData && character) {
      analyzeMarket(marketData);
      findUpgradeOpportunities(marketData, character);
    }
  }, [marketData, character]);


  const analyzeMarket = (data: MarketData) => {
    const itemGroups: { [key: string]: AuctionItem[] } = {};

    data.items.forEach(item => {
      const groupKey = `${item.itemHrid}_${item.enhancementLevel}`;
      if (!itemGroups[groupKey]) {
        itemGroups[groupKey] = [];
      }
      itemGroups[groupKey].push(item);
    });

    const analysisResults: ItemAnalysis[] = Object.entries(itemGroups).map(([, items]) => {
      const prices = items.map(item => item.pricePerUnit).sort((a, b) => a - b);
      
      return {
        itemHrid: items[0].itemHrid,
        itemName: items[0].itemName,
        totalListings: items.length,
        averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
        medianPrice: prices[Math.floor(prices.length / 2)],
        lowestPrice: prices[0],
        highestPrice: prices[prices.length - 1],
        priceHistory: items.map(item => ({
          timestamp: item.timestamp,
          price: item.pricePerUnit,
          quantity: item.quantity,
        })),
        enhancementLevels: {
          [items[0].enhancementLevel]: {
            count: items.length,
            averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
            lowestPrice: prices[0],
          },
        },
      };
    });

    setAnalysis(analysisResults);
  };

  const findUpgradeOpportunities = (data: MarketData, char: CharacterStats) => {
    const opportunities: UpgradeOpportunity[] = [];

    Object.entries(char.equipment).forEach(([slot, equipment]) => {
      const currentItemName = equipment.item.toLowerCase().replace(/\s+/g, '_');
      const potentialUpgrades = data.items.filter(item => {
        const itemName = item.itemName.toLowerCase().replace(/\s+/g, '_');
        return itemName === currentItemName && item.enhancementLevel > equipment.enhancement;
      });

      potentialUpgrades.forEach(upgrade => {
        if (upgrade.enhancementLevel > equipment.enhancement) {
          opportunities.push({
            currentItem: {
              itemHrid: `/items/${currentItemName}`,
              itemName: equipment.item,
              enhancementLevel: equipment.enhancement,
              slot: slot,
            },
            suggestedUpgrade: {
              itemHrid: upgrade.itemHrid,
              itemName: upgrade.itemName,
              enhancementLevel: upgrade.enhancementLevel,
              price: upgrade.price,
              improvement: {
                stat: 'Enhancement Level',
                increase: upgrade.enhancementLevel - equipment.enhancement,
                percentage: ((upgrade.enhancementLevel - equipment.enhancement) / Math.max(equipment.enhancement, 1)) * 100,
              },
            },
            costEfficiency: upgrade.price / Math.max(upgrade.enhancementLevel - equipment.enhancement, 1),
          });
        }
      });
    });

    opportunities.sort((a, b) => a.costEfficiency - b.costEfficiency);
    setUpgrades(opportunities.slice(0, 10));
  };

  const exportData = () => {
    const exportPayload = {
      character,
      marketData: {
        lastUpdated: marketData.lastUpdated,
        totalItems: marketData.totalItems,
        analysis,
      },
      upgradeOpportunities: upgrades,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mwi-character-upgrades-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Marketplace Analysis</h2>
        <button
          onClick={() => exportData()}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
        >
          Export Data
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-200 mb-4">Market Data Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Total Items:</span>
              <span className="text-white ml-2">{marketData.totalItems}</span>
            </div>
            <div>
              <span className="text-gray-300">Unique Items:</span>
              <span className="text-white ml-2">{analysis.length}</span>
            </div>
            <div>
              <span className="text-gray-300">Last Updated:</span>
              <span className="text-white ml-2">{new Date(marketData.lastUpdated).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {upgrades.length > 0 && (
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-purple-200 mb-4">
              Best Upgrade Opportunities ({upgrades.length} found)
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {upgrades.slice(0, 10).map((upgrade, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-medium">{upgrade.currentItem.slot}</p>
                      <p className="text-gray-300 text-sm">
                        {upgrade.currentItem.itemName} +{upgrade.currentItem.enhancementLevel} → {upgrade.suggestedUpgrade.itemName} +{upgrade.suggestedUpgrade.enhancementLevel}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Cost efficiency: {upgrade.costEfficiency.toFixed(0)} coins/level
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-300 font-medium">{upgrade.suggestedUpgrade.price.toLocaleString()} coins</p>
                      <p className="text-gray-400 text-sm">+{upgrade.suggestedUpgrade.improvement.increase} levels</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upgrades.length === 0 && (
          <div className="bg-gray-500/20 border border-gray-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-200 mb-2">No Upgrades Found</h3>
            <p className="text-gray-400">
              No upgrade opportunities were found in the current marketplace data for your character&apos;s equipment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}