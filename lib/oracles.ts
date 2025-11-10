/**
 * Oracle adapter for price feeds
 * Integrates with Chainlink Data Feeds for real-time price data
 */

import { createPublicClient, http, PublicClient, getAddress } from 'viem';
import { mainnet } from 'viem/chains';
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

/**
 * Chainlink AggregatorV3Interface ABI
 * Reference: https://docs.chain.link/data-feeds/api-reference
 */
const CHAINLINK_AGGREGATOR_ABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Chainlink Price Feed addresses on Ethereum Mainnet
 * Reference: https://docs.chain.link/data-feeds/price-feeds/addresses
 */
const CHAINLINK_PRICE_FEEDS: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    // WBTC/USD - Use BTC/USD feed as proxy (WBTC/USD not available on mainnet)
    // Reference: https://data.chain.link/feeds/ethereum/mainnet/btc-usd
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': '0xF4030086522a5bEEA4988F8Ca5B36dbC97BeE88c',
    // WETH/USD
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    // USDC/USD (native USDC is typically $1, but using Chainlink for consistency)
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
    // USDT/USD
    '0xdac17f958d2ee523a2206206994597c13d831ec7': '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
  },
};

class OracleAdapter {
  private config: OracleConfig;
  private priceCache = new Map<string, PriceFeed>();
  private publicClients = new Map<number, PublicClient>();

  constructor(config: OracleConfig) {
    this.config = config;
  }

  /**
   * Get or create a public client for the specified chain
   */
  private getPublicClient(chainId: number): PublicClient {
    if (!this.publicClients.has(chainId)) {
      const rpcUrl = process.env[`RPC_${chainId}`] || 'https://eth.llamarpc.com';
      const publicClient = createPublicClient({
        chain: chainId === 1 ? mainnet : mainnet, // Add more chains as needed
        transport: http(rpcUrl),
      });
      this.publicClients.set(chainId, publicClient);
    }
    return this.publicClients.get(chainId)!;
  }

  /**
   * Fetch price from Chainlink oracle
   */
  private async fetchChainlinkPrice(
    tokenAddress: string,
    chainId: number
  ): Promise<{ price: number; decimals: number }> {
    console.log(`🔗 [Chainlink] Fetching price for ${tokenAddress} on chain ${chainId}`);
    
    // Get the Chainlink aggregator address for this token
    const chainFeeds = CHAINLINK_PRICE_FEEDS[chainId];
    if (!chainFeeds) {
      throw new Error(`Chainlink feeds not configured for chain ${chainId}`);
    }

    const aggregatorAddress = chainFeeds[tokenAddress.toLowerCase()];
    if (!aggregatorAddress) {
      throw new Error(`Chainlink feed not found for token ${tokenAddress} on chain ${chainId}`);
    }

    try {
      const publicClient = this.getPublicClient(chainId);
      
      // Normalize the address using checksum
      const normalizedAddress = getAddress(aggregatorAddress);
      
      // Read price and decimals from Chainlink
      const [priceData, feedDecimals] = await Promise.all([
        publicClient.readContract({
          address: normalizedAddress,
          abi: CHAINLINK_AGGREGATOR_ABI,
          functionName: 'latestRoundData',
        }) as Promise<readonly [bigint, bigint, bigint, bigint, bigint]>,
        publicClient.readContract({
          address: normalizedAddress,
          abi: CHAINLINK_AGGREGATOR_ABI,
          functionName: 'decimals',
        }) as Promise<number>,
      ]);

      const [, priceRaw] = priceData;
      
      // Chainlink typically returns prices with 8 decimals
      const price = Number(priceRaw) / Math.pow(10, feedDecimals);
      
      console.log(`✅ [Chainlink] Price: $${price} (decimals: ${feedDecimals})`);
      
      return { price, decimals: feedDecimals };
    } catch (error) {
      console.error(`❌ [Chainlink] Failed to fetch price:`, error);
      throw error;
    }
  }

  /**
   * Get price for a token using Chainlink oracle
   * Falls back to mock prices if Chainlink feed is not available
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

    // Try to fetch from Chainlink first
    let price: number;
    let decimals: number;
    let source: string;
    
    try {
      const chainlinkData = await this.fetchChainlinkPrice(token, chainId);
      price = chainlinkData.price;
      decimals = chainlinkData.decimals;
      source = 'chainlink';
      console.log(`✅ [Oracle] Using Chainlink price for ${token}`);
    } catch (error) {
      // Fallback to mock prices if Chainlink fails
      console.warn(`⚠️ [Oracle] Chainlink fetch failed for ${token}, using fallback`);
      const mockPrice = await this.fetchMockPrice(token, chainId);
      price = parseFloat(mockPrice);
      decimals = 18;
      source = 'fallback';
    }
    
    const priceFeed: PriceFeed = {
      token,
      price: price.toString(),
      decimals,
      lastUpdated: Date.now(),
      source
    };

    this.priceCache.set(cacheKey, priceFeed);
    return price.toString();
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
