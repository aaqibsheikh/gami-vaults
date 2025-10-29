/**
 * React Query hook for fetching user's vault position
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

interface VaultPosition {
  shares: string;
  valueUsd: string;
  pnlUsd: string;
  entryUsd: string;
}

interface UseVaultPositionOptions {
  chainId: number;
  vaultAddress: string;
  enabled?: boolean;
}

interface VaultPositionResponse {
  position: VaultPosition | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useVaultPosition(options: UseVaultPositionOptions): VaultPositionResponse {
  const { chainId, vaultAddress, enabled = true } = options;
  const { address } = useAccount();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vault-position', chainId, vaultAddress, address],
    queryFn: async (): Promise<VaultPosition> => {
      if (!address) {
        throw new Error('No wallet connected');
      }

      const response = await fetch(`/api/portfolio?chain=${chainId}&address=${address}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const portfolio = await response.json();
      
      // Find the position for this vault
      const position = portfolio.positions.find(
        (pos: any) => pos.vault.toLowerCase() === vaultAddress.toLowerCase()
      );

      if (!position) {
        // Return a mock position for demonstration purposes
        // In a real implementation, this would be fetched from on-chain data
        return {
          shares: '0',
          valueUsd: '0',
          pnlUsd: '0',
          entryUsd: '0'
        };
      }

      return {
        shares: position.shares,
        valueUsd: position.valueUsd,
        pnlUsd: position.pnlUsd,
        entryUsd: position.entryUsd
      };
    },
    enabled: enabled && !!chainId && !!vaultAddress && !!address,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
  });

  return {
    position: data,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
