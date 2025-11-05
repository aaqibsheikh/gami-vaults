/**
 * Lagoon SDK
 * Integrates with Lagoon vaults by reading on-chain data
 * 
 * Documentation: https://docs.lagoon.finance/developer-hub
 */

import { createPublicClient, http, PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { VaultDTO } from './dto';
import { normalizeToString } from './normalize';
import { getUsdValue } from './oracles';

/**
 * Lagoon Subgraph (Ethereum mainnet) per docs:
 * https://docs.lagoon.finance/resources/networks-and-addresses
 */
const LAGOON_MAINNET_SUBGRAPH = 'https://api.goldsky.com/api/public/project_cmbrqvox367cy01y96gi91bis/subgraphs/lagoon-mainnet-vault/prod/gn';

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

    const result = {
      address,
      name,
      symbol,
      totalSupply,
      totalAssets,
      asset: assetAddress,
      paused,
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
async function fetchLagoonApyFromSubgraph(vaultAddress: string, chainId: number): Promise<string> {
  try {
    if (chainId !== 1) return '0';

    const query = `query PeriodSummaries($vault: Bytes!, $first: Int!) {
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
    }`;

    const body = { query, variables: { vault: vaultAddress.toLowerCase(), first: 1000 } };
    const res = await fetch(LAGOON_MAINNET_SUBGRAPH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) return '0';

    const json = await res.json();
    const summaries = (json?.data?.periodSummaries || []) as Array<{
      totalAssetsAtStart: string;
      totalSupplyAtStart: string;
      totalAssetsAtEnd?: string;
      totalSupplyAtEnd?: string;
      netTotalSupplyAtEnd?: string;
      blockTimestamp: string;
      duration: string;
    }>;
    if (!summaries.length) return '0';

    // Find earliest valid start and latest COMPLETED end (duration > 0)
    let earliestStart: typeof summaries[number] | undefined;
    let latestEnd: typeof summaries[number] | undefined;
    const zero = BigInt(0);

    for (const p of summaries) {
      const tas = BigInt(p.totalAssetsAtStart || '0');
      const tss = BigInt(p.totalSupplyAtStart || '0');
      const tae = BigInt(p.totalAssetsAtEnd || '0');
      const nse = BigInt(p.netTotalSupplyAtEnd || p.totalSupplyAtEnd || '0');
      const dur = BigInt(p.duration || '0');

      if (tas > zero && tss > zero) earliestStart = p; // newest→oldest; we’ll correct below
      if (!latestEnd && tae > zero && nse > zero && dur > BigInt(0)) latestEnd = p; // first valid completed
    }
    // true earliest by scanning oldest→newest
    for (let i = summaries.length - 1; i >= 0; i--) {
      const p = summaries[i];
      const tas = BigInt(p.totalAssetsAtStart || '0');
      const tss = BigInt(p.totalSupplyAtStart || '0');
      if (tas > zero && tss > zero) { earliestStart = p; break; }
    }

    if (!earliestStart || !latestEnd) return '0';

    const priceStart = Number(earliestStart.totalAssetsAtStart) / Number(earliestStart.totalSupplyAtStart);
    const priceEnd = Number(latestEnd.totalAssetsAtEnd) /
      Number(latestEnd.netTotalSupplyAtEnd || latestEnd.totalSupplyAtEnd);
    const tStart = Number(earliestStart.blockTimestamp || '0');
    const tEnd = Number(latestEnd.blockTimestamp || '0') + Number(latestEnd.duration || '0');
    const windowSec = Math.max(0, tEnd - tStart);

    if (!isFinite(priceStart) || !isFinite(priceEnd) || priceStart <= 0 || windowSec <= 0) return '0';

    const secondsInYear = 365 * 24 * 60 * 60;
    const apyOverall = Math.pow(priceEnd / priceStart, secondsInYear / windowSec) - 1;
    return isFinite(apyOverall) ? normalizeToString(apyOverall) : '0';
  } catch {
    return '0';
  }
}


/**
 * Compute Net APR windows from PeriodSummary list (newest first)
 */
function computeNetWindows(
  summaries: Array<{
    totalAssetsAtStart: string;
    totalSupplyAtStart: string;
    totalAssetsAtEnd?: string;
    totalSupplyAtEnd?: string;
    netTotalSupplyAtEnd?: string;
    blockTimestamp: string;
    duration: string;
  }>
): { apr: { all: string; d30: string; d7: string }, apy: { all: string; d30: string; d7: string } } {
  const secondsInYear = 365 * 24 * 60 * 60;
  if (!summaries.length) return { apr: { all: '0', d30: '0', d7: '0' }, apy: { all: '0', d30: '0', d7: '0' } };

  // PPS helpers (use NET at period end)
  const ppsStart = (p: any) => Number(p.totalAssetsAtStart) / Number(p.totalSupplyAtStart);
  const ppsEndNet = (p: any) => Number(p.totalAssetsAtEnd) / Number(p.netTotalSupplyAtEnd || p.totalSupplyAtEnd);

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

  // Latest COMPLETED period (ignore open duration=0)
  const latest =
    summaries.find(p => {
      const dur = Number(p.duration || '0');
      const tae = BigInt(p.totalAssetsAtEnd || '0');
      const nse = BigInt(p.netTotalSupplyAtEnd || p.totalSupplyAtEnd || '0');
      return dur > 0 && tae > BigInt(0) && nse > BigInt(0);
    }) || summaries[0];
  const latestEndTs = Number(latest.blockTimestamp || '0') + Number(latest.duration || '0');

  // ALL: earliest valid start → latest completed end
  let earliestStart: typeof summaries[number] | undefined;
  let latestEnd: typeof summaries[number] | undefined;
  const zero = BigInt(0);

  for (const p of summaries) {
    const tas = BigInt(p.totalAssetsAtStart || '0');
    const tss = BigInt(p.totalSupplyAtStart || '0');
    const tae = BigInt(p.totalAssetsAtEnd || '0');
    const nse = BigInt(p.netTotalSupplyAtEnd || p.totalSupplyAtEnd || '0');
    const dur = BigInt(p.duration || '0');
    if (!latestEnd && tae > zero && nse > zero && dur > BigInt(0)) latestEnd = p;
    if (tas > zero && tss > zero) earliestStart = p; // provisional
  }
  for (let i = summaries.length - 1; i >= 0; i--) {
    const p = summaries[i];
    const tas = BigInt(p.totalAssetsAtStart || '0');
    const tss = BigInt(p.totalSupplyAtStart || '0');
    if (tas > zero && tss > zero) { earliestStart = p; break; }
  }

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
  const interpolatePpsAt = (targetTs: number): number | null => {
    for (const p of summaries) {
      const startTs = Number(p.blockTimestamp || '0');
      const dur = Number(p.duration || '0');
      const endTs = startTs + dur;
      if (dur > 0 && targetTs >= startTs && targetTs <= endTs) {
        const start = ppsStart(p);
        const end = ppsEndNet(p);
        if (!isFinite(start) || !isFinite(end)) return null;
        const f = (targetTs - startTs) / dur;
        return start + f * (end - start);
      }
    }
    return null;
  };

  const computeWindow = (windowSec: number): { apr: string; apy: string } => {
    const targetStartTs = latestEndTs - windowSec;
    if (targetStartTs < 0) return { apr: '0', apy: '0' };
    const priceAtStart = interpolatePpsAt(targetStartTs);
    const priceAtEnd = ppsEndNet(latest);
    if (priceAtStart === null) return { apr: '0', apy: '0' };
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
  const rawTokenAmount = Number(vaultData.totalAssets) / Math.pow(10, assetDecimals);
  let tvlUsd: string;
  try {
    tvlUsd = await getUsdValue(vaultData.asset, rawTokenAmount.toString(), chainId, assetDecimals);
    console.log(`💰 [Lagoon] TVL calculated: ${rawTokenAmount} ${underlyingSymbol} = $${tvlUsd}`);
  } catch {
    console.warn(`⚠️ [Lagoon] Oracle failed, using fallback calculation for ${underlyingSymbol}`);
    tvlUsd = rawTokenAmount.toString();
  }

  // Overall APY (ALL) via subgraph scan
  const apyNet = await fetchLagoonApyFromSubgraph(vaultData.address, chainId);

  // APR & APY windows
  let windows:
    { apr: { all: string; d30: string; d7: string }, apy: { all: string; d30: string; d7: string } } =
    { apr: { all: '0', d30: '0', d7: '0' }, apy: { all: '0', d30: '0', d7: '0' } };
  let vaultAge: string | undefined = undefined;

  try {
    if (chainId === 1) {
      const query = `query LastPeriods($vault: Bytes!, $limit: Int!) {
        periodSummaries(
          first: $limit
          orderBy: blockTimestamp
          orderDirection: desc
          where: { vault: $vault }
        ) {
          totalAssetsAtStart
          totalSupplyAtStart
          totalAssetsAtEnd
          totalSupplyAtEnd
          netTotalSupplyAtEnd
          blockTimestamp
          duration
        }
      }`;
      const body = { query, variables: { vault: vaultData.address.toLowerCase(), limit: 1000 } };
      const res = await fetch(LAGOON_MAINNET_SUBGRAPH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const json = await res.json();
        const summaries = (json?.data?.periodSummaries || []) as any[];
        windows = computeNetWindows(summaries);

        // Compute vault age from earliest periodSummaries.blockTimestamp (good proxy for Lagoon)
        try {
          if (summaries.length) {
            let earliest: any | undefined;
            for (let i = summaries.length - 1; i >= 0; i--) {
              const p = summaries[i];
              const tas = BigInt(p.totalAssetsAtStart || '0');
              const tss = BigInt(p.totalSupplyAtStart || '0');
              if (tas > BigInt(0) && tss > BigInt(0)) { earliest = p; break; }
            }
            const startTs = earliest ? Number(earliest.blockTimestamp || '0') : 0;
            if (startTs > 0) {
              const now = Math.floor(Date.now() / 1000);
              const ageSec = Math.max(0, now - startTs);
              const days = Math.floor(ageSec / (24 * 60 * 60));
              // Prefer a compact representation (e.g., 123d)
              vaultAge = `${days}d`;
            }
          }
        } catch {}
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
