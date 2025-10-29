/**
 * React Query hook for fetching user token balances
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { mainnet, arbitrum, optimism, base, avalanche } from 'viem/chains';

interface TokenBalance {
  address: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
}

interface UseTokenBalanceOptions {
  chainId: number;
  tokenAddress: string;
  enabled?: boolean;
}

interface TokenBalanceResponse {
  balance: string | undefined;
  balanceFormatted: string | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ERC20 ABI for balanceOf and decimals
const ERC20_ABI = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const VIEM_CHAINS = {
  1: mainnet,
  42161: arbitrum,
  10: optimism,
  8453: base,
  43114: avalanche,
};

export function useTokenBalance(options: UseTokenBalanceOptions): TokenBalanceResponse {
  const { chainId, tokenAddress, enabled = true } = options;
  const { address } = useAccount();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['token-balance', chainId, tokenAddress, address],
    queryFn: async (): Promise<{ balance: string; balanceFormatted: string }> => {
      if (!address) {
        throw new Error('No wallet connected');
      }

      const viemChain = VIEM_CHAINS[chainId as keyof typeof VIEM_CHAINS];
      if (!viemChain) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      const publicClient = createPublicClient({
        chain: viemChain,
        transport: http()
      });

      // Get token decimals
      const decimals = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }) as number;

      // Get token balance
      const balance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      }) as bigint;

      // Format balance
      const balanceFormatted = (Number(balance) / Math.pow(10, decimals)).toFixed(6);

      return {
        balance: balance.toString(),
        balanceFormatted
      };
    },
    enabled: enabled && !!chainId && !!tokenAddress && !!address,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
  });

  return {
    balance: data?.balance,
    balanceFormatted: data?.balanceFormatted,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
