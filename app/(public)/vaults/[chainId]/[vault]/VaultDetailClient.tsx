'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useVault } from '@/hooks/useVault';
import { KPIs, LoadingKPIs } from '@/components/KPIs';
import { Loader } from '@/components/Loader';
import { DepositForm } from '@/components/DepositForm';
import { WithdrawForm } from '@/components/WithdrawForm';
import { getNetworkConfig } from '@/lib/sdk';
import { formatUsd, formatPercentage } from '@/lib/normalize';

interface VaultDetailClientProps {
  chainId: string;
  vault: string;
}

type TabType = 'overview' | 'deposit' | 'withdraw';

export default function VaultDetailClient({ chainId: chainIdParam, vault: vaultParam }: VaultDetailClientProps) {
  const chainId = parseInt(chainIdParam);
  const vaultId = vaultParam;
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Support deep-link to deposit tab via ?tab=deposit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const tab = sp.get('tab');
      if (tab === 'deposit' || tab === 'withdraw' || tab === 'overview') {
        setActiveTab(tab as TabType);
      }
    }
  }, []);

  const { data: vault, isLoading, error, refetch } = useVault({
    chainId,
    vaultId,
    enabled: !isNaN(chainId) && !!vaultId
  });

  const network = getNetworkConfig(chainId);

  if (isNaN(chainId)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Chain ID</h1>
          <p className="text-gray-300 mb-6">The provided chain ID is not valid.</p>
          <Link href="/vaults" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Back to Vaults
          </Link>
        </div>
      </div>
    );
  }

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
                <Link href="/portfolio" className="text-white hover:text-gray-300 transition-colors">
                  Portfolio
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/vaults" className="text-green-400 hover:text-green-300">
                Vaults
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-400">
                {network?.name || `Chain ${chainId}`}
              </span>
            </li>
            <li>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-400 truncate">
                {vault?.name || vaultId}
              </span>
            </li>
          </ol>
        </nav>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-8">
            <Loader label="Fetching vault details" />
            <LoadingKPIs />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Vault Not Found</h1>
            <p className="text-gray-300 mb-6">{error.message}</p>
            <div className="space-x-4">
              <button
                onClick={() => refetch()}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <Link href="/vaults" className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg border border-gray-600 transition-colors">
                Back to Vaults
              </Link>
            </div>
          </div>
        )}

        {/* Vault Content */}
        {vault && !isLoading && (
          <div className="space-y-8">
            {/* Vault Header */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {vault.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                      {vault.status}
                    </span>
                    <span>{vault.symbol}</span>
                    <span>•</span>
                    <span>{network?.name || `Chain ${chainId}`}</span>
                    <span>•</span>
                    <span className="text-green-400">by Gami Capital</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {formatUsd(vault.tvlUsd)}
                  </div>
                  <div className="text-sm text-gray-400">Total Value Locked</div>
                </div>
              </div>

              {/* Vault Description */}
              {vault.metadata?.description && (
                <p className="text-gray-300 mb-4">
                  {vault.metadata.description}
                </p>
              )}

              {/* Strategy Info */}
              {vault.strategy && (
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Strategy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-400">Strategy:</span>
                      <p className="font-medium text-white">{vault.strategy.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Risk Level:</span>
                      <p className="font-medium text-white capitalize">{vault.strategy.riskLevel}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Underlying:</span>
                      <p className="font-medium text-white">{vault.underlying.symbol}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* KPIs */}
            <KPIs vault={vault} />

            {/* Tabs */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
              <div className="border-b border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'deposit', label: 'Deposit' },
                    { id: 'withdraw', label: 'Withdraw' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-400'
                          : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <OverviewTab vault={vault} network={network} />
                )}
                {activeTab === 'deposit' && (
                  <DepositForm vault={vault} />
                )}
                {activeTab === 'withdraw' && (
                  <WithdrawForm vault={vault} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

interface OverviewTabProps {
  vault: any;
  network: any;
}

function OverviewTab({ vault, network }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Vault Details</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Vault Address:</dt>
              <dd className="text-sm font-mono text-white">
                {vault.id.slice(0, 6)}...{vault.id.slice(-4)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Chain:</dt>
              <dd className="text-sm font-medium text-white">
                {network?.name || `Chain ${vault.chainId}`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Underlying Token:</dt>
              <dd className="text-sm font-medium text-white">
                {vault.underlying.symbol}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Management Fee:</dt>
              <dd className="text-sm font-medium text-white">
                {(parseFloat(vault.fees.mgmtBps) / 100).toFixed(2)}%
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Performance Fee:</dt>
              <dd className="text-sm font-medium text-white">
                {(parseFloat(vault.fees.perfBps) / 100).toFixed(2)}%
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Net APY:</dt>
              <dd className="text-sm font-medium text-green-400">
                {formatPercentage(vault.apyNet)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Total Value Locked:</dt>
              <dd className="text-sm font-medium text-white">
                {formatUsd(vault.tvlUsd)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Status:</dt>
              <dd className="text-sm">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                  {vault.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Rewards */}
      {vault.rewards && vault.rewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vault.rewards.map((reward: any, index: number) => (
              <div key={index} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{reward.symbol}</p>
                    <p className="text-sm text-gray-400">Reward Token</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">
                      +{formatPercentage(reward.apy)}
                    </p>
                    <p className="text-sm text-gray-400">APY</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Links</h3>
        <div className="flex space-x-4">
          <a
            href={`${network?.explorerUrl}/address/${vault.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Explorer
          </a>
          {vault.metadata?.website && (
            <a
              href={vault.metadata.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
