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
  const vaultName = vault?.name || '--';
  const strategistName = vault?.strategist?.name || '--';
  const tvl = vault?.tvlUsd ? formatUsd(vault.tvlUsd) : '--';
  const apy = vault?.apyNet ? formatPercentage(vault.apyNet) : '--';

  const realizedApy = vault?.metadata?.realizedApy || '--';
  const vaultAge = vault?.metadata?.vaultAge || '--';
  const provider = vault?.provider || 'flagship';

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
    <div className='w-full px-[18.76px] py-[21px] rounded-[21.2px] bg-[#FFFFFF0F] backdrop-blur-lg space-y-5'>
      <div className='flex bg-[#141414] rounded-[16.11px] w-full p-[14.97px] justify-between items-start'>
        <div>
          <div className='text-white font-modernist text-[40px] font-normal tracking-[-0.8px] leading-none'>
            {vaultName}
          </div>

          <div className='text-white font-dm-sans text-[12.51px] font-light leading-[128%] tracking-[-0.25px] mt-1.5'>
            by {strategistName}
          </div>
        </div>

        <div
          className={`rounded-[10px] text-white font-dm-sans text-[15.39px] font-medium leading-none ${badge.bgColor} p-[5.44px]`}
        >
          {badge.text}
        </div>
      </div>

      <div className='flex justify-between items-center w-full'>
        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
            {tvl}
          </div>

          <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
            TOTAL TVL
          </div>
        </div>

        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
            {apy}
          </div>

          <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
            CURRENT APY
          </div>
        </div>

        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
            {realizedApy}
          </div>

          <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
            REALIZED APY
          </div>
        </div>

        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='text-[#00F792] font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
            {vaultAge}
          </div>

          <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
            VAULT AGE
          </div>
        </div>
      </div>
    </div>
  );
}
