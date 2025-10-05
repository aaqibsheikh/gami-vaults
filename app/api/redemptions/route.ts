/**
 * GET /api/redemptions
 * Returns claimable redemption amounts for a vault and user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedemptionsSchema } from '@/lib/zodSchemas';
import { createSdkClient, isSupportedNetwork } from '@/lib/sdk';
import { RedemptionDTO } from '@/lib/dto';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { normalizeToString } from '@/lib/normalize';
import { getUsdValue } from '@/lib/oracles';
import { AugustWithdrawalSummary } from '@/lib/dto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = getRedemptionsSchema.parse(query);
    const { chain, vault, address } = validatedQuery;

    // Check if chain is supported
    if (!isSupportedNetwork(chain)) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chain}` },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = CacheKeys.redemptions(chain, vault, address);
    const cached = cache.get<RedemptionDTO[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Create SDK client and fetch redemptions from August Digital
    const sdk = createSdkClient(chain);
    const withdrawalSummary = await sdk.getVaultWithdrawals(vault);

    if (!withdrawalSummary || !withdrawalSummary.pending_withdrawals) {
      // Cache empty result for shorter time
      cache.set(cacheKey, [], CacheTTL.REDEMPTIONS / 2);
      return NextResponse.json([]);
    }

    const redemptionDTOs: RedemptionDTO[] = [];

    // Process pending withdrawals for the specific user
    const userWithdrawals = withdrawalSummary.pending_withdrawals.filter(
      withdrawal => withdrawal.receiver.toLowerCase() === address.toLowerCase()
    );

    for (const withdrawal of userWithdrawals) {
      // Normalize numeric values
      const claimableAmount = withdrawal.normalized_amount;
      const claimableValueUsd = '0'; // TODO: Get USD value from August Digital API

      const redemptionDTO: RedemptionDTO = {
        vault: withdrawal.vault,
        chainId: chain,
        address,
        claimableAmount,
        claimableValueUsd,
        token: {
          symbol: withdrawalSummary.symbol || 'UNKNOWN',
          address: vault, // Use vault address as fallback
          decimals: 18 // Default decimals
        },
        expiry: undefined // August Digital doesn't provide expiry in withdrawal summary
      };

      redemptionDTOs.push(redemptionDTO);
    }

    // Cache the results
    cache.set(cacheKey, redemptionDTOs, CacheTTL.REDEMPTIONS);

    return NextResponse.json(redemptionDTOs);

  } catch (error) {
    console.error('Error in /api/redemptions:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch redemptions' },
      { status: 500 }
    );
  }
}
