'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useChainId, useSwitchChain } from 'wagmi';
import { isAddress, getAddress } from 'viem';
import { formatPercentage, formatUsd } from '@/lib/normalize';
import { useVaultPosition } from '@/hooks/useVaultPosition';
import { useVaultSharePrice } from '@/hooks/useVaultSharePrice';
import { getNetworkConfig } from '@/lib/sdk';
import toast from 'react-hot-toast';

interface WithdrawFormVaultDetailProps {
  vault?: {
    id: string;
    chainId: number;
    symbol: string; // vault share symbol (e.g., gETH)
    underlying: {
      symbol: string; // e.g., ETH
      address: string;
      decimals: number;
    };
    apyNet: string;
    tvlUsd: string;
    provider?: 'upshift' | 'ipor' | 'lagoon';
  };
}

export default function WithdrawFormVaultDetail({ vault }: WithdrawFormVaultDetailProps) {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransaction, sendTransactionAsync, isPending: isTxPending } = useSendTransaction();

  // Users input SHARES to withdraw
  const [sharesAmount, setSharesAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  const isWrongChain = vault?.chainId && currentChainId !== vault.chainId;
  const requiredChainName = vault?.chainId ? getNetworkConfig(vault.chainId)?.name || `Chain ${vault.chainId}` : '';
  const currentChainName = currentChainId ? getNetworkConfig(currentChainId)?.name || `Chain ${currentChainId}` : '';

  // Position and share price
  const { position, isLoading: isLoadingPosition, refetch: refetchPosition } = useVaultPosition({
    chainId: vault?.chainId || 1,
    vaultAddress: vault?.id || '',
    enabled: !!vault?.id && !!address
  });

  const { sharePrice, isLoading: isLoadingSharePrice } = useVaultSharePrice({
    chainId: vault?.chainId || 1,
    vaultAddress: vault?.id || '',
    underlyingDecimals: vault?.underlying.decimals,
    enabled: !!vault?.id
  });

  const expectedApy = vault?.apyNet ? formatPercentage(vault.apyNet) : '0.0%';

  // Calculate assets received = shares * sharePrice
  const assetsToReceive = sharesAmount && sharePrice
    ? (parseFloat(sharesAmount) * parseFloat(sharePrice)).toFixed(4)
    : '0.00';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSharesAmount(value);
    }
  };

  const handleMaxAmount = () => {
    if (position?.shares) {
      setSharesAmount(position.shares);
    }
  };

  const handleSwitchChain = async () => {
    if (!vault?.chainId || !switchChainAsync) {
      toast.error('Cannot switch chain - chain switching not available');
      return;
    }

    setIsSwitchingChain(true);
    const loadingToast = toast.loading('Switching network...');
    try {
      await switchChainAsync({ chainId: vault.chainId });
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.dismiss(loadingToast);
      toast.success(`Successfully switched to ${requiredChainName}`);
    } catch (error: any) {
      const errorMessage = error?.message || 'User rejected chain switch';
      toast.dismiss(loadingToast);
      toast.error(`Failed to switch chain: ${errorMessage}`);
    } finally {
      setIsSwitchingChain(false);
    }
  };

  const handleWithdraw = async () => {
    if (!sharesAmount || parseFloat(sharesAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!vault || !address) {
      toast.error('Wallet or vault not available');
      return;
    }

    setIsWithdrawing(true);
    const loadingToast = toast.loading('Processing withdrawal...');

    try {
      if (vault.chainId && currentChainId !== vault.chainId) {
        if (!switchChainAsync) {
          throw new Error(`Please switch your wallet to chain ${vault.chainId} (currently on ${currentChainId})`);
        }
        await switchChainAsync({ chainId: vault.chainId });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const withdrawUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/tx/withdraw`
        : '/api/tx/withdraw';

      const res = await fetch(withdrawUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          chain: vault.chainId,
          vault: vault.id,
          owner: address,
          shares: sharesAmount,
          provider: vault.provider // Pass provider so backend can use requestRedeem for Lagoon vaults
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        let data: any;
        try { data = JSON.parse(errorText); } catch { data = { error: errorText || 'Unknown error' }; }
        throw new Error(`Failed to build withdraw transaction: ${data.error || res.statusText} (${res.status})`);
      }
      
      const tx = await res.json();
      console.log('tx', tx);
      if (!tx.to || !tx.data) throw new Error('Invalid withdraw transaction response from server');
      if (!isAddress(tx.to)) throw new Error(`Invalid "to" address format: ${tx.to}`);
      const toAddress = getAddress(tx.to);

      if (sendTransactionAsync) {
        await sendTransactionAsync({
          to: toAddress,
          data: tx.data as `0x${string}`,
          value: BigInt(tx.value || '0')
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          sendTransaction({
            to: toAddress,
            data: tx.data as `0x${string}`,
            value: BigInt(tx.value || '0')
          }, {
            onSuccess: () => resolve(),
            onError: (error) => reject(error)
          });
        });
      }

      toast.dismiss(loadingToast);
      if (vault.provider === 'lagoon') {
        toast.success(`Redemption request submitted for ${sharesAmount} ${vault.symbol}. You'll need to claim your assets after settlement.`);
      } else if (vault.provider === 'upshift') {
        toast.success(`Redemption request submitted for ${sharesAmount} ${vault.symbol}. You'll need to claim your assets after the cooldown period.`);
      } else {
        toast.success(`Withdrawal submitted for ${sharesAmount} ${vault.symbol}`);
      }
      setSharesAmount('');
      // Refresh position to reflect updated shares
      try { await refetchPosition(); } catch {}
    } catch (error: any) {
      const errorMessage = error?.message || 'Withdrawal failed';
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className='w-full h-full md:p-5 p-[18px] md:rounded-[20px] rounded-[18.12px] bg-[#141414]'>
      {isWrongChain && (
        <div className='p-3 space-y-2 w-full rounded-lg border bg-yellow-500/20 border-yellow-500/50'>
          <div className='text-yellow-400 font-dm-sans text-[13px] font-medium leading-[120%]'>
            ⚠️ Wrong Network Detected
          </div>
          <div className='text-white/80 font-dm-sans text-[12px] leading-[140%]'>
            Your wallet is connected to <span className='font-semibold'>{currentChainName}</span>,
            but this vault requires <span className='font-semibold'>{requiredChainName}</span>.
          </div>
          <button
            onClick={handleSwitchChain}
            disabled={isSwitchingChain || !switchChainAsync}
            className='w-full bg-gradient-to-r from-[#A100FF] to-[#A100FF]/80 text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm'
          >
            {isSwitchingChain ? 'Switching...' : `Switch to ${requiredChainName}`}
          </button>
        </div>
      )}

      <div className='space-y-2.5 w-full md:mb-[17px] mb-[14px] md:py-3 py-2.5'>
        <div className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px]'>
          AMOUNT (Shares)
        </div>

        <div>
          <input
            type='text'
            value={sharesAmount}
            onChange={handleAmountChange}
            placeholder='0.00'
            className='md:h-[54px] h-[49.5px] w-full text-white font-dm-sans md:text-[19px] text-[17px] font-semibold outline-none placeholder-[#FFFFFF80] px-[15px] rounded-[23.77px] bg-[#FFFFFF0D] shadow-[0_0_0_0.6px_#ffffff47]'
          />
        </div>

        {isLoadingPosition ? (
          <div className='text-white/50 font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px]'>
            Loading balance...
          </div>
        ) : position?.shares ? (
          <div className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px]'>
            Balance: {position.shares} {vault?.symbol}
            <button
              onClick={handleMaxAmount}
              className='md:ml-2 ml-1 text-[#7E2BF5] underline underline-offset-2 hover:opacity-80'
            >
              Max
            </button>
          </div>
        ) : null}
      </div>

      <div className='space-y-2.5 w-full md:mb-[27px] mb-6 md:pt-3 pt-2.5'>
        <div className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px]'>
          ASSET
        </div>

        <div>
          <select
            value={vault?.underlying.symbol}
            disabled
            className='md:h-[54px] h-[49.5px] w-full text-white font-dm-sans md:text-[19px] text-[17px] font-semibold outline-none placeholder-[#FFFFFF80] px-[15px] rounded-[23.77px] bg-[#FFFFFF0D] shadow-[0_0_0_0.6px_#ffffff47]'
          >
            <option value={vault?.underlying.symbol} className='bg-gray-800'>
              {vault?.underlying.symbol}
            </option>
          </select>
        </div>
      </div>

      <div className='space-y-3 md:mb-[27px] mb-6'>
        <div className='flex justify-between items-center'>
          <span className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px]'>
            You will receive
          </span>

          <span className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px] space-x-1'>
            <span>{assetsToReceive}</span>
            <span>{vault?.underlying.symbol || '--'}</span>
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px]'>
            Share price
          </span>

          <span className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px] space-x-1'>
            {isLoadingSharePrice ? '...' : sharePrice || '1.00'}
            <span>{vault?.underlying.symbol || '--'}</span>
          </span>
        </div>

        <div className='w-full h-[1px] bg-white/50'></div>

        <div className='flex justify-between items-center px-2'>
          <span className='text-white font-dm-sans md:text-[13px] text-[12px] font-bold leading-none tracking-[-0.256px]'>
            Total
          </span>

          <span className='text-[#00F792] font-dm-sans md:text-[13px] text-[12px] font-bold leading-none tracking-[-0.256px]'>
            {sharesAmount || '0.00'} {vault?.symbol}
          </span>
        </div>
      </div>

      <div className='mb-5 w-full'>
        <div className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal tracking-[-0.256px] mb-4'>
          QUICK STATS
        </div>

        <div className='space-y-1.5'>
          <div className='flex justify-between items-center'>
            <span className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px]'>
              Your holdings
            </span>

            <span className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px]'>
              {isLoadingPosition ? 'Loading...' : position ? formatUsd(position.valueUsd) : '--'}
            </span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-white font-dm-sans md:text-[13px] text-[12px] font-normal leading-none tracking-[-0.256px]'>
              Expected APY
            </span>

            <span className='text-[#00F792] font-dm-sans md:text-[13px] text-[12px] font-bold leading-none tracking-[-0.256px]'>
              {expectedApy}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleWithdraw}
        disabled={
          isWithdrawing ||
          isTxPending ||
          isWrongChain ||
          !sharesAmount ||
          parseFloat(sharesAmount) <= 0 ||
          (position?.shares ? parseFloat(sharesAmount) > parseFloat(position.shares) : true)
        }
        className='w-full px-[28.44px] h-[40px] rounded-[10px] bg-gradient-purple text-white text-[15px] font-medium font-dm-sans hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isWithdrawing || isTxPending
          ? 'Processing...'
          : isWrongChain
            ? `Switch to ${requiredChainName} to Withdraw`
            : 'Withdraw'}
      </button>

      <p className='md:mt-4 mt-2.5 text-xs text-center text-white/50 font-modernist'>
        Expected settlement: 2 days
      </p>
    </div>
  );
}


