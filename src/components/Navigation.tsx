'use client';

import { useTheme } from '@/contexts/ThemeContext';

export type NavigationTab = 'import-character' | 'find-upgrades' | 'calculate-costs' | 'quick-upgrades' | 'marketplace-analysis';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { theme } = useTheme();

  const tabs = [
    { id: 'import-character' as NavigationTab, label: 'Import Character' },
    { id: 'find-upgrades' as NavigationTab, label: 'Find Upgrades' },
    { id: 'calculate-costs' as NavigationTab, label: 'Calculate Costs' },
    { id: 'quick-upgrades' as NavigationTab, label: 'Quick Upgrades' },
    { id: 'marketplace-analysis' as NavigationTab, label: 'Marketplace Analysis' },
  ];

  return (
    <header className={`${theme.mode === 'classic' ? 'bg-gradient-to-r from-blue-800 via-purple-800 to-indigo-800 border-b border-white/20' : theme.mode === 'dark' ? 'border-b' : `${theme.cardBackground} border-b ${theme.borderColor}`} shadow-lg`} style={theme.mode === 'dark' ? { backgroundColor: '#1a1a1a', borderBottomColor: '#E8000A' } : {}}>
      <div className="w-full px-6 py-4">
        <div className="flex items-center">
          {/* Logo */}
          <div
            className={`flex-shrink-0 ${theme.textColor}`}
            style={{
              fontFamily: 'var(--font-merriweather), serif',
              fontSize: '40px',
              fontWeight: 800,
              fontStyle: 'italic',
              ...(theme.mode === 'dark' ? { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' } : {})
            }}
          >
            MWI Upgrade Finder
          </div>

          {/* Navigation Tabs - Centered */}
          <nav className="flex space-x-1 flex-1 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${theme.buttonBackground} ${theme.textColor}`
                    : `${theme.textColor} opacity-70 hover:opacity-100 ${theme.mode === 'classic' ? 'hover:bg-white/10' : theme.mode === 'dark' ? 'hover:bg-orange-700/20' : 'hover:bg-gray-500/10'}`
                }`}
                style={{
                  ...(theme.mode === 'dark' ? { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' } : {}),
                  ...(activeTab === tab.id && theme.mode === 'dark' ? { backgroundColor: '#E8000A' } : {})
                }}
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