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

const tabs = ['Deposit', 'Withdraw'];

export default function VaultActionTabs({ vault }: VaultActionTabsProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  return (
    <div className='md:p-[11px] p-2.5 md:rounded-[20px] rounded-[18.12px] shadow-[0_0_0_0.5px_#ffffff47] bg-[#FFFFFF0F] backdrop-blur-lg w-full'>
      <div className='flex items-center gap-3 mb-[8.7px]'>
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`flex md:h-10 h-[36px] px-2.5 justify-center items-center rounded-[21.27px] backdrop-blur-lg ${
              activeTab === tab.toLowerCase()
                ? 'shadow-[0_0_0_1px_#A100FF] bg-[#A100FF2E]'
                : 'shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] hover:bg-white/10'
            } transition-colors`}
            onClick={() => setActiveTab(tab.toLowerCase() as 'deposit' | 'withdraw')}
          >
            <div className='text-white font-dm-sans md:text-[17px] font-medium leading-none'>
              {tab}
            </div>
          </button>
        ))}
      </div>

      {activeTab === 'deposit' ? (
        <DepositFormVaultDetail vault={vault} />
      ) : (
        <WithdrawFormVaultDetail vault={vault} />
      )}
    </div>
  );
}


