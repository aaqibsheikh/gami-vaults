/**
 * React Query hook for fetching vaults list
 */

import { useQuery } from '@tanstack/react-query';
import { VaultDTO } from '@/lib/dto';

interface UseVaultsOptions {
  chainIds?: number[];
  enabled?: boolean;
}

interface VaultsResponse {
  data: VaultDTO[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useVaults(options: UseVaultsOptions = {}): VaultsResponse {
  const { chainIds = [], enabled = true } = options;

  const {
    data = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vaults', chainIds],
    queryFn: async (): Promise<VaultDTO[]> => {
      const chainsParam = chainIds.length > 0 ? chainIds.join(',') : '';
      
      // Build URL with search params
      let url = '/api/vaults';
      if (chainsParam) {
        url += `?chains=${encodeURIComponent(chainsParam)}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch vaults');
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        throw error;
      }
    },
    enabled: enabled && chainIds.length > 0,
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
