'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useChainId, useSwitchChain } from 'wagmi';
import { isAddress, getAddress } from 'viem';
import { formatPercentage, formatUsd } from '@/lib/normalize';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useVaultPosition } from '@/hooks/useVaultPosition';
import { useVaultSharePrice } from '@/hooks/useVaultSharePrice';
import { getNetworkConfig } from '@/lib/sdk';

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
  console.log('DepositFormVaultDetail => vault', vault);
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransaction, sendTransactionAsync, isPending: isTxPending } = useSendTransaction();
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(vault?.underlying.symbol || '');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  // Check if wallet is on the correct chain
  const isWrongChain = vault?.chainId && currentChainId !== vault.chainId;
  const requiredChainName = vault?.chainId ? getNetworkConfig(vault.chainId)?.name || `Chain ${vault.chainId}` : '';
  const currentChainName = currentChainId ? getNetworkConfig(currentChainId)?.name || `Chain ${currentChainId}` : '';

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

  // Fetch vault share price dynamically from contract
  const { sharePrice, isLoading: isLoadingSharePrice } = useVaultSharePrice({
    chainId: vault?.chainId || 1,
    vaultAddress: vault?.id || '',
    underlyingDecimals: vault?.underlying.decimals,
    enabled: !!vault?.id
  });

  const expectedApy = vault?.apyNet ? formatPercentage(vault.apyNet) : '0.0%';

  // Calculate shares to receive
  const sharesToReceive = amount && sharePrice ? (parseFloat(amount) / parseFloat(sharePrice)).toFixed(4) : '0.00';

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

  const handleSwitchChain = async () => {
    if (!vault?.chainId || !switchChainAsync) {
      alert('Cannot switch chain - chain switching not available');
      return;
    }

    setIsSwitchingChain(true);
    try {
      console.log('Switching chain from', currentChainId, 'to', vault.chainId);
      await switchChainAsync({ chainId: vault.chainId });
      // Wait a moment for the chain switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Chain switch completed');
      alert(`Successfully switched to ${requiredChainName}`);
    } catch (error: any) {
      console.error('Chain switch failed:', error);
      const errorMessage = error?.message || 'User rejected chain switch';
      alert(`Failed to switch chain: ${errorMessage}`);
    } finally {
      setIsSwitchingChain(false);
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
      console.log('Building approval transaction:', {
        chain: vault.chainId,
        token: vault.underlying.address,
        spender: vault.id,
        amount: amount
      });
      
      // Use absolute URL to avoid Next.js routing issues
      const approveUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/tx/approve`
        : '/api/tx/approve';
      
      console.log('Fetching from URL:', approveUrl);
      
      const approveRes = await fetch(approveUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          chain: vault.chainId,
          token: vault.underlying.address,
          spender: vault.id,
          amount: amount
        })
      });
      
      console.log('Approval response status:', approveRes.status, approveRes.statusText);
      console.log('Approval response headers:', Object.fromEntries(approveRes.headers.entries()));
      
      if (!approveRes.ok) {
        const errorText = await approveRes.text();
        console.error('Error response body:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        throw new Error(`Failed to build approval transaction: ${errorData.error || approveRes.statusText} (${approveRes.status})`);
      }
      
      const approveTx = await approveRes.json();
      console.log('Approval transaction response:', approveTx);
      
      // Check if we got the GET handler's response instead of POST handler's response
      if (approveTx.ok && approveTx.message) {
        console.error('Received GET handler response instead of POST:', approveTx);
        throw new Error('Server returned wrong response - POST request was handled by GET handler. This may be a Next.js routing issue.');
      }
      
      // Validate transaction data
      if (!approveTx.to || !approveTx.data) {
        console.error('Invalid approve transaction response:', approveTx);
        throw new Error('Invalid approval transaction response from server');
      }
      
      // Validate and normalize address using viem
      if (!isAddress(approveTx.to)) {
        console.error('Invalid address from API:', approveTx.to);
        throw new Error(`Invalid "to" address format: ${approveTx.to}`);
      }
      
      // Normalize address (checksum it properly)
      const toAddress = getAddress(approveTx.to);
      
      console.log('Approval transaction prepared:', {
        originalTo: approveTx.to,
        normalizedTo: toAddress,
        dataLength: approveTx.data?.length,
        value: approveTx.value
      });

      // Ensure wallet is on the correct chain before sending approval
      if (vault.chainId && currentChainId !== vault.chainId) {
        console.log('Wallet is on chain', currentChainId, 'but vault requires chain', vault.chainId);
        if (!switchChainAsync) {
          throw new Error(`Please switch your wallet to chain ${vault.chainId} (currently on ${currentChainId})`);
        }
        try {
          console.log('Switching chain from', currentChainId, 'to', vault.chainId);
          await switchChainAsync({ chainId: vault.chainId });
          // Wait a moment for the chain switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Chain switch completed');
        } catch (error: any) {
          throw new Error(`Failed to switch chain: ${error?.message || 'User rejected chain switch'}`);
        }
      }

      // Send approval transaction - use sendTransactionAsync if available, otherwise use callback pattern
      try {
        if (sendTransactionAsync) {
          await sendTransactionAsync({
            to: toAddress,
            data: approveTx.data as `0x${string}`,
            value: BigInt(approveTx.value || '0'),
          });
          console.log('Approval transaction sent successfully');
        } else {
          // Fallback to callback pattern if sendTransactionAsync not available
          await new Promise<void>((resolve, reject) => {
            sendTransaction({
              to: toAddress,
              data: approveTx.data as `0x${string}`,
              value: BigInt(approveTx.value || '0'),
            }, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            });
          });
        }
      } catch (error: any) {
        throw new Error(`Approval transaction failed: ${error?.message || 'User rejected or transaction failed'}`);
      }

      // Wait a bit for approval to be mined
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2) Build deposit tx
      const depositUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/tx/deposit`
        : '/api/tx/deposit';

      console.log('Fetching deposit from URL:', depositUrl);
      const depositRes = await fetch(depositUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          chain: vault.chainId,
          vault: vault.id,
          owner: address,
          amount: amount
        })
      });
      
      console.log('Deposit response status:', depositRes.status, depositRes.statusText);
      console.log('Deposit response headers:', Object.fromEntries(depositRes.headers.entries()));
      if (!depositRes.ok) {
        const errorText2 = await depositRes.text();
        console.error('Deposit error response body:', errorText2);
        let errorData2;
        try { errorData2 = JSON.parse(errorText2); } catch { errorData2 = { error: errorText2 || 'Unknown error' }; }
        throw new Error(`Failed to build deposit transaction: ${errorData2.error || depositRes.statusText} (${depositRes.status})`);
      }
      
      const depositTx = await depositRes.json();
      
      // Validate transaction data
      if (!depositTx.to || !depositTx.data) {
        console.error('Invalid deposit transaction response:', depositTx);
        throw new Error('Invalid deposit transaction response from server');
      }
      
      // Validate and normalize address using viem
      if (!isAddress(depositTx.to)) {
        console.error('Invalid address from API:', depositTx.to);
        throw new Error(`Invalid "to" address format: ${depositTx.to}`);
      }
      
      // Normalize address (checksum it properly)
      const depositToAddress = getAddress(depositTx.to);
      
      console.log('Deposit transaction prepared:', {
        originalTo: depositTx.to,
        normalizedTo: depositToAddress,
        dataLength: depositTx.data?.length,
        value: depositTx.value
      });

      // Ensure wallet is still on the correct chain before sending deposit
      // Note: We can't call hooks inside the handler, so we use currentChainId from component level
      // The chain should still be correct after approval, but we check anyway
      if (vault.chainId && currentChainId !== vault.chainId) {
        console.log('Wallet chain check before deposit. Current chain:', currentChainId, 'Required:', vault.chainId);
        if (!switchChainAsync) {
          throw new Error(`Please switch your wallet to chain ${vault.chainId} (currently on ${currentChainId})`);
        }
        try {
          console.log('Switching chain before deposit from', currentChainId, 'to', vault.chainId);
          await switchChainAsync({ chainId: vault.chainId });
          // Wait a moment for the chain switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Chain switch completed before deposit');
        } catch (error: any) {
          throw new Error(`Failed to switch chain before deposit: ${error?.message || 'User rejected chain switch'}`);
        }
      }

      // Send deposit transaction - use sendTransactionAsync if available, otherwise use callback pattern
      try {
        if (sendTransactionAsync) {
          await sendTransactionAsync({
            to: depositToAddress,
            data: depositTx.data as `0x${string}`,
            value: BigInt(depositTx.value || '0'),
          });
          console.log('Deposit transaction sent successfully');
        } else {
          // Fallback to callback pattern if sendTransactionAsync not available
          await new Promise<void>((resolve, reject) => {
            sendTransaction({
              to: depositToAddress,
              data: depositTx.data as `0x${string}`,
              value: BigInt(depositTx.value || '0'),
            }, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            });
          });
        }
      } catch (error: any) {
        throw new Error(`Deposit transaction failed: ${error?.message || 'User rejected or transaction failed'}`);
      }

      alert(`Successfully deposited ${amount} ${selectedAsset}!`);
      setAmount('');
      
    } catch (error: any) {
      console.error('Deposit failed:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
      console.error('Error details:', {
        message: errorMessage,
        error,
        vault: vault?.id,
        chain: vault?.chainId,
        amount
      });
      alert(`Deposit failed: ${errorMessage}`);
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className='w-[35.03%] p-[11px] rounded-[20px] shadow-[0_0_0_0.5px_#ffffff47] bg-[#090909e0] backdrop-blur-lg'>
      <div className='w-full h-full p-5 rounded-[20px] bg-[#FFFFFF0F]'>
        <h2 className='text-white font-dm-sans text-[17px] font-bold leading-[128%] tracking-[-0.344px] mb-[30px]'>
          Deposit
        </h2>

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

        <div className='space-y-2.5 w-full mb-8'>
          <div className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px]'>
            AMOUNT
          </div>

          <div>
            <input
              type='text'
              value={amount}
              onChange={handleAmountChange}
              placeholder='0.00'
              className='h-[54px] w-full text-white font-dm-sans text-[19px] font-semibold outline-none placeholder-[#FFFFFF80] px-[15px] rounded-[23.77px] bg-[#FFFFFF0D] shadow-[0_0_0_0.6px_#ffffff47]'
            />
          </div>

          {isLoadingBalance ? (
            <div className='text-white/50 font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px]'>
              Loading balance...
            </div>
          ) : balanceFormatted ? (
            <div className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px]'>
              Balance: {balanceFormatted} {selectedAsset}
            </div>
          ) : null}
        </div>

        <div className='space-y-2.5 w-full mb-[27px]'>
          <div className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px]'>
            ASSET
          </div>

          <div>
            <select
              value={selectedAsset}
              onChange={e => setSelectedAsset(e.target.value)}
              className='h-[54px] w-full text-white font-dm-sans text-[19px] font-semibold outline-none placeholder-[#FFFFFF80] px-[15px] rounded-[23.77px] bg-[#FFFFFF0D] shadow-[0_0_0_0.6px_#ffffff47]'
            >
              {availableAssets.map(asset => (
                <option key={asset.symbol} value={asset.symbol} className='bg-gray-800'>
                  {asset.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='space-y-3 mb-[27px]'>
          <div className='flex justify-between items-center'>
            <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px]'>
              You will receive
            </span>

            <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] space-x-1'>
              <span>{sharesToReceive}</span>
              <span>{vault?.symbol || '--'}</span>
            </span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px]'>
              Share price
            </span>

            <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] space-x-1'>
              {isLoadingSharePrice ? '...' : sharePrice || '1.00'}
              <span>{vault?.underlying.symbol || '--'}</span>
            </span>
          </div>

          <div className='w-full h-[1px] bg-white/50'></div>

          <div className='flex justify-between items-center px-2'>
            <span className='text-white font-dm-sans text-[13px] font-bold leading-none tracking-[-0.256px]'>
              Total
            </span>

            <span className='text-[#00F792] font-dm-sans text-[13px] font-bold leading-none tracking-[-0.256px]'>
              {amount || '0.00'} {selectedAsset}
            </span>
          </div>
        </div>

        <div className='mb-5 w-full'>
          <div className='text-white font-dm-sans text-[13px] font-normal tracking-[-0.256px] mb-4'>
            QUICK STATS
          </div>

          <div className='space-y-1.5'>
            <div className='flex justify-between items-center'>
              <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px]'>
                Your position
              </span>

              <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px]'>
                {isLoadingPosition ? 'Loading...' : userPosition}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px]'>
                Expected APY
              </span>

              <span className='text-[#00F792] font-dm-sans text-[13px] font-bold leading-none tracking-[-0.256px]'>
                {expectedApy}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDeposit}
          disabled={
            isDepositing ||
            isTxPending ||
            isWrongChain ||
            !amount ||
            parseFloat(amount) <= 0 ||
            !balanceFormatted ||
            parseFloat(amount) > parseFloat(balanceFormatted)
          }
          className='w-full px-[28.44px] h-[40px] rounded-[10px] bg-gradient-purple text-white text-[15px] font-medium font-dm-sans hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isDepositing || isTxPending
            ? 'Processing...'
            : isWrongChain
              ? `Switch to ${requiredChainName} to Deposit`
              : 'Deposit'}
        </button>
      </div>
    </div>
  );
}
