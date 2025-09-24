'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function FloatingStyleChanger() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full ${theme.buttonBackground} ${theme.buttonHover} ${theme.textColor} shadow-lg transition-all duration-200 flex items-center justify-center border ${theme.borderColor}`}
        title="Change Theme"
        style={theme.mode === 'dark' ? {
          backgroundColor: '#e05a3e',
          borderColor: '#e05a3e',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
        } : {}}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
      </button>

      {/* Style Selector Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className={`fixed bottom-20 right-6 z-50 ${theme.cardBackground} border ${theme.borderColor} rounded-lg shadow-xl p-4 w-80 animate-in slide-in-from-bottom-2 duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${theme.textColor}`}>Theme Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`${theme.textColor} hover:opacity-70 transition-opacity`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {availableThemes.map((themeOption) => (
                <button
                  key={themeOption.mode}
                  onClick={() => {
                    setTheme(themeOption.mode);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    theme.mode === themeOption.mode
                      ? `${theme.buttonBackground} ${theme.textColor} border-blue-500`
                      : `${theme.cardBackground} ${theme.textColor} ${theme.borderColor} hover:border-blue-400`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{themeOption.name}</div>
                      <div className={`text-sm opacity-70`}>
                        {themeOption.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Theme preview dots */}
                      <div className="flex gap-1">
                        {themeOption.mode === 'classic' && (
                          <>
                            <div className="w-3 h-3 rounded-full bg-gray-900 border border-gray-600"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                          </>
                        )}
                        {themeOption.mode === 'light' && (
                          <>
                            <div className="w-3 h-3 rounded-full bg-gray-50 border border-gray-300"></div>
                            <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                          </>
                        )}
                        {themeOption.mode === 'dark' && (
                          <>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#556b2f', border: '1px solid #e05a3e' }}></div>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E8000A' }}></div>
                          </>
                        )}
                      </div>
                      {theme.mode === themeOption.mode && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className={`mt-4 pt-3 border-t ${theme.borderColor}`}>
              <div className={`text-xs ${theme.textColor} opacity-60`}>
                Theme preferences are saved automatically
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}