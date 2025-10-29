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
import { transformAugustVault, getVaultTVL, calculateVaultAge, calculateRealizedAPY } from '@/lib/august-transform';
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

    // First, try to find the vault in IPOR (if enabled)
    if (isIporEnabled()) {
      try {
        console.log(`🔍 [Vault Detail] Checking IPOR for vault: ${vault} on chain ${chainId}`);
        const iporVaults = await getIporVaults([chainId]);
        const iporVault = iporVaults.find(
          v => v.id.toLowerCase() === vault.toLowerCase()
        );
        
        if (iporVault) {
          console.log(`✅ [Vault Detail] Found IPOR vault: ${iporVault.name}`);
          vaultDTO = iporVault;
        }
      } catch (error) {
        console.warn(`Could not fetch from IPOR:`, error);
      }
    }

    // If not found in IPOR, try Upshift/August Digital
    if (!vaultDTO) {
      try {
        console.log(`🔍 [Vault Detail] Checking Upshift for vault: ${vault} on chain ${chainId}`);
        const sdk = createSdkClient(chainId);

        // Accept either on-chain address (preferred) or legacy UUID; if UUID, resolve to address
        const isHexAddress = /^0x[a-fA-F0-9]{40}$/.test(vault);
        let augustVault;
        if (isHexAddress) {
          augustVault = await sdk.getVault(vault);
        } else {
          // Fallback: find by UUID from the vaults list and use its address
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
          console.log(`✅ [Vault Detail] Found Upshift vault: ${augustVault.vault_name}`);
          
          // Try to get vault summary and APY data
          let vaultSummary, apyData;
          try {
            [vaultSummary, apyData] = await Promise.all([
              sdk.getVaultSummary(vault).catch(() => null),
              sdk.getVaultAPY(vault).catch(() => null)
            ]);
          } catch (error) {
            console.warn(`Could not fetch summary/APY for vault ${vault}:`, error);
          }

          // Transform August Digital response to our DTO format
          vaultDTO = transformAugustVault(augustVault);
          vaultDTO.provider = 'upshift';
          
          // Get TVL from summary data
          const tvlUsd = getVaultTVL(augustVault, vaultSummary || undefined);
          vaultDTO.tvlUsd = tvlUsd;

          // Calculate additional metadata
          const vaultAge = calculateVaultAge(augustVault.start_datetime);
          const realizedApy = apyData ? calculateRealizedAPY(apyData) : '--';

          // Add additional metadata
          vaultDTO.metadata = {
            ...vaultDTO.metadata,
            website: `https://vaults.augustdigital.io/${chainId}/${vault}`,
            logo: augustVault.vault_logo_url,
            vaultAge,
            realizedApy
          };
        }
      } catch (error) {
        console.warn(`Could not fetch from Upshift:`, error);
      }
    }

    // If not found in IPOR or Upshift, try Lagoon
    if (!vaultDTO) {
      try {
        console.log(`🔍 [Vault Detail] Checking Lagoon for vault: ${vault} on chain ${chainId}`);
        
        // Check if this is a curated Lagoon vault
        const curatedVault = getCuratedVault(vault, chainId);
        if (curatedVault && curatedVault.provider === 'lagoon') {
          console.log(`✅ [Vault Detail] Found curated Lagoon vault: ${curatedVault.name}`);
          
          // Fetch Lagoon vault data
          vaultDTO = await getLagoonVault(
            vault,
            chainId,
            curatedVault.underlyingSymbol,
            6 // USDC has 6 decimals
          );
        }
      } catch (error) {
        console.warn(`Could not fetch from Lagoon:`, error);
      }
    }

    // If vault not found in any provider
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
