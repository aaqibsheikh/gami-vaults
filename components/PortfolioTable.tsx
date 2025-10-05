/**
 * PortfolioTable component for displaying user positions
 */

'use client';

import { useState } from 'react';
import { PortfolioDTO, PositionDTO } from '@/lib/dto';
import { formatUsd, formatDecimalString } from '@/lib/normalize';
import { getNetworkConfig } from '@/lib/sdk';
import { useRedemptions } from '@/hooks/useRedemptions';

interface PortfolioTableProps {
  portfolio: PortfolioDTO;
}

export function PortfolioTable({ portfolio }: PortfolioTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (vault: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(vault)) {
      newExpanded.delete(vault);
    } else {
      newExpanded.add(vault);
    }
    setExpandedRows(newExpanded);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Vault', 'Chain', 'Shares', 'Value (USD)', 'P&L (USD)', 'Entry Value (USD)'].join(','),
      ...portfolio.positions.map(position => [
        position.vault,
        getNetworkConfig(position.chainId)?.name || `Chain ${position.chainId}`,
        position.shares,
        position.valueUsd,
        position.pnlUsd,
        position.entryUsd
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

  if (portfolio.positions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No Positions</h3>
          <p className="text-gray-300">You don't have any vault positions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Portfolio</h3>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Vault
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Chain
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Value (USD)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                P&L (USD)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                P&L %
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {portfolio.positions.map((position) => (
              <PositionRow
                key={`${position.chainId}-${position.vault}`}
                position={position}
                isExpanded={expandedRows.has(position.vault)}
                onToggle={() => toggleRow(position.vault)}
              />
            ))}
          </tbody>
          <tfoot className="bg-gray-700">
            <tr>
              <td colSpan={3} className="px-6 py-3 text-sm font-medium text-white">
                Total
              </td>
              <td className="px-6 py-3 text-right text-sm font-medium text-white">
                {formatUsd(portfolio.totalValueUsd)}
              </td>
              <td className={`px-6 py-3 text-right text-sm font-medium ${
                parseFloat(portfolio.totalPnlUsd) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatUsd(portfolio.totalPnlUsd)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

interface PositionRowProps {
  position: PositionDTO;
  isExpanded: boolean;
  onToggle: () => void;
}

function PositionRow({ position, isExpanded, onToggle }: PositionRowProps) {
  const network = getNetworkConfig(position.chainId);
  const pnlPercentage = position.entryUsd !== '0' 
    ? ((parseFloat(position.pnlUsd) / parseFloat(position.entryUsd)) * 100).toFixed(2)
    : '0';

  return (
    <>
      <tr className="hover:bg-gray-700">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs font-semibold">
                {position.vault.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                {position.vault.slice(0, 6)}...{position.vault.slice(-4)}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
          {network?.name || `Chain ${position.chainId}`}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">
          {formatDecimalString(position.shares, 4)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">
          {formatUsd(position.valueUsd)}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
          parseFloat(position.pnlUsd) >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {formatUsd(position.pnlUsd)}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
          parseFloat(pnlPercentage) >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {pnlPercentage}%
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <button
            onClick={onToggle}
            className="text-green-400 hover:text-green-300 text-sm font-medium"
          >
            {isExpanded ? 'Hide' : 'View'} Details
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-gray-700">
            <PositionDetails position={position} />
          </td>
        </tr>
      )}
    </>
  );
}

interface PositionDetailsProps {
  position: PositionDTO;
}

function PositionDetails({ position }: PositionDetailsProps) {
  const { data: redemptions, isLoading: redemptionsLoading } = useRedemptions({
    chainId: position.chainId,
    vault: position.vault,
    address: undefined, // TODO: Get from context
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Position Details</h4>
          <dl className="space-y-1">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Entry Value:</dt>
              <dd className="text-sm font-medium text-white">{formatUsd(position.entryUsd)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Current Value:</dt>
              <dd className="text-sm font-medium text-white">{formatUsd(position.valueUsd)}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-sm font-medium text-white mb-2">Rewards</h4>
          {position.rewards && position.rewards.length > 0 ? (
            <div className="space-y-1">
              {position.rewards.map((reward, index) => (
                <div key={index} className="flex justify-between">
                  <dt className="text-sm text-gray-400">{reward.symbol}:</dt>
                  <dd className="text-sm font-medium text-white">
                    {formatDecimalString(reward.amount, 4)} ({formatUsd(reward.valueUsd)})
                  </dd>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No rewards available</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white mb-2">Claimable Redemptions</h4>
        {redemptionsLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : redemptions && redemptions.length > 0 ? (
          <div className="space-y-1">
            {redemptions.map((redemption, index) => (
              <div key={index} className="flex justify-between">
                <dt className="text-sm text-gray-400">{redemption.token.symbol}:</dt>
                <dd className="text-sm font-medium text-white">
                  {formatDecimalString(redemption.claimableAmount, 4)} ({formatUsd(redemption.claimableValueUsd)})
                </dd>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No claimable redemptions</p>
        )}
      </div>
    </div>
  );
}
