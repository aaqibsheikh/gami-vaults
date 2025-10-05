'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount, useConnect } from 'wagmi';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioTable } from '@/components/PortfolioTable';
import { formatUsd } from '@/lib/normalize';

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [selectedChain, setSelectedChain] = useState(1); // Default to Ethereum

  const { data: portfolio, isLoading, error, refetch } = usePortfolio({
    chainId: selectedChain,
    address: address || undefined,
    enabled: isConnected && !!address
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
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
            
            {/* Wallet Connection */}
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-gray-300">
            View and manage your vault positions across multiple networks
          </p>
        </div>

        {/* Not Connected State */}
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

        {/* Connected State */}
        {isConnected && (
          <div className="space-y-8">
            {/* Portfolio Summary */}
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

            {/* Chain Selector */}
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

            {/* Loading State */}
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

            {/* Error State */}
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

            {/* Portfolio Table */}
            {portfolio && !isLoading && !error && (
              <PortfolioTable portfolio={portfolio} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
