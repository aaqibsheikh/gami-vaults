'use client';

import { useState } from 'react';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import PerformanceChart from './PerformanceChart';
import { DepositFormVaultDetailProps } from './DepositFormVaultDetail';
import VaultActionTabs from './VaultActionTabs';

interface VaultDetailsSectionsProps {
  vault?: {
    id: string;
    chainId?: number;
    symbol?: string;
    name?: string;
    underlying?: {
      symbol: string;
      address: string;
      decimals: number;
    };
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
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '365d' | 'all'>('all');
  const [selectedMetric, setSelectedMetric] = useState<'apy' | 'tvl' | 'price'>('price');
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  // Fetch historical data
  // Map period to API format: '7d' | '30d' | '365d' | 'all'
  const apiPeriod =
    selectedPeriod === '7d'
      ? '7d'
      : selectedPeriod === '30d'
        ? '30d'
        : selectedPeriod === '365d'
          ? '365d'
          : 'all';
  const { data: historicalData, isLoading: isLoadingHistorical } = useHistoricalData({
    chainId: vault?.chainId || 1,
    vaultId: vault?.id || '',
    period: apiPeriod,
    enabled: !!vault?.id && !!vault?.chainId,
  });

  // Protocol allocation data - this would ideally come from vault strategy data
  const protocols = [
    { name: 'Aave V3', percentage: '45%', color: '#CF7CFF' },
    { name: 'Curve Finance', percentage: '30%', color: '#FF9C46' },
    { name: 'Uniswap V3', percentage: '25%', color: '#469CFF' },
  ];

  // Fee structure from vault data or defaults
  const managementFee = vault?.fees?.mgmtBps
    ? `${(parseFloat(vault.fees.mgmtBps) / 100).toFixed(2)}% annually`
    : '2.0% annually';
  const performanceFee = vault?.fees?.perfBps
    ? `${(parseFloat(vault.fees.perfBps) / 100).toFixed(2)}% on profits`
    : '20% on profits';

  const fees = [
    { label: 'Management Fee', value: managementFee },
    { label: 'Performance Fee', value: performanceFee },
    { label: 'Deposit Fee', value: '0%' },
    { label: 'Withdrawal Fee', value: '0.1%' },
  ];

  const strategyDescription =
    vault?.strategy?.description ||
    vault?.metadata?.description ||
    "This vault employs a delta-neutral strategy across leading DeFi protocols, combining yield farming with automated rebalancing. The strategy focuses on ETH and stablecoin pairs to generate consistent returns while minimizing impermanent loss.\n\nPositions are actively managed by Gami Capital's algorithmic system with daily rebalancing to optimize APY based on market conditions & protocol incentives.";

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
    <div className='md:space-y-[30px] space-y-[22px] w-full'>
      <div className='space-y-4'>
        <div className='text-white font-modernist text-xl font-bold leading-[162%] tracking-[-0.4px]'>
          Strategy Overview
        </div>

        <div className='w-full text-white font-dm-sans md:text-[20px] font-light leading-[128%] tracking-[-0.4px] whitespace-pre-line'>
          {strategyDescription}
        </div>
      </div>

      <div className='md:hidden'>
        <VaultActionTabs vault={vault as DepositFormVaultDetailProps['vault']} />
      </div>

      <div className='md:space-y-5 space-y-2.5 w-full'>
        {/* <div className='flex justify-between items-center'>
          <div className='text-white font-modernist text-xl font-bold leading-[162%] tracking-[-0.4px]'>
            Chart
          </div>

          <div className='flex gap-2 items-center'>
            <div className='relative'>
              <button
                onClick={() => setIsMetricDropdownOpen(!isMetricDropdownOpen)}
                className='flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-colors'
              >
                <span>
                  {selectedMetric === 'apy'
                    ? 'APY'
                    : selectedMetric === 'tvl'
                      ? 'TVL'
                      : 'Price per share'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isMetricDropdownOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>

              {isMetricDropdownOpen && (
                <>
                  <div
                    className='fixed inset-0 z-10'
                    onClick={() => setIsMetricDropdownOpen(false)}
                  />
                  <div className='absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/20 rounded-[10px] shadow-lg z-20 py-1'>
                    <button
                      onClick={() => {
                        setSelectedMetric('price');
                        setIsMetricDropdownOpen(false);
                      }}
                      className='flex justify-between items-center px-4 py-2 w-full text-left text-white transition-colors hover:bg-white/10'
                    >
                      <span>Price per share</span>
                      {selectedMetric === 'price' && (
                        <svg
                          className='w-4 h-4 text-blue-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMetric('tvl');
                        setIsMetricDropdownOpen(false);
                      }}
                      className='flex justify-between items-center px-4 py-2 w-full text-left text-white transition-colors hover:bg-white/10'
                    >
                      <span>TVL</span>
                      {selectedMetric === 'tvl' && (
                        <svg
                          className='w-4 h-4 text-blue-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMetric('apy');
                        setIsMetricDropdownOpen(false);
                      }}
                      className='flex justify-between items-center px-4 py-2 w-full text-left text-white transition-colors hover:bg-white/10'
                    >
                      <span>APY</span>
                      {selectedMetric === 'apy' && (
                        <svg
                          className='w-4 h-4 text-blue-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className='relative'>
              <button
                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                className='flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-colors'
              >
                <span>
                  {selectedPeriod === '7d'
                    ? '1 Week'
                    : selectedPeriod === '30d'
                      ? '1 Month'
                      : selectedPeriod === '365d'
                        ? '1 Year'
                        : 'All'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isPeriodDropdownOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>

              {isPeriodDropdownOpen && (
                <>
                  <div
                    className='fixed inset-0 z-10'
                    onClick={() => setIsPeriodDropdownOpen(false)}
                  />
                  <div className='absolute right-0 mt-2 w-40 bg-[#1a1a1a] border border-white/20 rounded-[10px] shadow-lg z-20 py-1'>
                    <button
                      onClick={() => {
                        setSelectedPeriod('7d');
                        setIsPeriodDropdownOpen(false);
                      }}
                      className='flex justify-between items-center px-4 py-2 w-full text-left text-white transition-colors hover:bg-white/10'
                    >
                      <span>1 Week</span>
                      {selectedPeriod === '7d' && (
                        <svg
                          className='w-4 h-4 text-blue-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPeriod('30d');
                        setIsPeriodDropdownOpen(false);
                      }}
                      className='flex justify-between items-center px-4 py-2 w-full text-left text-white transition-colors hover:bg-white/10'
                    >
                      <span>1 Month</span>
                      {selectedPeriod === '30d' && (
                        <svg
                          className='w-4 h-4 text-blue-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPeriod('365d');
                        setIsPeriodDropdownOpen(false);
                      }}
                      className='flex justify-between items-center px-4 py-2 w-full text-left text-white transition-colors hover:bg-white/10'
                    >
                      <span>1 Year</span>
                      {selectedPeriod === '365d' && (
                        <svg
                          className='w-4 h-4 text-blue-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPeriod('all');
                        setIsPeriodDropdownOpen(false);
                      }}
                      className='flex justify-between items-center px-4 py-2 w-full text-left text-white transition-colors hover:bg-white/10'
                    >
                      <span>All</span>
                      {selectedPeriod === 'all' && (
                        <svg
                          className='w-4 h-4 text-blue-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {historicalData && historicalData.length > 0 && (
          <div className='flex gap-3 items-center px-3 py-2'>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedMetric === 'price'
                  ? 'bg-gradient-to-br from-blue-400 to-cyan-400'
                  : selectedMetric === 'tvl'
                    ? 'bg-gradient-to-br from-orange-400 to-amber-400'
                    : 'bg-gradient-to-br from-green-400 to-emerald-400'
              }`}
            >
              <span className='text-lg font-bold text-white'>
                {selectedMetric === 'price' ? '$' : selectedMetric === 'tvl' ? '$' : '%'}
              </span>
            </div>
            <div>
              <div className='text-sm text-white/70 font-dm-sans'>
                {selectedMetric === 'price'
                  ? `1 ${vault?.symbol || vault?.underlying?.symbol || 'share'}`
                  : selectedMetric === 'tvl'
                    ? 'Total Value Locked'
                    : 'Annual Percentage Yield'}
              </div>

              <div className='text-lg font-medium text-white font-dm-sans'>
                {(() => {
                  const latestData = historicalData[historicalData.length - 1];
                  if (selectedMetric === 'price') {
                    const price = parseFloat(latestData.price);
                    const underlyingSymbol = vault?.underlying?.symbol || 'USDC';
                    return `${price.toFixed(6)} ${underlyingSymbol}`;
                  } else if (selectedMetric === 'tvl') {
                    const tvl = parseFloat(latestData.tvl);
                    return `$${tvl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  } else {
                    const apy = parseFloat(latestData.apy) * 100;
                    return `${apy.toFixed(2)}%`;
                  }
                })()}
              </div>
              {selectedMetric === 'price' && historicalData && historicalData.length > 0 && (
                <div className='text-sm text-white/50 font-dm-sans'>
                  ${parseFloat(historicalData[historicalData.length - 1].price).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )} */}

        <div className='flex min-h-[304px] px-3 py-3 justify-center items-center gap-2 shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] rounded-[30px] flex-col'>
          <div className='w-full bg-[#FFFFFF0F] rounded-[30px] md:py-2.5 py-[5.38px] md:px-3 px-1.5 grid grid-cols-2'>
            <button
              onClick={() => setSelectedMetric('price')}
              className={`text-white font-dm-sans md:text-[14px] text-[13px] font-medium leading-[128%] tracking-[-0.32px] md:h-[36px] h-[26px] md:rounded-[17.4px] rounded-[9.36px] transition-colors ${
                selectedMetric === 'price' ? 'bg-[#0F0F0F]' : 'hover:bg-[#0f0f0f]'
              }`}
            >
              Price per share
            </button>

            <button
              onClick={() => setSelectedMetric('tvl')}
              className={`text-white font-dm-sans md:text-[14px] text-[13px] font-medium leading-[128%] tracking-[-0.32px] md:h-[36px] h-[26px] md:rounded-[17.4px] rounded-[9.36px] transition-colors ${
                selectedMetric === 'tvl' ? 'bg-[#0F0F0F]' : 'hover:bg-[#0f0f0f]'
              }`}
            >
              TVL
            </button>
          </div>

          {isLoadingHistorical ? (
            <div className='flex-1 text-white text-center font-modernist text-[16px] font-normal leading-[162%] tracking-[-0.32px] flex items-center justify-center'>
              Loading historical data...
            </div>
          ) : historicalData && historicalData.length > 0 ? (
            <PerformanceChart
              data={historicalData}
              period={apiPeriod}
              type={selectedMetric}
              className='flex-1 w-full h-full'
            />
          ) : (
            <div className='flex-1 text-white text-center font-modernist text-[16px] font-normal leading-[162%] tracking-[-0.32px] flex items-center justify-center'>
              No historical data available
            </div>
          )}
        </div>
      </div>

      <div className='rounded-[20px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] md:px-3 px-2.5 md:py-[30px] py-4 md:space-y-5 space-y-2.5'>
        <div className='text-white font-modernist md:text-xl font-bold leading-[162%] tracking-[-0.4px] md:px-3 px-2'>
          Protocol Allocation
        </div>

        <div className='md:space-y-[18px] space-y-2.5'>
          {protocols.map((protocol, index) => (
            <div
              key={index}
              className='md:rounded-[16px] rounded-[8.66px] bg-[#141414] flex justify-between items-center md:p-[14.97px] p-2'
            >
              <div className='flex gap-2 items-center'>
                <div
                  className='md:w-[15px] w-2 md:h-[15px] h-2 rounded-full'
                  style={{ backgroundColor: protocol.color }}
                ></div>

                <div className='text-white font-dm-sans md:text-xl text-[13px] font-medium leading-[128%] tracking-[-0.4px]'>
                  {protocol.name}
                </div>
              </div>

              <div className='text-white font-dm-sans md:text-base text-[8.6px] font-medium leading-[128%] tracking-[-0.32px]'>
                {protocol.percentage}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='rounded-[20px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] md:px-3 px-2.5 md:py-[30px] py-4 md:space-y-5 space-y-2.5'>
        <div className='text-white font-modernist md:text-xl font-bold leading-[162%] tracking-[-0.4px] md:px-3 px-2'>
          Fee Structure
        </div>

        <div className='md:space-y-[18px] space-y-2.5'>
          {fees.map((fee, index) => (
            <div
              key={index}
              className='md:rounded-[16px] rounded-[8.66px] bg-[#141414] flex justify-between items-center md:py-[14.97px] py-2 md:px-[13px] px-2'
            >
              <div className='text-white font-dm-sans md:text-[17px] text-[13px] font-medium leading-[128%] tracking-[-0.4px]'>
                {fee.label}
              </div>

              <div className='text-white font-dm-sans md:text-[17px] text-[8.6px] font-medium leading-[128%] tracking-[-0.32px]'>
                {fee.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='rounded-[20.78px] border border-[#FF9C4680] bg-[#FF9C460F] md:py-[30px] md:px-[20px] py-5 px-5 space-y-3.5'>
        <div className='text-white font-dm-sans md:text-[20px] text-[15.91px] font-bold flex items-end gap-1 leading-none'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 64 64'
            role='img'
            aria-labelledby='warnTitle warnDesc'
            className='w-4 h-4 md:w-5 md:h-5'
          >
            <title id='warnTitle'>Warning</title>
            <desc id='warnDesc'>Rounded yellow triangular warning sign with exclamation mark.</desc>

            <path
              d='M32 6
           C33 6 34 6.6 34.5 7.5
           L60 54
           C60.5 55 60 56 59 56
           H5
           C4 56 3.5 55 4 54
           L29.5 7.5
           C30 6.6 31 6 32 6Z'
              fill='#FFCC00'
            />

            <rect x='30' y='18' width='4' height='18' rx='2' ry='2' fill='#000000' />

            <circle cx='32' cy='44.5' r='3.5' fill='#000000' />
          </svg>
          <span>Risk Disclosure</span>
        </div>

        <ul className='md:pl-1.5 pl-3 space-y-0.5 list-disc list-inside'>
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

      <div className='space-y-1 md:space-y-5'>
        <div className='text-white font-modernist md:text-xl font-bold leading-[162%] tracking-[-0.4px] md:px-3'>
          Contract Information
        </div>

        <div className='rounded-[21px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] md:px-[9.5px] px-[14px] py-5 flex justify-between items-center gap-3'>
          <div className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px] break-all  '>
            {contractAddress}
          </div>

          <button
            onClick={handleCopyAddress}
            className='rounded-[10px] border border-white/40 hover:bg-white/10 transition-colors h-[30px] px-2.5 flex-shrink-0'
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
