/**
 * GET /api/vaults
 * Returns list of vaults across multiple chains
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVaultsSchema } from '@/lib/zodSchemas';
import { createSdkClient, getSupportedNetworks } from '@/lib/sdk';
import { VaultDTO } from '@/lib/dto';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { normalizeToString, formatUsd, formatPercentage } from '@/lib/normalize';
import { getVaultUnderlying } from '@/lib/underlying';
import { getUsdValue } from '@/lib/oracles';
import { transformAugustVault, getVaultTVL } from '@/lib/august-transform';
import { getIporVaults, isIporEnabled } from '@/lib/ipor-sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = getVaultsSchema.parse(query);
    const chainIds = validatedQuery.chains.length > 0 ? validatedQuery.chains : getSupportedNetworks();
    
    // Get provider filter (optional: 'upshift', 'ipor', or undefined for all)
    const provider = searchParams.get('provider') as 'upshift' | 'ipor' | null;
    
    // Check cache first
    const cacheKey = provider 
      ? `${CacheKeys.vaults(chainIds)}_${provider}`
      : CacheKeys.vaults(chainIds);
    const cached = cache.get<VaultDTO[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const vaults: VaultDTO[] = [];

    // Fetch Upshift vaults (if not filtering for IPOR only)
    if (provider !== 'ipor') {
      for (const chainId of chainIds) {
        try {
          const sdk = createSdkClient(chainId);
          const augustVaults = await sdk.getVaults('active'); // Only get active vaults

          // Process vaults in parallel with limited concurrency to avoid overwhelming the API
          const vaultPromises = augustVaults
            .filter(augustVault => augustVault.chain === chainId)
            .map(async (augustVault) => {
              console.log(`🔄 [Upshift API] Processing vault: ${augustVault.vault_name} (${augustVault.address})`);
              
              // Transform August Digital response to our DTO format first
              const vaultDTO = transformAugustVault(augustVault);
              
              // Mark as Upshift vault
              vaultDTO.provider = 'upshift';
              
              // Try to get vault summary for TVL data (with timeout)
              let tvlUsd = '0';
              try {
                const vaultSummary = await Promise.race([
                  sdk.getVaultSummary(augustVault.address),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000)) // 3 second timeout
                ]);
                tvlUsd = getVaultTVL(augustVault, vaultSummary as any);
                console.log(`💰 [Upshift API] TVL for ${augustVault.vault_name}: $${tvlUsd}`);
              } catch (error) {
                // Use default TVL if summary fetch fails
                console.warn(`Could not fetch summary for vault ${augustVault.address}:`, error);
              }

              vaultDTO.tvlUsd = tvlUsd;
              console.log(`✅ [Upshift API] Final vault DTO for ${augustVault.vault_name}:`, JSON.stringify({
                name: vaultDTO.name,
                underlying: vaultDTO.underlying.symbol,
                tvlUsd: vaultDTO.tvlUsd,
                apyNet: vaultDTO.apyNet
              }, null, 2));

              return vaultDTO;
            });

          // Wait for all vault processing to complete
          const processedVaults = await Promise.all(vaultPromises);
          vaults.push(...processedVaults);
        } catch (error) {
          console.error(`Error fetching Upshift vaults for chain ${chainId}:`, error);
          // Continue with other chains even if one fails
        }
      }
    }

    // Fetch IPOR vaults (if not filtering for Upshift only and IPOR is enabled)
    if (provider !== 'upshift' && isIporEnabled()) {
      try {
        console.log(`🔄 [IPOR API] Fetching IPOR vaults for chains: ${chainIds.join(', ')}`);
        const iporVaults = await getIporVaults(chainIds);
        console.log(`✅ [IPOR API] Fetched ${iporVaults.length} IPOR vaults`);
        vaults.push(...iporVaults);
      } catch (error) {
        console.error('Error fetching IPOR vaults:', error);
        // Continue even if IPOR fails
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
