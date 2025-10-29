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
    <div className="flex items-start gap-16 w-full">
      <div className="flex w-[651px] flex-col items-start gap-12">
        <div className="flex w-full flex-col items-start gap-5">
          <div className="text-white font-modernist text-[20px] font-bold leading-[162%] tracking-[-0.4px]">
            Strategy Overview
          </div>
          <div className="w-full text-white font-dm-sans text-[20px] font-light leading-[128%] tracking-[-0.4px] whitespace-pre-line">
            {strategyDescription}
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 self-stretch">
          <div className="flex justify-between items-center w-full">
            <div className="text-white font-modernist text-[20px] font-bold leading-[162%] tracking-[-0.4px]">
              Historical Performance
            </div>
            <div className="flex gap-2">
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
          <div className="flex h-[237px] px-3 py-3 justify-center items-center gap-2 self-stretch rounded-[30px] glass-border bg-white/6">
            {isLoadingHistorical ? (
              <div className="flex-1 text-white text-center font-modernist text-[16px] font-normal leading-[162%] tracking-[-0.32px]">
                Loading historical data...
              </div>
            ) : historicalData && historicalData.length > 0 ? (
              <PerformanceChart
                data={historicalData}
                period={selectedPeriod}
                type="apy"
                className="w-full h-full"
              />
            ) : (
              <div className="flex-1 text-white text-center font-modernist text-[16px] font-normal leading-[162%] tracking-[-0.32px]">
                No historical data available
              </div>
            )}
          </div>
        </div>

        <div className="flex px-4 py-4 flex-col justify-center items-center gap-5 self-stretch rounded-[20px] glass-border bg-white/6">
          <div className="flex w-full px-[10px] flex-col items-start gap-6">
            <div className="text-white font-modernist text-[20px] font-bold leading-[162%] tracking-[-0.4px]">
              Protocol Allocation
            </div>
          </div>
          <div className="flex flex-col items-start gap-[18px] self-stretch">
            {protocols.map((protocol, index) => (
              <div
                key={index}
                className="flex px-4 py-4 flex-col justify-center items-center gap-4 self-stretch rounded-[16px] bg-gradient-to-b from-[#141414] to-[#141414]"
              >
                <div className="flex justify-between items-center self-stretch">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="flex w-[15px] flex-col items-start gap-4">
                      <div
                        className="w-[15px] h-[15px] rounded-full"
                        style={{ backgroundColor: protocol.color }}
                      ></div>
                    </div>
                    <div className="w-[537px] text-white font-dm-sans text-[20px] font-medium leading-[128%] tracking-[-0.4px]">
                      {protocol.name}
                    </div>
                    <div className="text-white font-dm-sans text-[16px] font-medium leading-[128%] tracking-[-0.32px]">
                      {protocol.percentage}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex px-4 py-4 flex-col justify-center items-center gap-5 self-stretch rounded-[20px] glass-border bg-white/6">
          <div className="flex w-full px-[10px] flex-col items-start gap-6">
            <div className="text-white font-dm-sans text-[20px] font-bold leading-[162%] tracking-[-0.4px]">
              Fee Structure
            </div>
          </div>
          <div className="flex flex-col items-start gap-[18px] self-stretch">
            {fees.map((fee, index) => (
              <div
                key={index}
                className="flex px-4 py-4 flex-col justify-center items-center gap-4 self-stretch rounded-[16px] bg-gradient-to-b from-[#141414] to-[#141414]"
              >
                <div className="flex justify-between items-center self-stretch">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="text-white font-dm-sans text-[17px] font-normal leading-[128%] tracking-[-0.34px]">
                      {fee.label}
                    </div>
                    <div className="text-white font-dm-sans text-[17px] font-bold leading-[128%] tracking-[-0.34px] ml-auto">
                      {fee.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex px-5 py-5 flex-col justify-center items-center gap-5 self-stretch rounded-[21px] border border-[#FF9C46]/50 bg-[#FF9C46]/6">
          <div className="text-white font-dm-sans text-[20px] font-bold leading-[162%] tracking-[-0.4px] self-stretch">
            ⚠ Risk Disclosure
          </div>
          <div className="w-full text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]">
            Smart contract risk across multiple DeFi protocols<br />
            Liquidation risk in leveraged positions<br />
            Impermanent loss in liquidity provision strategies<br />
            Oracle manipulation and price feed vulnerabilities<br />
            Regulatory uncertainty in DeFi markets
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 self-stretch">
          <div className="text-white font-dm-sans text-[20px] font-bold leading-[162%] tracking-[-0.4px]">
            Contract Information
          </div>
          <div className="flex px-5 py-5 justify-center items-center gap-5 self-stretch rounded-[21px] glass-border bg-white/6">
            <div className="w-[558px] text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]">
              {contractAddress}
            </div>
            <button 
              onClick={handleCopyAddress}
              className="flex px-[10px] py-[10px] justify-center items-center gap-[10px] rounded-[10px] border border-white/40 hover:bg-white/10 transition-colors"
            >
              <div className="text-white/50 font-dm-sans text-[14px] font-light leading-[128%] tracking-[-0.28px]">
                {copied ? 'Copied!' : 'Copy'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
