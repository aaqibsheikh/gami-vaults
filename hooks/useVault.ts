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
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(`/api/vaults/${chainId}/${vaultId}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch vault details');
        }

        const result = await response.json();
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        throw error;
      }
    },
    enabled: enabled && !!chainId && !!vaultId,
    staleTime: Infinity, // Never consider data stale - only fetch on manual refresh
    gcTime: 300000, // 5 minutes
    retry: false, // Disable automatic retries
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false // Don't refetch when network reconnects
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
