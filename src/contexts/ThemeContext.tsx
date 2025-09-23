'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'classic' | 'light' | 'dark';

interface ThemeConfig {
  mode: ThemeMode;
  backgroundColor: string;
  textColor: string;
  cardBackground: string;
  borderColor: string;
  buttonBackground: string;
  buttonHover: string;
  inputBackground: string;
  inputBorder: string;
}

const themes: Record<ThemeMode, ThemeConfig> = {
  classic: {
    mode: 'classic',
    backgroundColor: 'bg-gray-900',
    textColor: 'text-white',
    cardBackground: 'bg-gray-800',
    borderColor: 'border-gray-600',
    buttonBackground: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    inputBackground: 'bg-gray-700',
    inputBorder: 'border-gray-600'
  },
  light: {
    mode: 'light',
    backgroundColor: 'bg-gray-50',
    textColor: 'text-gray-900',
    cardBackground: 'bg-white',
    borderColor: 'border-gray-300',
    buttonBackground: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    inputBackground: 'bg-white',
    inputBorder: 'border-gray-300'
  },
  dark: {
    mode: 'dark',
    backgroundColor: 'bg-gray-950',
    textColor: 'text-gray-100',
    cardBackground: 'bg-gray-900',
    borderColor: 'border-gray-700',
    buttonBackground: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    inputBackground: 'bg-gray-800',
    inputBorder: 'border-gray-700'
  }
};

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (mode: ThemeMode) => void;
  availableThemes: { mode: ThemeMode; name: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('classic');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeMode;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when changed
  useEffect(() => {
    localStorage.setItem('app-theme', currentTheme);

    // Apply background color to document body
    const bodyStyle = document.body.style;
    switch (currentTheme) {
      case 'light':
        bodyStyle.backgroundColor = '#f5f5f5';
        break;
      case 'dark':
        bodyStyle.backgroundColor = '#101010';
        break;
      default:
        bodyStyle.backgroundColor = '#111827'; // gray-900
    }
  }, [currentTheme]);

  const availableThemes = [
    { mode: 'classic' as ThemeMode, name: 'Classic', description: 'Original gaming-style dark theme' },
    { mode: 'light' as ThemeMode, name: 'Light Mode', description: 'Clean light theme for bright environments' },
    { mode: 'dark' as ThemeMode, name: 'Dark Mode', description: 'Pure dark theme for low-light use' }
  ];

  const value: ThemeContextType = {
    theme: themes[currentTheme],
    setTheme: setCurrentTheme,
    availableThemes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}