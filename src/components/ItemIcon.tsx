'use client';

interface ItemIconProps {
  itemHrid: string;
  className?: string;
  size?: number;
}

export function ItemIcon({ itemHrid, className = "", size = 24 }: ItemIconProps) {
  const getIconId = (hrid: string): string => {
    return hrid.replace('/items/', '').replace(/\//g, '_');
  };

  const iconId = getIconId(itemHrid);

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 64 64"
    >
      <use
        xlinkHref={`https://www.milkywayidle.com/static/media/items_sprite.d4d08849.svg#${iconId}`}
      />
    </svg>
  );
}