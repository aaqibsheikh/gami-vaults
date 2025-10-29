'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction } from 'wagmi';
import { formatPercentage, formatUsd } from '@/lib/normalize';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useVaultPosition } from '@/hooks/useVaultPosition';

interface DepositFormVaultDetailProps {
  vault?: {
    id: string;
    chainId: number;
    symbol: string;
    underlying: {
      symbol: string;
      address: string;
      decimals: number;
    };
    apyNet: string;
    tvlUsd: string;
  };
}

export default function DepositFormVaultDetail({ vault }: DepositFormVaultDetailProps) {
  const { address } = useAccount();
  const { sendTransaction, isPending: isTxPending } = useSendTransaction();
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(vault?.underlying.symbol || '');
  const [isDepositing, setIsDepositing] = useState(false);

  // Fetch user's token balance
  const { balanceFormatted, isLoading: isLoadingBalance } = useTokenBalance({
    chainId: vault?.chainId || 1,
    tokenAddress: vault?.underlying.address || '',
    enabled: !!vault?.underlying.address && !!address
  });

  // Fetch user's vault position
  const { position, isLoading: isLoadingPosition } = useVaultPosition({
    chainId: vault?.chainId || 1,
    vaultAddress: vault?.id || '',
    enabled: !!vault?.id && !!address
  });


  // Mock share price - would be calculated from vault data
  const sharePrice = '1.00';
  const expectedApy = vault?.apyNet ? formatPercentage(vault.apyNet) : '0.0%';

  // Calculate shares to receive
  const sharesToReceive = amount ? (parseFloat(amount) / parseFloat(sharePrice)).toFixed(4) : '0.00';

  // Available assets for deposit
  const availableAssets = vault ? [{ symbol: vault.underlying.symbol, name: vault.underlying.symbol }] : [];

  // User position from real data
  const userPosition = position ? formatUsd(position.valueUsd) : '--';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxAmount = () => {
    if (balanceFormatted) {
      setAmount(balanceFormatted);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!vault || !address) {
      alert('Wallet or vault not available');
      return;
    }

    setIsDepositing(true);
    
    try {
      // 1) Build approval tx (token -> approve vault for amount)
      const approveRes = await fetch('/api/tx/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chain: vault.chainId,
          token: vault.underlying.address,
          spender: vault.id,
          amount: amount
        })
      });
      if (!approveRes.ok) throw new Error('Failed to build approval transaction');
      const approveTx = await approveRes.json();

      // Send approval transaction
      await sendTransaction({
        to: approveTx.to as `0x${string}`,
        data: approveTx.data as `0x${string}`,
        value: BigInt(approveTx.value),
      });

      // Wait a bit for approval to be mined
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2) Build deposit tx
      const depositRes = await fetch('/api/tx/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chain: vault.chainId,
          vault: vault.id,
          owner: address,
          amount: amount
        })
      });
      if (!depositRes.ok) throw new Error('Failed to build deposit transaction');
      const depositTx = await depositRes.json();

      // Send deposit transaction
      await sendTransaction({
        to: depositTx.to as `0x${string}`,
        data: depositTx.data as `0x${string}`,
        value: BigInt(depositTx.value),
      });

      alert(`Successfully deposited ${amount} ${selectedAsset}!`);
      setAmount('');
      
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Deposit failed. Please try again.');
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="flex w-[388px] h-[507px] p-[11px] flex-col justify-center items-center gap-2 rounded-[20px] glass-border/28 bg-white/6">
      <div className="flex w-[366px] h-[480px] px-5 py-5 flex-col justify-between items-center flex-shrink-0 rounded-[20px] bg-gradient-to-b from-[#141414] to-[#141414]">
        <div className="flex items-start gap-7 self-stretch">
          <div className="flex flex-col items-start gap-2">
            <div className="text-white font-dm-sans text-[17px] font-bold leading-[128%] tracking-[-0.344px]">
              Deposit
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-[-2px] self-stretch">
          <div className="flex h-[35px] flex-col justify-between items-center">
            <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
              AMOUNT
            </div>
          </div>
          <div className="flex h-[55px] px-4 py-5 justify-center items-center self-stretch rounded-[24px] glass-border bg-white/5">
            <div className="flex justify-center items-center gap-3 flex-1">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="flex-1 text-white font-dm-sans text-[19px] font-semibold leading-[150%] bg-transparent border-none outline-none placeholder-white/50"
              />
              <button
                onClick={handleMaxAmount}
                className="text-[#A100FF] font-dm-sans text-[12px] font-medium hover:text-white transition-colors"
              >
                MAX
              </button>
            </div>
          </div>
          <div className="flex h-[35px] flex-col justify-between items-center mt-2">
            {isLoadingBalance ? (
              <div className="text-white/50 font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
                Loading balance...
              </div>
            ) : balanceFormatted ? (
              <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
                Balance: {balanceFormatted} {selectedAsset}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-start gap-[-2px] self-stretch">
          <div className="flex h-[35px] flex-col justify-between items-center">
            <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
              ASSET
            </div>
          </div>
          <div className="flex h-[55px] px-4 py-5 justify-center items-center self-stretch rounded-[24px] glass-border bg-white/5">
            <div className="flex justify-center items-center gap-3 flex-1">
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="flex-1 text-white font-dm-sans text-[19px] font-semibold leading-[150%] bg-transparent border-none outline-none"
              >
                {availableAssets.map((asset) => (
                  <option key={asset.symbol} value={asset.symbol} className="bg-gray-800">
                    {asset.symbol}
                  </option>
                ))}
              </select>
              <div className="flex w-[109px] h-2 rotate-[-90deg] justify-center items-center gap-3">
                <div className="w-3 flex-shrink-0 text-white/50 font-dm-sans text-[19px] font-semibold leading-[150%]">
                  {'>'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[89px] px-[10px] py-[10px] flex-col justify-between items-center flex-shrink-0 self-stretch">
          <div className="flex items-center justify-between self-stretch">
            <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
              You will receive
            </div>
            <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
              {sharesToReceive} {vault?.symbol || 'gETH'}
            </div>
          </div>
          <div className="flex items-center justify-between self-stretch">
            <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
              Share price
            </div>
            <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
              {sharePrice} {vault?.symbol || 'gETH'}
            </div>
          </div>
          <div className="w-full h-[1px] bg-white/50"></div>
          <div className="flex justify-between items-center self-stretch">
            <div className="text-white font-dm-sans text-[13px] font-bold leading-[110%] tracking-[-0.256px]">
              Total
            </div>
            <div className="text-[#00F792] font-dm-sans text-[13px] font-bold leading-[110%] tracking-[-0.256px]">
              {amount || '0.00'} {selectedAsset}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 self-stretch">
          <div className="flex items-center gap-3 self-stretch">
            <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
              QUICK STATS
            </div>
          </div>
          <div className="flex flex-col items-start gap-[10px] self-stretch">
            <div className="flex w-full justify-between items-center">
              <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
                Your position
              </div>
              <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
                {isLoadingPosition ? 'Loading...' : userPosition}
              </div>
            </div>
            <div className="flex justify-between items-center self-stretch">
              <div className="text-white font-dm-sans text-[13px] font-normal leading-[110%] tracking-[-0.256px]">
                Expected APY
              </div>
              <div className="text-[#00F792] font-dm-sans text-[13px] font-bold leading-[110%] tracking-[-0.256px]">
                {expectedApy}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDeposit}
          disabled={isDepositing || isTxPending || !amount || parseFloat(amount) <= 0 || !balanceFormatted || parseFloat(amount) > parseFloat(balanceFormatted)}
          className="w-full bg-gradient-to-r from-[#A100FF] to-[#A100FF]/80 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDepositing || isTxPending ? 'Processing...' : 'Deposit'}
        </button>
      </div>
    </div>
  );
}
