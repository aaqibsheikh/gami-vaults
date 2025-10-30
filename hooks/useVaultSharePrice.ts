/**
 * React Query hook for fetching vault share price
 * Calculates share price as totalAssets / totalSupply for ERC4626 vaults
 */

import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, defineChain, formatUnits } from 'viem';
import { mainnet, arbitrum, optimism, base, avalanche } from 'viem/chains';

// Viem chain configurations
const hyperEvm = defineChain({
  id: 999,
  name: 'Hyperliquid EVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_999 || 'https://rpc.hyperliquid.xyz/evm'] },
    public: { http: [process.env.NEXT_PUBLIC_RPC_999 || 'https://rpc.hyperliquid.xyz/evm'] }
  },
  blockExplorers: {
    default: { name: 'Hyperliquid Explorer', url: 'https://explorer.hyperliquid.xyz' }
  }
});

const VIEM_CHAINS: Record<number, any> = {
  1: mainnet,
  42161: arbitrum,
  10: optimism,
  8453: base,
  43114: avalanche,
  999: hyperEvm
};

// ERC4626 Vault ABI for reading share price
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
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface UseVaultSharePriceOptions {
  chainId: number;
  vaultAddress: string;
  underlyingDecimals?: number; // Optional: if not provided, will try to read from vault
  enabled?: boolean;
}

interface VaultSharePriceResponse {
  sharePrice: string | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useVaultSharePrice(options: UseVaultSharePriceOptions): VaultSharePriceResponse {
  const { chainId, vaultAddress, underlyingDecimals, enabled = true } = options;

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vault-share-price', chainId, vaultAddress],
    queryFn: async (): Promise<string> => {
      const viemChain = VIEM_CHAINS[chainId];
      if (!viemChain) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      // Try to get RPC URL from environment or use default
      const rpcUrl = process.env[`NEXT_PUBLIC_RPC_${chainId}`] || 
                     (chainId === 1 ? 'https://eth.llamarpc.com' : undefined);

      const publicClient = createPublicClient({
        chain: viemChain,
        transport: http(rpcUrl)
      });

      try {
        // Read totalAssets and totalSupply from vault contract
        const [totalAssets, totalSupply, vaultDecimals, assetAddress] = await Promise.all([
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: ERC4626_ABI,
            functionName: 'totalAssets',
          }) as Promise<bigint>,
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: ERC4626_ABI,
            functionName: 'totalSupply',
          }) as Promise<bigint>,
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: ERC4626_ABI,
            functionName: 'decimals',
          }).catch(() => 18) as Promise<number>,
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: ERC4626_ABI,
            functionName: 'asset',
          }).catch(() => null) as Promise<string | null>
        ]);

        // If totalSupply is 0, vault hasn't received deposits yet - return 1.0
        if (totalSupply === BigInt(0)) {
          return '1.0';
        }

        // Determine underlying asset decimals
        // Priority: 1) provided underlyingDecimals, 2) read from asset contract, 3) assume 18
        let assetDecimals = underlyingDecimals || 18;
        
        if (!underlyingDecimals && assetAddress) {
          try {
            // Try to read decimals from underlying asset contract
            const ERC20_ABI = [
              {
                inputs: [],
                name: 'decimals',
                outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
                stateMutability: 'view',
                type: 'function',
              },
            ] as const;
            
            assetDecimals = await publicClient.readContract({
              address: assetAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'decimals',
            }) as number;
          } catch {
            // Fallback to 18 if we can't read decimals
            assetDecimals = 18;
          }
        }

        // Calculate share price: totalAssets / totalSupply
        // Both values are in their respective decimals
        // We need to account for the difference in decimals between assets and shares
        // Typically: assets have underlyingDecimals (e.g., 6 for USDC), shares have 18
        
        // Convert to decimal strings with proper precision
        const assetsDecimal = formatUnits(totalAssets, assetDecimals);
        const supplyDecimal = formatUnits(totalSupply, vaultDecimals);

        const assetsNum = parseFloat(assetsDecimal);
        const supplyNum = parseFloat(supplyDecimal);

        if (supplyNum === 0) {
          return '1.0';
        }

        const sharePrice = (assetsNum / supplyNum).toFixed(6);
        return sharePrice;

      } catch (error) {
        console.error('Error fetching vault share price:', error);
        throw new Error(`Failed to fetch share price: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    enabled: enabled && !!chainId && !!vaultAddress,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
  });

  return {
    sharePrice: data,
    isLoading,
    error: error as Error | null,
    refetch
  };
}

