'use client';

import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { formatUsd } from '@/lib/normalize';
import { getUsdValue } from '@/lib/oracles';
import { LAGOON_MAINNET_SUBGRAPH } from '@/lib/lagoon-sdk';

// August Digital subgraph endpoints
// Based on: https://docs.augustdigital.io/developers/subgraphs
// Subgraph URL: https://api.studio.thegraph.com/query/85409/august-eth-lending-pools/version/latest
const AUGUST_ETHEREUM_SUBGRAPH =
  process.env.NEXT_PUBLIC_AUGUST_ETHEREUM_SUBGRAPH ??
  'https://api.studio.thegraph.com/query/85409/august-eth-lending-pools/version/latest';

const LAGOON_VAULT_ACTIVITY_QUERY = `
  query VaultActivity($vault: Bytes!, $first: Int!, $skip: Int!) {
    deposits(
      where: { vault: $vault }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      owner
      shares
      assets
      blockTimestamp
      transactionHash
    }

    withdraws(
      where: { vault: $vault }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      owner
      shares
      assets
      blockTimestamp
      transactionHash
    }

    depositRequests(
      where: { vault: $vault }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      owner
      sender
      assets
      blockTimestamp
      transactionHash
    }

    totalAssetsUpdateds(
      where: { vault: $vault }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      totalAssets
      blockTimestamp
      transactionHash
    }

    settleDeposits(
      where: { vault: $vault }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      totalAssets
      totalSupply
      blockTimestamp
      transactionHash
    }

    settleRedeems(
      where: { vault: $vault }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      totalAssets
      totalSupply
      blockTimestamp
      transactionHash
    }
  }
`;

// August Digital subgraph query for Upshift vaults
// Uses "pool" field instead of "vault" per their schema
// Note: Uses "withdrawalProcesseds" for completed withdrawals (not "withdraws")
const AUGUST_VAULT_ACTIVITY_QUERY = `
  query UpshiftVaultActivity($pool: Bytes!, $first: Int!, $skip: Int!) {
    deposits(
      where: { pool: $pool }
      orderBy: timestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      sender
      owner
      assets
      shares
      timestamp
      transactionHash
    }

    withdrawalProcesseds(
      where: { pool: $pool }
      orderBy: timestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      receiver
      amount
      timestamp
      transactionHash
    }

    withdrawalRequests(
      where: { pool: $pool }
      orderBy: timestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      receiver
      owner
      assets
      shares
      timestamp
      transactionHash
    }
  }
`;

type GraphDeposit = {
  id: string;
  owner: string;
  shares: string;
  assets: string;
  blockTimestamp: string;
  transactionHash: string;
};

type GraphWithdraw = GraphDeposit;

type GraphDepositRequest = {
  id: string;
  owner: string;
  sender: string;
  assets: string;
  blockTimestamp: string;
  transactionHash: string;
};

type GraphTotalAssetsUpdated = {
  id: string;
  totalAssets: string;
  blockTimestamp: string;
  transactionHash: string;
};

type GraphSettle = {
  id: string;
  totalAssets: string;
  totalSupply: string;
  blockTimestamp: string;
  transactionHash: string;
};

// August Digital subgraph types
type AugustDeposit = {
  id: string;
  sender: string;
  owner: string;
  assets: string;
  shares: string;
  timestamp: string;
  transactionHash: string;
};

type AugustWithdrawalProcessed = {
  id: string;
  receiver: string;
  amount: string;
  timestamp: string;
  transactionHash: string;
};

type AugustWithdrawalRequest = {
  id: string;
  receiver: string;
  owner: string;
  assets: string;
  shares: string;
  timestamp: string;
  transactionHash: string;
};

type VaultActivityResponse = {
  deposits: GraphDeposit[];
  withdraws: GraphWithdraw[];
  depositRequests: GraphDepositRequest[];
  totalAssetsUpdateds: GraphTotalAssetsUpdated[];
  settleDeposits: GraphSettle[];
  settleRedeems: GraphSettle[];
};

type AugustVaultActivityResponse = {
  deposits: AugustDeposit[];
  withdrawalProcesseds: AugustWithdrawalProcessed[];
  withdrawalRequests: AugustWithdrawalRequest[];
};

export type VaultActivityType =
  | 'deposit'
  | 'withdraw'
  | 'valuation'
  | 'settlement';

export interface VaultActivityItem {
  id: string;
  type: VaultActivityType;
  label: string;
  address?: string;
  addressLabel: string;
  amountToken: string;
  amountTokenFormatted: string;
  amountUsd?: string;
  amountUsdFormatted?: string;
  timestamp: number;
  txHash: string;
  source: 'deposit' | 'withdraw' | 'totalAssetsUpdated' | 'settleDeposit' | 'settleRedeem' | 'withdrawalRequest';
}

export interface UseVaultActivityOptions {
  vaultAddress: string;
  chainId: number;
  underlyingSymbol: string;
  underlyingAddress: string;
  underlyingDecimals: number;
  provider?: 'upshift' | 'ipor' | 'lagoon';
  enabled?: boolean;
  first?: number;
}

interface JsonRpcResponse {
  id: number;
  jsonrpc: string;
  result?: {
    from?: string;
  };
  error?: {
    code: number;
    message?: string;
  };
}

const DEFAULT_RPC_BY_CHAIN: Record<number, string> = {
  1: 'https://eth.llamarpc.com',
};

function shortenAddress(address?: string): string {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function toBigInt(value?: string | null): bigint {
  if (!value) return BigInt(0);
  try {
    return BigInt(value);
  } catch {
    return BigInt(0);
  }
}

function toTimestampMs(value?: string): number {
  const num = value ? Number(value) : NaN;
  if (!Number.isFinite(num)) return 0;
  return num * 1000;
}

function formatTokenAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '0';
  if (amount >= 1000) {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  if (amount >= 1) {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (amount >= 0.01) {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }
  return amount.toLocaleString('en-US', {
    maximumFractionDigits: 6,
  });
}

function getAugustSubgraphUrl(chainId: number): string | null {
  if (chainId === 1) return AUGUST_ETHEREUM_SUBGRAPH;
  return null;
}

async function fetchVaultActivityData(options: UseVaultActivityOptions): Promise<VaultActivityItem[]> {
  const {
    vaultAddress,
    chainId,
    underlyingDecimals,
    underlyingSymbol,
    underlyingAddress,
    provider,
    first = 100,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12_000);

  try {
    let pricePerToken: number | null = null;
    try {
      const priceStr = await getUsdValue(
        underlyingAddress,
        '1',
        chainId,
        underlyingDecimals
      );
      const priceNum = Number(priceStr);
      if (Number.isFinite(priceNum)) {
        pricePerToken = priceNum;
      }
    } catch (error) {
      console.warn(
        `[VaultActivity] Failed to fetch price for ${underlyingAddress} on chain ${chainId}:`,
        error
      );
    }

    const items: VaultActivityItem[] = [];

    const formatAmount = (raw: string | undefined) => {
      const decimal = formatUnits(toBigInt(raw), underlyingDecimals);
      const numeric = Number(decimal);
      return {
        decimal,
        numeric,
        formatted: `${formatTokenAmount(numeric)} ${underlyingSymbol}`,
      };
    };

    const withUsd = (amount: number | undefined | null) => {
      if (!pricePerToken || !Number.isFinite(amount ?? NaN)) {
        return { usd: undefined, formatted: undefined };
      }
      const usdValue = (amount ?? 0) * pricePerToken;
      const usdStr = usdValue.toString();
      return {
        usd: usdStr,
        formatted: formatUsd(usdStr, true),
      };
    };

    // Handle Upshift vaults using August Digital subgraph
    if (provider === 'upshift') {
      const subgraphUrl = getAugustSubgraphUrl(chainId);
      if (!subgraphUrl) {
        console.warn(`[VaultActivity] August subgraph not available for chain ${chainId}`);
        return [];
      }

      let fetched = 0;
      let hasMore = true;

      while (hasMore) {
        const queryBody = {
          query: AUGUST_VAULT_ACTIVITY_QUERY,
          variables: {
            pool: vaultAddress.toLowerCase(),
            first,
            skip: fetched,
          },
        };

        console.log(`[VaultActivity] Fetching Upshift activity from ${subgraphUrl}`, {
          vault: vaultAddress,
          variables: queryBody.variables,
        });

        const response = await fetch(subgraphUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(queryBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[VaultActivity] HTTP ${response.status}:`, errorText);
          throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
        }

        const json = await response.json();
        
        if (json?.errors?.length) {
          console.error(`[VaultActivity] GraphQL errors:`, json.errors);
          throw new Error(json.errors[0]?.message || 'GraphQL error');
        }

        if (!json.data) {
          console.warn(`[VaultActivity] No data in response:`, json);
          // Return empty array if no data instead of throwing
          return [];
        }

        const data: AugustVaultActivityResponse = json.data;
        const chunkBefore = items.length;

        // Process deposits
        (data.deposits || []).forEach((entry) => {
          const amount = formatAmount(entry.assets);
          const usd = withUsd(amount.numeric);
          items.push({
            id: `upshift-deposit-${entry.id}`,
            type: 'deposit',
            label: 'Deposit',
            address: entry.owner || entry.sender,
            addressLabel: shortenAddress(entry.owner || entry.sender),
            amountToken: amount.decimal,
            amountTokenFormatted: amount.formatted,
            amountUsd: usd.usd,
            amountUsdFormatted: usd.formatted,
            timestamp: toTimestampMs(entry.timestamp),
            txHash: entry.transactionHash,
            source: 'deposit',
          });
        });

        // Process withdrawal processed (completed withdrawals)
        (data.withdrawalProcesseds || []).forEach((entry) => {
          const amount = formatAmount(entry.amount);
          const usd = withUsd(amount.numeric);
          items.push({
            id: `upshift-withdrawal-processed-${entry.id}`,
            type: 'withdraw',
            label: 'Withdraw',
            address: entry.receiver,
            addressLabel: shortenAddress(entry.receiver),
            amountToken: amount.decimal,
            amountTokenFormatted: amount.formatted,
            amountUsd: usd.usd,
            amountUsdFormatted: usd.formatted,
            timestamp: toTimestampMs(entry.timestamp),
            txHash: entry.transactionHash,
            source: 'withdraw',
          });
        });

        // Process withdrawal requests
        (data.withdrawalRequests || []).forEach((entry) => {
          const amount = formatAmount(entry.assets);
          const usd = withUsd(amount.numeric);
          items.push({
            id: `upshift-withdrawal-request-${entry.id}`,
            type: 'withdraw',
            label: 'Withdrawal Request',
            address: entry.owner || entry.receiver,
            addressLabel: shortenAddress(entry.owner || entry.receiver),
            amountToken: amount.decimal,
            amountTokenFormatted: amount.formatted,
            amountUsd: usd.usd,
            amountUsdFormatted: usd.formatted,
            timestamp: toTimestampMs(entry.timestamp),
            txHash: entry.transactionHash,
            source: 'withdrawalRequest',
          });
        });

        const chunkSize = items.length - chunkBefore;
        fetched += first;

        hasMore =
          (data.deposits?.length || 0) === first ||
          (data.withdrawalProcesseds?.length || 0) === first ||
          (data.withdrawalRequests?.length || 0) === first;

        if (chunkSize === 0) {
          hasMore = false;
        }
      }

      return items
        .filter((item) => item.timestamp > 0)
        .sort((a, b) => b.timestamp - a.timestamp);
    }

    // Handle Lagoon vaults (existing logic)
    let fetched = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(LAGOON_MAINNET_SUBGRAPH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: LAGOON_VAULT_ACTIVITY_QUERY,
          variables: {
            vault: vaultAddress.toLowerCase(),
            first,
            skip: fetched,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      if (json?.errors?.length) {
        throw new Error(json.errors[0]?.message || 'GraphQL error');
      }

      const data: VaultActivityResponse = json.data || {};
      const chunkBefore = items.length;

      (data.deposits || []).forEach((entry) => {
        const amount = formatAmount(entry.assets);
        const usd = withUsd(amount.numeric);
        items.push({
          id: `deposit-${entry.id}`,
          type: 'deposit',
          label: 'Deposit',
          address: entry.owner,
          addressLabel: shortenAddress(entry.owner),
          amountToken: amount.decimal,
          amountTokenFormatted: amount.formatted,
          amountUsd: usd.usd,
          amountUsdFormatted: usd.formatted,
          timestamp: toTimestampMs(entry.blockTimestamp),
          txHash: entry.transactionHash,
          source: 'deposit',
        });
      });

      (data.withdraws || []).forEach((entry) => {
        const amount = formatAmount(entry.assets);
        const usd = withUsd(amount.numeric);
        items.push({
          id: `withdraw-${entry.id}`,
          type: 'withdraw',
          label: 'Withdraw',
          address: entry.owner,
          addressLabel: shortenAddress(entry.owner),
          amountToken: amount.decimal,
          amountTokenFormatted: amount.formatted,
          amountUsd: usd.usd,
          amountUsdFormatted: usd.formatted,
          timestamp: toTimestampMs(entry.blockTimestamp),
          txHash: entry.transactionHash,
          source: 'withdraw',
        });
      });

      (data.depositRequests || []).forEach((entry) => {
        const amount = formatAmount(entry.assets);
        const usd = withUsd(amount.numeric);
        const address = entry.sender || entry.owner;
        items.push({
          id: `deposit-request-${entry.id}`,
          type: 'deposit',
          label: 'Deposit Request',
          address,
          addressLabel: shortenAddress(address),
          amountToken: amount.decimal,
          amountTokenFormatted: amount.formatted,
          amountUsd: usd.usd,
          amountUsdFormatted: usd.formatted,
          timestamp: toTimestampMs(entry.blockTimestamp),
          txHash: entry.transactionHash,
          source: 'deposit',
        });
      });

      (data.totalAssetsUpdateds || []).forEach((entry) => {
        const amount = formatAmount(entry.totalAssets);
        const usd = withUsd(amount.numeric);
        items.push({
          id: `valuation-${entry.id}`,
          type: 'valuation',
          label: 'Valuation',
          address: undefined,
          addressLabel: 'Unknown',
          amountToken: amount.decimal,
          amountTokenFormatted: amount.formatted,
          amountUsd: usd.usd,
          amountUsdFormatted: usd.formatted,
          timestamp: toTimestampMs(entry.blockTimestamp),
          txHash: entry.transactionHash,
          source: 'totalAssetsUpdated',
        });
      });

      (data.settleDeposits || []).forEach((entry) => {
        const amount = formatAmount(entry.totalAssets);
        const usd = withUsd(amount.numeric);
        items.push({
          id: `settle-deposit-${entry.id}`,
          type: 'settlement',
          label: 'Settlement',
          address: undefined,
          addressLabel: 'Unknown',
          amountToken: amount.decimal,
          amountTokenFormatted: amount.formatted,
          amountUsd: usd.usd,
          amountUsdFormatted: usd.formatted,
          timestamp: toTimestampMs(entry.blockTimestamp),
          txHash: entry.transactionHash,
          source: 'settleDeposit',
        });
      });

      (data.settleRedeems || []).forEach((entry) => {
        const amount = formatAmount(entry.totalAssets);
        const usd = withUsd(amount.numeric);
        items.push({
          id: `settle-redeem-${entry.id}`,
          type: 'settlement',
          label: 'Settlement',
          address: undefined,
          addressLabel: 'Unknown',
          amountToken: amount.decimal,
          amountTokenFormatted: amount.formatted,
          amountUsd: usd.usd,
          amountUsdFormatted: usd.formatted,
          timestamp: toTimestampMs(entry.blockTimestamp),
          txHash: entry.transactionHash,
          source: 'settleRedeem',
        });
      });

      const chunkSize = items.length - chunkBefore;
      fetched += first;

      hasMore =
        (data.deposits?.length || 0) === first ||
        (data.withdraws?.length || 0) === first ||
        (data.depositRequests?.length || 0) === first ||
        (data.totalAssetsUpdateds?.length || 0) === first ||
        (data.settleDeposits?.length || 0) === first ||
        (data.settleRedeems?.length || 0) === first;

      if (chunkSize === 0) {
        hasMore = false;
      }
    }

    const itemsMissingAddress = items.filter((item) => !item.address);
    if (itemsMissingAddress.length && chainId === 1) {
      try {
        const uniqueHashes = Array.from(
          new Set(itemsMissingAddress.map((item) => item.txHash.toLowerCase()))
        );
        const senderMap = await fetchTransactionSenders(uniqueHashes, chainId);
        itemsMissingAddress.forEach((item) => {
          const sender = senderMap[item.txHash.toLowerCase()];
          if (sender) {
            item.address = sender;
            item.addressLabel = shortenAddress(sender);
          }
        });
      } catch (error) {
        console.warn('[VaultActivity] Failed to fetch transaction senders:', error);
      }
    }

    return items
      .filter((item) => item.timestamp > 0)
      .sort((a, b) => b.timestamp - a.timestamp);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchTransactionSenders(
  hashes: string[],
  chainId: number
): Promise<Record<string, string>> {
  const envKey = `NEXT_PUBLIC_RPC_${chainId}` as keyof NodeJS.ProcessEnv;
  const rpcUrl =
    (typeof process !== 'undefined' ? (process.env?.[envKey] as string | undefined) : undefined) ||
    DEFAULT_RPC_BY_CHAIN[chainId];

  if (!rpcUrl || !hashes.length) {
    return {};
  }

  const batchSize = 10;
  const results: Record<string, string> = {};

  for (let i = 0; i < hashes.length; i += batchSize) {
    const batch = hashes.slice(i, i + batchSize);
    const payload = batch.map((hash, idx) => ({
      jsonrpc: '2.0',
      id: i + idx + 1,
      method: 'eth_getTransactionByHash',
      params: [hash],
    }));

    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`RPC HTTP ${response.status}`);
      }

      const json = (await response.json()) as JsonRpcResponse | JsonRpcResponse[];
      const responses = Array.isArray(json) ? json : [json];

      responses.forEach((entry, index) => {
        const txHash = batch[index];
        const sender = entry?.result?.from;
        if (sender) {
          results[txHash] = sender.toLowerCase();
        }
      });
    } catch (error) {
      console.warn('[VaultActivity] RPC batch failed:', error);
    }
  }

  return results;
}

export function useVaultActivity(options: UseVaultActivityOptions) {
  const {
    vaultAddress,
    chainId,
    provider,
    enabled = true,
  } = options;

  const isLagoon = provider === 'lagoon' && chainId === 1;
  const isUpshift = provider === 'upshift' && chainId === 1;
  
  const shouldFetch = enabled && !!vaultAddress && (isLagoon || isUpshift);

  return useQuery({
    queryKey: [
      'vault-activity',
      vaultAddress?.toLowerCase(),
    ],
    queryFn: () => fetchVaultActivityData(options),
    enabled: shouldFetch,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

