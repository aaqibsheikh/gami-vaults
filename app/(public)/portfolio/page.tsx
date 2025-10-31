'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useVaults } from '@/hooks/useVaults';
import { getNetworkConfig } from '@/lib/sdk';
import { formatUsd } from '@/lib/normalize';
import { PositionDTO } from '@/lib/dto';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';

type FilterTab = 'All Chains' | 'Token';
type SortOption = 'Position Size' | 'P&L' | 'Value';

interface PositionWithMetadata extends PositionDTO {
  vaultName?: string;
  vaultProvider?: string;
  underlyingSymbol?: string;
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All Chains');
  const [sortBy, setSortBy] = useState<SortOption>('Position Size');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Fix hydration mismatch - only check connection state after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch portfolio for Ethereum mainnet only
  const {
    data: portfolio,
    isLoading,
    error,
    refetch,
  } = usePortfolio({
    chainId: 1, // Ethereum mainnet
    address: address || undefined,
    enabled: isConnected && !!address,
  });

  // Fetch vaults from Ethereum mainnet to get metadata (names, providers)
  const { data: allVaults } = useVaults({
    chainIds: [1], // Ethereum mainnet only
  });


  // Create a map of vault address -> vault metadata
  const vaultMetadataMap = useMemo(() => {
    const map = new Map<string, { name: string; provider?: string; underlyingSymbol?: string }>();
    if (allVaults) {
      allVaults.forEach((vault) => {
        map.set(vault.id.toLowerCase(), {
          name: vault.name,
          provider: vault.provider,
          underlyingSymbol: vault.underlying.symbol,
        });
      });
      console.log('\n🗺️  Vault Metadata Map Created:');
      console.log('  • Total Vaults Mapped:', map.size);
      map.forEach((meta, address) => {
        console.log(`    • ${address.slice(0, 10)}... → ${meta.name} (${meta.provider || 'N/A'})`);
      });
    }
    return map;
  }, [allVaults]);

  // Enrich positions with vault metadata
  const enrichedPositions: PositionWithMetadata[] = useMemo(() => {
    if (!portfolio) return [];

    const enriched = portfolio.positions.map((position) => {
      const metadata = vaultMetadataMap.get(position.vault.toLowerCase());
      const enrichedPos = {
        ...position,
        vaultName: metadata?.name || `${position.vault.slice(0, 6)}...${position.vault.slice(-4)}`,
        vaultProvider: metadata?.provider || 'flagship',
        underlyingSymbol: metadata?.underlyingSymbol || 'Unknown',
      };
      return enrichedPos;
    });

    console.log('\n✨ Enriched Positions:');
    console.log('  • Total Enriched:', enriched.length);
    enriched.forEach((pos, idx) => {
      console.log(`\n    ${idx + 1}. ${pos.vaultName}`);
      console.log(`       📍 Vault Address: ${pos.vault}`);
      console.log(`       💼 Provider: ${pos.vaultProvider}`);
      console.log(`       🪙 Underlying: ${pos.underlyingSymbol}`);
      console.log(`       📊 Shares: ${pos.shares}`);
      console.log(`       💵 Current Value USD: ${pos.valueUsd}`);
      console.log(`       📈 Entry Value USD: ${pos.entryUsd}`);
      console.log(`       📉 P&L USD: ${pos.pnlUsd}`);
      
      // Calculate P&L percentage
      const entryNum = parseFloat(pos.entryUsd);
      const pnlNum = parseFloat(pos.pnlUsd);
      const pnlPercent = entryNum !== 0 ? ((pnlNum / entryNum) * 100).toFixed(2) : '0.00';
      console.log(`       📊 P&L %: ${pnlNum >= 0 ? '+' : ''}${pnlPercent}%`);
    });

    return enriched;
  }, [portfolio, vaultMetadataMap]);

  // Apply filters and sorting
  const filteredPositions = useMemo(() => {
    let filtered = [...enrichedPositions];

    console.log('\n🔍 Filtering & Sorting:');
    console.log(`  • Active Filter: "${activeFilter}"`);
    console.log(`  • Sort By: "${sortBy}"`);
    console.log(`  • Positions Before Filter: ${filtered.length}`);

    // Filter by token type if needed
    if (activeFilter === 'Token') {
      // Could filter by underlying token type here if needed
      // For now, showing all since we only have Ethereum
      filtered = filtered;
    }

    console.log(`  • Positions After Filter: ${filtered.length}`);

    // Apply sorting
    const originalOrder = filtered.map(p => `${p.vaultName} (${p.valueUsd})`);
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Position Size':
          return parseFloat(b.valueUsd) - parseFloat(a.valueUsd);
        case 'P&L':
          return parseFloat(b.pnlUsd) - parseFloat(a.pnlUsd);
        case 'Value':
          return parseFloat(b.valueUsd) - parseFloat(a.valueUsd);
        default:
          return 0;
      }
    });

    console.log(`  • Positions After Sort: ${filtered.length}`);
    console.log('\n  📋 Sorted Order:');
    filtered.forEach((pos, idx) => {
      const sortValue = sortBy === 'P&L' ? pos.pnlUsd : pos.valueUsd;
      console.log(`    ${idx + 1}. ${pos.vaultName} (${sortBy}: ${sortValue})`);
    });

    return filtered;
  }, [enrichedPositions, activeFilter, sortBy]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    console.log('\n📊 Calculating Summary Statistics:');
    
    const activeVaults = filteredPositions.length;
    console.log(`  • Active Vaults: ${activeVaults}`);
    
    console.log('\n  💰 Calculating Total Assets:');
    const totalAssets = filteredPositions.reduce(
      (sum, p) => {
        const value = parseFloat(p.valueUsd);
        console.log(`    • ${p.vaultName}: ${p.valueUsd} → Running Total: ${sum + value}`);
        return sum + value;
      },
      0
    );
    console.log(`    ✅ Final Total Assets: ${totalAssets}`);
    
    console.log('\n  📈 Calculating Total P&L:');
    const totalPnl = filteredPositions.reduce(
      (sum, p) => {
        const pnl = parseFloat(p.pnlUsd);
        console.log(`    • ${p.vaultName}: ${p.pnlUsd} → Running Total: ${sum + pnl}`);
        return sum + pnl;
      },
      0
    );
    console.log(`    ✅ Final Total P&L: ${totalPnl}`);

    const stats = {
      activeVaults,
      totalAssets,
      totalPnl,
    };

    console.log('\n📈 Final Summary Statistics:');
    console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  • Active Vaults: ${stats.activeVaults}`);
    console.log(`  • Total Assets: $${stats.totalAssets.toFixed(2)}`);
    console.log(`  • Total P&L: ${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(2)}`);
    console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return stats;
  }, [filteredPositions]);

  // Console logs for portfolio data - after all calculations
  useEffect(() => {
    if (!mounted) return;
    
    console.group('📊 Portfolio Data Flow');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🔗 Connection State:');
    console.log('  • Wallet Address:', address || 'Not connected');
    console.log('  • Is Connected:', isConnected);
    console.log('  • Component Mounted:', mounted);
    console.log('  • Is Loading:', isLoading);
    if (error) {
      console.log('  • Error:', error.message);
    }
    
    console.log('\n📥 Raw Portfolio Data from API:');
    if (portfolio) {
      console.log('  • Total Positions:', portfolio.positions.length);
      console.log('  • Total Value USD:', portfolio.totalValueUsd);
      console.log('  • Total P&L USD:', portfolio.totalPnlUsd);
      console.log('  • Last Updated:', portfolio.lastUpdated);
      console.log('\n  📋 Positions Breakdown:');
      portfolio.positions.forEach((pos, idx) => {
        console.log(`    ${idx + 1}. Vault: ${pos.vault}`);
        console.log(`       • Shares: ${pos.shares}`);
        console.log(`       • Value USD: ${pos.valueUsd}`);
        console.log(`       • Entry USD: ${pos.entryUsd}`);
        console.log(`       • P&L USD: ${pos.pnlUsd}`);
        console.log(`       • Chain ID: ${pos.chainId}`);
      });
    } else {
      console.log('  • No portfolio data yet');
    }
    
    console.log('\n📚 Vault Metadata:');
    if (allVaults) {
      console.log('  • Total Vaults Fetched:', allVaults.length);
      console.log('\n  🔍 Vault Details:');
      allVaults.forEach((vault, idx) => {
        console.log(`    ${idx + 1}. ${vault.name} (${vault.id})`);
        console.log(`       • Provider: ${vault.provider || 'N/A'}`);
        console.log(`       • Underlying: ${vault.underlying.symbol}`);
        console.log(`       • TVL: ${vault.tvlUsd}`);
      });
    } else {
      console.log('  • No vault metadata yet');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.groupEnd();
  }, [mounted, portfolio, allVaults, enrichedPositions, filteredPositions, summaryStats, address, isConnected, isLoading, error]);

  // Get provider badge
  const getProviderBadge = (provider?: string) => {
    switch (provider) {
      case 'ipor':
        return 'Advanced';
      case 'lagoon':
        return 'Lagoon';
      case 'upshift':
        return 'Flagship';
      default:
        return 'Flagship';
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Vault', 'Action', 'Amount', 'Status'].join(','),
      // Note: Transaction history would need to be fetched from on-chain events
      // For now, we'll export position data
      ...filteredPositions.map((pos) => [
        new Date().toLocaleDateString(),
        pos.vaultName || pos.vault,
        'Position',
        formatUsd(pos.valueUsd),
        'Active'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    if (typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className='min-h-screen bg-black'>
      {/* <div className='absolute inset-0 -bottom-[80px]'>
        <div className='h-full max-w-[1280px] mx-auto px-[84px] relative'>
          <div className='absolute left-[84px] top-0 bottom-0 w-px bg-[#242424]' />

          <div className='absolute left-1/2 top-0 bottom-[52px] w-px bg-[#242424] -translate-x-1/2' />

          <div className='absolute right-[84px] top-0 bottom-0 w-px bg-[#242424]' />
        </div>
      </div> */}

      {/* <div className='absolute left-0 right-0 h-px bg-[#242424] bottom-0' /> */}

      <Header />

      <Image
        src='/assets/images/vault-detail-glass.svg'
        alt='Vault detail glass'
        width={459}
        height={362}
        className='absolute top-0 right-0 pointer-events-none'
      />

      <section className='max-w-[1280px] mx-auto px-[84px] pt-[156.33px] pb-10 relative z-10'>
        <div className='relative z-10 px-5'>
          <div className='space-y-1.5 font-bold'>
            <h1 className='font-modernist text-[57px] font-bold'>Portfolio</h1>

            <p className='font-dm-sans text-xl font-[200] leading-[128%] tracking-[-0.4px] text-white'>
              Track your positions and performance across all vaults
            </p>
          </div>

          {!mounted || !isConnected ? (
            <div className='flex flex-col items-center justify-center w-full bg-[#FFFFFF0F] py-[60px] shadow-[0_0_0_0.4px_#ffffff47] rounded-[33.43px] px-[70px] mt-10 backdrop-blur-lg'>
              <div className='mb-6 text-gray-400'>
                <svg className='mx-auto w-16 h-16' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
              </div>
              <h2 className='mb-4 text-2xl font-bold text-white'>Connect Your Wallet</h2>
              <p className='mx-auto mb-0 max-w-md text-center text-gray-300'>
                Please connect your wallet using the button in the header to view your portfolio.
              </p>
            </div>
          ) : (
            <>
              <div className='flex justify-between items-center w-full bg-[#FFFFFF0F] py-[31px] shadow-[0_0_0_0.4px_#ffffff47] rounded-[33.43px] px-[70px] mt-10 backdrop-blur-lg'>
                <div className='flex flex-col gap-1.5 justify-center items-center'>
                  <div className='text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
                    {isLoading ? '--' : summaryStats.activeVaults}
                  </div>

                  <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
                    ACTIVE VAULTS
                  </div>
                </div>

                <div className='flex flex-col gap-1.5 justify-center items-center'>
                  <div className='text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
                    {isLoading ? '--' : formatUsd(summaryStats.totalAssets.toString())}
                  </div>

                  <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
                    TOTAL ASSETS
                  </div>
                </div>

                <div className='flex flex-col gap-1.5 justify-center items-center'>
                  <div className={`font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px] ${
                    summaryStats.totalPnl >= 0 ? 'text-[#00F792]' : 'text-red-400'
                  }`}>
                    {isLoading ? '--' : `${summaryStats.totalPnl >= 0 ? '+' : ''}${formatUsd(summaryStats.totalPnl.toString())}`}
                  </div>

                  <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
                    TOTAL PNL
                  </div>
                </div>
              </div>

              {error && (
                <div className='p-4 mt-4 text-center bg-red-500/10 border border-red-500/50 rounded-[33.43px]'>
                  <p className='text-red-400 font-dm-sans text-sm'>{error.message}</p>
                </div>
              )}
            </>
          )}

          <div className='mt-10'>
            <h2 className='font-modernist text-[30px] leading-[100%] tracking-[-0.64px] text-white mb-6'>
              Active Positions
            </h2>

            {mounted && isConnected && (
              <>
                <div className='flex justify-between items-center mb-8'>
                  <div className='flex gap-3 items-center'>
                    {(['All Chains', 'Token'] as FilterTab[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`flex h-10 px-2.5 justify-center items-center rounded-[20.78px] backdrop-blur-lg ${
                          activeFilter === tab
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

                  <div className='relative'>
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className='flex items-center gap-2 px-3 py-2 rounded-[32px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] backdrop-blur-lg hover:bg-white/10 transition-colors'
                    >
                      <span className='text-white text-[13.58px] font-light'>Sort by: {sortBy}</span>

                      <svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
                        <path
                          d='M3 4.5L6 7.5L9 4.5'
                          stroke='white'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </button>

                    {showSortDropdown && (
                      <div className='absolute right-0 mt-2 rounded-[16px] bg-[#141414] border border-white/20 shadow-lg z-10 min-w-[180px]'>
                        {(['Position Size', 'P&L', 'Value'] as SortOption[]).map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-white font-dm-sans text-[13.58px] font-light hover:bg-white/10 transition-colors first:rounded-t-[16px] last:rounded-b-[16px] ${
                              sortBy === option ? 'bg-[#A100FF2E]' : ''
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <div className='space-y-6'>
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className='shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] rounded-[20.34px] p-2 animate-pulse'
                      >
                        <div className='p-[14.36px] rounded-[15.46px] bg-[#141414]'>
                          <div className='h-6 bg-white/10 rounded mb-4'></div>
                          <div className='h-20 bg-white/10 rounded'></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPositions.length === 0 ? (
                  <div className='p-12 text-center bg-[#FFFFFF0F] rounded-[20.34px] border border-white/10'>
                    <div className='text-gray-400 mb-4'>
                      <svg className='mx-auto w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                      </svg>
                    </div>
                    <h3 className='mb-2 text-lg font-medium text-white'>No Positions</h3>
                    <p className='text-gray-300'>You don't have any vault positions yet.</p>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {filteredPositions.map((position) => (
                      <div
                        key={`${position.chainId}-${position.vault}`}
                        className='shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] rounded-[20.34px] p-2'
                      >
                        <div className='p-[14.36px] rounded-[15.46px] bg-[#141414]'>
                          <div className='flex relative z-10 justify-between items-start'>
                            <div>
                              <div className='font-bold text-xl leading-none tracking-[-0.358px] text-white'>
                                {position.vaultName}
                              </div>

                              <Link
                                href={`/vaults/${position.chainId}/${position.vault}`}
                                className='text-[#CF7CFF] text-[10px] underline hover:text-[#A100FF] transition-colors'
                              >
                                View Vault
                              </Link>
                            </div>

                            <div className='text-[14.76px] font-medium leading-none text-white bg-[#2C2929] rounded-[10.44px] py-[4.74px] px-[5.49px]'>
                              {getProviderBadge(position.vaultProvider)}
                            </div>
                          </div>

                          <div className='flex justify-evenly items-center mt-3.5 shadow-[0_0_0_0.4px_#ffffff47] rounded-[18.77px] py-[22px]'>
                            <div className='text-center'>
                              <div className='text-[7.73px] font-medium text-white uppercase leading-none'>
                                DEPOSITED
                              </div>

                              <div className='text-[16.66px] font-bold text-white font-modernist tracking-[-0.333px] leading-none'>
                                {formatUsd(position.entryUsd)}
                              </div>
                            </div>

                            <div className='w-[1px] h-[9.48px] bg-white'></div>

                            <div className='text-center'>
                              <div className='text-[7.73px] font-medium text-white uppercase leading-none'>
                                CURRENT VALUE
                              </div>

                              <div className='text-[16.66px] font-bold text-white font-modernist tracking-[-0.333px] leading-none'>
                                {formatUsd(position.valueUsd)}
                              </div>
                            </div>

                            <div className='w-[1px] h-[9.48px] bg-white'></div>

                            <div className='text-center'>
                              <div className='text-[7.73px] font-medium text-white uppercase leading-none'>
                                EARNED
                              </div>

                              <div className={`text-[16.66px] font-bold font-modernist tracking-[-0.333px] leading-none ${
                                parseFloat(position.pnlUsd) >= 0 ? 'text-[#00F792]' : 'text-red-400'
                              }`}>
                                {parseFloat(position.pnlUsd) >= 0 ? '+' : ''}{formatUsd(position.pnlUsd)}
                              </div>
                            </div>
                          </div>

                          <div className='flex gap-4 mt-3.5'>
                            <Link
                              href={`/vaults/${position.chainId}/${position.vault}?action=deposit`}
                              className='flex-1 h-[31.19px] px-6 rounded-[10px] bg-gradient-purple text-white font-dm-sans text-[10.99px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center'
                            >
                              Add Funds
                            </Link>

                            <Link
                              href={`/vaults/${position.chainId}/${position.vault}?action=withdraw`}
                              className='flex-1 h-[31.19px] px-6 rounded-[10px] glass-border bg-[#FFFFFF0D] text-white font-dm-sans text-[10.99px] font-normal hover:bg-white/10 transition-colors flex items-center justify-center'
                            >
                              Withdraw
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {mounted && isConnected && (
          <div className='bg-[#FFFFFF0F] rounded-[20.34px] p-5 mt-10'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-[17.54px] font-bold leading-[100%] tracking-[-0.64px] text-white'>
                Transaction History
              </h2>

              <button
                onClick={exportToCSV}
                className='text-[10.38px] font-medium leading-none text-white bg-[#2C2929] rounded-[10.44px] py-[4.74px] px-[5.49px] hover:bg-[#3A3737] transition-colors'
              >
                Export CSV
              </button>
            </div>

            <div className='overflow-x-auto px-[55px]'>
              {filteredPositions.length === 0 ? (
                <div className='py-12 text-center'>
                  <p className='text-gray-400 font-dm-sans text-[13.24px]'>
                    No transaction history available. Transaction history will be available once on-chain events are integrated.
                  </p>
                </div>
              ) : (
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-white/20'>
                      <th className='py-3 pl-5 text-white font-dm-sans text-[13.24px] font-bold uppercase text-left'>
                        VAULT
                      </th>

                      <th className='py-3 text-center text-white font-dm-sans text-[13.24px] font-bold uppercase'>
                        CHAIN
                      </th>

                      <th className='py-3 text-center text-white font-dm-sans text-[13.24px] font-bold uppercase'>
                        CURRENT VALUE
                      </th>

                      <th className='py-3 text-center text-white font-dm-sans text-[13.24px] font-bold uppercase'>
                        P&L
                      </th>

                      <th className='py-3 text-right pr-3 text-white font-dm-sans text-[13.24px] font-bold uppercase'>
                        STATUS
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPositions.map((position) => (
                      <tr key={`${position.chainId}-${position.vault}`} className='border-b border-white/10 last:border-0'>
                        <td className='py-3 text-white font-dm-sans text-[13.24px] font-normal'>
                          {position.vaultName}
                        </td>

                        <td className='py-3 text-white font-dm-sans text-[13.24px] font-normal text-center'>
                          {getNetworkConfig(position.chainId)?.name || `Chain ${position.chainId}`}
                        </td>

                        <td className='py-3 text-white font-dm-sans text-[13.24px] font-bold text-center'>
                          {formatUsd(position.valueUsd)}
                        </td>

                        <td className={`py-3 font-dm-sans text-[13.24px] font-bold text-center ${
                          parseFloat(position.pnlUsd) >= 0 ? 'text-[#00F792]' : 'text-red-400'
                        }`}>
                          {parseFloat(position.pnlUsd) >= 0 ? '+' : ''}{formatUsd(position.pnlUsd)}
                        </td>

                        <td className='py-3 text-[#00F792] font-dm-sans text-[13.24px] font-normal text-right'>
                          Active
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </section>

      <Footer />

      {/* 
      COMMENTED OUT ORIGINAL PORTFOLIO PAGE CODE - PRESERVED FOR REFERENCE
      
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="mr-8 text-2xl font-bold text-white">
                  Gami Capital
                </Link>
                <nav className="flex space-x-8">
                  <Link href="/vaults" className="text-white transition-colors hover:text-gray-300">
                    Vaults
                  </Link>
                  <Link href="/portfolio" className="text-green-400 transition-colors hover:text-green-300">
                    Portfolio
                  </Link>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                {isConnected && address ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-300">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    {connectors.map((connector) => (
                      <button
                        key={connector.uid}
                        onClick={() => connect({ connector })}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
                      >
                        {isPending ? 'Connecting...' : `Connect ${connector.name}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">Portfolio</h1>
            <p className="text-gray-300">
              View and manage your vault positions across multiple networks
            </p>
          </div>

          {!isConnected && (
            <div className="p-12 text-center bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
              <div className="mb-6 text-gray-400">
                <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="mb-4 text-2xl font-bold text-white">Connect Your Wallet</h2>
              <p className="mx-auto mb-8 max-w-md text-gray-300">
                Connect your wallet to view your vault positions, track performance, and manage your portfolio.
              </p>
              <div className="flex justify-center space-x-4">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                    className="px-4 py-2 font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
                  >
                    {isPending ? 'Connecting...' : `Connect ${connector.name}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isConnected && (
            <div className="space-y-8">
              {portfolio && (
                <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className="mb-1 text-3xl font-bold text-white">
                        {formatUsd(portfolio.totalValueUsd)}
                      </div>
                      <div className="text-sm text-gray-400">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold mb-1 ${
                        parseFloat(portfolio.totalPnlUsd) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatUsd(portfolio.totalPnlUsd)}
                      </div>
                      <div className="text-sm text-gray-400">Total P&L</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 text-3xl font-bold text-white">
                        {portfolio.positions.length}
                      </div>
                      <div className="text-sm text-gray-400">Active Positions</div>
                    </div>
                  </div>
                  
                  {portfolio.lastUpdated && (
                    <div className="pt-4 mt-4 text-center border-t border-gray-700">
                      <p className="text-sm text-gray-500">
                        Last updated: {new Date(portfolio.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                <div className="flex justify-between items-center">
                  <label htmlFor="chain-select" className="block text-sm font-medium text-gray-300">
                    Select Network
                  </label>
                  <select
                    id="chain-select"
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(parseInt(e.target.value))}
                    className="px-3 py-2 w-auto text-white bg-gray-700 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-green-500"
                  >
                    <option value={1}>Ethereum</option>
                    <option value={42161}>Arbitrum</option>
                    <option value={10}>Optimism</option>
                    <option value={8453}>Base</option>
                  </select>
                </div>
              </div>

              {isLoading && (
                <div className="p-8 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                  <div className="space-y-4 animate-pulse">
                    <div className="w-1/4 h-4 bg-gray-700 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
                      <div className="w-1/2 h-4 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="p-8 text-center bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                  <div className="mb-4 text-red-500">
                    <svg className="mx-auto w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-white">Failed to Load Portfolio</h3>
                  <p className="mb-4 text-gray-300">{error.message}</p>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {portfolio && !isLoading && !error && (
                <PortfolioTable portfolio={portfolio} />
              )}
            </div>
          )}
        </main>
      </div>
      */}
    </div>
  );
}
