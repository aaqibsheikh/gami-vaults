'use client';

import { useMemo } from 'react';
import { useVaults } from '@/hooks/useVaults';
import { getSupportedNetworks } from '@/lib/sdk';
import { formatUsd, formatPercentage } from '@/lib/normalize';
import Link from 'next/link';

interface VaultRowProps {
  name: string;
  apy: string;
  tvl: string;
  assets: string[];
  chainId: number;
  vaultId: string;
  provider?: 'upshift' | 'ipor' | 'lagoon';
}

function VaultRow({ name, apy, tvl, assets, chainId, vaultId, provider }: VaultRowProps) {
  const apyValue = parseFloat(apy.replace('%', ''));
  const hasApy = !isNaN(apyValue) && apyValue > 0;
  
  // Determine badge color based on provider
  let badgeText = '';
  let badgeClass = '';
  if (provider === 'ipor') {
    badgeText = 'Advanced';
    badgeClass = 'bg-[#C4511F]';
  } else if (provider === 'lagoon') {
    badgeText = 'Lagoon';
    badgeClass = 'bg-[#6B73FF]';
  } else {
    badgeText = 'Flagship';
    badgeClass = 'bg-[#2C2929]';
  }

  return (
    <>
      <div className="flex justify-between items-center self-stretch">
        <div className="flex w-[150px] px-1 items-center gap-1 self-stretch rounded-[12px]">
          <Link
            href={`/vaults/${chainId}/${vaultId}`}
            className="text-white text-start font-dm-sans text-[13px] font-bold flex items-center gap-2 hover:text-[#A100FF] transition-colors cursor-pointer"
          >
            {name}
          </Link>
        </div>
        <div className="flex w-[43px] px-1 justify-center items-center gap-1 self-stretch rounded-[12px]">
          <div className={`font-dm-sans text-[13px] font-medium ${hasApy ? 'text-[#10B981]' : 'text-white/50'}`}>
            {apy}
          </div>
        </div>
        <div className="flex w-[43px] px-1 justify-center items-center gap-1 self-stretch rounded-[12px]">
          <div className="text-white text-center font-dm-sans text-[13px] font-normal">
            {tvl}
          </div>
        </div>
        <div className="flex w-[165px] px-1 items-center gap-[5px] self-stretch rounded-[12px]">
          {assets.map((asset, index) => (
            <div key={index} className="flex px-[5px] py-[6px] justify-center items-center gap-2 rounded-[5px] bg-[#2C2929]">
              <div className="text-white font-dm-sans text-[13px] font-medium">
                {asset}
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-[204px] px-1 justify-center items-center gap-1 self-stretch rounded-[9px]">
          <div className="flex w-full justify-between items-start gap-2">
            <Link
              href={`/vaults/${chainId}/${vaultId}?tab=deposit`}
              className="flex px-4 py-3 justify-center items-center rounded-blue hover:opacity-90 transition-opacity"
            >
              <div className="text-white font-dm-sans text-[12px] font-semibold">
                Deposit
              </div>
            </Link>
            <Link
              href={`/vaults/${chainId}/${vaultId}`}
              className="flex px-4 py-3 justify-center items-center rounded-gray"
            >
              <div className="text-white font-dm-sans text-[12px] font-medium">
                Details
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-white/50"></div>
    </>
  );
}

export default function VaultTable() {
  const supportedNetworks = getSupportedNetworks();
  const { data: vaults, isLoading, error } = useVaults({
    chainIds: supportedNetworks
  });

  // Transform vaults for display
  const transformedVaults = useMemo(() => {
    if (!vaults) return [];
    
    return vaults.map(vault => ({
      name: vault.name,
      apy: vault.apyNet ? formatPercentage(vault.apyNet) : 'N/A',
      tvl: formatUsd(vault.tvlUsd),
      assets: [vault.underlying.symbol],
      chainId: vault.chainId,
      vaultId: vault.id,
      provider: vault.provider
    }));
  }, [vaults]);

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center gap-[15px] py-8">
        <div className="text-white/50 font-dm-sans text-[14px]">
          Loading vaults...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full flex-col items-center gap-[15px] py-8">
        <div className="text-red-400 font-dm-sans text-[14px]">
          Error loading vaults: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-[15px]">
      <div className="flex justify-between items-center self-stretch">
        <div className="flex w-[130px] px-1 items-center gap-1 self-stretch rounded-[12px]">
          <div className="text-white/50 text-center font-dm-sans text-[13px] font-normal">
            VAULT
          </div>
        </div>
        <div className="flex w-[43px] px-1 items-center gap-1 self-stretch rounded-[12px]">
          <div className="text-white/50 text-center font-dm-sans text-[13px] font-normal">
            APY
          </div>
        </div>
        <div className="flex w-[43px] px-1 items-center gap-1 self-stretch rounded-[12px]">
          <div className="text-white/50 text-center font-dm-sans text-[13px] font-normal">
            TVL
          </div>
        </div>
        <div className="flex w-[166px] px-1 items-center gap-1 self-stretch rounded-[12px]">
          <div className="text-white/50 text-center font-dm-sans text-[13px] font-normal">
            ASSETS
          </div>
        </div>
        <div className="flex w-[204px] px-1 items-center gap-1 self-stretch rounded-[12px]">
          <div className="text-white/50 text-center font-dm-sans text-[13px] font-medium">
            ACTIONS
          </div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-white/50"></div>
      {transformedVaults.length > 0 ? (
        transformedVaults.map((vault, index) => (
          <VaultRow key={`${vault.chainId}-${vault.vaultId}-${index}`} {...vault} />
        ))
      ) : (
        <div className="flex w-full flex-col items-center gap-[15px] py-8">
          <div className="text-white/50 font-dm-sans text-[14px]">
            No vaults available
          </div>
        </div>
      )}
    </div>
  );
}
