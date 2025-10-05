/**
 * React Query hook for fetching portfolio positions
 */

import { useQuery } from '@tanstack/react-query';
import { PortfolioDTO } from '@/lib/dto';

interface UsePortfolioOptions {
  chainId: number;
  address?: string;
  enabled?: boolean;
}

interface PortfolioResponse {
  data: PortfolioDTO | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePortfolio(options: UsePortfolioOptions): PortfolioResponse {
  const { chainId, address, enabled = true } = options;

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['portfolio', chainId, address],
    queryFn: async (): Promise<PortfolioDTO> => {
      if (!address) {
        throw new Error('Wallet address is required');
      }

      // Build URL with search params
      const params = new URLSearchParams({
        chain: chainId.toString(),
        address: address
      });
      const url = `/api/portfolio?${params.toString()}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch portfolio');
      }

      return response.json();
    },
    enabled: enabled && !!chainId && !!address,
    staleTime: 5000, // 5 seconds
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
