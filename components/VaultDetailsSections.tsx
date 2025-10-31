'use client';

import { useState } from 'react';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import PerformanceChart from './PerformanceChart';

interface VaultDetailsSectionsProps {
  vault?: {
    id: string;
    chainId?: number;
    strategy?: {
      name: string;
      description: string;
    };
    metadata?: {
      description?: string;
      website?: string;
      logo?: string;
      vaultAge?: string;
      realizedApy?: string;
    };
    fees?: {
      mgmtBps: string;
      perfBps: string;
    };
  };
}

export default function VaultDetailsSections({ vault }: VaultDetailsSectionsProps) {
  const [copied, setCopied] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d'>('30d');

  // Fetch historical data
  const { data: historicalData, isLoading: isLoadingHistorical } = useHistoricalData({
    chainId: vault?.chainId || 1,
    vaultId: vault?.id || '',
    period: selectedPeriod,
    enabled: !!vault?.id && !!vault?.chainId
  });

  // Protocol allocation data - this would ideally come from vault strategy data
  const protocols = [
    { name: 'Aave V3', percentage: '45%', color: '#CF7CFF' },
    { name: 'Curve Finance', percentage: '30%', color: '#FF9C46' },
    { name: 'Uniswap V3', percentage: '25%', color: '#469CFF' },
  ];

  // Fee structure from vault data or defaults
  const managementFee = vault?.fees?.mgmtBps ? `${(parseFloat(vault.fees.mgmtBps) / 100).toFixed(2)}% annually` : '2.0% annually';
  const performanceFee = vault?.fees?.perfBps ? `${(parseFloat(vault.fees.perfBps) / 100).toFixed(2)}% on profits` : '20% on profits';
  
  const fees = [
    { label: 'Management Fee', value: managementFee },
    { label: 'Performance Fee', value: performanceFee },
    { label: 'Deposit Fee', value: '0%' },
    { label: 'Withdrawal Fee', value: '0.1%' },
  ];

  // Strategy description from vault data or default
  const strategyDescription = vault?.strategy?.description || vault?.metadata?.description || 
    'This vault employs a delta-neutral strategy across leading DeFi protocols, combining yield farming with automated rebalancing. The strategy focuses on ETH and stablecoin pairs to generate consistent returns while minimizing impermanent loss.\n\nPositions are actively managed by Gami Capital\'s algorithmic system with daily rebalancing to optimize APY based on market conditions & protocol incentives.';

  // Contract address from vault data or default
  const contractAddress = vault?.id || '0xb742435C6634005329254308448b9759135af1';

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className='space-y-[30px] w-[58.89%]'>
      <div className='space-y-4'>
        <div className='text-white font-modernist text-xl font-bold leading-[162%] tracking-[-0.4px]'>
          Strategy Overview
        </div>

        <div className='w-full text-white font-dm-sans text-[20px] font-light leading-[128%] tracking-[-0.4px] whitespace-pre-line'>
          {strategyDescription}
        </div>
      </div>

      <div className='space-y-5 w-full'>
        <div className='flex justify-between items-center'>
          <div className='text-white font-modernist text-xl font-bold leading-[162%] tracking-[-0.4px]'>
            Historical Performance
          </div>

          <div className='flex gap-2'>
            <button
              onClick={() => setSelectedPeriod('7d')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === '7d'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              7D
            </button>

            <button
              onClick={() => setSelectedPeriod('30d')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === '30d'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              30D
            </button>
          </div>
        </div>

        <div className='flex h-[237px] px-3 py-3 justify-center items-center gap-2 shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] rounded-[30px]'>
          {isLoadingHistorical ? (
            <div className='flex-1 text-white text-center font-modernist text-[16px] font-normal leading-[162%] tracking-[-0.32px]'>
              Loading historical data...
            </div>
          ) : historicalData && historicalData.length > 0 ? (
            <PerformanceChart
              data={historicalData}
              period={selectedPeriod}
              type='apy'
              className='w-full h-full'
            />
          ) : (
            <div className='flex-1 text-white text-center font-modernist text-[16px] font-normal leading-[162%] tracking-[-0.32px]'>
              No historical data available
            </div>
          )}
        </div>
      </div>

      <div className='rounded-[20px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] px-3 py-[30px] space-y-5'>
        <div className='text-white font-modernist text-xl font-bold leading-[162%] tracking-[-0.4px] px-3'>
          Protocol Allocation
        </div>

        <div className='space-y-[18px]'>
          {protocols.map((protocol, index) => (
            <div
              key={index}
              className='rounded-[16px] bg-[#141414] flex justify-between items-center p-[14.97px]'
            >
              <div className='flex gap-2 items-center'>
                <div
                  className='w-[15px] h-[15px] rounded-full'
                  style={{ backgroundColor: protocol.color }}
                ></div>

                <div className='text-white font-dm-sans text-xl font-medium leading-[128%] tracking-[-0.4px]'>
                  {protocol.name}
                </div>
              </div>

              <div className='text-white font-dm-sans text-base font-medium leading-[128%] tracking-[-0.32px]'>
                {protocol.percentage}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='rounded-[20px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] px-3 py-[30px] space-y-5'>
        <div className='text-white font-modernist text-xl font-bold leading-[162%] tracking-[-0.4px] px-3'>
          Fee Structure
        </div>

        <div className='space-y-[18px]'>
          {fees.map((fee, index) => (
            <div
              key={index}
              className='rounded-[16px] bg-[#141414] flex justify-between items-center py-[14.97px] px-[13px]'
            >
              <div className='text-white font-dm-sans text-[17px] font-medium leading-[128%] tracking-[-0.4px]'>
                {fee.label}
              </div>

              <div className='text-white font-dm-sans text-[17px] font-medium leading-[128%] tracking-[-0.32px]'>
                {fee.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='rounded-[20.78px] border border-[#FF9C4680] bg-[#FF9C460F] py-[30px] px-[20px] space-y-3.5'>
        <div className='text-white font-dm-sans text-[20px] font-bold flex items-center gap-0.5'>
          <span className='-mt-1.5'>⚠️</span>
          <span>Risk Disclosure</span>
        </div>

        <ul className='pl-1.5 space-y-0.5 list-disc list-inside'>
          <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
            Smart contract risk across multiple DeFi protocols
          </li>

          <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
            Liquidation risk in leveraged positions
          </li>

          <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
            Impermanent loss in liquidity provision strategies
          </li>

          <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
            Oracle manipulation and price feed vulnerabilities
          </li>

          <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
            Regulatory uncertainty in DeFi markets
          </li>
        </ul>
      </div>

      <div className='space-y-5'>
        <div className='text-white font-modernist text-xl font-bold leading-[162%] tracking-[-0.4px] px-3'>
          Contract Information
        </div>

        <div className='rounded-[21px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] px-[9.5px] py-5 flex justify-between items-center'>
          <div className='w-[558px] text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
            {contractAddress}
          </div>

          <button
            onClick={handleCopyAddress}
            className='rounded-[10px] border border-white/40 hover:bg-white/10 transition-colors h-[30px] px-2.5'
          >
            <div className='text-[#FFFFFF80] font-dm-sans text-sm font-light leading-[128%] tracking-[-0.28px]'>
              {copied ? 'Copied!' : 'Copy'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
