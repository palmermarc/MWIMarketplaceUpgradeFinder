'use client';

import { useState, useEffect } from 'react';

interface ItemIconProps {
  itemHrid: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function ItemIcon({ itemHrid, className = "", size = 24, style = {} }: ItemIconProps) {
  const [iconUrl, setIconUrl] = useState<string>('');

  useEffect(() => {
    // Safety check for undefined or invalid itemHrid
    if (!itemHrid || typeof itemHrid !== 'string') {
      setIconUrl('');
      return;
    }

    const getIconId = (hrid: string): string => {
      return hrid.replace('/items/', '').replace(/\//g, '_');
    };

    const iconId = getIconId(itemHrid);

    // Create a placeholder icon as fallback
    const createPlaceholderIcon = () => {
      const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" fill="#4a5568" rx="8"/>
          <text x="32" y="36" text-anchor="middle" fill="white" font-size="12" font-family="monospace">?</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    // Try to fetch and process the sprite, fallback to placeholder
    fetch('https://www.milkywayidle.com/static/media/items_sprite.d4d08849.svg')
      .then(response => response.text())
      .then(svgText => {
        // Parse the SVG and extract the specific symbol
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const symbol = doc.getElementById(iconId);

        if (symbol) {
          // Extract the viewBox from the symbol
          const viewBox = symbol.getAttribute('viewBox') || '0 0 64 64';

          // Create a standalone SVG with the symbol content
          const symbolContent = symbol.innerHTML;
          const standaloneSvg = `
            <svg width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
              ${symbolContent}
            </svg>
          `;

          setIconUrl(`data:image/svg+xml;base64,${btoa(standaloneSvg)}`);
        } else {
          setIconUrl(createPlaceholderIcon());
        }
      })
      .catch(() => {
        setIconUrl(createPlaceholderIcon());
      });
  }, [itemHrid, size]);

  if (!iconUrl) {
    return (
      <div
        className={`${className} bg-gray-600 rounded flex items-center justify-center`}
        style={{ width: size, height: size }}
      >
        <span className="text-white text-xs">?</span>
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={itemHrid}
      width={size}
      height={size}
      className={className}
      style={style}
    />
  );
}