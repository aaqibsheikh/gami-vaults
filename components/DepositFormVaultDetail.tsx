'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useChainId, useSwitchChain, useReadContract } from 'wagmi';
import { isAddress, getAddress, parseUnits } from 'viem';
import { formatPercentage, formatUsd } from '@/lib/normalize';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useVaultPosition } from '@/hooks/useVaultPosition';
import { useVaultSharePrice } from '@/hooks/useVaultSharePrice';
import { getNetworkConfig } from '@/lib/sdk';
import toast from 'react-hot-toast';

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
    provider?: 'upshift' | 'ipor' | 'lagoon';
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
  const [isApproving, setIsApproving] = useState(false);
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

  // Read ERC20 allowance: how much `vault.id` is allowed to spend from `address`
  const { data: allowanceData, refetch: refetchAllowance, isFetching: isFetchingAllowance } = useReadContract({
    address: (vault?.underlying.address || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    abi: [
      {
        inputs: [
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'address', name: 'spender', type: 'address' }
        ],
        name: 'allowance',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ] as const,
    functionName: 'allowance',
    args: [
      (address || '0x0000000000000000000000000000000000000000') as `0x${string}`,
      (vault?.id || '0x0000000000000000000000000000000000000000') as `0x${string}`
    ],
    query: {
      enabled: Boolean(vault?.underlying.address && vault?.id && address),
    }
  });

  const allowance = typeof allowanceData === 'bigint' ? allowanceData : BigInt(0);
  const requiredAmount = (() => {
    if (!amount || !vault?.underlying.decimals) return BigInt(0);
    try {
      return parseUnits(amount as `${string}`, vault.underlying.decimals);
    } catch {
      return BigInt(0);
    }
  })();
  const needsApproval = requiredAmount > BigInt(0) && allowance < requiredAmount;

  const handleSwitchChain = async () => {
    if (!vault?.chainId || !switchChainAsync) {
      toast.error('Cannot switch chain - chain switching not available');
      return;
    }

    setIsSwitchingChain(true);
    const loadingToast = toast.loading('Switching network...');
    try {
      console.log('Switching chain from', currentChainId, 'to', vault.chainId);
      await switchChainAsync({ chainId: vault.chainId });
      // Wait a moment for the chain switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Chain switch completed');
      toast.dismiss(loadingToast);
      toast.success(`Successfully switched to ${requiredChainName}`);
    } catch (error: any) {
      console.error('Chain switch failed:', error);
      const errorMessage = error?.message || 'User rejected chain switch';
      toast.dismiss(loadingToast);
      toast.error(`Failed to switch chain: ${errorMessage}`);
    } finally {
      setIsSwitchingChain(false);
    }
  };

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!vault || !address) {
      toast.error('Wallet or vault not available');
      return;
    }

    setIsApproving(true);
    const loadingToast = toast.loading('Approving transaction...');
    try {
      // Ensure correct chain
      if (vault.chainId && currentChainId !== vault.chainId) {
        if (!switchChainAsync) {
          throw new Error(`Please switch your wallet to chain ${vault.chainId} (currently on ${currentChainId})`);
        }
        await switchChainAsync({ chainId: vault.chainId });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Build approval tx
      const approveUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/tx/approve`
        : '/api/tx/approve';

      const approveRes = await fetch(approveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          chain: vault.chainId,
          token: vault.underlying.address,
          spender: vault.id,
          amount: amount
        })
      });
      if (!approveRes.ok) {
        const errorText = await approveRes.text();
        let errorData: any;
        try { errorData = JSON.parse(errorText); } catch { errorData = { error: errorText || 'Unknown error' }; }
        throw new Error(`Failed to build approval transaction: ${errorData.error || approveRes.statusText} (${approveRes.status})`);
      }
      const approveTx = await approveRes.json();
      if (!approveTx.to || !approveTx.data) throw new Error('Invalid approval transaction response from server');
      if (!isAddress(approveTx.to)) throw new Error(`Invalid "to" address format: ${approveTx.to}`);
      const toAddress = getAddress(approveTx.to);

      // Send approval
      if (sendTransactionAsync) {
        await sendTransactionAsync({
          to: toAddress,
          data: approveTx.data as `0x${string}`,
          value: BigInt(approveTx.value || '0'),
        });
      } else {
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

      // Wait briefly, then refresh allowance
      await new Promise(resolve => setTimeout(resolve, 3000));
      await refetchAllowance();
      toast.dismiss(loadingToast);
      toast.success('Approval successful. You can now deposit.');
    } catch (error: any) {
      const errorMessage = error?.message || 'Approval failed';
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!vault || !address) {
      toast.error('Wallet or vault not available');
      return;
    }

    setIsDepositing(true);
    const loadingToast = toast.loading('Processing deposit...');
    
    try {
      // Ensure correct chain before deposit
      if (vault.chainId && currentChainId !== vault.chainId) {
        if (!switchChainAsync) {
          throw new Error(`Please switch your wallet to chain ${vault.chainId} (currently on ${currentChainId})`);
        }
        await switchChainAsync({ chainId: vault.chainId });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Build deposit tx
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
          amount: amount,
          provider: vault.provider // Pass provider so backend can use requestDeposit for Lagoon vaults
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

      toast.dismiss(loadingToast);
      if (vault.provider === 'lagoon') {
        toast.success(`Deposit request submitted for ${amount} ${selectedAsset}. You'll receive shares after settlement.`);
      } else {
        toast.success(`Successfully deposited ${amount} ${selectedAsset}!`);
      }
      setAmount('');
      await refetchAllowance();
      
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
      toast.dismiss(loadingToast);
      toast.error(`Deposit failed: ${errorMessage}`);
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className='p-[11px] rounded-[20px] shadow-[0_0_0_0.5px_#ffffff47] bg-[#090909e0] backdrop-blur-lg'>
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
          onClick={needsApproval ? handleApprove : handleDeposit}
          disabled={
            isApproving ||
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
          {isApproving || isDepositing || isTxPending
            ? (needsApproval ? 'Approving...' : 'Processing...')
            : isWrongChain
              ? `Switch to ${requiredChainName} to ${needsApproval ? 'Approve' : 'Deposit'}`
              : (needsApproval ? 'Approve' : 'Deposit')}
        </button>
      </div>
    </div>
  );
}
