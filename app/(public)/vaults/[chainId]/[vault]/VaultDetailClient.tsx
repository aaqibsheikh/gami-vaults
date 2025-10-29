'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useVault } from '@/hooks/useVault';
import { Loader } from '@/components/Loader';
import VaultDetail from '@/components/VaultDetail';
import VaultDetailsSections from '@/components/VaultDetailsSections';
import DepositFormVaultDetail from '@/components/DepositFormVaultDetail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getNetworkConfig } from '@/lib/sdk';

interface VaultDetailClientProps {
  chainId: string;
  vault: string;
}

export default function VaultDetailClient({ chainId: chainIdParam, vault: vaultParam }: VaultDetailClientProps) {
  const chainId = parseInt(chainIdParam);
  const vaultId = vaultParam;

  const { data: vault, isLoading, error, refetch } = useVault({
    chainId,
    vaultId,
    enabled: !isNaN(chainId) && !!vaultId
  });

  const network = getNetworkConfig(chainId);

  if (isNaN(chainId)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Chain ID</h1>
          <p className="text-gray-300 mb-6">The provided chain ID is not valid.</p>
          <Link href="/vaults" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Back to Vaults
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <section id="vaults" className="w-full relative pt-32 pb-12 overflow-hidden">
        <img
          src="/assets/images/vault-detail-glass.svg"
          alt=""
          className="absolute right-0 top-[-175px] w-[390px] h-[655px] object-contain pointer-events-none"
        />
        
        <div className="max-w-[1280px] mx-auto px-[84px] flex flex-col items-center gap-10 relative z-10">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-8">
              <Loader label="Fetching vault details" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Vault Not Found</h1>
              <p className="text-gray-300 mb-6">{error.message}</p>
              <div className="space-x-4">
                <button
                  onClick={() => refetch()}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <Link href="/vaults" className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg border border-gray-600 transition-colors">
                  Back to Vaults
                </Link>
              </div>
            </div>
          )}

          {/* Vault Content */}
          {vault && !isLoading && (
            <>
              <VaultDetail vault={vault} />
              
              <div className="flex items-start gap-16 w-full">
                <VaultDetailsSections vault={vault} />
                <DepositFormVaultDetail vault={vault} />
              </div>
            </>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

