'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export type NavigationTab = 'import-character' | 'find-upgrades' | 'calculate-costs' | 'quick-upgrades' | 'marketplace-analysis' | 'skills-calculator';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'import-character' as NavigationTab, label: 'Import Character' },
    { id: 'find-upgrades' as NavigationTab, label: 'Find Upgrades' },
    { id: 'calculate-costs' as NavigationTab, label: 'Calculate Costs' },
    //{ id: 'quick-upgrades' as NavigationTab, label: 'Quick Upgrades' },
    //{ id: 'skills-calculator' as NavigationTab, label: 'Skills Calculator' },
  ];

  const handleTabChange = (tab: NavigationTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  return (
    <header
      className={`${theme.mode === 'classic' ? 'border-b' : theme.mode === 'dark' ? 'border-b' : `${theme.cardBackground} border-b ${theme.borderColor}`} shadow-lg`}
      style={{
        ...(theme.mode === 'classic' ? {
          background: 'linear-gradient(180deg,rgba(84,109,219,.5019607843),rgba(84,109,219,0))',
          borderBottomColor: '#98a7e9'
        } : {}),
        ...(theme.mode === 'dark' ? {
          backgroundColor: '#1a1a1a',
          borderBottomColor: '#E8000A'
        } : {})
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Max 75% width */}
          <div
            className={`${theme.textColor} max-w-[75%]`}
            style={{
              fontFamily: 'var(--font-merriweather), serif',
              fontSize: 'clamp(24px, 5vw, 40px)',
              fontWeight: 800,
              fontStyle: 'italic',
              ...(theme.mode === 'dark' ? { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' } : {})
            }}
          >
            MWI Upgrade Finder
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${theme.buttonBackground} ${theme.textColor}`
                    : `${theme.textColor} opacity-70 hover:opacity-100 ${theme.mode === 'classic' ? 'hover:bg-blue-700/20' : theme.mode === 'dark' ? 'hover:bg-orange-700/20' : 'hover:bg-gray-500/10'}`
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

          {/* Mobile Hamburger Menu Button - Shown only on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${theme.textColor} hover:bg-black/20 transition-colors`}
            aria-label="Toggle navigation menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-current mt-1 transform transition duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-current mt-1 transform transition duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Menu - Shown only when hamburger is clicked */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-current/20">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? `${theme.buttonBackground} ${theme.textColor}`
                      : `${theme.textColor} opacity-70 hover:opacity-100 ${theme.mode === 'classic' ? 'hover:bg-blue-700/20' : theme.mode === 'dark' ? 'hover:bg-orange-700/20' : 'hover:bg-gray-500/10'}`
                  }`}
                  style={{
                    ...(theme.mode === 'dark' ? { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' } : {}),
                    ...(activeTab === tab.id && theme.mode === 'dark' ? { backgroundColor: '#E8000A' } : {})
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}