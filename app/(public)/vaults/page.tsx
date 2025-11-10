'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useVaults } from '@/hooks/useVaults';
import { getSupportedNetworks, getNetworkConfig } from '@/lib/sdk';
import { formatUsd, formatPercentage } from '@/lib/normalize';
import VaultCard from './components/VaultCard';
import { VaultDTO } from '@/lib/dto';

export default function ExploreVaults() {
  const tabs = ['Assets', 'USD', 'BTC', 'ETH', 'AVAX', 'Partner'];
  const [activeViewType, setActiveViewType] = useState<'grid' | 'list'>('list');
  const viewTypes: { icon: string; value: 'grid' | 'list' }[] = [
    {
      icon: '/assets/svgs/grid-icon.svg',
      value: 'grid',
    },
    {
      icon: '/assets/svgs/list-icon.svg',
      value: 'list',
    },
  ];

  const supportedNetworks = getSupportedNetworks();
  const {
    data: vaults,
    isLoading,
    error,
  } = useVaults({
    chainIds: supportedNetworks,
  });

  // Transform vaults for display and compute featured (Upshift top 3)
  const { featuredVaults, otherVaults } = useMemo(() => {
    if (!vaults) return { transformedVaults: [], featuredVaults: [], otherVaults: [] };

    const toDisplay = (v: VaultDTO) => ({
      name: v.name,
      apy: v.apyNet ? formatPercentage(v.apyNet) : 'N/A',
      tvl: formatUsd(v.tvlUsd),
      assets: [v.underlying.symbol],
      chainId: v.chainId,
      vaultId: v.id,
      provider: v.provider,
      chainName: getNetworkConfig(v.chainId)?.name || 'Unknown',
    });

    const all = vaults.map(toDisplay);
    const featuredRaw = vaults.filter((v: VaultDTO) => v.provider === 'upshift').slice(0, 3);
    const featuredIds = new Set(featuredRaw.map((v: VaultDTO) => v.id));
    const featured = featuredRaw.map(toDisplay);
    const others = all.filter(v => !featuredIds.has(v.vaultId));

    return { transformedVaults: all, featuredVaults: featured, otherVaults: others };
  }, [vaults]);

  return (
    <>
      <Image
        src='/assets/images/vault-detail-glass.svg'
        alt='Vault detail glass'
        width={459}
        height={362}
        className='absolute top-0 right-0 pointer-events-none'
      />

      <section id='vaults' className='pt-40 pb-14 w-full'>
        <div className='space-y-1.5'>
          <h1 className='font-modernist text-[57px] font-normal'>
            Explore <span className='font-bold'>Vaults</span>
          </h1>

          <p className='font-dm-sans text-xl font-light leading-[128%] tracking-[-0.4px] text-white'>
            Discover and deposit into professionally managed DeFi Vaults
          </p>
        </div>

        <div className='bg-[#141414] rounded-[21.93px] p-[20.37px] mt-10'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-[14.32px]'>
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`flex h-10 px-2.5 justify-center items-center rounded-[20.78px] backdrop-blur-lg ${
                    index === 0
                      ? 'shadow-[0_0_0_1px_#A100FF] bg-[#A100FF2E]'
                      : 'shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] hover:bg-white/10'
                  } transition-colors`}
                >
                  <div className='text-white font-dm-sans text-[13.58px] font-light leading-none'>
                    {tab}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className='mt-5'>
            {isLoading ? (
              <div className='flex w-full flex-col items-center gap-[15px] py-8'>
                <div className='text-white/50 font-dm-sans text-[14px]'>Loading vaults...</div>
              </div>
            ) : error ? (
              <div className='flex w-full flex-col items-center gap-[15px] py-8'>
                <div className='text-red-400 font-dm-sans text-[14px]'>
                  Error loading vaults: {error.message}
                </div>
              </div>
            ) : featuredVaults.length === 0 ? (
              <div className='flex w-full flex-col items-center gap-[15px] py-8'>
                <div className='text-white/50 font-dm-sans text-[14px]'>No featured vaults</div>
              </div>
            ) : (
              <div className='grid grid-cols-3 gap-5'>
                {featuredVaults.map((vault, index) => (
                  <VaultCard
                    key={`${vault.chainId}-${vault.vaultId}-featured-${index}`}
                    name={vault.name}
                    apy={vault.apy}
                    tvl={vault.tvl}
                    assets={vault.assets}
                    chainId={vault.chainId}
                    vaultId={vault.vaultId}
                    chainName={vault.chainName}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='bg-[#141414] rounded-[21.93px] p-[20.37px] mt-10'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-[14.32px]'>
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`flex h-10 px-2.5 justify-center items-center rounded-[20.78px] backdrop-blur-lg ${
                    index === 0
                      ? 'shadow-[0_0_0_1px_#A100FF] bg-[#A100FF2E]'
                      : 'shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] hover:bg-white/10'
                  } transition-colors`}
                >
                  <div className='text-white font-dm-sans text-[13.58px] font-light leading-none'>
                    {tab}
                  </div>
                </button>
              ))}
            </div>

            <div className='flex items-center gap-[5px]'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search by chain...'
                  className='bg-[#FFFFFF0F] text-white placeholder:text-white text-[14px] font-light font-dm-sans outline-none h-[40px] w-[268px] rounded-[19.09px] pr-2 pl-[32.21px] shadow-[0_0_0_0.4px_#ffffff47] backdrop-blur-lg'
                />

                <svg
                  width='13'
                  height='15'
                  viewBox='0 0 13 15'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className='absolute top-1/2 left-[14.55px] -translate-y-1/2 pointer-events-none'
                >
                  <circle
                    cx='7.95438'
                    cy='4.71219'
                    r='4.10417'
                    stroke='white'
                    strokeWidth='1.21605'
                  />
                  <rect
                    x='4.91602'
                    y='7.60031'
                    width='1.41547'
                    height='7.82305'
                    rx='0.608025'
                    transform='rotate(38.9421 4.91602 7.60031)'
                    fill='white'
                  />
                </svg>
              </div>

              {viewTypes.map(viewType => (
                <button
                  key={viewType.value}
                  className={`flex w-[50px] h-10 justify-center items-center rounded-[19.09px] backdrop-blur-lg ${
                    viewType.value === activeViewType
                      ? 'shadow-[0_0_0_0.4px_#A100FF] bg-[#A100FF2E]'
                      : 'shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] hover:bg-white/10'
                  } transition-all`}
                  onClick={() => setActiveViewType(viewType.value)}
                >
                  <div className='text-white font-dm-sans text-[13.58px] font-light leading-none'>
                    <Image src={viewType.icon} alt={viewType.value} width={15} height={8.79} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className='mt-5'>
            {isLoading ? (
              <div className='flex w-full flex-col items-center gap-[15px] py-8'>
                <div className='text-white/50 font-dm-sans text-[14px]'>Loading vaults...</div>
              </div>
            ) : error ? (
              <div className='flex w-full flex-col items-center gap-[15px] py-8'>
                <div className='text-red-400 font-dm-sans text-[14px]'>
                  Error loading vaults: {error.message}
                </div>
              </div>
            ) : otherVaults.length === 0 ? (
              <div className='flex w-full flex-col items-center gap-[15px] py-8'>
                <div className='text-white/50 font-dm-sans text-[14px]'>No vaults available</div>
              </div>
            ) : activeViewType === 'list' ? (
              <>
                <div className='grid grid-cols-[2fr_1fr_1fr_2fr_1.5fr] gap-4 text-[#FFFFFF80] text-[13.24px] pb-5 pl-1 font-dm-sans font-light shadow-[0_0.4px_0_0_#ffffff47]'>
                  <div>VAULT</div>
                  <div>APY</div>
                  <div>TVL</div>
                  <div>ASSETS EXPOSITION</div>
                  <div>ACTIONS</div>
                </div>

                {otherVaults.map((vault, index) => (
                  <div
                    key={`${vault.chainId}-${vault.vaultId}-${index}`}
                    className='grid grid-cols-[2fr_1fr_1fr_2fr_1.5fr] gap-4 items-center shadow-[0_0.5px_0_0_#ffffff47] transition-colors py-[26px]'
                  >
                    <div className='font-dm-sans text-white text-[13.24px] font-bold flex items-center gap-2'>
                      <span>{vault.name}</span>
                      <span className='bg-[#2C2929] rounded-[5px] h-[21px] px-[8px] text-[12px] text-white flex items-center justify-center font-dm-sans'>
                        {vault.chainName}
                      </span>
                    </div>

                    <div className='font-dm-sans text-white text-[13.24px]'>{vault.apy}</div>

                    <div className='font-dm-sans text-white text-[13.24px]'>{vault.tvl}</div>

                    <div className='flex gap-2 items-center'>
                      {vault.assets.map((asset, assetIndex) => (
                        <div
                          key={assetIndex}
                          className='bg-[#2C2929] rounded-[5px] h-[21px] px-[8px] text-[13.41px] text-white flex items-center justify-center font-dm-sans'
                        >
                          {asset}
                        </div>
                      ))}
                    </div>

                    <div className='flex gap-3.5 justify-start items-center'>
                      <Link
                        href={`/vaults/${vault.chainId}/${vault.vaultId}?tab=deposit`}
                        className='px-6 h-[33px] rounded-[10px] bg-gradient-purple text-white text-[13px] font-medium font-dm-sans hover:opacity-90 transition-opacity flex items-center justify-center'
                      >
                        Deposit
                      </Link>

                      <Link
                        href={`/vaults/${vault.chainId}/${vault.vaultId}`}
                        className='px-6 h-[33px] rounded-[10px] shadow-[0_0_0_1px_#ffffff47] bg-[#FFFFFF0F] text-white text-[13px] font-medium font-dm-sans hover:bg-white/10 transition-colors flex items-center justify-center'
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className='grid grid-cols-3 gap-5'>
                {otherVaults.map((vault, index) => (
                  <VaultCard
                    key={`${vault.chainId}-${vault.vaultId}-${index}`}
                    name={vault.name}
                    apy={vault.apy}
                    tvl={vault.tvl}
                    assets={vault.assets}
                    chainId={vault.chainId}
                    vaultId={vault.vaultId}
                    chainName={vault.chainName}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
