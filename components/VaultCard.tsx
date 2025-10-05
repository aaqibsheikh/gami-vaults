/**
 * VaultCard component matching Upshift design
 */

import Link from 'next/link';
import { VaultDTO } from '@/lib/dto';
import { formatUsd, formatPercentage } from '@/lib/normalize';

interface VaultCardProps {
  vault: VaultDTO;
}

export function VaultCard({ vault }: VaultCardProps) {
  const apyValue = parseFloat(vault.apyNet);
  const hasApy = apyValue > 0;

  return (
    <div className="dark-card p-6 hover:border-gray-600 transition-colors cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Vault Icon */}
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-green-400">$</span>
          </div>
          <div>
            <Link href={`/vaults/${vault.chainId}/${vault.id}`} className="text-lg font-semibold text-white hover:underline">
              {vault.name}
            </Link>
            <p className="text-sm text-gray-400">by Gami Capital</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4 mb-6">
        {/* Total Deposited */}
        <div>
          <p className="text-sm text-gray-400 mb-1">Total Deposited</p>
          <p className="text-xl font-bo ld text-white">
            {formatUsd(vault.tvlUsd)}
          </p>
        </div>

        {/* Target APY */}
        <div>
          <p className="text-sm text-gray-400 mb-1">Target APY</p>
          <p className={`text-xl font-bold ${hasApy ? 'text-green-400' : 'text-gray-500'}`}>
            {hasApy ? formatPercentage(vault.apyNet) : 'N/A'}
          </p>
        </div>

        {/* Deposit Tokens */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Deposit Tokens</p>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {vault.underlying.symbol.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-gray-300">{vault.underlying.symbol}</span>
          </div>
        </div>

        {/* Rewards */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Rewards</p>
          <div className="flex items-center space-x-1">
            {vault.rewards && vault.rewards.length > 0 ? (
              <>
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </>
            ) : (
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Button */}
      <Link
        href={`/vaults/${vault.chainId}/${vault.id}?tab=deposit`}
        className="block text-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        Deposit
      </Link>
    </div>
  );
}
