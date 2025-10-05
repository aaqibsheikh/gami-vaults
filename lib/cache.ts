/**
 * Simple in-memory cache implementation
 * Used for caching API responses with TTL
 */

import { CacheEntry } from './dto';

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Set a cache entry with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  /**
   * Get a cache entry if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Destroy the cache and clear the cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global cache instance
export const cache = new MemoryCache();

/**
 * Generate cache keys for different API endpoints
 */
export const CacheKeys = {
  vaults: (chainIds: number[]) => `vaults:${chainIds.sort().join(',')}`,
  vault: (chainId: number, vaultId: string) => `vault:${chainId}:${vaultId}`,
  portfolio: (chainId: number, address: string) => `portfolio:${chainId}:${address}`,
  redemptions: (chainId: number, vault: string, address: string) => 
    `redemptions:${chainId}:${vault}:${address}`,
  tokenBalance: (chainId: number, token: string, address: string) =>
    `balance:${chainId}:${token}:${address}`,
  tokenAllowance: (chainId: number, token: string, owner: string, spender: string) =>
    `allowance:${chainId}:${token}:${owner}:${spender}`
} as const;

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  VAULTS_LIST: 15000,      // 15 seconds
  VAULT_DETAIL: 10000,     // 10 seconds
  PORTFOLIO: 5000,         // 5 seconds
  REDEMPTIONS: 10000,      // 10 seconds
  TOKEN_BALANCE: 5000,     // 5 seconds
  TOKEN_ALLOWANCE: 5000,   // 5 seconds
} as const;
