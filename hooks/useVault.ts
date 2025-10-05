/**
 * React Query hook for fetching individual vault details
 */

import { useQuery } from '@tanstack/react-query';
import { VaultDTO } from '@/lib/dto';

interface UseVaultOptions {
  chainId: number;
  vaultId: string;
  enabled?: boolean;
}

interface VaultResponse {
  data: VaultDTO | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useVault(options: UseVaultOptions): VaultResponse {
  const { chainId, vaultId, enabled = true } = options;

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vault', chainId, vaultId],
    queryFn: async (): Promise<VaultDTO> => {
      const response = await fetch(`/api/vaults/${chainId}/${vaultId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vault details');
      }

      return response.json();
    },
    enabled: enabled && !!chainId && !!vaultId,
    staleTime: 10000, // 10 seconds
    gcTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
