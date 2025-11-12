'use client';

import { formatUsd, formatPercentage } from '@/lib/normalize';
import { VaultDTO } from '@/lib/dto';

interface VaultDetailProps {
  vault?: VaultDTO;
}

export default function VaultDetail({ vault }: VaultDetailProps) {
  const vaultName = vault?.name || '--';
  const strategistName = vault?.strategist?.name || '--';
  const tvl = vault?.tvlUsd ? formatUsd(vault.tvlUsd) : '--';
  // Net APR windows (Lagoon)
  const aprAll = vault?.metadata?.aprNetAll ? formatPercentage(vault.metadata.aprNetAll) : '--';
  const apr30d = vault?.metadata?.aprNet30d ? formatPercentage(vault.metadata.aprNet30d) : '--';
  const apr7d = vault?.metadata?.aprNet7d ? formatPercentage(vault.metadata.aprNet7d) : '--';

  const realizedApy = vault?.metadata?.realizedApy || '--';
  const apyAll = vault?.metadata?.apyNetAll ? formatPercentage(vault.metadata.apyNetAll) : '--';
  const apy30d = vault?.metadata?.apyNet30d ? formatPercentage(vault.metadata.apyNet30d) : '--';
  const apy7d = vault?.metadata?.apyNet7d ? formatPercentage(vault.metadata.apyNet7d) : '--';
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
          {aprAll}
          </div>

          <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
          Net APR
          </div>
        </div>

        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
          {apyAll}
          </div>

          <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
          REALIZED APY
          </div>
        </div>


{/* 
        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
            {realizedApy}
          </div>

          <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
            REALIZED APY
          </div>
        </div> */}

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
