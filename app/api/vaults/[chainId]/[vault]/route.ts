/**
 * GET /api/vaults/[chainId]/[vault]
 * Returns detailed information for a specific vault
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVaultSchema } from '@/lib/zodSchemas';
import { createSdkClient, isSupportedNetwork } from '@/lib/sdk';
import { VaultDTO } from '@/lib/dto';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { normalizeToString } from '@/lib/normalize';
import { getUsdValue } from '@/lib/oracles';
import { transformAugustVault, getVaultTVL, calculateVaultAge, calculateRealizedAPY, computeAugustWindows, computeWindowsFromSummary } from '@/lib/august-transform';
import { getIporVaults, isIporEnabled } from '@/lib/ipor-sdk';
import { getLagoonVault } from '@/lib/lagoon-sdk';
import { getCuratedVault } from '@/lib/curated-vaults';

interface RouteParams {
  params: Promise<{
    chainId: string;
    vault: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { chainId: chainIdParam, vault: vaultParam } = await params;
  try {
    // Validate parameters
    const validatedParams = getVaultSchema.parse({
      chainId: parseInt(chainIdParam),
      vault: vaultParam
    });

    let { chainId, vault } = validatedParams;

    // Check if chain is supported
    if (!isSupportedNetwork(chainId)) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = CacheKeys.vault(chainId, vault);
    const cached = cache.get<VaultDTO>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    let vaultDTO: VaultDTO | null = null;

    // First, check if this is a curated vault and restrict resolution to that provider only
    const curatedVault = getCuratedVault(vault, chainId);

    if (curatedVault) {
      // Strict provider handling for curated vaults
      if (curatedVault.provider === 'lagoon') {
        try {
          console.log(`🔍 [Vault Detail] Checking curated Lagoon vault: ${vault} on chain ${chainId}`);
          console.log(`✅ [Vault Detail] Found curated Lagoon vault: ${curatedVault.name}`);

          const getAssetDecimals = (symbol: string): number => {
            const decimalsMap: Record<string, number> = {
              'USDC': 6,
              'USDT': 6,
              'BTC': 8,
              'WBTC': 8,
              'ETH': 18,
              'WETH': 18,
              'DAI': 18
            };
            return decimalsMap[symbol] || 18;
          };

          vaultDTO = await getLagoonVault(
            vault,
            chainId,
            curatedVault.underlyingSymbol,
            getAssetDecimals(curatedVault.underlyingSymbol)
          );
        } catch (error) {
          console.warn(`Could not fetch from Lagoon (curated). Returning Lagoon placeholder.`, error);
          // Return Lagoon placeholder, do NOT fall back to Upshift/August
          const getTokenAddress = (symbol: string): string => {
            const addresses: Record<string, string> = {
              'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              'BTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
              'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
              'ETH': '0x0000000000000000000000000000000000000000',
              'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
              'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
              'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F'
            };
            return addresses[symbol] || '0x0000000000000000000000000000000000000000';
          };
          const getTokenDecimals = (symbol: string): number => {
            const decimals: Record<string, number> = {
              'USDC': 6,
              'USDT': 6,
              'BTC': 8,
              'WBTC': 8,
              'ETH': 18,
              'WETH': 18,
              'DAI': 18
            };
            return decimals[symbol] || 18;
          };

          vaultDTO = {
            id: curatedVault.address,
            chainId: curatedVault.chainId,
            name: curatedVault.name,
            symbol: `lag${curatedVault.underlyingSymbol}`,
            tvlUsd: '0',
            apyNet: '0',
            fees: { mgmtBps: '0', perfBps: '0' },
            underlying: {
              symbol: curatedVault.underlyingSymbol,
              address: getTokenAddress(curatedVault.underlyingSymbol),
              decimals: getTokenDecimals(curatedVault.underlyingSymbol)
            },
            status: 'active',
            provider: 'lagoon',
            metadata: {
              website: curatedVault.externalUrl,
              description: `${curatedVault.name} - On-chain data unavailable`,
              logo: undefined
            }
          };
        }

        // Return immediately for curated Lagoon (either real data or placeholder)
        cache.set(cacheKey, vaultDTO!, CacheTTL.VAULT_DETAIL);
        return NextResponse.json(vaultDTO);
      }

      if (curatedVault.provider === 'upshift') {
        try {
          console.log(`🔍 [Vault Detail] Checking curated Upshift vault: ${vault} on chain ${chainId}`);
          const sdk = createSdkClient(chainId);

          const isHexAddress = /^0x[a-fA-F0-9]{40}$/.test(vault);
          let augustVault;
          if (isHexAddress) {
            augustVault = await sdk.getVault(vault);
          } else {
            const list = await sdk.getVaults('active');
            const match = list.find((v) => v.id === vault);
            if (!match) {
              return NextResponse.json(
                { error: 'Vault not found' },
                { status: 404 }
              );
            }
            augustVault = await sdk.getVault(match.address);
            vault = match.address;
          }

          if (augustVault) {
            let vaultSummary, apyData;
            try {
              [vaultSummary, apyData] = await Promise.all([
                sdk.getVaultSummary(vault).catch(() => null),
                sdk.getVaultAPY(vault).catch(() => null)
              ]);
            } catch {}

            vaultDTO = transformAugustVault(augustVault);
            vaultDTO.provider = 'upshift';
            vaultDTO.tvlUsd = getVaultTVL(augustVault, vaultSummary || undefined);
            const vaultAge = calculateVaultAge(augustVault.start_datetime);
            const realizedApy = apyData ? calculateRealizedAPY(apyData) : '--';
            
            // Compute APR/APY windows from August APY data
            let windows = { apr: { all: '0', d30: '0', d7: '0' }, apy: { all: '0', d30: '0', d7: '0' } };
            if (apyData && (apyData.liquidAPY30Day || apyData.liquidAPY7Day || apyData.hgETH30dLiquidAPY || apyData.hgETH7dLiquidAPY)) {
              const currentApy = augustVault.reported_apy?.apy || 0;
              windows = computeAugustWindows(apyData, currentApy);
            } else if (vaultSummary) {
              const currentApy = augustVault.reported_apy?.apy || 0;
              windows = computeWindowsFromSummary(vaultSummary, currentApy);
            }
            
            vaultDTO.metadata = {
              ...vaultDTO.metadata,
              website: `https://vaults.augustdigital.io/${chainId}/${vault}`,
              logo: augustVault.vault_logo_url,
              vaultAge,
              realizedApy,
              // APR (linear)
              aprNetAll: windows.apr.all,
              aprNet30d: windows.apr.d30,
              aprNet7d: windows.apr.d7,
              // APY (compounded)
              apyNetAll: windows.apy.all,
              apyNet30d: windows.apy.d30,
              apyNet7d: windows.apy.d7,
            } as any;
          }
        } catch (error) {
          console.warn(`Could not fetch from Upshift (curated).`, error);
        }

        if (!vaultDTO) {
          return NextResponse.json(
            { error: 'Vault not found for curated provider: upshift' },
            { status: 404 }
          );
        }

        cache.set(cacheKey, vaultDTO, CacheTTL.VAULT_DETAIL);
        return NextResponse.json(vaultDTO);
      }

      if (curatedVault.provider === 'ipor') {
        try {
          if (isIporEnabled()) {
            const iporVaults = await getIporVaults([chainId]);
            const iporVault = iporVaults.find(
              v => v.id.toLowerCase() === vault.toLowerCase()
            );
            if (iporVault) vaultDTO = iporVault;
          }
        } catch (error) {
          console.warn(`Could not fetch from IPOR (curated).`, error);
        }

        if (!vaultDTO) {
          return NextResponse.json(
            { error: 'Vault not found for curated provider: ipor' },
            { status: 404 }
          );
        }

        cache.set(cacheKey, vaultDTO, CacheTTL.VAULT_DETAIL);
        return NextResponse.json(vaultDTO);
      }
    }

    // Non-curated vaults: best-effort resolution (IPOR then Upshift)
    if (isIporEnabled()) {
      try {
        console.log(`🔍 [Vault Detail] Checking IPOR for vault: ${vault} on chain ${chainId}`);
        const iporVaults = await getIporVaults([chainId]);
        const iporVault = iporVaults.find(
          v => v.id.toLowerCase() === vault.toLowerCase()
        );
        if (iporVault) vaultDTO = iporVault;
      } catch (error) {
        console.warn(`Could not fetch from IPOR:`, error);
      }
    }

    if (!vaultDTO) {
      try {
        console.log(`🔍 [Vault Detail] Checking Upshift for vault: ${vault} on chain ${chainId}`);
        const sdk = createSdkClient(chainId);

        const isHexAddress = /^0x[a-fA-F0-9]{40}$/.test(vault);
        let augustVault;
        if (isHexAddress) {
          augustVault = await sdk.getVault(vault);
        } else {
          const list = await sdk.getVaults('active');
          const match = list.find((v) => v.id === vault);
          if (!match) {
            return NextResponse.json(
              { error: 'Vault not found' },
              { status: 404 }
            );
          }
          augustVault = await sdk.getVault(match.address);
          vault = match.address;
        }

        if (augustVault) {
          let vaultSummary, apyData;
          try {
            [vaultSummary, apyData] = await Promise.all([
              sdk.getVaultSummary(vault).catch(() => null),
              sdk.getVaultAPY(vault).catch(() => null)
            ]);
          } catch {}

          vaultDTO = transformAugustVault(augustVault);
          vaultDTO.provider = 'upshift';
          vaultDTO.tvlUsd = getVaultTVL(augustVault, vaultSummary || undefined);
          const vaultAge = calculateVaultAge(augustVault.start_datetime);
          const realizedApy = apyData ? calculateRealizedAPY(apyData) : '--';
          
          // Compute APR/APY windows from August APY data
          let windows = { apr: { all: '0', d30: '0', d7: '0' }, apy: { all: '0', d30: '0', d7: '0' } };
          if (apyData && (apyData.liquidAPY30Day || apyData.liquidAPY7Day || apyData.hgETH30dLiquidAPY || apyData.hgETH7dLiquidAPY)) {
            const currentApy = augustVault.reported_apy?.apy || 0;
            windows = computeAugustWindows(apyData, currentApy);
          } else if (vaultSummary) {
            const currentApy = augustVault.reported_apy?.apy || 0;
            windows = computeWindowsFromSummary(vaultSummary, currentApy);
          }
          
          vaultDTO.metadata = {
            ...vaultDTO.metadata,
            website: `https://vaults.augustdigital.io/${chainId}/${vault}`,
            logo: augustVault.vault_logo_url,
            vaultAge,
            realizedApy,
            // APR (linear)
            aprNetAll: windows.apr.all,
            aprNet30d: windows.apr.d30,
            aprNet7d: windows.apr.d7,
            // APY (compounded)
            apyNetAll: windows.apy.all,
            apyNet30d: windows.apy.d30,
            apyNet7d: windows.apy.d7,
          } as any;
        }
      } catch (error) {
        console.warn(`Could not fetch from Upshift:`, error);
      }
    }

    if (!vaultDTO) {
      return NextResponse.json(
        { error: 'Vault not found in any provider' },
        { status: 404 }
      );
    }

    // Cache the result
    cache.set(cacheKey, vaultDTO, CacheTTL.VAULT_DETAIL);

    return NextResponse.json(vaultDTO);

  } catch (error) {
    console.error('Error in /api/vaults/[chainId]/[vault]:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch vault details' },
      { status: 500 }
    );
  }
}
