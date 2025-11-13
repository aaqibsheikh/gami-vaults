'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useVaultActivity, VaultActivityType } from '@/hooks/useVaultActivity';

dayjs.extend(relativeTime);

interface VaultActivityProps {
  vault?: {
    id: string;
    chainId: number;
    provider?: 'upshift' | 'ipor' | 'lagoon';
    underlying: {
      symbol: string;
      address: string;
      decimals: number;
    };
  };
}

type ActivityFilter = 'all' | VaultActivityType;

const FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'deposit', label: 'Deposit' },
  { key: 'withdraw', label: 'Withdraw' },
  { key: 'valuation', label: 'Valuation' },
  { key: 'settlement', label: 'Settlement' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

const TYPE_META: Record<
  VaultActivityType,
  { dot: string; badgeBg: string; badgeText: string }
> = {
  deposit: {
    dot: 'bg-[#10B981]',
    badgeBg: 'bg-[#10B9811A]',
    badgeText: 'text-[#34D399]',
  },
  withdraw: {
    dot: 'bg-[#F87171]',
    badgeBg: 'bg-[#F871711A]',
    badgeText: 'text-[#FCA5A5]',
  },
  valuation: {
    dot: 'bg-[#3B82F6]',
    badgeBg: 'bg-[#3B82F61A]',
    badgeText: 'text-[#60A5FA]',
  },
  settlement: {
    dot: 'bg-[#A855F7]',
    badgeBg: 'bg-[#A855F71A]',
    badgeText: 'text-[#C084FC]',
  },
};

const EXPLORERS: Record<number, string> = {
  1: 'https://etherscan.io',
  42161: 'https://arbiscan.io',
  10: 'https://optimistic.etherscan.io',
  8453: 'https://basescan.org',
  43114: 'https://snowtrace.io',
  999: 'https://explorer.hyperliquid.xyz',
};

function getRelativeTime(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '--';
  return dayjs(timestamp).fromNow();
}

function ActivitySkeleton() {
  return (
    <div className='mt-4 space-y-4'>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className='h-[62px] rounded-xl bg-white/5 animate-pulse'
        />
      ))}
    </div>
  );
}

export default function VaultActivity({ vault }: VaultActivityProps) {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZE_OPTIONS[number]>(10);

  if (!vault) {
    return null;
  }

  const isLagoonVault = vault.provider === 'lagoon';
  const isLagoonMainnet =
    isLagoonVault && vault.chainId === 1;

  const {
    data: activity = [],
    isLoading,
    error,
    isRefetching,
  } = useVaultActivity({
    vaultAddress: vault.id,
    chainId: vault.chainId,
    provider: vault.provider,
    underlyingSymbol: vault.underlying.symbol,
    underlyingAddress: vault.underlying.address,
    underlyingDecimals: vault.underlying.decimals,
    enabled: isLagoonMainnet,
  });

  if (!isLagoonVault) {
    return null;
  }

  const filteredActivity = useMemo(() => {
    if (!activity.length) return [];
    if (activeFilter === 'all') return activity;
    return activity.filter((item) => item.type === activeFilter);
  }, [activity, activeFilter]);

  const totalPages = useMemo(() => {
    if (!filteredActivity.length) return 1;
    return Math.max(1, Math.ceil(filteredActivity.length / pageSize));
  }, [filteredActivity.length, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, pageSize, activity.length]);

  useEffect(() => {
    setPage((prev) => {
      if (prev > totalPages) {
        return totalPages;
      }
      if (prev < 1) {
        return 1;
      }
      return prev;
    });
  }, [totalPages]);

  const paginatedActivity = useMemo(() => {
    if (!filteredActivity.length) return [];
    const start = (page - 1) * pageSize;
    return filteredActivity.slice(start, start + pageSize);
  }, [filteredActivity, page, pageSize]);

  const showingStart = filteredActivity.length ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = filteredActivity.length
    ? Math.min(filteredActivity.length, page * pageSize)
    : 0;

  return (
    <div className='md:mt-10 mt-6 md:p-5 p-4 rounded-[20px] bg-[#FFFFFF0F] shadow-[0_0_0_0.8px_#ffffff26] backdrop-blur-lg'>
      <div className='flex flex-wrap gap-3 justify-between items-center mb-6'>
        <h2 className='text-white font-dm-sans md:text-[18px] text-[16px] font-bold leading-none tracking-[-0.4px]'>
          Activity
        </h2>

        <div className='flex flex-wrap gap-2'>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type='button'
                onClick={() => setActiveFilter(filter.key)}
                className={`flex h-9 px-4 items-center gap-2 rounded-full transition-colors ${
                  isActive
                    ? 'bg-[#A100FF2E] shadow-[0_0_0_0.5px_#A100FF]'
                    : 'bg-[#FFFFFF14] shadow-[0_0_0_0.5px_#ffffff33] hover:bg-white/15'
                }`}
              >
                <span className='text-white font-dm-sans text-[13px] font-medium leading-none'>
                  {filter.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!isLagoonMainnet && (
        <div className='text-white/60 font-dm-sans text-[14px]'>
          Activity data is currently available for Lagoon vaults on Ethereum
          mainnet.
        </div>
      )}

      {isLagoonMainnet && (
        <>
          {(isLoading || isRefetching) && !activity.length && <ActivitySkeleton />}

          {error && (
            <div className='p-4 mt-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm'>
              Failed to load activity: {error.message}
            </div>
          )}

          {!isLoading && !error && !filteredActivity.length && (
            <div className='p-6 mt-4 rounded-xl bg-white/5 text-white/60 text-sm'>
              No activity found for this vault yet.
            </div>
          )}

          {filteredActivity.length > 0 && (
            <div className='overflow-x-auto'>
              <div className='min-w-[640px] space-y-2'>
                <div className='grid grid-cols-[1.5fr_1fr_1.2fr_auto] gap-4 px-4 py-2 text-white/50 font-dm-sans text-[12px] uppercase tracking-[0.2em]'>
                  <span>Address</span>
                  <span>Operation</span>
                  <span>Tx Details</span>
                  <span className='text-right'>Time</span>
                </div>

                <div className='divide-y divide-white/10 rounded-2xl bg-[#090909aa]'>
                  {paginatedActivity.map((item) => {
                    const meta = TYPE_META[item.type];
                    const explorer = EXPLORERS[vault.chainId];
                    const txUrl = explorer ? `${explorer}/tx/${item.txHash}` : null;

                    return (
                      <div
                        key={item.id}
                        className='grid grid-cols-[1.5fr_1fr_1.2fr_auto] gap-4 px-4 py-4 items-center'
                      >
                        <div className='space-y-1'>
                          <div className='text-white font-dm-sans text-[14px] font-semibold leading-snug'>
                            {item.addressLabel}
                          </div>
                          {item.address && (
                            <div className='text-white/40 font-dm-sans text-[12px] leading-snug'>
                              {item.address}
                            </div>
                          )}
                        </div>

                        <div>
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-dm-sans text-[12px] font-medium ${meta.badgeBg} ${meta.badgeText}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${meta.dot}`}
                            />
                            {item.label}
                          </span>
                        </div>

                        <div className='space-y-1'>
                          <div className='text-white font-dm-sans text-[14px] font-semibold leading-snug'>
                            {item.amountTokenFormatted}
                          </div>
                          {item.amountUsdFormatted && (
                            <div className='text-white/50 font-dm-sans text-[12px] leading-snug'>
                              {item.amountUsdFormatted}
                            </div>
                          )}
                        </div>

                        <div className='flex justify-end'>
                          {txUrl ? (
                            <Link
                              href={txUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='flex items-center gap-2 text-white/70 font-dm-sans text-[12px] hover:text-white transition-colors'
                            >
                              {getRelativeTime(item.timestamp)}
                              <svg
                                className='w-3.5 h-3.5'
                                viewBox='0 0 16 16'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M5.333 10.667 10.667 5.333M10.667 5.333H5.333M10.667 5.333v5.334'
                                  stroke='currentColor'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                              </svg>
                            </Link>
                          ) : (
                            <span className='text-white/60 font-dm-sans text-[12px]'>
                              {getRelativeTime(item.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className='flex flex-wrap items-center justify-between gap-3 px-2 py-3 rounded-xl bg-white/5'>
                  <div className='flex items-center gap-2 text-white/60 font-dm-sans text-[12px]'>
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(event) =>
                        setPageSize(Number(event.target.value) as typeof PAGE_SIZE_OPTIONS[number])
                      }
                      className='bg-[#0F0F0F] border border-white/10 text-white text-[12px] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#A100FF]'
                    >
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='text-white/60 font-dm-sans text-[12px]'>
                    Showing {showingStart}-{showingEnd} of {filteredActivity.length}
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1 text-[12px] font-medium transition-colors ${
                        page <= 1
                          ? 'text-white/30 bg-white/5 cursor-not-allowed'
                          : 'text-white bg-[#FFFFFF14] hover:bg-white/20'
                      }`}
                    >
                      Prev
                    </button>
                    <span className='text-white/70 text-[12px] font-dm-sans'>
                      {page} / {totalPages}
                    </span>
                    <button
                      type='button'
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page >= totalPages}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1 text-[12px] font-medium transition-colors ${
                        page >= totalPages
                          ? 'text-white/30 bg-white/5 cursor-not-allowed'
                          : 'text-white bg-[#FFFFFF14] hover:bg-white/20'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

