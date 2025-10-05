/**
 * DepositForm component for vault deposits
 */

'use client';

import { useState } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatUnits } from 'viem';
import { VaultDTO } from '@/lib/dto';
import { normalizeToString, isValidDecimalString } from '@/lib/normalize';

interface DepositFormProps {
  vault: VaultDTO;
}

export function DepositForm({ vault }: DepositFormProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  // Get user's token balance
  const { data: tokenBalance } = useBalance({
    address,
    token: vault.underlying.address as `0x${string}`,
  });

  // Check current allowance
  const { data: allowance } = useReadContract({
    address: vault.underlying.address as `0x${string}`,
    abi: [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        outputs: [{ type: 'uint256' }]
      }
    ],
    functionName: 'allowance',
    args: address && vault.underlying.address ? [address, vault.id as `0x${string}`] : undefined,
  });

  const { writeContract: approve, isPending: isApprovalPending } = useWriteContract();
  const { writeContract: deposit, isPending: isDepositPending } = useWriteContract();

  const handleAmountChange = (value: string) => {
    if (value === '' || isValidDecimalString(value)) {
      setAmount(value);
    }
  };

  const handleMaxClick = () => {
    if (tokenBalance) {
      setAmount(formatUnits(tokenBalance.value, tokenBalance.decimals));
    }
  };

  const handleApprove = async () => {
    if (!address || !amount) return;

    try {
      setIsApproving(true);

      // Execute approval
      await approve({
        address: vault.underlying.address as `0x${string}`,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ type: 'bool' }]
          }
        ],
        functionName: 'approve',
        args: [vault.id as `0x${string}`, parseEther(amount)],
      });

    } catch (error) {
      console.error('Approval failed:', error);
      // TODO: Show error toast
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeposit = async () => {
    if (!address || !amount) return;

    try {
      setIsDepositing(true);

      // Execute deposit
      await deposit({
        address: vault.id as `0x${string}`,
        abi: [
          {
            name: 'deposit',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'amount', type: 'uint256' },
              { name: 'receiver', type: 'address' }
            ],
            outputs: [{ type: 'uint256' }]
          }
        ],
        functionName: 'deposit',
        args: [parseEther(amount), address],
      });

    } catch (error) {
      console.error('Deposit failed:', error);
      // TODO: Show error toast
    } finally {
      setIsDepositing(false);
    }
  };

  const amountNum = parseFloat(amount || '0');
  const balanceNum = tokenBalance ? parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)) : 0;
  const allowanceNum = allowance ? parseFloat(formatUnits(allowance, vault.underlying.decimals)) : 0;

  const hasInsufficientBalance = amountNum > balanceNum;
  const needsApprovalCheck = amountNum > allowanceNum;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Deposit</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount ({vault.underlying.symbol})
          </label>
          <div className="relative">
            <input
              id="deposit-amount"
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
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
          
          {tokenBalance && (
            <p className="mt-1 text-sm text-gray-400">
              Balance: {formatUnits(tokenBalance.value, tokenBalance.decimals)} {vault.underlying.symbol}
            </p>
          )}
        </div>

        {hasInsufficientBalance && (
          <div className="text-sm text-red-400">
            Insufficient balance
          </div>
        )}

        {needsApprovalCheck ? (
          <button
            onClick={handleApprove}
            disabled={isApproving || !amount || hasInsufficientBalance}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isApproving ? 'Approving...' : `Approve ${vault.underlying.symbol}`}
          </button>
        ) : (
          <button
            onClick={handleDeposit}
            disabled={isDepositing || !amount || hasInsufficientBalance || needsApprovalCheck}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isDepositing ? 'Depositing...' : 'Deposit'}
          </button>
        )}

      </div>
    </div>
  );
}
