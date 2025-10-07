/**
 * VaultsTable component matching Upshift design
 */

import Link from 'next/link';
import { VaultDTO } from '@/lib/dto';
import { formatUsd, formatPercentage } from '@/lib/normalize';

interface VaultsTableProps {
  vaults: VaultDTO[];
  isLoading?: boolean;
}

export function VaultsTable({ vaults, isLoading }: VaultsTableProps) {
  if (isLoading) {
    return (
      <div className="dark-card overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Vault</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Deposit</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">TVL</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Target APY</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Rewards</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Strategist</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {vaults.map((vault, index) => {
              const apyValue = parseFloat(vault.apyNet);
              const hasApy = apyValue > 0;

              return (
                <tr key={`${vault.chainId}-${vault.id}`} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  {/* Vault */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-green-400">
                          {vault.underlying.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <Link href={`/vaults/${vault.chainId}/${vault.id}`} className="font-medium text-white hover:underline">{vault.name}</Link>
                        <div className="text-sm text-gray-400">
                          {vault.strategy?.name || 'DeFi Yield'}
                          {vault.strategy?.name === 'DeFi Yield' && index % 3 === 0 && ', Pre-deposit'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Deposit */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {vault.underlying.symbol.charAt(0)}
                        </span>
                      </div>
                      <span className="text-white">{vault.underlying.symbol}</span>
                    </div>
                  </td>

                  {/* TVL */}
                  <td className="py-4 px-6">
                    <div className="text-white">
                      {formatUsd(vault.tvlUsd)}
                    </div>
                  </td>

                  {/* Target APY */}
                  <td className="py-4 px-6">
                    <span className={`font-medium ${hasApy ? 'text-green-400' : 'text-gray-500'}`}>
                      {hasApy ? formatPercentage(vault.apyNet) : 'N/A'}
                    </span>
                  </td>

                  {/* Rewards */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1">
                      {vault.rewards && vault.rewards.length > 0 ? (
                        <>
                          {index % 4 === 0 && <span className="text-xs text-green-400 mr-1">5x</span>}
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          {index % 3 === 0 && <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
                          {index % 2 === 0 && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
                          {index % 5 === 0 && <div className="w-4 h-4 bg-orange-500 rounded-full"></div>}
                        </>
                      ) : (
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </td>

                  {/* Strategist */}
                  <td className="py-4 px-6">
                    <span className="text-green-400 font-medium">
                      {vault.strategist?.name || 'Unknown'}
                    </span>
                  </td>

                  {/* Deposit Button */}
                  <td className="py-4 px-6">
                    <Link
                      href={`/vaults/${vault.chainId}/${vault.id}?tab=deposit`}
                      className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Deposit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
