/**
 * August Digital SDK initialization and management
 * Server-only file - never import in client components
 */

import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from 'viem';
import { mainnet, arbitrum, optimism, base } from 'viem/chains';
import { NetworkConfig, AugustVaultResponse, AugustVaultSummary, AugustAPYResponse, AugustWithdrawalSummary } from './dto';

/**
 * Retry utility for API calls
 */
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Supported networks configuration
export const NETWORKS: Record<number, NetworkConfig> = {
  1: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: process.env.RPC_1 || 'https://mainnet.infura.io/v3/your-key',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: process.env.RPC_42161 || 'https://arb-mainnet.g.alchemy.com/v2/your-key',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  10: {
    chainId: 10,
    name: 'Optimism',
    rpcUrl: process.env.RPC_10 || 'https://optimism-mainnet.g.alchemy.com/v2/your-key',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  8453: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: process.env.RPC_8453 || 'https://base-mainnet.g.alchemy.com/v2/your-key',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Viem chain configurations
const VIEM_CHAINS = {
  1: mainnet,
  42161: arbitrum,
  10: optimism,
  8453: base
};

/**
 * August Digital SDK Client interface
 */
export interface SdkClient {
  chainId: number;
  publicClient: any; // Using any to avoid viem type conflicts
  walletClient?: any;
  
  // Vault operations using August Digital API
  getVaults(status?: 'active' | 'closed'): Promise<AugustVaultResponse[]>;
  getVault(address: string): Promise<AugustVaultResponse>;
  getVaultSummary(address: string): Promise<AugustVaultSummary>;
  getVaultAPY(address: string): Promise<AugustAPYResponse>;
  getVaultWithdrawals(address: string): Promise<AugustWithdrawalSummary>;
  
  // Position operations (will need to be implemented with on-chain data)
  getPositions(userAddress: string): Promise<any[]>;
  getPosition(vaultAddress: string, userAddress: string): Promise<any>;
  
  // Redemption operations
  getRedemptions(userAddress: string, vaultAddress?: string): Promise<any[]>;
  
  // Transaction builders (will need contract interaction)
  buildDepositTx(vaultAddress: string, amount: string, userAddress: string): Promise<any>;
  buildWithdrawTx(vaultAddress: string, shares: string, userAddress: string): Promise<any>;
  buildApprovalTx(tokenAddress: string, spender: string, amount: string): Promise<any>;
}

/**
 * Create SDK client for a specific chain
 */
export function createSdkClient(chainId: number): SdkClient {
  const networkConfig = NETWORKS[chainId];
  if (!networkConfig) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const viemChain = VIEM_CHAINS[chainId as keyof typeof VIEM_CHAINS];
  if (!viemChain) {
    throw new Error(`Viem chain config not found for chain ID: ${chainId}`);
  }

  // Create public client for read operations
  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(networkConfig.rpcUrl)
  });

  // August Digital API base URL
  const AUGUST_API_BASE = 'https://api.augustdigital.io/api/v1';

  return {
    chainId,
    publicClient,
    
    // August Digital API implementations
    async getVaults(status?: 'active' | 'closed') {
      return retryApiCall(async () => {
        const url = new URL(`${AUGUST_API_BASE}/tokenized_vault`);
        if (status) {
          url.searchParams.set('status', status);
        }

        console.log(`🔍 [August API] Fetching vaults from: ${url.toString()}`);
        
        const response = await fetch(url.toString(), {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Upshift-App/1.0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as AugustVaultResponse[];
        console.log(`📊 [August API] Received ${data.length} vaults`);
        console.log(`📋 [August API] First vault sample:`, JSON.stringify(data[0], null, 2));
        
        return data;
      });
    },
    
    async getVault(address: string) {
      return retryApiCall(async () => {
        const url = `${AUGUST_API_BASE}/tokenized_vault/${address}`;
        console.log(`🔍 [August API] Fetching vault details from: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Upshift-App/1.0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as AugustVaultResponse;
        console.log(`📊 [August API] Vault details for ${address}:`, JSON.stringify(data, null, 2));
        
        return data;
      });
    },
    
    async getVaultSummary(address: string) {
      return retryApiCall(async () => {
        const url = `${AUGUST_API_BASE}/tokenized_vault/vault_summary/${address}`;
        console.log(`🔍 [August API] Fetching vault summary from: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Upshift-App/1.0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as AugustVaultSummary;
        console.log(`📊 [August API] Vault summary for ${address}:`, JSON.stringify(data, null, 2));
        
        return data;
      });
    },
    
    async getVaultAPY(address: string) {
      return retryApiCall(async () => {
        const response = await fetch(`${AUGUST_API_BASE}/tokenized_vault/annualized_apy/${address}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Upshift-App/1.0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }

        return await response.json() as AugustAPYResponse;
      });
    },

    async getVaultWithdrawals(address: string) {
      try {
        const response = await fetch(`${AUGUST_API_BASE}/withdrawals/${chainId}/${address}`);
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }

        return await response.json() as AugustWithdrawalSummary;
      } catch (error) {
        console.error('Error fetching vault withdrawals from August API:', error);
        throw new Error(`Failed to fetch vault withdrawals: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async getPositions(userAddress: string) {
      try {
        const response = await fetch(`${AUGUST_API_BASE}/positions/${chainId}/${userAddress}`);
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching positions from August API:', error);
        throw new Error(`Failed to fetch positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async getPosition(vaultAddress: string, userAddress: string) {
      try {
        const response = await fetch(`${AUGUST_API_BASE}/positions/${chainId}/${userAddress}/${vaultAddress}`);
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching position from August API:', error);
        throw new Error(`Failed to fetch position: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async getRedemptions(userAddress: string, vaultAddress?: string) {
      try {
        const url = new URL(`${AUGUST_API_BASE}/redemptions/${chainId}/${userAddress}`);
        if (vaultAddress) {
          url.searchParams.set('vault', vaultAddress);
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching redemptions from August API:', error);
        throw new Error(`Failed to fetch redemptions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async buildDepositTx(vaultAddress: string, amount: string, userAddress: string) {
      try {
        const response = await fetch(`${AUGUST_API_BASE}/transactions/deposit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chain_id: chainId,
            vault_address: vaultAddress,
            amount,
            user_address: userAddress
          })
        });
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error building deposit transaction from August API:', error);
        throw new Error(`Failed to build deposit transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async buildWithdrawTx(vaultAddress: string, shares: string, userAddress: string) {
      try {
        const response = await fetch(`${AUGUST_API_BASE}/transactions/withdraw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chain_id: chainId,
            vault_address: vaultAddress,
            shares,
            user_address: userAddress
          })
        });
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error building withdraw transaction from August API:', error);
        throw new Error(`Failed to build withdraw transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async buildApprovalTx(tokenAddress: string, spender: string, amount: string) {
      try {
        const response = await fetch(`${AUGUST_API_BASE}/transactions/approval`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chain_id: chainId,
            token_address: tokenAddress,
            spender,
            amount
          })
        });
        if (!response.ok) {
          throw new Error(`August API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error building approval transaction from August API:', error);
        throw new Error(`Failed to build approval transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

  };
}

/**
 * Get supported network IDs from environment
 */
export function getSupportedNetworks(): number[] {
  // For client-side, return the supported networks directly
  // Start with just Ethereum to improve performance, users can add more networks
  return [1]; // Ethereum mainnet - most vaults are here
}

/**
 * Check if a chain ID is supported
 */
export function isSupportedNetwork(chainId: number): boolean {
  return chainId in NETWORKS && getSupportedNetworks().includes(chainId);
}

/**
 * Get network configuration by chain ID
 */
export function getNetworkConfig(chainId: number): NetworkConfig | null {
  return NETWORKS[chainId] || null;
}
