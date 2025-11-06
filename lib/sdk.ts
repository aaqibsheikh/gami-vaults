/**
 * August Digital SDK initialization and management
 * Server-only file - never import in client components
 */

import { createPublicClient, createWalletClient, http, PublicClient, WalletClient, defineChain, encodeFunctionData, formatUnits, parseUnits } from 'viem';
import { mainnet, arbitrum, optimism, base, avalanche } from 'viem/chains';
import { NetworkConfig, AugustVaultResponse, AugustVaultSummary, AugustAPYResponse, AugustWithdrawalSummary } from './dto';
import { CURATED_VAULTS, getCuratedVaultsByChain } from './curated-vaults';

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
  buildDepositTx(vaultAddress: string, amount: string, userAddress: string, provider?: 'upshift' | 'ipor' | 'lagoon'): Promise<any>;
  buildWithdrawTx(vaultAddress: string, shares: string, userAddress: string, provider?: 'upshift' | 'ipor' | 'lagoon'): Promise<any>;
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
          // console.log(`📊 [August API] Vault details for ${address}:`, JSON.stringify(data, null, 2));
          
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
      try {
        // Normalize user address to lowercase
        const normalizedAddress = userAddress.toLowerCase() as `0x${string}`;
        console.log(`🔍 [Positions] Fetching positions for ${normalizedAddress} on chain ${chainId}`);
        
        // Only check curated vaults for this chain
        const curatedVaults = getCuratedVaultsByChain([chainId]);
        if (!curatedVaults || curatedVaults.length === 0) {
          console.log(`⚠️ [Positions] No curated vaults found for chain ${chainId}`);
          return [];
        }
        
        console.log(`📋 [Positions] Checking ${curatedVaults.length} curated vaults for user positions`);

        // ERC4626/ERC20 ABI for balanceOf
        const ERC20_ABI = [
          {
            inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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

        // ERC4626 ABI for reading vault data
        const ERC4626_ABI = [
          {
            inputs: [],
            name: 'totalAssets',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'totalSupply',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'asset',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [],
            name: 'paused',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
          },
        ] as const;

        const positions = [];

        // Check each curated vault for user positions
        for (const curatedVault of curatedVaults) {
          try {
            const vaultAddress = curatedVault.address.toLowerCase();
            
            // First, verify this is a contract address (has code)
            const code = await publicClient.getBytecode({ address: vaultAddress as `0x${string}` });
            if (!code || code === '0x') {
              console.log(`⚠️ [Positions] Skipping ${vaultAddress} - not a contract`);
              continue;
            }

            // Check if vault is paused (some vaults revert balanceOf when paused)
            let isPaused = false;
            try {
              isPaused = await publicClient.readContract({
                address: vaultAddress as `0x${string}`,
                abi: ERC4626_ABI,
                functionName: 'paused',
              }) as boolean;
              if (isPaused) {
                console.log(`⚠️ [Positions] Skipping ${vaultAddress} - vault is paused`);
                continue;
              }
            } catch {
              // If paused() doesn't exist, continue (not all vaults have this)
              // This is fine, we'll try balanceOf anyway
            }

            // Read user's share balance with error handling
            let sharesBalance: bigint;
            try {
              sharesBalance = await publicClient.readContract({
                address: vaultAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [normalizedAddress],
              }) as bigint;
            } catch (balanceError: any) {
              // If balanceOf fails, the user likely has no position or contract doesn't support it
              // Skip this vault silently
              if (balanceError?.message?.includes('returned no data') || 
                  balanceError?.message?.includes('reverted') ||
                  balanceError?.shortMessage?.includes('returned no data') ||
                  balanceError?.shortMessage?.includes('reverted')) {
                console.log(`⚠️ [Positions] Skipping ${vaultAddress} - balanceOf failed (vault may be paused or not ERC4626)`);
                continue;
              }
              // Re-throw unexpected errors
              throw balanceError;
            }

            // If user has no shares, skip
            if (sharesBalance === BigInt(0)) {
              continue;
            }

            // Read vault data to calculate share price
            let totalAssets: bigint;
            let vaultDecimals: number;
            let totalSupply: bigint;
            let assetAddress: string | null = null;

            try {
              [totalAssets, vaultDecimals, totalSupply, assetAddress] = await Promise.all([
                publicClient.readContract({
                  address: vaultAddress as `0x${string}`,
                  abi: ERC4626_ABI,
                  functionName: 'totalAssets',
                }) as Promise<bigint>,
                publicClient.readContract({
                  address: vaultAddress as `0x${string}`,
                  abi: ERC20_ABI,
                  functionName: 'decimals',
                }).catch(() => 18) as Promise<number>,
                publicClient.readContract({
                  address: vaultAddress as `0x${string}`,
                  abi: ERC4626_ABI,
                  functionName: 'totalSupply',
                }) as Promise<bigint>,
                publicClient.readContract({
                  address: vaultAddress as `0x${string}`,
                  abi: ERC4626_ABI,
                  functionName: 'asset',
                }).catch(() => null) as Promise<string | null>,
              ]);
            } catch (error: any) {
              // If we can't read vault data, skip this vault
              console.warn(`⚠️ [Positions] Failed to read vault data for ${vaultAddress}:`, error?.message || error);
              continue;
            }

            // Get asset decimals
            let assetDecimals = 18;
            if (assetAddress) {
              try {
                assetDecimals = await publicClient.readContract({
                  address: assetAddress as `0x${string}`,
                  abi: ERC20_ABI,
                  functionName: 'decimals',
                }) as number;
              } catch {
                assetDecimals = 18;
              }
            }

            // Calculate share price
            const sharesDecimals = vaultDecimals as number;
            const sharesDecimal = formatUnits(sharesBalance, sharesDecimals);
            let sharePrice = '1.0';

            console.log(`\n  💰 [${vaultAddress.slice(0, 10)}...] Share Price Calculation:`);
            console.log(`     • User Shares: ${sharesDecimal} (decimals: ${sharesDecimals})`);

            if (totalSupply > BigInt(0)) {
              const assetsDecimal = formatUnits(totalAssets, assetDecimals);
              const supplyDecimal = formatUnits(totalSupply, sharesDecimals);
              const assetsNum = parseFloat(assetsDecimal);
              const supplyNum = parseFloat(supplyDecimal);
              sharePrice = (assetsNum / supplyNum).toFixed(6);
              console.log(`     • Total Assets: ${assetsDecimal} ${curatedVault.underlyingSymbol || 'tokens'}`);
              console.log(`     • Total Supply: ${supplyDecimal} shares`);
              console.log(`     • Share Price: ${sharePrice} = ${assetsNum} / ${supplyNum}`);
            } else {
              console.log(`     • Total Supply is 0, using default share price: ${sharePrice}`);
            }

            // Calculate current value in underlying tokens
            const sharesNum = parseFloat(sharesDecimal);
            const sharePriceNum = parseFloat(sharePrice);
            const currentValue = (sharesNum * sharePriceNum).toString();
            console.log(`     • Current Value: ${sharesNum} shares × ${sharePriceNum} = ${currentValue} tokens`);

            // Calculate entry value assuming shares were purchased at initial share price of 1.0
            // This is a reasonable approximation for ERC4626 vaults where shares start at 1:1 ratio
            // If share price > 1.0, the vault has generated yield (positive P&L)
            // If share price < 1.0, the vault has lost value (negative P&L)
            const entrySharePrice = '1.0'; // Assume initial purchase at 1:1 ratio
            const entryValue = (sharesNum * parseFloat(entrySharePrice)).toString();
            console.log(`     • Entry Value: ${sharesNum} shares × ${entrySharePrice} = ${entryValue} tokens (assumed initial price)`);

            // Try to get USD value - if oracle fails, use 0
            let valueUsd = '0';
            let entryValueUsd = '0';
            console.log(`\n  💵 [${vaultAddress.slice(0, 10)}...] USD Value Calculation:`);
            if (assetAddress) {
              try {
                const { getUsdValue } = await import('./oracles');
                valueUsd = await getUsdValue(assetAddress, currentValue, chainId, assetDecimals);
                entryValueUsd = await getUsdValue(assetAddress, entryValue, chainId, assetDecimals);
                console.log(`     • Using Oracle - Asset Address: ${assetAddress.slice(0, 10)}...`);
                console.log(`     • Current Value USD: ${valueUsd} (from ${currentValue} tokens)`);
                console.log(`     • Entry Value USD: ${entryValueUsd} (from ${entryValue} tokens)`);
              } catch (error) {
                console.warn(`⚠️ [Positions] Failed to get USD value for vault ${vaultAddress}:`, error);
                // Fallback: try to use a simple price lookup if available
                // For ETH: assume $3000, for USDC/USDT: assume $1
                if (assetAddress && currentValue) {
                  const assetLower = assetAddress.toLowerCase();
                  if (assetLower.includes('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') || 
                      assetLower.includes('eth') || 
                      chainId === 1) {
                    // ETH approximation
                    const ethPrice = 3000;
                    valueUsd = (parseFloat(currentValue) * ethPrice).toString();
                    console.log(`     • Using ETH Fallback - Price: $${ethPrice}`);
                  } else {
                    // Stablecoin approximation
                    valueUsd = currentValue;
                    console.log(`     • Using Stablecoin Fallback - 1:1 ratio`);
                  }
                  entryValueUsd = valueUsd;
                  console.log(`     • Current Value USD: ${valueUsd} (fallback)`);
                  console.log(`     • Entry Value USD: ${entryValueUsd} (fallback)`);
                }
              }
            } else {
              console.log(`     • No asset address, USD value set to 0`);
            }

            // Calculate P&L (current value - entry value)
            const pnlUsd = (parseFloat(valueUsd) - parseFloat(entryValueUsd)).toString();
            const pnlNum = parseFloat(pnlUsd);
            const entryNum = parseFloat(entryValueUsd);
            const pnlPercent = entryNum !== 0 ? ((pnlNum / entryNum) * 100).toFixed(2) : '0.00';
            console.log(`\n  📈 [${vaultAddress.slice(0, 10)}...] P&L Calculation:`);
            console.log(`     • Current Value: $${valueUsd}`);
            console.log(`     • Entry Value: $${entryValueUsd}`);
            console.log(`     • P&L USD: ${pnlNum >= 0 ? '+' : ''}$${pnlUsd}`);
            console.log(`     • P&L %: ${pnlNum >= 0 ? '+' : ''}${pnlPercent}%`);
            console.log(`     • Share Price Change: ${sharePrice} vs ${entrySharePrice} (${((parseFloat(sharePrice) - 1) * 100).toFixed(2)}%)`);

            positions.push({
              vault: vaultAddress,
              shares: sharesDecimal,
              value: currentValue,
              valueUsd,
              pnl: pnlUsd,
              entryValue,
              entryValueUsd,
            });

            console.log(`✅ [Positions] Found position for vault ${vaultAddress}: ${sharesDecimal} shares = ${valueUsd} USD`);
          } catch (error) {
            console.warn(`⚠️ [Positions] Error checking vault ${curatedVault.address}:`, error);
            // Continue to next vault
            continue;
          }
        }

        console.log(`✅ [Positions] Found ${positions.length} positions for user ${userAddress}`);
        return positions;
      } catch (error) {
        console.error(`❌ [Positions] Failed to fetch positions:`, error);
        throw new Error(`Failed to fetch positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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
    
    async buildDepositTx(vaultAddress: string, amount: string, userAddress: string, provider?: 'upshift' | 'ipor' | 'lagoon') {
      // Common ABIs for reading vault and token data
      const ERC4626_ABI = [
        {
          inputs: [],
          name: 'asset',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
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

      // Read underlying token address
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

      // Lagoon vaults use ERC-7540 standard with requestDeposit (asynchronous deposit)
      if (provider === 'lagoon') {
        const LAGOON_ABI = [
          {
            inputs: [
              { internalType: 'uint256', name: 'assets', type: 'uint256' },
              { internalType: 'address', name: 'receiver', type: 'address' },
              { internalType: 'address', name: 'owner', type: 'address' }
            ],
            name: 'requestDeposit',
            outputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
          }
        ] as const;

        const data = encodeFunctionData({
          abi: LAGOON_ABI,
          functionName: 'requestDeposit',
          args: [assets, userAddress as `0x${string}`, userAddress as `0x${string}`]
        });

        return {
          to: vaultAddress,
          data,
          value: '0x0'
        };
      }

      // Standard ERC4626 vaults (Upshift, IPOR, etc.) use deposit() directly
      const STANDARD_ERC4626_ABI = [
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

      const data = encodeFunctionData({
        abi: STANDARD_ERC4626_ABI,
        functionName: 'deposit',
        args: [assets, userAddress as `0x${string}`]
      });

      return {
        to: vaultAddress,
        data,
        value: '0x0'
      };
    },
    
    async buildWithdrawTx(vaultAddress: string, shares: string, userAddress: string, provider?: 'upshift' | 'ipor' | 'lagoon') {
      // Read vault token decimals from contract to ensure correct conversion
      const ERC20_ABI = [
        {
          inputs: [],
          name: 'decimals',
          outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
          stateMutability: 'view',
          type: 'function',
        }
      ] as const;

      let vaultDecimals = 18; // Default fallback
      try {
        vaultDecimals = await publicClient.readContract({
          address: vaultAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }) as number;
      } catch (error) {
        console.warn(`Failed to read vault decimals for ${vaultAddress}, using default 18:`, error);
        vaultDecimals = 18;
      }

      // Convert decimal shares to base units using parseUnits from viem (handles decimal conversion correctly)
      let sharesUnits: bigint;
      try {
        sharesUnits = parseUnits(shares as `${number}`, vaultDecimals);
        console.log(`[buildWithdrawTx] Converting ${shares} shares with ${vaultDecimals} decimals: ${sharesUnits.toString()}`);
      } catch (error) {
        console.error(`[buildWithdrawTx] Failed to parse shares "${shares}" with ${vaultDecimals} decimals:`, error);
        throw new Error(`Invalid shares amount: ${shares}`);
      }

      // Lagoon vaults use ERC-7540 standard with requestRedeem (asynchronous redemption)
      if (provider === 'lagoon') {
        const LAGOON_ABI = [
          {
            inputs: [
              { internalType: 'uint256', name: 'shares', type: 'uint256' },
              { internalType: 'address', name: 'receiver', type: 'address' },
              { internalType: 'address', name: 'owner', type: 'address' }
            ],
            name: 'requestRedeem',
            outputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
          }
        ] as const;

        const data = encodeFunctionData({
          abi: LAGOON_ABI,
          functionName: 'requestRedeem',
          args: [sharesUnits, userAddress as `0x${string}`, userAddress as `0x${string}`]
        });

        return {
          to: vaultAddress,
          data,
          value: '0x0'
        };
      }

      // Upshift vaults also use requestRedeem (asynchronous redemption with cooldown)
      if (provider === 'upshift') {
        const UPSHIFT_ABI = [
          {
            inputs: [
              { internalType: 'uint256', name: 'shares', type: 'uint256' },
              { internalType: 'address', name: 'receiverAddr', type: 'address' },
              { internalType: 'address', name: 'holderAddr', type: 'address' }
            ],
            name: 'requestRedeem',
            outputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
          }
        ] as const;

        const data = encodeFunctionData({
          abi: UPSHIFT_ABI,
          functionName: 'requestRedeem',
          args: [sharesUnits, userAddress as `0x${string}`, userAddress as `0x${string}`]
        });

        return {
          to: vaultAddress,
          data,
          value: '0x0'
        };
      }

      // Standard ERC4626 vaults (IPOR, etc.) use redeem() directly for instant redemption
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
