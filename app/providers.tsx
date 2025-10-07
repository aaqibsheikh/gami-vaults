'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, arbitrum, optimism, base, avalanche } from 'wagmi/chains';
import { defineChain } from 'viem';
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

// Custom chain for Hyperliquid EVM
const hyperEvm = defineChain({
  id: 999,
  name: 'Hyperliquid EVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_999 || 'https://rpc.hyperliquid.xyz/evm'] },
    public: { http: [process.env.NEXT_PUBLIC_RPC_999 || 'https://rpc.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: { name: 'Hyperliquid Explorer', url: 'https://explorer.hyperliquid.xyz' },
  },
});

const config = createConfig({
  chains: [mainnet, arbitrum, optimism, base, avalanche, hyperEvm],
  connectors,
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_1),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_42161),
    [optimism.id]: http(process.env.NEXT_PUBLIC_RPC_10),
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_8453),
    [avalanche.id]: http(process.env.NEXT_PUBLIC_RPC_43114),
    [hyperEvm.id]: http(process.env.NEXT_PUBLIC_RPC_999),
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
