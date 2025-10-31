'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount, useConnect } from 'wagmi';
import { usePortfolio } from '@/hooks/usePortfolio';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [selectedChain, setSelectedChain] = useState(1); // Default to Ethereum
  const tabs = ['All Chains', 'Ethereum', 'Token'];

  const {
    data: portfolio,
    isLoading,
    error,
    refetch,
  } = usePortfolio({
    chainId: selectedChain,
    address: address || undefined,
    enabled: isConnected && !!address,
  });

  // Mock data for the new design
  const mockPositions = [
    {
      name: 'Flagship ETH Vault',
      deposited: '$5,000',
      currentValue: '$5,400',
      earned: '+$246',
      tag: 'Flagship',
    },
    {
      name: 'Stable Yield Vault',
      deposited: '$10,000',
      currentValue: '$10,312',
      earned: '+$312',
      tag: 'Flagship',
    },
  ];

  const mockTransactions = [
    {
      date: 'Oct 12, 2025',
      vault: 'Flagship ETH Vault',
      action: 'Deposit',
      amount: '$5,240',
      status: 'Completed',
    },
    {
      date: 'Oct 10, 2025',
      vault: 'Flagship ETH Vault',
      action: 'Deposit',
      amount: '$5,240',
      status: 'Completed',
    },
    {
      date: 'Oct 8, 2025',
      vault: 'Flagship ETH Vault',
      action: 'Deposit',
      amount: '$5,240',
      status: 'Completed',
    },
    {
      date: 'Oct 5, 2025',
      vault: 'Flagship ETH Vault',
      action: 'Deposit',
      amount: '$5,240',
      status: 'Completed',
    },
  ];

  return (
    <div className='min-h-screen bg-black'>
      <div className='absolute inset-0 -bottom-[80px]'>
        <div className='h-full max-w-[1280px] mx-auto px-[84px] relative'>
          <div className='absolute left-[84px] top-0 bottom-0 w-px bg-[#242424]' />

          <div className='absolute left-1/2 top-0 bottom-[52px] w-px bg-[#242424] -translate-x-1/2' />

          <div className='absolute right-[84px] top-0 bottom-0 w-px bg-[#242424]' />
        </div>
      </div>

      <div className='absolute left-0 right-0 h-px bg-[#242424] bottom-0' />

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

          <div className='flex justify-between items-center w-full bg-[#FFFFFF0F] py-[31px] shadow-[0_0_0_0.4px_#ffffff47] rounded-[33.43px] px-[70px] mt-10 backdrop-blur-lg'>
            <div className='flex flex-col gap-1.5 justify-center items-center'>
              <div className='text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
                2
              </div>

              <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
                ACTIVE VAULTS
              </div>
            </div>

            <div className='flex flex-col gap-1.5 justify-center items-center'>
              <div className='text-white font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
                $15,798
              </div>

              <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
                TOTAL ASSETS
              </div>
            </div>

            <div className='flex flex-col gap-1.5 justify-center items-center'>
              <div className='text-[#00F792] font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.866px]'>
                +$558
              </div>

              <div className='text-white font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.244px]'>
                TOTAL PNL
              </div>
            </div>
          </div>

          <div className='mt-10'>
            <h2 className='font-modernist text-[30px] leading-[100%] tracking-[-0.64px] text-white mb-6'>
              Active Positions
            </h2>

            <div className='flex justify-between items-center mb-8'>
              <div className='flex gap-3 items-center'>
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

              <div className='flex items-center gap-2 px-3 py-2 rounded-[32px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] backdrop-blur-lg'>
                <span className='text-white text-[13.58px] font-light'>Sort by: Position Size</span>

                <svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
                  <path
                    d='M3 4.5L6 7.5L9 4.5'
                    stroke='white'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
            </div>

            <div className='space-y-6'>
              {mockPositions.map((position, index) => (
                <div
                  key={index}
                  className='shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] rounded-[20.34px] p-2'
                >
                  <div className='p-[14.36px] rounded-[15.46px] bg-[#141414]'>
                    <div className='flex relative z-10 justify-between items-start'>
                      <div>
                        <div className='font-bold text-xl leading-none tracking-[-0.358px]'>
                          {position.name}
                        </div>

                        <Link
                          href={`#`}
                          className='text-[#CF7CFF] text-[10px] underline hover:text-[#A100FF] transition-colors'
                        >
                          View Vault
                        </Link>
                      </div>

                      <div className='text-[14.76px] font-medium leading-none text-white bg-[#2C2929] rounded-[10.44px] py-[4.74px] px-[5.49px]'>
                        {position.tag}
                      </div>
                    </div>

                    <div className='flex justify-evenly items-center mt-3.5 shadow-[0_0_0_0.4px_#ffffff47] rounded-[18.77px] py-[22px]'>
                      <div className='text-center'>
                        <div className='text-[7.73px] font-medium text-white uppercase leading-none'>
                          DEPOSITED
                        </div>

                        <div className='text-[16.66px] font-bold text-white font-modernist tracking-[-0.333px] leading-none'>
                          {position.deposited}
                        </div>
                      </div>

                      <div className='w-[1px] h-[9.48px] bg-white'></div>

                      <div className='text-center'>
                        <div className='text-[7.73px] font-medium text-white uppercase leading-none'>
                          CURRENT VALUE
                        </div>

                        <div className='text-[16.66px] font-bold text-white font-modernist tracking-[-0.333px] leading-none'>
                          {position.deposited}
                        </div>
                      </div>

                      <div className='w-[1px] h-[9.48px] bg-white'></div>

                      <div className='text-center'>
                        <div className='text-[7.73px] font-medium text-white uppercase leading-none'>
                          EARNED
                        </div>

                        <div className='text-[16.66px] font-bold text-white font-modernist tracking-[-0.333px] leading-none'>
                          {position.deposited}
                        </div>
                      </div>
                    </div>

                    <div className='flex gap-4 mt-3.5'>
                      <button className='flex-1 h-[31.19px] px-6 rounded-[10px] bg-gradient-purple text-white font-dm-sans text-[10.99px] font-bold hover:opacity-90 transition-opacity'>
                        Add Funds
                      </button>

                      <button className='flex-1 h-[31.19px] px-6 rounded-[10px] glass-border bg-[#FFFFFF0D] text-white font-dm-sans text-[10.99px] font-normal hover:bg-white/10 transition-colors'>
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='bg-[#FFFFFF0F] rounded-[20.34px] p-5 mt-10'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-[17.54px] font-bold leading-[100%] tracking-[-0.64px] text-white'>
              Transaction History
            </h2>

            <button className='text-[10.38px] font-medium leading-none text-white bg-[#2C2929] rounded-[10.44px] py-[4.74px] px-[5.49px]'>
              Export CSV
            </button>
          </div>

          <div className='overflow-x-auto px-[55px]'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-white/20'>
                  <th className='py-3 pl-5 text-white font-dm-sans text-[13.24px] font-bold uppercase text-left'>
                    DATE
                  </th>

                  <th className='py-3 text-center text-white font-dm-sans text-[13.24px] font-bold uppercase'>
                    VAULT
                  </th>

                  <th className='py-3 text-center text-white font-dm-sans text-[13.24px] font-bold uppercase'>
                    ACTION
                  </th>

                  <th className='py-3 text-center text-white font-dm-sans text-[13.24px] font-bold uppercase'>
                    AMOUNT
                  </th>

                  <th className='py-3 text-right pr-3 text-white font-dm-sans text-[13.24px] font-bold uppercase'>
                    STATUS
                  </th>
                </tr>
              </thead>

              <tbody>
                {mockTransactions.map((tx, index) => (
                  <tr key={index} className='border-b border-white/10 last:border-0'>
                    <td className='py-3 text-white font-dm-sans text-[13.24px] font-normal'>
                      {tx.date}
                    </td>

                    <td className='py-3 text-white font-dm-sans text-[13.24px] font-normal text-center'>
                      {tx.vault}
                    </td>

                    <td className='py-3 text-white font-dm-sans text-[13.24px] font-normal text-center'>
                      {tx.action}
                    </td>

                    <td className='py-3 text-white font-dm-sans text-[13.24px] font-bold text-center'>
                      {tx.amount}
                    </td>

                    <td className='py-3 text-gami-green font-dm-sans text-[13.24px] font-normal text-right'>
                      {tx.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
