'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  fontSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Logo({ fontSize = 32, className = '', style = {} }: LogoProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`${className} ${theme.textColor}`}
      style={{
        fontFamily: 'var(--font-merriweather), serif',
        fontSize: `${fontSize}px`,
        fontWeight: 800,
        fontStyle: 'italic',
        ...style
      }}
    >
      MWI Upgrade Finder
    </div>
  );
}