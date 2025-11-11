'use client';

import Link from 'next/link';
import { useVault } from '@/hooks/useVault';
import { Loader } from '@/components/Loader';
import VaultDetail from '@/components/VaultDetail';
import VaultDetailsSections from '@/components/VaultDetailsSections';
import VaultTransparency from '@/components/VaultTransparency';
import Image from 'next/image';
import DepositFormVaultDetail from '@/components/DepositFormVaultDetail';
interface VaultDetailClientProps {
  chainId: string;
  vault: string;
}

export default function VaultDetailClient({
  chainId: chainIdParam,
  vault: vaultParam,
}: VaultDetailClientProps) {
  const chainId = parseInt(chainIdParam);
  const vaultId = vaultParam;

  const {
    data: vault,
    isLoading,
    error,
    refetch,
  } = useVault({
    chainId,
    vaultId,
    enabled: !isNaN(chainId) && !!vaultId,
  });

  if (isNaN(chainId)) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center'>
          <h1 className='mb-2 text-2xl font-bold text-white'>Invalid Chain ID</h1>

          <p className='mb-6 text-gray-300'>The provided chain ID is not valid.</p>

          <Link
            href='/vaults'
            className='px-4 py-2 font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700'
          >
            Back to Vaults
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Image
        src='/assets/images/vault-detail-glass.svg'
        alt='Vault detail glass'
        width={459}
        height={362}
        className='absolute top-0 right-0 pointer-events-none'
      />

      <section id='vaults' className='pt-12 pb-12'>
        {isLoading && (
          <div className='space-y-8'>
            <Loader label='Fetching vault details' />
          </div>
        )}

        {error && !isLoading && (
          <div className='py-12 text-center'>
            <div className='mb-4 text-red-500'>
              <svg
                className='mx-auto w-12 h-12'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>

            <h1 className='mb-4 text-2xl font-bold text-white'>Vault Not Found</h1>

            <p className='mb-6 text-gray-300'>{error.message}</p>

            <div className='space-x-4'>
              <button
                onClick={() => refetch()}
                className='px-4 py-2 font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700'
              >
                Try Again
              </button>

              <Link
                href='/vaults'
                className='px-4 py-2 font-medium text-white bg-gray-700 rounded-lg border border-gray-600 transition-colors hover:bg-gray-600'
              >
                Back to Vaults
              </Link>
            </div>
          </div>
        )}

        {vault && !isLoading && (
          <>
            <VaultDetail vault={vault} />

            <div className='flex gap-16 items-start w-full mt-[68px]'>
              <VaultDetailsSections vault={vault} />

              <DepositFormVaultDetail vault={vault} />
            </div>

            <VaultTransparency vault={vault} />
          </>
        )}
      </section>
    </>
  );
}
