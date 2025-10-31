/**
 * Oracle adapter for price feeds
 * Placeholder implementation - replace with actual oracle integration
 */

import { NetworkConfig } from './dto';

export interface PriceFeed {
  token: string;
  price: string; // normalized decimal string
  decimals: number;
  lastUpdated: number;
  source: string;
}

export interface OracleConfig {
  policy: string;
  fallbackPrice?: number;
  maxAge: number; // maximum age in milliseconds
}

class OracleAdapter {
  private config: OracleConfig;
  private priceCache = new Map<string, PriceFeed>();

  constructor(config: OracleConfig) {
    this.config = config;
  }

  /**
   * Get price for a token (placeholder implementation)
   * TODO: Replace with actual oracle integration (Chainlink, Pyth, etc.)
   */
  async getTokenPrice(
    token: string,
    chainId: number,
    forceRefresh: boolean = false
  ): Promise<string> {
    const cacheKey = `${chainId}:${token}`;
    
    if (!forceRefresh && this.priceCache.has(cacheKey)) {
      const cached = this.priceCache.get(cacheKey)!;
      const age = Date.now() - cached.lastUpdated;
      
      if (age < this.config.maxAge) {
        return cached.price;
      }
    }

    // TODO: Replace with actual oracle call
    const mockPrice = await this.fetchMockPrice(token, chainId);
    
    const priceFeed: PriceFeed = {
      token,
      price: mockPrice,
      decimals: 18,
      lastUpdated: Date.now(),
      source: 'mock'
    };

    this.priceCache.set(cacheKey, priceFeed);
    return mockPrice;
  }

  /**
   * Get multiple token prices in batch
   */
  async getTokenPrices(
    tokens: string[],
    chainId: number,
    forceRefresh: boolean = false
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Process in parallel
    const promises = tokens.map(async (token) => {
      const price = await this.getTokenPrice(token, chainId, forceRefresh);
      results.set(token, price);
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Convert token amount to USD value
   */
  async getUsdValue(
    token: string,
    amount: string,
    chainId: number,
    decimals: number = 18
  ): Promise<string> {
    const price = await this.getTokenPrice(token, chainId);
    const tokenAmount = parseFloat(amount);
    const tokenPrice = parseFloat(price);
    
    const usdValue = tokenAmount * tokenPrice;
    console.log('usdValue.toString', usdValue.toString())
    return usdValue.toString();
  }

  /**
   * Mock price fetcher - replace with real oracle
   */
  private async fetchMockPrice(token: string, chainId: number): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock prices based on token address
    const mockPrices: Record<string, number> = {
      // ETH
      '0x0000000000000000000000000000000000000000': 2500,
      // USDC
      '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C': 1,
      // USDT
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 1,
      // WETH
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 2500,
    };

    const lowerToken = token.toLowerCase();
    const price = mockPrices[lowerToken] || this.config.fallbackPrice || 1;
    
    return price.toString();
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this.priceCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.priceCache.size,
      keys: Array.from(this.priceCache.keys()),
      config: this.config
    };
  }
}

// Global oracle instance
export const oracle = new OracleAdapter({
  policy: process.env.ORACLE_POLICY || 'ibt-native',
  fallbackPrice: 1,
  maxAge: 30000 // 30 seconds
});

/**
 * Helper function to get USD value for a token amount
 */
export async function getUsdValue(
  token: string,
  amount: string,
  chainId: number,
  decimals: number = 18
): Promise<string> {
  return oracle.getUsdValue(token, amount, chainId, decimals);
}

/**
 * Helper function to get multiple USD values
 */
export async function getUsdValues(
  entries: Array<{ token: string; amount: string; decimals?: number }>,
  chainId: number
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  const promises = entries.map(async (entry, index) => {
    const usdValue = await getUsdValue(
      entry.token,
      entry.amount,
      chainId,
      entry.decimals || 18
    );
    results.set(`${entry.token}:${index}`, usdValue);
  });

  await Promise.all(promises);
  return results;
}
