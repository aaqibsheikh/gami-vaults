/**
 * React Query hook for fetching historical vault performance data
 */

import { useQuery } from '@tanstack/react-query';

interface HistoricalDataPoint {
  timestamp: string;
  apy: string;
  tvl: string;
  price: string;
}

interface HistoricalResponse {
  data: HistoricalDataPoint[];
  period: '7d' | '30d' | '365d' | 'all';
  vaultAddress: string;
  chainId: number;
}

interface UseHistoricalDataOptions {
  chainId: number;
  vaultId: string;
  period?: '7d' | '30d' | '365d' | 'all';
  enabled?: boolean;
}

interface HistoricalDataResponse {
  data: HistoricalDataPoint[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHistoricalData(options: UseHistoricalDataOptions): HistoricalDataResponse {
  const { chainId, vaultId, period = '30d', enabled = true } = options;

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vault-historical', chainId, vaultId, period],
    queryFn: async (): Promise<HistoricalDataPoint[]> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(`/api/vaults/${chainId}/${vaultId}/historical?period=${period}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch historical data');
        }

        const result: HistoricalResponse = await response.json();
        return result.data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        throw error;
      }
    },
    enabled: enabled && !!chainId && !!vaultId,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
