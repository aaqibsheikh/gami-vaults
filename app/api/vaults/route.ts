/**
 * GET /api/vaults
 * Returns list of curated vaults only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVaultsSchema } from '@/lib/zodSchemas';
import { createSdkClient, getSupportedNetworks } from '@/lib/sdk';
import { VaultDTO } from '@/lib/dto';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { transformAugustVault, getVaultTVL } from '@/lib/august-transform';
import { 
  CURATED_VAULTS
} from '@/lib/curated-vaults';
import { getLagoonVault } from '@/lib/lagoon-sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = getVaultsSchema.parse(query);
    const chainIds = validatedQuery.chains.length > 0 ? validatedQuery.chains : getSupportedNetworks();
    
    // Get provider filter (optional: 'upshift', 'ipor', 'lagoon', or undefined for all)
    const provider = searchParams.get('provider') as 'upshift' | 'ipor' | 'lagoon' | null;
    
    // Check cache first
    const cacheKey = provider 
      ? `${CacheKeys.vaults(chainIds)}_${provider}`
      : CacheKeys.vaults(chainIds);
    const cached = cache.get<VaultDTO[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const vaults: VaultDTO[] = [];

    // Only process curated vaults
    const curatedVaultsForChains = CURATED_VAULTS.filter(v => 
      chainIds.includes(v.chainId) &&
      (!provider || v.provider === provider)
    );

    // Process each curated vault
    for (const curatedVault of curatedVaultsForChains) {
      try {
        if (curatedVault.provider === 'upshift') {
          // Fetch Upshift vault data from August Digital API
          const sdk = createSdkClient(curatedVault.chainId);
          
          // Fetch specific vault data
          const augustVault = await sdk.getVault(curatedVault.address);
          // Transform to our DTO format
          const vaultDTO = transformAugustVault(augustVault);
          vaultDTO.provider = 'upshift';
          
          // Fetch TVL data
          let tvlUsd = '0';
          try {
            const vaultSummary = await Promise.race([
              sdk.getVaultSummary(curatedVault.address),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
            tvlUsd = getVaultTVL(augustVault, vaultSummary as any);
          } catch (error) {
            // Failed to fetch TVL, will use default value
          }

          vaultDTO.tvlUsd = tvlUsd;
          vaults.push(vaultDTO);
          
        } else if (curatedVault.provider === 'lagoon') {
          // Fetch Lagoon vault data from on-chain contract
          try {
            const vaultDTO = await getLagoonVault(
              curatedVault.address,
              curatedVault.chainId,
              curatedVault.underlyingSymbol,
              getTokenDecimals(curatedVault.underlyingSymbol)
            );
            vaults.push(vaultDTO);
          } catch (error) {
            // Fallback to placeholder data if on-chain fetch fails
            console.warn(`Failed to fetch Lagoon vault ${curatedVault.address}, using placeholder:`, error);
            vaults.push({
              id: curatedVault.address,
              chainId: curatedVault.chainId,
              name: curatedVault.name,
              symbol: `lag${curatedVault.underlyingSymbol}`,
              tvlUsd: '0',
              apyNet: '0',
              fees: {
                mgmtBps: '0',
                perfBps: '0'
              },
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
            });
          }
        }
      } catch (error) {
        console.error(`Error processing vault ${curatedVault.address}:`, error);
        // Continue with other vaults even if one fails
      }
    }
    
    // Cache the results
    cache.set(cacheKey, vaults, CacheTTL.VAULTS_LIST);

    return NextResponse.json(vaults);

  } catch (error) {
    console.error('Error in /api/vaults:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch vaults' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get token address by symbol
 */
function getTokenAddress(symbol: string): string {
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
}

/**
 * Helper function to get token decimals by symbol
 */
function getTokenDecimals(symbol: string): number {
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
}
