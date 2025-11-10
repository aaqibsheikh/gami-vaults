/**
 * Lagoon SDK
 * Integrates with Lagoon vaults by reading on-chain data
 * 
 * Documentation: https://docs.lagoon.finance/developer-hub
 */

import { createPublicClient, formatUnits, http, PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { VaultDTO } from './dto';
import { normalizeToString } from './normalize';
import { getUsdValue } from './oracles';

/**
 * Lagoon Subgraph (Ethereum mainnet) per docs:
 * https://docs.lagoon.finance/resources/networks-and-addresses
 */
export const LAGOON_MAINNET_SUBGRAPH =
  process.env.NEXT_PUBLIC_LAGOON_MAINNET_SUBGRAPH ??
  'https://api.goldsky.com/api/public/project_cmbrqvox367cy01y96gi91bis/subgraphs/lagoon-mainnet-vault/prod/gn';

const SUBGRAPH_PAGE = 500;

type PeriodSummary = {
  totalAssetsAtStart: string;
  totalSupplyAtStart: string;
  totalAssetsAtEnd?: string;
  totalSupplyAtEnd?: string;
  netTotalSupplyAtEnd?: string;
  blockTimestamp: string;
  duration: string;
};

const priceCache = new Map<string, string>();

async function postGql<T>(url: string, body: unknown, timeoutMs = 12_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json?.errors) {
      throw new Error(JSON.stringify(json.errors));
    }
    return json.data as T;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAllPeriodSummaries(
  subgraphUrl: string,
  vault: string,
  untilTs?: number
): Promise<PeriodSummary[]> {
  const summaries: PeriodSummary[] = [];
  let before: bigint | null = null;

  // Build query once; blockTimestamp_lt filter is optional depending on variable presence.
  const buildQuery = (withBefore: boolean) => `
    query PeriodSummaries($vault: Bytes!, $first: Int!${withBefore ? ', $before: BigInt!' : ''}) {
      periodSummaries(
        where: { vault: $vault${withBefore ? ', blockTimestamp_lt: $before' : ''} }
        orderBy: blockTimestamp
        orderDirection: desc
        first: $first
      ) {
        totalAssetsAtStart
        totalSupplyAtStart
        totalAssetsAtEnd
        totalSupplyAtEnd
        netTotalSupplyAtEnd
        blockTimestamp
        duration
      }
    }
  `;

  for (;;) {
    const withBefore = before !== null;
    const query = buildQuery(withBefore);
    const variables: Record<string, unknown> = {
      vault: vault.toLowerCase(),
      first: SUBGRAPH_PAGE,
    };
    if (withBefore) {
      variables.before = before!.toString();
    }

    const data = await postGql<{ periodSummaries: PeriodSummary[] }>(subgraphUrl, {
      query,
      variables,
    });

    const page = data?.periodSummaries ?? [];
    if (!page.length) break;

    summaries.push(...page);

    const oldest = page[page.length - 1];
    const oldestTs = BigInt(oldest.blockTimestamp);
    before = oldestTs > BigInt(0) ? oldestTs - BigInt(1) : null;

    if (page.length < SUBGRAPH_PAGE) break;
    if (untilTs !== undefined && Number(oldest.blockTimestamp) < untilTs) break;
  }

  return summaries;
}

async function usdCached(
  asset: string,
  amount: string,
  chainId: number,
  decimals: number,
  timestampSec: number
): Promise<string> {
  const dayKey = new Date(timestampSec * 1000).toISOString().slice(0, 10);
  const cacheKey = `${asset.toLowerCase()}-${dayKey}`;
  if (!priceCache.has(cacheKey)) {
    const unitPrice = await getUsdValue(asset, '1', chainId, decimals);
    priceCache.set(cacheKey, unitPrice);
  }
  const price = parseFloat(priceCache.get(cacheKey)!);
  const amountNum = parseFloat(amount);
  const usd = price * amountNum;
  return usd.toString();
}

function lerpBigInt(
  start: bigint,
  end: bigint,
  startTs: bigint,
  endTs: bigint,
  targetTs: bigint
): bigint {
  if (targetTs <= startTs) return start;
  if (targetTs >= endTs) return end;
  const duration = endTs - startTs;
  if (duration <= BigInt(0)) return start;
  const delta = targetTs - startTs;
  return start + ((end - start) * delta) / duration;
}

function findLatestCompletedSummary(summaries: PeriodSummary[]): PeriodSummary | undefined {
  const zero = BigInt(0);
  for (const summary of summaries) {
    const assetsEnd = BigInt(summary.totalAssetsAtEnd || '0');
    const supplyEnd = BigInt(summary.netTotalSupplyAtEnd || summary.totalSupplyAtEnd || '0');
    const duration = BigInt(summary.duration || '0');
    if (assetsEnd > zero && supplyEnd > zero && duration > BigInt(0)) {
      return summary;
    }
  }
  return undefined;
}

/**
 * Lagoon vault contract ABI (minimal for reading basic data)
 */
const LAGOON_VAULT_ABI = [
  // Read functions
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'asset',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Lagoon vault data structure
 */
export interface LagoonVaultData {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  totalAssets: bigint;
  asset: string;
  paused: boolean;
  decimals?: number; // Vault token decimals
}

/**
 * Get public client for reading on-chain data
 */
function getPublicClient(): PublicClient {
  // Try environment variable first, then fallback to public RPC
  const rpcUrl = process.env.RPC_1 || 'https://eth.llamarpc.com';
  
  return createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl)
  });
}

/**
 * Fetch Lagoon vault data from on-chain contract
 */
export async function fetchLagoonVault(address: string, chainId: number): Promise<LagoonVaultData> {
  console.log(`🔍 [Lagoon SDK] Fetching vault data for ${address} on chain ${chainId}`);
  const publicClient = getPublicClient();
  
  try {
    // Read vault data with individual error handling for each call
    let name = 'Lagoon Vault';
    let symbol = 'LAG';
    let totalSupply = BigInt(0);
    let totalAssets = BigInt(0);
    let assetAddress = '';
    let paused = false;

    // Try to read name
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'name',
      });
      name = result || name;
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read name for ${address}:`, error);
    }

    // Try to read symbol
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'symbol',
      });
      symbol = result || symbol;
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read symbol for ${address}:`, error);
    }

    // Try to read totalSupply
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'totalSupply',
      });
      totalSupply = result as bigint;
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read totalSupply for ${address}:`, error);
    }

    // Try to read totalAssets
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'totalAssets',
      });
      totalAssets = result as bigint;
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read totalAssets for ${address}:`, error);
    }

    // Try to read asset
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'asset',
      });
      assetAddress = result as string;
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read asset for ${address}:`, error);
    }

    // Try to read paused
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'paused',
      });
      paused = result as boolean;
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read paused for ${address}:`, error);
    }

    // Try to read decimals
    let decimals = 18; // Default
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'decimals',
      });
      decimals = result as number;
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read decimals for ${address}, using default 18:`, error);
    }

    const result = {
      address,
      name,
      symbol,
      totalSupply,
      totalAssets,
      asset: assetAddress,
      paused,
      decimals,
    };
    
    console.log(`✅ [Lagoon SDK] Successfully fetched vault data:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to fetch Lagoon vault data for ${address}:`, error);
    throw new Error(`Failed to fetch Lagoon vault data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch APY for a Lagoon vault from subgraph using PeriodSummary
 * APY approximation: annualized change in share price over the most recent completed period
 */
type WindowBuckets = {
  apr: { all: string; d30: string; d7: string };
  apy: { all: string; d30: string; d7: string };
};

const EMPTY_WINDOWS: WindowBuckets = {
  apr: { all: '0', d30: '0', d7: '0' },
  apy: { all: '0', d30: '0', d7: '0' },
};

async function fetchLagoonMetricsFromSubgraph(
  vaultAddress: string,
  chainId: number,
  vaultDecimals: number,
  assetDecimals: number
): Promise<{ summaries: PeriodSummary[]; windows: WindowBuckets }> {
  if (chainId !== 1) {
    return { summaries: [], windows: EMPTY_WINDOWS };
  }

  try {
    const summaries = await fetchAllPeriodSummaries(LAGOON_MAINNET_SUBGRAPH, vaultAddress);
    if (!summaries.length) {
      return { summaries: [], windows: EMPTY_WINDOWS };
    }
    const windows = computeNetWindows(summaries, vaultDecimals, assetDecimals);
    return { summaries, windows };
  } catch (error) {
    console.error(`[Lagoon SDK] Failed to fetch metrics for ${vaultAddress}:`, error);
    return { summaries: [], windows: EMPTY_WINDOWS };
  }
}


/**
 * Compute price per share using Lagoon's method
 * According to docs: VaultUtils.convertToAssets(10^vaultDecimals, {decimalsOffset, totalAssets, totalSupply})
 * This accounts for the difference between vault decimals and asset decimals
 * 
 * For simplicity, if vaultDecimals === assetDecimals, this is just totalAssets / totalSupply
 * If they differ, we need to account for the offset: (totalAssets * 10^assetDecimals) / (totalSupply * 10^(vaultDecimals - assetDecimals))
 * Which simplifies to: (totalAssets * 10^assetDecimals) / totalSupply when calculating in asset terms
 * 
 * However, since we're working with raw BigInt values from subgraph (strings), we can use:
 * pricePerShare = (totalAssets / totalSupply) * (10^assetDecimals / 10^vaultDecimals)
 * Or more simply: totalAssets / totalSupply, then adjust for decimals if needed
 * 
 * For most Lagoon vaults, vault decimals = asset decimals, so simple division works.
 * But we'll make it work correctly for both cases.
 */
function ppsInAssetUnits(
  totalAssets: bigint,
  totalSupply: bigint,
  assetDecimals: number,
  vaultDecimals: number
): number {
  if (totalSupply === BigInt(0)) return 0;
  const assetsDecimal = parseFloat(formatUnits(totalAssets, assetDecimals));
  const supplyDecimal = parseFloat(formatUnits(totalSupply, vaultDecimals));
  if (!isFinite(assetsDecimal) || !isFinite(supplyDecimal) || supplyDecimal === 0) {
    return 0;
  }
  return assetsDecimal / supplyDecimal;
}

/**
 * Compute Net APR windows from PeriodSummary list (newest first)
 * According to Lagoon docs: https://docs.lagoon.finance/developer-hub/integration/apr-computations
 */
function computeNetWindows(
  summaries: PeriodSummary[],
  vaultDecimals: number = 18,
  assetDecimals: number = 18
): { apr: { all: string; d30: string; d7: string }; apy: { all: string; d30: string; d7: string } } {
  const secondsInYear = 365 * 24 * 60 * 60;
  if (!summaries.length) return { apr: { all: '0', d30: '0', d7: '0' }, apy: { all: '0', d30: '0', d7: '0' } };

  const ppsStart = (p: PeriodSummary) =>
    ppsInAssetUnits(
    BigInt(p.totalAssetsAtStart || '0'),
    BigInt(p.totalSupplyAtStart || '0'),
      assetDecimals,
      vaultDecimals
  );
  const ppsEndNet = (p: PeriodSummary) =>
    ppsInAssetUnits(
    BigInt(p.totalAssetsAtEnd || '0'),
    BigInt(p.netTotalSupplyAtEnd || p.totalSupplyAtEnd || '0'),
      assetDecimals,
      vaultDecimals
  );

  // APR / APY helpers
  const computeLinearApr = (startPrice: number, endPrice: number, windowSec: number) => {
    if (!isFinite(startPrice) || !isFinite(endPrice) || startPrice <= 0 || windowSec <= 0) return '0';
    const r = (endPrice - startPrice) / startPrice;
    const apr = r * (secondsInYear / windowSec);
    return isFinite(apr) ? normalizeToString(apr) : '0';
  };
  const computeCompoundedApy = (startPrice: number, endPrice: number, windowSec: number) => {
    if (!isFinite(startPrice) || !isFinite(endPrice) || startPrice <= 0 || windowSec <= 0) return '0';
    const apy = Math.pow(endPrice / startPrice, secondsInYear / windowSec) - 1;
    return isFinite(apy) ? normalizeToString(apy) : '0';
  };

  // ALL: earliest valid start → latest completed end
  let earliestStart: PeriodSummary | undefined;
  let latestEnd: PeriodSummary | undefined;
  const zero = BigInt(0);

  // Find latest completed period (newest first, so first match is most recent)
  for (const p of summaries) {
    const tas = BigInt(p.totalAssetsAtStart || '0');
    const tss = BigInt(p.totalSupplyAtStart || '0');
    const tae = BigInt(p.totalAssetsAtEnd || '0');
    const nse = BigInt(p.netTotalSupplyAtEnd || p.totalSupplyAtEnd || '0');
    const dur = BigInt(p.duration || '0');
    
    // Find latest completed period (duration > 0 means completed)
    if (!latestEnd && tae > zero && nse > zero && dur > BigInt(0)) {
      latestEnd = p;
    }
    // Provisional earliest start (will be corrected below)
    if (tas > zero && tss > zero) earliestStart = p;
  }
  
  // Find true earliest start by scanning from oldest to newest
  for (let i = summaries.length - 1; i >= 0; i--) {
    const p = summaries[i];
    const tas = BigInt(p.totalAssetsAtStart || '0');
    const tss = BigInt(p.totalSupplyAtStart || '0');
    if (tas > zero && tss > zero) { earliestStart = p; break; }
  }
  
  // Use latestEnd for consistency (fallback to first summary if no completed period found)
  const latest = latestEnd || summaries[0];
  const latestEndTsBI = BigInt(latest.blockTimestamp || '0') + BigInt(latest.duration || '0');
  const latestEndTs = Number(latestEndTsBI);

  let aprAll = '0', apyAll = '0';
  if (earliestStart && latestEnd) {
    const priceStart = ppsStart(earliestStart);
    const priceEnd = ppsEndNet(latestEnd);
    const tStart = Number(earliestStart.blockTimestamp || '0');
    const tEnd = Number(latestEnd.blockTimestamp || '0') + Number(latestEnd.duration || '0');
    const windowSec = Math.max(0, tEnd - tStart);
    aprAll = computeLinearApr(priceStart, priceEnd, windowSec);
    apyAll = computeCompoundedApy(priceStart, priceEnd, windowSec);
  }

  // Interpolate PPS at arbitrary timestamp inside its containing completed period
  // According to Lagoon docs: if targetTimestamp is older than first periodSummary,
  // use the first periodSummary's start price
  const interpolatePpsAt = (targetTs: number): number | null => {
    // Find the oldest (first) period summary
    let oldestSummary: PeriodSummary | undefined;
    for (let i = summaries.length - 1; i >= 0; i--) {
      const p = summaries[i];
      const tas = BigInt(p.totalAssetsAtStart || '0');
      const tss = BigInt(p.totalSupplyAtStart || '0');
      if (tas > BigInt(0) && tss > BigInt(0)) {
        oldestSummary = p;
        break;
      }
    }
    
    const oldestStartTs = oldestSummary ? Number(oldestSummary.blockTimestamp || '0') : Infinity;
    
    // If target timestamp is older than the first periodSummary, use first periodSummary's start price
    if (oldestSummary && targetTs < oldestStartTs) {
      const startPrice = ppsStart(oldestSummary);
      if (isFinite(startPrice) && startPrice > 0) {
        return startPrice;
      }
    }
    
    // Otherwise, find the period that contains the target timestamp and interpolate
    for (const p of summaries) {
      const startTsBI = BigInt(p.blockTimestamp || '0');
      const durBI = BigInt(p.duration || '0');
      const endTsBI = startTsBI + durBI;
      if (durBI > BigInt(0) && targetTs >= Number(startTsBI) && targetTs <= Number(endTsBI)) {
        const startAssets = BigInt(p.totalAssetsAtStart || '0');
        const endAssets = BigInt(p.totalAssetsAtEnd || '0');
        const startSupply = BigInt(p.totalSupplyAtStart || '0');
        const endSupply = BigInt(p.netTotalSupplyAtEnd || p.totalSupplyAtEnd || '0');
        const targetBI = BigInt(targetTs);
        const assets = lerpBigInt(startAssets, endAssets, startTsBI, endTsBI, targetBI);
        const supply = lerpBigInt(startSupply, endSupply, startTsBI, endTsBI, targetBI);
        return ppsInAssetUnits(assets, supply, assetDecimals, vaultDecimals);
      }
    }
    
    return null;
  };

  const computeWindow = (windowSec: number): { apr: string; apy: string } => {
    // Per Lagoon docs: Check if the most recent period summary is within the timeframe
    // "Find the most recent period summary within the timeframe, here 30 days. If none is found, APR is 0."
    // This means: if the end of the most recent period is older than the timeframe, return 0
    if (!Number.isFinite(latestEndTs) || latestEndTs <= 0) return { apr: '0', apy: '0' };
    const targetStartTs = latestEndTs - windowSec;
    if (targetStartTs < 0) return { apr: '0', apy: '0' };
    
    // Get interpolated price at target timestamp
    const priceAtStart = interpolatePpsAt(targetStartTs);
    
    // Per docs: use the price at the END of the most recent period (using netTotalSupplyAtEnd)
    // This represents the current price after fees
    const priceAtEnd = latestEnd ? ppsEndNet(latestEnd) : (latest ? ppsEndNet(latest) : null);
    if (priceAtStart === null || priceAtEnd === null) return { apr: '0', apy: '0' };
    
    return {
      apr: computeLinearApr(priceAtStart, priceAtEnd, windowSec),
      apy: computeCompoundedApy(priceAtStart, priceAtEnd, windowSec),
    };
  };

  const win30d = computeWindow(30 * 24 * 60 * 60);
  const win7d  = computeWindow(7 * 24 * 60 * 60);

  return {
    apr: { all: aprAll, d30: win30d.apr, d7: win7d.apr },
    apy: { all: apyAll, d30: win30d.apy, d7: win7d.apy },
  };
}


/**
 * Get USDC price in USD (simplified - in production, use an oracle)
 */
async function getUsdcPrice(): Promise<number> {
  // USDC should be ~$1, but we can add oracle integration later
  return 1;
}

/**
 * Transform Lagoon vault data to VaultDTO format
 */
export async function transformLagoonVault(
  vaultData: LagoonVaultData,
  chainId: number,
  underlyingSymbol: string,
  assetDecimals: number
): Promise<VaultDTO> {
  // TVL
  const rawTokenAmount = formatUnits(vaultData.totalAssets, assetDecimals);
  let tvlUsd: string;
  try {
    tvlUsd = await usdCached(
      vaultData.asset,
      rawTokenAmount,
      chainId,
      assetDecimals,
      Math.floor(Date.now() / 1000)
    );
    console.log(`💰 [Lagoon] TVL calculated: ${rawTokenAmount} ${underlyingSymbol} = $${tvlUsd}`);
  } catch {
    console.warn(`⚠️ [Lagoon] Oracle failed, using fallback calculation for ${underlyingSymbol}`);
    tvlUsd = rawTokenAmount;
  }

  const vaultDecimals = vaultData.decimals ?? assetDecimals;
  const { summaries, windows } = await fetchLagoonMetricsFromSubgraph(
    vaultData.address,
    chainId,
    vaultDecimals,
    assetDecimals
  );
  const apyNet = windows.apy.all;

  let vaultAge: string | undefined = undefined;

        try {
          if (summaries.length) {
      let earliest: PeriodSummary | undefined;
      for (let i = summaries.length - 1; i >= 0; i -= 1) {
              const p = summaries[i];
              const tas = BigInt(p.totalAssetsAtStart || '0');
              const tss = BigInt(p.totalSupplyAtStart || '0');
        if (tas > BigInt(0) && tss > BigInt(0)) {
          earliest = p;
          break;
        }
            }
            const startTs = earliest ? Number(earliest.blockTimestamp || '0') : 0;
            if (startTs > 0) {
              const now = Math.floor(Date.now() / 1000);
              const ageSec = Math.max(0, now - startTs);
              const days = Math.floor(ageSec / (24 * 60 * 60));
              vaultAge = `${days}d`;
      }
    }
  } catch {}

  return {
    id: vaultData.address,
    chainId,
    name: vaultData.name,
    symbol: vaultData.symbol,
    tvlUsd: normalizeToString(parseFloat(tvlUsd)),
    apyNet, // overall APY across full history
    fees: { mgmtBps: '0', perfBps: '0' },
    underlying: { symbol: underlyingSymbol, address: vaultData.asset, decimals: assetDecimals },
    status: vaultData.paused ? 'paused' : 'active',
    provider: 'lagoon',
    metadata: {
      website: `https://app.lagoon.finance/vault/${chainId}/${vaultData.address.toLowerCase()}`,
      description: `Lagoon ${underlyingSymbol} Vault`,
      logo: undefined,
      vaultAge,
      // APR (linear)
      aprNetAll:  windows.apr.all,
      aprNet30d:  windows.apr.d30,
      aprNet7d:   windows.apr.d7,
      // APY (compounded)
      // If your TS type doesn't include these yet, either extend it or cast metadata as any.
      apyNetAll:  windows.apy.all,
      apyNet30d:  windows.apy.d30,
      apyNet7d:   windows.apy.d7,
    } as any
  };
}


/**
 * Fetch and transform Lagoon vault for a specific address
 */
export async function getLagoonVault(
  address: string,
  chainId: number,
  underlyingSymbol: string,
  assetDecimals: number
): Promise<VaultDTO> {
  try {
    const vaultData = await fetchLagoonVault(address, chainId);
    return await transformLagoonVault(vaultData, chainId, underlyingSymbol, assetDecimals);
  } catch (error) {
    console.error(`Error fetching Lagoon vault ${address}:`, error);
    throw error;
  }
}

/**
 * Historical data point interface
 */
export interface HistoricalDataPoint {
  timestamp: string;
  apy: string;
  tvl: string;
  price: string;
}

/**
 * Fetch historical performance data for Lagoon vault from subgraph
 * Uses PeriodSummary data to calculate APY, TVL, and share price over time
 */
export async function fetchLagoonHistoricalData(
  vaultAddress: string,
  chainId: number,
  period: '7d' | '30d' | 'all',
  underlyingSymbol: string,
  assetDecimals: number
): Promise<HistoricalDataPoint[]> {
  try {
    if (chainId !== 1) {
      console.warn(`[Lagoon Historical] Only mainnet supported, got chain ${chainId}`);
      return [];
    }

    const windowSec =
      period === 'all'
        ? null
        : (period === '7d' ? 7 : 30) * 24 * 60 * 60;
    const latestPageQuery = `
      query LatestPeriodSummaries($vault: Bytes!, $first: Int!) {
      periodSummaries(
        where: { vault: $vault }
        orderBy: blockTimestamp
        orderDirection: desc
        first: $first
      ) {
        totalAssetsAtStart
        totalSupplyAtStart
        totalAssetsAtEnd
        totalSupplyAtEnd
        netTotalSupplyAtEnd
        blockTimestamp
        duration
      }
      }
    `;

    let latestPage = await postGql<{ periodSummaries: PeriodSummary[] }>(LAGOON_MAINNET_SUBGRAPH, {
      query: latestPageQuery,
      variables: { vault: vaultAddress.toLowerCase(), first: SUBGRAPH_PAGE },
    });

    let latestCandidates = latestPage?.periodSummaries ?? [];
    if (!latestCandidates.length) {
      console.warn(`[Lagoon Historical] No period summaries found for vault ${vaultAddress}`);
      return [];
    }

    let latestCompleted = findLatestCompletedSummary(latestCandidates);
    if (!latestCompleted) {
      // Fallback: pull additional history until we find a completed period
      latestCandidates = await fetchAllPeriodSummaries(LAGOON_MAINNET_SUBGRAPH, vaultAddress);
      latestCompleted = findLatestCompletedSummary(latestCandidates);
      if (!latestCompleted) {
        console.warn(`[Lagoon Historical] No completed periods found for vault ${vaultAddress}`);
      return [];
      }
    }

    const latestEndTs =
      Number(latestCompleted.blockTimestamp || '0') + Number(latestCompleted.duration || '0');
    const windowStartTs =
      windowSec === null ? 0 : Math.max(0, latestEndTs - windowSec);

    const summariesDesc = await fetchAllPeriodSummaries(
      LAGOON_MAINNET_SUBGRAPH,
      vaultAddress,
      windowSec === null ? undefined : windowStartTs
    );
    if (!summariesDesc.length) {
      console.warn(`[Lagoon Historical] No summaries after pagination for ${vaultAddress}`);
      return [];
    }

    const vaultData = await fetchLagoonVault(vaultAddress, chainId);
    const vaultDecimals = vaultData.decimals ?? assetDecimals;
    const assetAddress = vaultData.asset;
    const secondsInYear = 365 * 24 * 60 * 60;

    const earliestSummary = summariesDesc[summariesDesc.length - 1];
    const relevantDesc = summariesDesc.filter((summary) => {
      const duration = Number(summary.duration || '0');
      if (duration <= 0) return false;
      const startTs = Number(summary.blockTimestamp || '0');
      const endTs = startTs + duration;
      const lowerBound = windowSec === null ? 0 : windowStartTs;
      return endTs >= lowerBound && endTs <= latestEndTs;
    });

    if (!relevantDesc.length) {
      console.warn(`[Lagoon Historical] No relevant summaries in computed window for ${vaultAddress}`);
      return [];
    }

    let oldestValidStart: PeriodSummary | undefined;
    for (let i = summariesDesc.length - 1; i >= 0; i -= 1) {
      const candidate = summariesDesc[i];
      const tas = BigInt(candidate.totalAssetsAtStart || '0');
      const tss = BigInt(candidate.totalSupplyAtStart || '0');
      if (tas > BigInt(0) && tss > BigInt(0)) {
        oldestValidStart = candidate;
        break;
      }
    }

    const stateAt = (targetTs: number): { assets: bigint; supply: bigint } | null => {
      const targetBI = BigInt(targetTs);
      if (oldestValidStart) {
        const oldestStartTs = BigInt(oldestValidStart.blockTimestamp || '0');
        if (targetBI < oldestStartTs) {
          return {
            assets: BigInt(oldestValidStart.totalAssetsAtStart || '0'),
            supply: BigInt(oldestValidStart.totalSupplyAtStart || '0'),
          };
        }
      }

      for (const summary of summariesDesc) {
        const startTs = BigInt(summary.blockTimestamp || '0');
        const duration = BigInt(summary.duration || '0');
        if (duration <= BigInt(0)) continue;
        const endTs = startTs + duration;
        if (targetBI < startTs || targetBI > endTs) continue;

        const startAssets = BigInt(summary.totalAssetsAtStart || '0');
        const endAssets = BigInt(summary.totalAssetsAtEnd || '0');
        const startSupply = BigInt(summary.totalSupplyAtStart || '0');
        const endSupply = BigInt(summary.netTotalSupplyAtEnd || summary.totalSupplyAtEnd || '0');

        return {
          assets: lerpBigInt(startAssets, endAssets, startTs, endTs, targetBI),
          supply: lerpBigInt(startSupply, endSupply, startTs, endTs, targetBI),
        };
      }

      if (latestCompleted) {
        return {
          assets: BigInt(latestCompleted.totalAssetsAtEnd || '0'),
          supply: BigInt(
            latestCompleted.netTotalSupplyAtEnd || latestCompleted.totalSupplyAtEnd || '0'
          ),
        };
      }

      return null;
    };

    const effectiveStartTs =
      windowSec === null
        ? Number(
            oldestValidStart?.blockTimestamp ??
              earliestSummary?.blockTimestamp ??
              windowStartTs
          )
        : windowStartTs;

    const startState = stateAt(effectiveStartTs);
    if (!startState || startState.supply === BigInt(0)) {
      console.warn(`[Lagoon Historical] Unable to determine start state for ${vaultAddress}`);
      return [];
    }

    const priceAtStart = ppsInAssetUnits(
      startState.assets,
      startState.supply,
      assetDecimals,
      vaultDecimals
    );
    const amountAtStart = formatUnits(startState.assets, assetDecimals);
    let tvlStartUsd = amountAtStart;
    try {
      tvlStartUsd = await usdCached(
        assetAddress,
        amountAtStart,
        chainId,
        assetDecimals,
        effectiveStartTs
      );
    } catch {
      tvlStartUsd = amountAtStart;
    }

    const historicalData: HistoricalDataPoint[] = [
      {
        timestamp: new Date(effectiveStartTs * 1000).toISOString(),
        apy: '0',
        tvl: normalizeToString(parseFloat(tvlStartUsd)),
        price: normalizeToString(priceAtStart),
      },
    ];

    const relevantAsc = [...relevantDesc].sort(
      (a, b) => Number(a.blockTimestamp || '0') - Number(b.blockTimestamp || '0')
    );

    for (const summary of relevantAsc) {
        const startAssets = BigInt(summary.totalAssetsAtStart || '0');
        const startSupply = BigInt(summary.totalSupplyAtStart || '0');
        const endAssets = BigInt(summary.totalAssetsAtEnd || '0');
        const endSupply = BigInt(summary.netTotalSupplyAtEnd || summary.totalSupplyAtEnd || '0');
      const duration = Number(summary.duration || '0');
      if (endSupply === BigInt(0)) continue;

      const priceStart = ppsInAssetUnits(startAssets, startSupply, assetDecimals, vaultDecimals);
      const priceEnd = ppsInAssetUnits(endAssets, endSupply, assetDecimals, vaultDecimals);
      const endTs = Number(summary.blockTimestamp || '0') + duration;

      const amountEnd = formatUnits(endAssets, assetDecimals);
      let tvlUsd = amountEnd;
      try {
        tvlUsd = await usdCached(assetAddress, amountEnd, chainId, assetDecimals, endTs);
      } catch {
        tvlUsd = amountEnd;
      }

        let apy = 0;
      if (priceStart > 0 && priceEnd > 0 && duration > 0) {
        const priceRatio = priceEnd / priceStart;
        apy = Math.pow(priceRatio, secondsInYear / duration) - 1;
        }
        
        historicalData.push({
        timestamp: new Date(endTs * 1000).toISOString(),
        apy: normalizeToString(apy),
          tvl: normalizeToString(parseFloat(tvlUsd)),
        price: normalizeToString(priceEnd),
        });
    }

    return historicalData;
  } catch (error) {
    console.error(`[Lagoon Historical] Error fetching historical data:`, error);
    return [];
  }
}









