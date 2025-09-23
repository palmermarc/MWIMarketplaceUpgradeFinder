'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  fontSize?: number;
  className?: string;
}

export function Logo({ fontSize = 32, className = '' }: LogoProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`${className} ${theme.textColor}`}
      style={{
        fontFamily: 'var(--font-merriweather), serif',
        fontSize: `${fontSize}px`,
        fontWeight: 800,
        fontStyle: 'italic'
      }}
    >
      MWI Upgrade Finder
    </div>
  );
}