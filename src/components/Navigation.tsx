'use client';

import { useState } from 'react';
import { Logo } from './Logo';

export type NavigationTab = 'import-character' | 'find-upgrades' | 'calculate-costs' | 'quick-upgrades' | 'marketplace-analysis';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'import-character' as NavigationTab, label: 'Import Character' },
    { id: 'find-upgrades' as NavigationTab, label: 'Find Upgrades' },
    { id: 'calculate-costs' as NavigationTab, label: 'Calculate Costs' },
    { id: 'quick-upgrades' as NavigationTab, label: 'Quick Upgrades' },
    { id: 'marketplace-analysis' as NavigationTab, label: 'Marketplace Analysis' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-800 via-purple-800 to-indigo-800 border-b border-white/20 shadow-lg">
      <div className="w-full px-6 py-4">
        <div className="flex items-center">
          {/* Logo */}
          <Logo fontSize={40} className="flex-shrink-0" />

          {/* Navigation Tabs - Centered */}
          <nav className="flex space-x-1 flex-1 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10"
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}