'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount, useConnect } from 'wagmi';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioTable } from '@/components/PortfolioTable';
import { formatUsd } from '@/lib/normalize';
import Footer from '@/components/Footer';

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [selectedChain, setSelectedChain] = useState(1); // Default to Ethereum

  const { data: portfolio, isLoading, error, refetch } = usePortfolio({
    chainId: selectedChain,
    address: address || undefined,
    enabled: isConnected && !!address
  });

  // Mock data for the new design
  const mockPositions = [
    {
      name: 'Flagship ETH Vault',
      deposited: '$5,000',
      currentValue: '$5,400',
      earned: '+$246',
      tag: 'Flagship'
    },
    {
      name: 'Stable Yield Vault',
      deposited: '$10,000',
      currentValue: '$10,312',
      earned: '+$312',
      tag: 'Flagship'
    }
  ];

  const mockTransactions = [
    { date: 'Oct 12, 2025', vault: 'Flagship ETH Vault', action: 'Deposit', amount: '$5,240', status: 'Completed' },
    { date: 'Oct 10, 2025', vault: 'Flagship ETH Vault', action: 'Deposit', amount: '$5,240', status: 'Completed' },
    { date: 'Oct 8, 2025', vault: 'Flagship ETH Vault', action: 'Deposit', amount: '$5,240', status: 'Completed' },
    { date: 'Oct 5, 2025', vault: 'Flagship ETH Vault', action: 'Deposit', amount: '$5,240', status: 'Completed' }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-[1280px] mx-auto py-5 px-[84px] flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/assets/images/gami-logo.svg" alt="Gami Labs" className="" />
            </Link>
          </div>

          <nav className="flex items-center gap-5">
            <Link
              href="/vaults"
              className="text-white font-dm-sans text-[14px] font-normal leading-[21px] px-2 py-3 hover:opacity-80 transition-opacity"
            >
              Vaults
            </Link>
            <Link
              href="/portfolio"
              className="text-white font-dm-sans text-[14px] font-normal leading-[21px] px-2 py-3 hover:opacity-80 transition-opacity"
            >
              Portfolio
            </Link>
            <Link
              href="#about"
              className="text-white font-dm-sans text-[14px] font-normal leading-[21px] px-2 py-3 hover:opacity-80 transition-opacity"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-[14px]">
            <div className="flex items-center gap-3 px-4 py-2 rounded-[32px] glass-border bg-white/6">
              <input
                type="text"
                placeholder="Search vaults..."
                className="bg-transparent text-white text-[14px] font-light font-dm-sans outline-none placeholder:text-white/70 w-60"
              />
            </div>
            
            {/* Network Selector */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-[32px] glass-border bg-white/6">
              <span className="text-white text-[14px] font-medium">Ethereum</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Wallet Balance */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-[32px] glass-border bg-white/6">
              <span className="text-white text-[14px] font-medium">$15,700</span>
            </div>

            <div className="relative">
              {isConnected && address ? (
                <button className="px-6 py-2 rounded-[36px] bg-gradient-purple text-white text-[14px] font-medium font-dm-sans hover:opacity-90 transition-opacity">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </button>
              ) : (
                <button 
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-6 py-2 rounded-[36px] bg-gradient-purple text-white text-[14px] font-medium font-dm-sans hover:opacity-90 transition-opacity"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-[84px] pt-32 pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-modernist text-[48px] font-bold leading-[100%] tracking-[-0.96px] text-white mb-4">
            Portfolio
          </h1>
          <p className="font-dm-sans text-[20px] font-light leading-[128%] tracking-[-0.4px] text-white/70">
            Track your positions and performance across all vaults
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-[28px] glass-border bg-white/6">
            <div className="text-center">
              <div className="text-[32px] font-bold text-white mb-2">2</div>
              <div className="text-[14px] font-medium text-white/70 uppercase tracking-wider">ACTIVE VAULTS</div>
            </div>
          </div>
          <div className="p-6 rounded-[28px] glass-border bg-white/6">
            <div className="text-center">
              <div className="text-[32px] font-bold text-white mb-2">$15,798</div>
              <div className="text-[14px] font-medium text-white/70 uppercase tracking-wider">TOTAL ASSETS</div>
            </div>
          </div>
          <div className="p-6 rounded-[28px] glass-border bg-white/6">
            <div className="text-center">
              <div className="text-[32px] font-bold text-white mb-2">10.6%</div>
              <div className="text-[14px] font-medium text-white/70 uppercase tracking-wider">AVG APY</div>
            </div>
          </div>
          <div className="p-6 rounded-[28px] glass-border bg-white/6">
            <div className="text-center">
              <div className="text-[32px] font-bold text-gami-green mb-2">+$558</div>
              <div className="text-[14px] font-medium text-white/70 uppercase tracking-wider">TOTAL PNL</div>
            </div>
          </div>
        </div>

        {/* Active Positions Section */}
        <div className="mb-12">
          <h2 className="font-modernist text-[32px] font-bold leading-[100%] tracking-[-0.64px] text-white mb-6">
            Active Positions
          </h2>
          
          {/* Filter Buttons */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-[32px] bg-gradient-purple text-white text-[14px] font-medium">
                All Chains
              </button>
              <button className="px-4 py-2 rounded-[32px] glass-border bg-white/6 text-white text-[14px] font-medium hover:bg-white/10 transition-colors">
                Ethereum
              </button>
              <button className="px-4 py-2 rounded-[32px] glass-border bg-white/6 text-white text-[14px] font-medium hover:bg-white/10 transition-colors">
                Token
              </button>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 rounded-[32px] glass-border bg-white/6">
              <span className="text-white text-[14px] font-medium">Sort by: Position Size</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Vault Cards */}
          <div className="space-y-6">
            {mockPositions.map((position, index) => (
              <div key={index} className="p-6 rounded-[28px] glass-border bg-white/6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-dm-sans text-[20px] font-bold leading-[128%] tracking-[-0.4px] text-white mb-2">
                      {position.name}
                    </h3>
                    <Link href="#" className="text-gami-purple text-[14px] font-medium hover:opacity-80 transition-opacity">
                      View Vault
                    </Link>
                  </div>
                  <span className="px-3 py-1 rounded-[8px] glass-border bg-white/6 text-white font-dm-sans text-[12px] font-medium">
                    {position.tag}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-6">
                  <div>
                    <div className="text-[12px] font-medium text-white/70 uppercase tracking-wider mb-2">DEPOSITED</div>
                    <div className="text-[20px] font-bold text-white">{position.deposited}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-white/70 uppercase tracking-wider mb-2">CURRENT VALUE</div>
                    <div className="text-[20px] font-bold text-white">{position.currentValue}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-white/70 uppercase tracking-wider mb-2">EARNED</div>
                    <div className="text-[20px] font-bold text-gami-green">{position.earned}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-3 px-6 rounded-[38px] bg-gradient-purple text-white font-dm-sans text-[15px] font-bold hover:opacity-90 transition-opacity">
                    Add Funds
                  </button>
                  <button className="flex-1 py-3 px-6 rounded-[38px] glass-border bg-white/5 text-white font-dm-sans text-[15px] font-normal hover:bg-white/10 transition-colors">
                    Withdraw
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-modernist text-[32px] font-bold leading-[100%] tracking-[-0.64px] text-white">
              Transaction History
            </h2>
            <button className="text-white/70 text-[14px] font-medium hover:text-white transition-colors">
              Export CSV
            </button>
          </div>

          <div className="p-6 rounded-[28px] glass-border bg-white/6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-4 text-left text-white font-dm-sans text-[14px] font-bold uppercase tracking-wider">DATE</th>
                    <th className="py-4 text-left text-white font-dm-sans text-[14px] font-bold uppercase tracking-wider">VAULT</th>
                    <th className="py-4 text-left text-white font-dm-sans text-[14px] font-bold uppercase tracking-wider">ACTION</th>
                    <th className="py-4 text-left text-white font-dm-sans text-[14px] font-bold uppercase tracking-wider">AMOUNT</th>
                    <th className="py-4 text-left text-white font-dm-sans text-[14px] font-bold uppercase tracking-wider">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx, index) => (
                    <tr key={index} className="border-b border-white/10 last:border-0">
                      <td className="py-4 text-white font-dm-sans text-[14px] font-normal">{tx.date}</td>
                      <td className="py-4 text-white font-dm-sans text-[14px] font-normal">{tx.vault}</td>
                      <td className="py-4 text-white font-dm-sans text-[14px] font-normal">{tx.action}</td>
                      <td className="py-4 text-white font-dm-sans text-[14px] font-bold">{tx.amount}</td>
                      <td className="py-4 text-gami-green font-dm-sans text-[14px] font-normal">{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
     <Footer /> 
      {/* 
      COMMENTED OUT ORIGINAL PORTFOLIO PAGE CODE - PRESERVED FOR REFERENCE
      
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-white mr-8">
                  Gami Capital
                </Link>
                <nav className="flex space-x-8">
                  <Link href="/vaults" className="text-white hover:text-gray-300 transition-colors">
                    Vaults
                  </Link>
                  <Link href="/portfolio" className="text-green-400 hover:text-green-300 transition-colors">
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
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
            <p className="text-gray-300">
              View and manage your vault positions across multiple networks
            </p>
          </div>

          {!isConnected && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-6">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Connect your wallet to view your vault positions, track performance, and manage your portfolio.
              </p>
              <div className="flex justify-center space-x-4">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
                <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
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
                      <div className="text-3xl font-bold text-white mb-1">
                        {portfolio.positions.length}
                      </div>
                      <div className="text-sm text-gray-400">Active Positions</div>
                    </div>
                  </div>
                  
                  {portfolio.lastUpdated && (
                    <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                      <p className="text-sm text-gray-500">
                        Last updated: {new Date(portfolio.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <label htmlFor="chain-select" className="block text-sm font-medium text-gray-300">
                    Select Network
                  </label>
                  <select
                    id="chain-select"
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(parseInt(e.target.value))}
                    className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:border-green-500 focus:ring-green-500 w-auto"
                  >
                    <option value={1}>Ethereum</option>
                    <option value={42161}>Arbitrum</option>
                    <option value={10}>Optimism</option>
                    <option value={8453}>Base</option>
                  </select>
                </div>
              </div>

              {isLoading && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-8 text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Failed to Load Portfolio</h3>
                  <p className="text-gray-300 mb-4">{error.message}</p>
                  <button
                    onClick={() => refetch()}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
