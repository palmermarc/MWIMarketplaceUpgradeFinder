'use client';

interface LogoProps {
  fontSize?: number;
  color?: string;
  className?: string;
}

export function Logo({ fontSize = 32, color = '#fff', className = '' }: LogoProps) {
  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--font-merriweather), serif',
        fontSize: `${fontSize}px`,
        color: color,
        fontWeight: 800,
        fontStyle: 'italic'
      }}
    >
      MWI Upgrade Finder
    </div>
  );
}