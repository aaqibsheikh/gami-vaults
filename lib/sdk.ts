/**
 * August Digital SDK initialization and management
 * Server-only file - never import in client components
 */

import { createPublicClient, createWalletClient, http, PublicClient, WalletClient, defineChain, encodeFunctionData } from 'viem';
import { mainnet, arbitrum, optimism, base, avalanche } from 'viem/chains';
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
  43114: {
    chainId: 43114,
    name: 'Avalanche',
    rpcUrl: process.env.RPC_43114 || 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
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
  },
  999: {
    chainId: 999,
    name: 'Hyperliquid EVM',
    rpcUrl: process.env.RPC_999 || 'https://rpc.hyperliquid.xyz/evm',
    explorerUrl: 'https://explorer.hyperliquid.xyz',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Viem chain configurations
// Custom chain definition for Hyperliquid EVM (not available in viem/chains)
const hyperEvm = defineChain({
  id: 999,
  name: 'Hyperliquid EVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_999 || 'https://rpc.hyperliquid.xyz/evm'] },
    public: { http: [process.env.RPC_999 || 'https://rpc.hyperliquid.xyz/evm'] }
  },
  blockExplorers: {
    default: { name: 'Hyperliquid Explorer', url: 'https://explorer.hyperliquid.xyz' }
  }
});

const VIEM_CHAINS = {
  1: mainnet,
  42161: arbitrum,
  10: optimism,
  8453: base,
  43114: avalanche,
  999: hyperEvm
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
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        try {
          const response = await fetch(url.toString(), {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Upshift-App/1.0'
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`August API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json() as AugustVaultResponse[];
          return data;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      });
    },
    
    async getVault(address: string) {
      return retryApiCall(async () => {
        const url = `${AUGUST_API_BASE}/tokenized_vault/${address}`;
        console.log(`🔍 [August API] Fetching vault details from: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Upshift-App/1.0'
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`August API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json() as AugustVaultResponse;
          console.log(`📊 [August API] Vault details for ${address}:`, JSON.stringify(data, null, 2));
          
          return data;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      });
    },
    
    async getVaultSummary(address: string) {
      return retryApiCall(async () => {
        const url = `${AUGUST_API_BASE}/tokenized_vault/vault_summary/${address}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Upshift-App/1.0'
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`August API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json() as AugustVaultSummary;
          
          return data;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
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
      // August Digital API doesn't have a positions endpoint
      // Return empty array to indicate no positions
      console.log(`⚠️ [August API] Positions endpoint not available, returning empty array for ${userAddress}`);
      return [];
    },
    
    async getPosition(vaultAddress: string, userAddress: string) {
      // August Digital API doesn't have individual position endpoint
      // Return null to indicate no position found
      console.log(`⚠️ [August API] Individual position endpoint not available for vault ${vaultAddress}`);
      return null;
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
      // On-chain builder using ERC4626 deposit(assets, receiver)
      // 1) read vault.asset() to get underlying token
      // 2) read token.decimals() to scale decimal string to base units
      // 3) encode deposit calldata
      const ERC4626_ABI = [
        {
          inputs: [],
          name: 'asset',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'uint256', name: 'assets', type: 'uint256' },
            { internalType: 'address', name: 'receiver', type: 'address' }
          ],
          name: 'deposit',
          outputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
          stateMutability: 'nonpayable',
          type: 'function',
        }
      ] as const;

      const ERC20_ABI = [
        {
          inputs: [],
          name: 'decimals',
          outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
          stateMutability: 'view',
          type: 'function',
        }
      ] as const;

      // Read underlying token
      const assetAddress = await publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: 'asset',
      });

      // Read decimals
      const decimals = await publicClient.readContract({
        address: assetAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }) as number;

      // Convert decimal string to base units
      const [whole, frac = ''] = amount.split('.');
      const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
      const assetsStr = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, '');
      const assets = BigInt(assetsStr || '0');

      const data = encodeFunctionData({
        abi: ERC4626_ABI,
        functionName: 'deposit',
        args: [assets, userAddress as `0x${string}`]
      });

      return {
        to: vaultAddress,
        data,
        value: '0x0'
      };
    },
    
    async buildWithdrawTx(vaultAddress: string, shares: string, userAddress: string) {
      // On-chain builder using ERC4626 redeem(shares, receiver, owner)
      const ERC4626_ABI = [
        {
          inputs: [
            { internalType: 'uint256', name: 'shares', type: 'uint256' },
            { internalType: 'address', name: 'receiver', type: 'address' },
            { internalType: 'address', name: 'owner', type: 'address' }
          ],
          name: 'redeem',
          outputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
          stateMutability: 'nonpayable',
          type: 'function',
        }
      ] as const;

      // Convert decimal shares to base units assuming vault token decimals are 18 by default.
      // If different, front-end should provide correct base-unit shares or extend to read decimals().
      const DEFAULT_DECIMALS = 18;
      const [whole, frac = ''] = shares.split('.');
      const fracPadded = (frac + '0'.repeat(DEFAULT_DECIMALS)).slice(0, DEFAULT_DECIMALS);
      const sharesStr = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, '');
      const sharesUnits = BigInt(sharesStr || '0');

      const data = encodeFunctionData({
        abi: ERC4626_ABI,
        functionName: 'redeem',
        args: [sharesUnits, userAddress as `0x${string}`, userAddress as `0x${string}`]
      });

      return {
        to: vaultAddress,
        data,
        value: '0x0'
      };
    },
    
    async buildApprovalTx(tokenAddress: string, spender: string, amount: string) {
      // On-chain builder using ERC20 approve(spender, amount)
      const ERC20_ABI = [
        {
          inputs: [],
          name: 'decimals',
          outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            { internalType: 'address', name: 'spender', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' }
          ],
          name: 'approve',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function',
        }
      ] as const;

      const decimals = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }) as number;

      const [whole, frac = ''] = amount.split('.');
      const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
      const amtStr = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, '');
      const amt = BigInt(amtStr || '0');

      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, amt]
      });

      return {
        to: tokenAddress,
        data,
        value: '0x0'
      };
    },

  };
}

/**
 * Get supported network IDs from environment
 */
export function getSupportedNetworks(): number[] {
  // Read supported networks from env (client/server safe)
  // Prefer NEXT_PUBLIC_NETWORKS on client; fallback to NETWORKS; default to common set
  const envValue = typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_NETWORKS || process.env.NETWORKS)
    : undefined;
  if (envValue) {
    const parsed = envValue
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    if (parsed.length > 0) return parsed;
  }
  return [1]; // need to final this??
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
