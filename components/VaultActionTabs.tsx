'use client';

import { useState } from 'react';
import DepositFormVaultDetail from './DepositFormVaultDetail';
import WithdrawFormVaultDetail from './WithdrawFormVaultDetail';

interface VaultActionTabsProps {
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

// Re-export the same interface for consistency
export type { VaultActionTabsProps };

export default function VaultActionTabs({ vault }: VaultActionTabsProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  return (
    <div className='w-full'>
      <div className='flex gap-3 mb-3'>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`px-5 h-[40px] rounded-[20px] text-[15px] font-dm-sans font-medium transition ${
            activeTab === 'deposit' ? 'bg-[#7E2BF5] text-white' : 'bg-[#2A2A2A] text-white/70'
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`px-5 h-[40px] rounded-[20px] text-[15px] font-dm-sans font-medium transition ${
            activeTab === 'withdraw' ? 'bg-[#7E2BF5] text-white' : 'bg-[#2A2A2A] text-white/70'
          }`}
        >
          Withdraw
        </button>
      </div>

      {activeTab === 'deposit' ? (
        <DepositFormVaultDetail vault={vault} />
      ) : (
        <WithdrawFormVaultDetail vault={vault} />
      )}
    </div>
  );
}


