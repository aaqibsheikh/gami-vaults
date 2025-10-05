'use client';

import { useEffect, useMemo, useState } from 'react';
import { useVaults } from '@/hooks/useVaults';
import { Loader } from '@/components/Loader';
import { VaultCard } from '@/components/VaultCard';
import { VaultsTable } from '@/components/VaultsTable';
import { Header } from '@/components/Header';
import { getSupportedNetworks } from '@/lib/sdk';
import { VaultDTO } from '@/lib/dto';

export default function VaultsPage() {
  const [selectedChains, setSelectedChains] = useState<number[]>(getSupportedNetworks());
  const [activeTab, setActiveTab] = useState<'all' | 'lending' | 'defi-yield' | 'pre-deposit'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: vaults, isLoading, error, refetch } = useVaults({
    chainIds: selectedChains,
    enabled: selectedChains.length > 0
  });

  // Filter vaults by type
  const filteredVaults = useMemo(() => {
    if (!vaults) return [];

    return vaults.filter(vault => {
      if (activeTab === 'all') return true;
      if (activeTab === 'lending') return vault.strategy?.name === 'Lending';
      if (activeTab === 'defi-yield') return vault.strategy?.name === 'DeFi Yield';
      if (activeTab === 'pre-deposit') return vault.name.includes('Pre-deposit') || vault.name.includes('TAC');
      return true;
    });
  }, [vaults, activeTab]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Discover Vaults Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Discover Vaults</h1>
          {/* <p className="text-lg text-gray-300 max-w-4xl">
            Gami Capital provides institutional-grade DeFi vaults powered by August Digital infrastructure. 
            Our flagship simple vaults and advanced strategies offer professional risk management and optimized yields.{' '}
            <a href="#" className="text-green-400 hover:text-green-300 underline">
              Contact our team
            </a>
          </p> */}
        </div>

        {/* Featured Vaults */}
        {!isLoading && !error && filteredVaults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured vaults</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVaults.slice(0, 4).map((vault) => (
                <VaultCard key={`${vault.chainId}-${vault.id}`} vault={vault} />
              ))}
            </div>
          </div>
        )}

        {/* All Vaults Section */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 lg:mb-0">All vaults</h2>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 mb-4 lg:mb-0">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            {/* Tabs */}
            <div className="flex space-x-8 mb-4 lg:mb-0">
              {[
                { id: 'all', label: 'All vaults' },
                { id: 'lending', label: 'Lending' },
                { id: 'defi-yield', label: 'DeFi Yield' },
                { id: 'pre-deposit', label: 'Pre-deposit' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select className="dark-input px-3 py-2 rounded-lg">
                <option>All chains</option>
                <option>Ethereum</option>
                <option>Arbitrum</option>
                <option>Optimism</option>
                <option>Base</option>
              </select>
              <select className="dark-input px-3 py-2 rounded-lg">
                <option>All tokens</option>
                <option>USDC</option>
                <option>ETH</option>
                <option>USDT</option>
              </select>
            </div>
          </div>

        {/* Results Summary */}
          <div className="mb-6">
            <div className="text-sm text-gray-400">
            {isLoading ? (
              ''
            ) : error ? (
                'Error loading vaults'
              ) : (
                `${filteredVaults.length} vault${filteredVaults.length !== 1 ? 's' : ''} found`
              )}
            </div>
          </div>

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Failed to Load Vaults</h3>
              <p className="text-gray-400 mb-4">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="btn-primary-dark"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Vaults Display */}
          {isLoading ? (
            mounted ? (
              <Loader label="Loading vaults..." />
            ) : (
              <div className="dark-card p-12 text-center text-gray-400">Loading vaults...</div>
            )
          ) : (!error && filteredVaults.length > 0 && (
            <>
              {viewMode === 'table' ? (
                <VaultsTable vaults={filteredVaults} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVaults.map((vault) => (
                    <VaultCard key={`${vault.chainId}-${vault.id}`} vault={vault} />
                  ))}
                </div>
              )}
            </>
          ))}

          {/* Empty State */}
          {!isLoading && !error && filteredVaults.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Vaults Found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {/* <div className="mt-16 mb-12">
          <button className="btn-primary-dark mb-6">Send us your feedback</button>
          <div className="max-w-2xl">
            <p className="text-white mb-4">I really hate the way Upshift is...</p>
            <textarea
              placeholder="Input your feedback..."
              className="w-full h-32 dark-input rounded-lg p-4 resize-none"
            />
            <button className="btn-secondary-dark mt-4">Submit Feedback</button>
          </div>
        </div> */}

        {/* Community Section */}
        {/* <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Join our community</h3>
          <div className="flex space-x-4">
            <a href="#" className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </a>
            <a href="#" className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
            </a>
            <a href="#" className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div> */}

        {/* Footer */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-8 border-t border-gray-800">
          {/* <p className="text-sm text-gray-400">Powered by August Digital</p> */}
          <p className="text-sm text-gray-400">Copyright © 2025 Gami Capital</p>
        </div>
      </main>
    </div>
  );
}
