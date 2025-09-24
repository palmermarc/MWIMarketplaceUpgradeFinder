'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SkillIconProps {
  skillId: string;
  className?: string;
  size?: number;
}

export function SkillIcon({ skillId, className = "", size = 24 }: SkillIconProps) {
  const [iconUrl, setIconUrl] = useState<string>('');

  useEffect(() => {
    // Create a placeholder icon as fallback
    const createPlaceholderIcon = () => {
      const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" fill="#4a5568" rx="8"/>
          <text x="20" y="24" text-anchor="middle" fill="white" font-size="10" font-family="monospace">?</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    // Try to fetch and process the skills sprite
    fetch('https://www.milkywayidle.com/static/media/skills_sprite.3bb4d936.svg')
      .then(response => response.text())
      .then(svgText => {
        // Parse the SVG and extract the specific symbol
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const symbol = doc.getElementById(skillId);

        if (symbol) {
          // Extract the viewBox from the symbol (default to 40x40 based on sprite analysis)
          const viewBox = symbol.getAttribute('viewBox') || '0 0 40 40';

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
  }, [skillId, size]);

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
    <Image
      src={iconUrl}
      alt={skillId}
      width={size}
      height={size}
      className={className}
      unoptimized={true}
    />
  );
}