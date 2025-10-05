/**
 * React Query hook for fetching redemption amounts
 */

import { useQuery } from '@tanstack/react-query';
import { RedemptionDTO } from '@/lib/dto';

interface UseRedemptionsOptions {
  chainId: number;
  vault: string;
  address?: string;
  enabled?: boolean;
}

interface RedemptionsResponse {
  data: RedemptionDTO[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useRedemptions(options: UseRedemptionsOptions): RedemptionsResponse {
  const { chainId, vault, address, enabled = true } = options;

  const {
    data = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['redemptions', chainId, vault, address],
    queryFn: async (): Promise<RedemptionDTO[]> => {
      if (!address) {
        return []; // Return empty array if no address provided
      }

      // Build URL with search params
      const params = new URLSearchParams({
        chain: chainId.toString(),
        vault: vault,
        address: address
      });
      const url = `/api/redemptions?${params.toString()}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch redemptions');
      }

      return response.json();
    },
    enabled: enabled && !!chainId && !!vault && !!address,
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
