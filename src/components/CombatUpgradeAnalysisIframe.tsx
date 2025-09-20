'use client';

import { useState } from 'react';
import { UpgradeOpportunity } from '@/types/marketplace';
import { CharacterStats } from '@/types/character';
import { ItemIcon } from './ItemIcon';

interface CombatUpgradeAnalysisProps {
  character: CharacterStats;
  upgrades: UpgradeOpportunity[];
  rawCharacterData?: string | null;
}

export function CombatUpgradeAnalysisIframe({ character, upgrades, rawCharacterData }: CombatUpgradeAnalysisProps) {
  const [showUpgrades, setShowUpgrades] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Equipment Upgrade Analysis (GitHub Pages - Static Version)
      </h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Note: Static Version</h3>
        <p className="text-blue-700">
          This is a simplified version for GitHub Pages. Combat simulation features require server-side processing
          and are only available on the Vercel deployment. This version shows marketplace upgrade opportunities
          based on your character data.
        </p>
      </div>

      {/* Character Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Character Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Attack:</span> {character.combat.attack}
          </div>
          <div>
            <span className="font-medium">Defense:</span> {character.combat.defense}
          </div>
          <div>
            <span className="font-medium">Magic:</span> {character.combat.magic}
          </div>
          <div>
            <span className="font-medium">Intelligence:</span> {character.combat.intelligence}
          </div>
        </div>
      </div>

      {/* Upgrade Opportunities */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Marketplace Upgrade Opportunities</h3>
          <button
            onClick={() => setShowUpgrades(!showUpgrades)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {showUpgrades ? 'Hide' : 'Show'} Upgrades ({upgrades.length})
          </button>
        </div>

        {showUpgrades && (
          <div className="space-y-4">
            {upgrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No upgrade opportunities found in the marketplace.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Item</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Slot</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Enhancement</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Price</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">Cost Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upgrades.slice(0, 20).map((upgrade, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 border-b">
                          <div className="flex items-center space-x-2">
                            <ItemIcon itemHrid={upgrade.suggestedUpgrade.itemHrid} size={24} />
                            <span className="text-sm font-medium">{upgrade.suggestedUpgrade.itemName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 border-b text-sm capitalize">
                          {upgrade.currentItem.slot.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-2 border-b text-sm">
                          +{upgrade.suggestedUpgrade.enhancementLevel}
                        </td>
                        <td className="px-4 py-2 border-b text-sm">
                          {upgrade.suggestedUpgrade.price.toLocaleString()} coins
                        </td>
                        <td className="px-4 py-2 border-b text-sm">
                          {upgrade.costEfficiency.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions for Full Version */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Want Combat Simulation?</h3>
        <p className="text-yellow-700 mb-2">
          For full combat simulation and upgrade testing features, visit the Vercel deployment:
        </p>
        <a
          href="https://mwimarketplaceupgradefinder-ddgbb2y45-marc-palmers-projects.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
        >
          Open Full Version on Vercel
        </a>
      </div>
    </div>
  );
}