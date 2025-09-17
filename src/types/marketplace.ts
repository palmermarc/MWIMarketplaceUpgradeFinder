export interface AuctionItem {
  id: string;
  itemHrid: string;
  itemName: string;
  enhancementLevel: number;
  quantity: number;
  price: number;
  pricePerUnit: number;
  seller: string;
  timeRemaining: number;
  timestamp: string;
}

export interface ApiMarketEntry {
  a: number; // ask/sell price
  b: number; // bid/buy price
}

export interface ApiMarketItem {
  [level: string]: ApiMarketEntry;
}

export interface ApiMarketData {
  marketData: {
    [itemPath: string]: ApiMarketItem;
  };
  timestamp: number;
}

export interface MarketData {
  items: AuctionItem[];
  lastUpdated: string;
  totalItems: number;
}

export interface ItemAnalysis {
  itemHrid: string;
  itemName: string;
  totalListings: number;
  averagePrice: number;
  medianPrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceHistory: PricePoint[];
  enhancementLevels: {
    [level: number]: {
      count: number;
      averagePrice: number;
      lowestPrice: number;
    };
  };
}

export interface PricePoint {
  timestamp: string;
  price: number;
  quantity: number;
}

export interface MarketFilter {
  itemName?: string;
  maxPrice?: number;
  minPrice?: number;
  enhancementLevel?: number;
  sortBy: 'price' | 'pricePerUnit' | 'timeRemaining' | 'quantity';
  sortOrder: 'asc' | 'desc';
}

export interface UpgradeOpportunity {
  currentItem: {
    itemHrid: string;
    itemName: string;
    enhancementLevel: number;
    slot: string;
  };
  suggestedUpgrade: {
    itemHrid: string;
    itemName: string;
    enhancementLevel: number;
    price: number;
    improvement: {
      stat: string;
      increase: number;
      percentage: number;
    };
  };
  costEfficiency: number;
}

export interface MarketStats {
  totalValue: number;
  totalListings: number;
  averagePrice: number;
  topCategories: {
    [category: string]: {
      count: number;
      totalValue: number;
    };
  };
}