'use client';

import { formatUsd, formatPercentage } from '@/lib/normalize';
import { VaultDTO } from '@/lib/dto';

interface VaultDetailProps {
  vault?: VaultDTO;
}

export default function VaultDetail({ vault }: VaultDetailProps) {
  const vaultName = vault?.name || '--';
  const strategistName = vault?.strategist?.name || vault?.provider;
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
  const provider = vault?.provider || '';

  const getProviderBadge = () => {
    switch (provider) {
      case 'ipor':
        return { text: 'Advanced', bgColor: 'bg-[#C4511F]' };
      case 'lagoon':
        return { text: 'Lagoon', bgColor: 'bg-[#6B73FF]' };
        case 'upshift':
          return { text: 'Upshift', bgColor: 'bg-[#2C2929]' };
      default:
        return { text: '--', bgColor: 'bg-[#2C2929]' };
    }
  };

  const badge = getProviderBadge();

  return (
    <div className='w-full sm:px-[18.76px] sm:py-[21px] py-[14.5px] px-[14.6px] sm:rounded-[21.2px] rounded-[14.6px] bg-[#FFFFFF0F] backdrop-blur-lg space-y-5'>
      <div className='flex bg-[#141414] sm:rounded-[16.11px] rounded-[11.28px] w-full sm:!p-[14.97px] px-2.5 py-4 justify-between items-start'>
        <div>
          <div className='text-white font-modernist sm:text-[40px] text-sm font-normal tracking-[-0.8px] leading-none'>
            {vaultName}
          </div>

          <div className='text-white font-dm-sans sm:text-[12.51px] text-[8.76px] font-light leading-[128%] tracking-[-0.25px] mt-1.5'>
            by <span className='capitalize'>{strategistName}</span>
          </div>
        </div>

        <div
          className={`sm:rounded-[10px] rounded-[7px] text-white font-dm-sans sm:text-[15px] text-[10.78px] font-light leading-none bg-[#2C2929] p-[5.40px]`}
        >
          {badge.text}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-y-20 justify-between md:grid-cols-4'>
        <div className='flex flex-col gap-0.5 justify-center items-center sm:gap-2'>
          <div className='text-white font-modernist text-[30.32px] sm:text-[36px] font-bold leading-[110%] tracking-[-0.866px]'>
            {tvl}
          </div>

          <div className='text-white font-dm-sans text-[8.55px] sm:text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
            TOTAL TVL
          </div>
        </div>

        <div className='flex flex-col gap-0.5 justify-center items-center sm:gap-2'>
          <div className='text-white font-modernist text-[30.32px] sm:text-[36px] font-bold leading-[110%] tracking-[-0.866px]'>
            {aprAll}
          </div>

          <div className='text-white font-dm-sans text-[8.55px] sm:text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
            Net APR
          </div>
        </div>

        <div className='flex flex-col gap-0.5 justify-center items-center sm:gap-2'>
          <div className='text-white font-modernist text-[30.32px] sm:text-[36px] font-bold leading-[110%] tracking-[-0.866px]'>
            {apyAll}
          </div>

          <div className='text-white font-dm-sans text-[8.55px] sm:text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
            REALIZED APY
          </div>
        </div>

        <div className='flex flex-col gap-0.5 justify-center items-center sm:gap-2'>
          <div className='text-[#00F792] font-modernist text-[30.32px] sm:text-[36px] font-bold leading-[110%] tracking-[-0.866px]'>
            {vaultAge}
          </div>

          <div className='text-white font-dm-sans text-[8.55px] sm:text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
            VAULT AGE
          </div>
        </div>
      </div>
    </div>
  );
}
