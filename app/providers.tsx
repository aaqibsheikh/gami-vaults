'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, arbitrum, optimism, base } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { useState } from 'react';

// Create wagmi config
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected(),
  coinbaseWallet({
    appName: 'Gami Vaults',
  }),
  // Only include WalletConnect if a valid projectId is configured
  ...(walletConnectProjectId
    ? [walletConnect({ projectId: walletConnectProjectId })]
    : []),
];

const config = createConfig({
  chains: [mainnet, arbitrum, optimism, base],
  connectors,
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_1),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_42161),
    [optimism.id]: http(process.env.NEXT_PUBLIC_RPC_10),
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_8453),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
