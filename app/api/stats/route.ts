import { NextRequest, NextResponse } from 'next/server';
import { createSdkClient, getSupportedNetworks } from '@/lib/sdk';
import { transformAugustVault, getVaultTVL } from '@/lib/august-transform';

export async function GET(_request: NextRequest) {
  try {
    const chainIds = getSupportedNetworks();

    let totalTvl = 0;
    let apySum = 0;
    let apyCount = 0;
    let vaultCount = 0;

    for (const chainId of chainIds) {
      const sdk = createSdkClient(chainId);
      const augustVaults = await sdk.getVaults('active');

      const tvls = await Promise.all(
        augustVaults.map(async (v) => {
          const summary = await sdk
            .getVaultSummary(v.address)
            .catch(() => undefined);
          const tvlStr = getVaultTVL(v as any, summary as any);
          const tvl = parseFloat(tvlStr || '0');
          return { tvl, apy: v.reported_apy?.apy ?? 0 };
        })
      );

      for (const { tvl, apy } of tvls) {
        totalTvl += tvl;
        if (apy && Number.isFinite(apy)) {
          apySum += apy;
          apyCount += 1;
        }
      }

      vaultCount += augustVaults.length;
    }

    const avgApy = apyCount > 0 ? apySum / apyCount : 0;

    return NextResponse.json({
      totalTvlUsd: totalTvl,
      averageApy: avgApy,
      activeVaults: vaultCount,
      networks: chainIds.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to compute stats' },
      { status: 500 }
    );
  }
}


