'use client';

import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { formatUsd } from '@/lib/normalize';
import { getUsdValue } from '@/lib/oracles';
import { LAGOON_MAINNET_SUBGRAPH } from '@/lib/lagoon-sdk';

const VAULT_ACTIVITY_QUERY = `
  query VaultActivity($vault: Bytes!) {
    deposits(
      where: { vault: $vault }
      orderBy: blockTimestamp
      orderDirection: desc
      first: 50
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
      first: 50
    ) {
      id
      owner
      shares
      assets
      blockTimestamp
      transactionHash
    }

    totalAssetsUpdateds(
      where: { vault: $vault }
      orderBy: blockTimestamp
      orderDirection: desc
      first: 50
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
      first: 50
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
      first: 50
    ) {
      id
      totalAssets
      totalSupply
      blockTimestamp
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

type VaultActivityResponse = {
  deposits: GraphDeposit[];
  withdraws: GraphWithdraw[];
  totalAssetsUpdateds: GraphTotalAssetsUpdated[];
  settleDeposits: GraphSettle[];
  settleRedeems: GraphSettle[];
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
  source: 'deposit' | 'withdraw' | 'totalAssetsUpdated' | 'settleDeposit' | 'settleRedeem';
}

export interface UseVaultActivityOptions {
  vaultAddress: string;
  chainId: number;
  underlyingSymbol: string;
  underlyingAddress: string;
  underlyingDecimals: number;
  provider?: 'upshift' | 'ipor' | 'lagoon';
  enabled?: boolean;
}

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

async function fetchVaultActivityData(options: UseVaultActivityOptions): Promise<VaultActivityItem[]> {
  const {
    vaultAddress,
    chainId,
    underlyingDecimals,
    underlyingSymbol,
    underlyingAddress,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(LAGOON_MAINNET_SUBGRAPH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: VAULT_ACTIVITY_QUERY,
        variables: { vault: vaultAddress.toLowerCase() },
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

    const data: VaultActivityResponse = json.data;

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

    const addItem = (item: VaultActivityItem) => {
      items.push(item);
    };

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

    data.deposits?.forEach((entry) => {
      const amount = formatAmount(entry.assets);
      const usd = withUsd(amount.numeric);
      addItem({
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

    data.withdraws?.forEach((entry) => {
      const amount = formatAmount(entry.assets);
      const usd = withUsd(amount.numeric);
      addItem({
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

    data.totalAssetsUpdateds?.forEach((entry) => {
      const amount = formatAmount(entry.totalAssets);
      const usd = withUsd(amount.numeric);
      addItem({
        id: `valuation-${entry.id}`,
        type: 'valuation',
        label: 'Valuation',
        addressLabel: 'Price Oracle',
        amountToken: amount.decimal,
        amountTokenFormatted: amount.formatted,
        amountUsd: usd.usd,
        amountUsdFormatted: usd.formatted,
        timestamp: toTimestampMs(entry.blockTimestamp),
        txHash: entry.transactionHash,
        source: 'totalAssetsUpdated',
      });
    });

    data.settleDeposits?.forEach((entry) => {
      const amount = formatAmount(entry.totalAssets);
      const usd = withUsd(amount.numeric);
      addItem({
        id: `settle-deposit-${entry.id}`,
        type: 'settlement',
        label: 'Settlement',
        addressLabel: 'Curator',
        amountToken: amount.decimal,
        amountTokenFormatted: amount.formatted,
        amountUsd: usd.usd,
        amountUsdFormatted: usd.formatted,
        timestamp: toTimestampMs(entry.blockTimestamp),
        txHash: entry.transactionHash,
        source: 'settleDeposit',
      });
    });

    data.settleRedeems?.forEach((entry) => {
      const amount = formatAmount(entry.totalAssets);
      const usd = withUsd(amount.numeric);
      addItem({
        id: `settle-redeem-${entry.id}`,
        type: 'settlement',
        label: 'Settlement',
        addressLabel: 'Curator',
        amountToken: amount.decimal,
        amountTokenFormatted: amount.formatted,
        amountUsd: usd.usd,
        amountUsdFormatted: usd.formatted,
        timestamp: toTimestampMs(entry.blockTimestamp),
        txHash: entry.transactionHash,
        source: 'settleRedeem',
      });
    });

    return items
      .filter((item) => item.timestamp > 0)
      .sort((a, b) => b.timestamp - a.timestamp);
  } finally {
    clearTimeout(timeoutId);
  }
}

export function useVaultActivity(options: UseVaultActivityOptions) {
  const {
    vaultAddress,
    chainId,
    provider,
    enabled = true,
  } = options;

  const shouldFetch =
    enabled &&
    !!vaultAddress &&
    provider === 'lagoon' &&
    chainId === 1;

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

