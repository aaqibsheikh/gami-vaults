/**
 * GET /api/portfolio
 * Returns portfolio positions for a connected wallet
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioSchema } from '@/lib/zodSchemas';
import { createSdkClient, isSupportedNetwork } from '@/lib/sdk';
import { PortfolioDTO, PositionDTO } from '@/lib/dto';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { normalizeToString, formatUsd } from '@/lib/normalize';
import { getUsdValue } from '@/lib/oracles';
import { transformAugustVault } from '@/lib/august-transform';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = getPortfolioSchema.parse(query);
    const { chain, address } = validatedQuery;

    // Check if chain is supported
    if (!isSupportedNetwork(chain)) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chain}` },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = CacheKeys.portfolio(chain, address);
    const cached = cache.get<PortfolioDTO>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Create SDK client and fetch positions
    const sdk = createSdkClient(chain);
    const positions = await sdk.getPositions(address);

    if (!positions || positions.length === 0) {
      const emptyPortfolio: PortfolioDTO = {
        address,
        chainId: chain,
        positions: [],
        totalValueUsd: '0',
        totalPnlUsd: '0',
        lastUpdated: new Date().toISOString()
      };

      // Cache empty result for shorter time
      cache.set(cacheKey, emptyPortfolio, CacheTTL.PORTFOLIO / 2);
      return NextResponse.json(emptyPortfolio);
    }

    const positionDTOs: PositionDTO[] = [];
    let totalValueUsd = 0;
    let totalPnlUsd = 0;

    // Process each position
    for (const position of positions) {
      // Normalize numeric values
      const shares = normalizeToString(position.shares);
      const valueUsd = normalizeToString(position.value);
      const pnlUsd = normalizeToString(position.pnl);
      const entryUsd = normalizeToString(position.entryValue);

      // Convert to numbers for totals
      const valueNum = parseFloat(valueUsd);
      const pnlNum = parseFloat(pnlUsd);
      
      totalValueUsd += valueNum;
      totalPnlUsd += pnlNum;

      const positionDTO: PositionDTO = {
        vault: position.vault,
        chainId: chain,
        shares,
        valueUsd,
        pnlUsd,
        entryUsd,
        rewards: [] // TODO: Get from SDK
      };

      positionDTOs.push(positionDTO);
    }

    const portfolio: PortfolioDTO = {
      address,
      chainId: chain,
      positions: positionDTOs,
      totalValueUsd: totalValueUsd.toString(),
      totalPnlUsd: totalPnlUsd.toString(),
      lastUpdated: new Date().toISOString()
    };

    // Cache the result
    cache.set(cacheKey, portfolio, CacheTTL.PORTFOLIO);

    return NextResponse.json(portfolio);

  } catch (error) {
    console.error('Error in /api/portfolio:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
