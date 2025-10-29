'use client';

import { formatUsd, formatPercentage } from '@/lib/normalize';

interface VaultDetailProps {
  vault?: {
    name: string;
    strategist?: { name: string };
    tvlUsd: string;
    apyNet: string;
    status: string;
    provider?: string;
    createdAt?: string;
    metadata?: {
      vaultAge?: string;
      realizedApy?: string;
    };
  };
}

export default function VaultDetail({ vault }: VaultDetailProps) {
  // Default values for when vault data is not available
  const vaultName = vault?.name || '--';
  const strategistName = vault?.strategist?.name || '--';
  const tvl = vault?.tvlUsd ? formatUsd(vault.tvlUsd) : '--';
  const apy = vault?.apyNet ? formatPercentage(vault.apyNet) : '--';
  
  // Calculate realized APY and vault age from vault data
  const realizedApy = vault?.metadata?.realizedApy || '--';
  const vaultAge = vault?.metadata?.vaultAge || '--';
  const provider = vault?.provider || 'flagship';
  
  // Determine badge text and styling based on provider
  const getProviderBadge = () => {
    switch (provider) {
      case 'ipor':
        return { text: 'Advanced', bgColor: 'bg-[#C4511F]' };
      case 'lagoon':
        return { text: 'Lagoon', bgColor: 'bg-[#6B73FF]' };
      default:
        return { text: 'Flagship', bgColor: 'bg-[#2C2929]' };
    }
  };

  const badge = getProviderBadge();

  return (
    <div className="flex w-full p-5 flex-col justify-center items-center gap-5 rounded-[21px] glass-border bg-white/6">
      <div className="flex w-full p-4 flex-col justify-center items-center gap-4 rounded-[16px] bg-gradient-to-b from-[#141414] to-[#141414]">
        <div className="flex w-full justify-between items-start">
          <div className="flex flex-col items-start gap-4">
            <div className="text-white font-modernist text-[40px] font-normal leading-[128%] tracking-[-0.8px]">
              {vaultName}
            </div>
            <div className="text-white font-dm-sans text-[13px] font-light leading-[128%] tracking-[-0.25px]">
              by {strategistName}
            </div>
          </div>
          <div className={`flex px-[5px] py-[5px] justify-center items-center gap-3 rounded-[11px] ${badge.bgColor}`}>
            <div className="text-white font-dm-sans text-[15px] font-medium">
              {badge.text}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]">
            {tvl}
          </div>
          <div className="text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]">
            TOTAL TVL
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]">
            {apy}
          </div>
          <div className="text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]">
            CURRENT APY
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]">
            {realizedApy}
          </div>
          <div className="text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]">
            REALIZED APY
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="text-[#00F792] font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]">
            {vaultAge}
          </div>
          <div className="text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]">
            VAULT AGE
          </div>
        </div>
      </div>
    </div>
  );
}
