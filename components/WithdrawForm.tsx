/**
 * WithdrawForm component for vault withdrawals
 */

'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatUnits } from 'viem';
import { VaultDTO } from '@/lib/dto';
import { normalizeToString, isValidDecimalString } from '@/lib/normalize';

interface WithdrawFormProps {
  vault: VaultDTO;
  userShares?: string;
}

export function WithdrawForm({ vault, userShares = '0' }: WithdrawFormProps) {
  const { address } = useAccount();
  const [shares, setShares] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Get user's vault shares balance
  const { data: sharesBalance } = useReadContract({
    address: vault.id as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }]
      }
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContract: withdraw, isPending: isWithdrawPending } = useWriteContract();

  const handleSharesChange = (value: string) => {
    if (value === '' || isValidDecimalString(value)) {
      setShares(value);
    }
  };

  const handleMaxClick = () => {
    if (sharesBalance) {
      setShares(formatUnits(sharesBalance, vault.underlying.decimals));
    }
  };

  const handleWithdraw = async () => {
    if (!address || !shares) return;

    try {
      setIsWithdrawing(true);
      
      // Build withdrawal transaction
      const response = await fetch('/api/tx/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chain: vault.chainId,
          vault: vault.id,
          owner: address,
          shares: shares
        })
      });

      if (!response.ok) {
        throw new Error('Failed to build withdrawal transaction');
      }

      const txData = await response.json();

      // Execute withdrawal
      await withdraw({
        address: vault.id as `0x${string}`,
        abi: [
          {
            name: 'withdraw',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'shares', type: 'uint256' },
              { name: 'receiver', type: 'address' },
              { name: 'owner', type: 'address' }
            ],
            outputs: [{ type: 'uint256' }]
          }
        ],
        functionName: 'withdraw',
        args: [parseEther(shares), address, address],
      });

    } catch (error) {
      console.error('Withdrawal failed:', error);
      // TODO: Show error toast
    } finally {
      setIsWithdrawing(false);
    }
  };

  const sharesNum = parseFloat(shares || '0');
  const balanceNum = sharesBalance ? parseFloat(formatUnits(sharesBalance, vault.underlying.decimals)) : 0;

  const hasInsufficientShares = sharesNum > balanceNum;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Withdraw</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="withdraw-shares" className="block text-sm font-medium text-gray-300 mb-2">
            Shares ({vault.symbol})
          </label>
          <div className="relative">
            <input
              id="withdraw-shares"
              type="text"
              value={shares}
              onChange={(e) => handleSharesChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-green-400 hover:text-green-300"
            >
              MAX
            </button>
          </div>
          
          {sharesBalance && (
            <p className="mt-1 text-sm text-gray-400">
              Balance: {formatUnits(sharesBalance, vault.underlying.decimals)} {vault.symbol}
            </p>
          )}
        </div>

        {hasInsufficientShares && (
          <div className="text-sm text-red-400">
            Insufficient shares
          </div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={isWithdrawing || !shares || hasInsufficientShares}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
        </button>

      </div>
    </div>
  );
}
