'use client';

import Link from 'next/link';
import { useVault } from '@/hooks/useVault';
import VaultDetail from '@/components/VaultDetail';
import VaultDetailsSections from '@/components/VaultDetailsSections';
import VaultTransparency from '@/components/VaultTransparency';
import VaultActivity from '@/components/VaultActivity';
import VaultDetailSkeleton from '@/components/VaultDetailSkeleton';
import Image from 'next/image';
import VaultActionTabs from '@/components/VaultActionTabs';
import { useState } from 'react';
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
  const [isRiskDisclosureOpen, setIsRiskDisclosureOpen] = useState(false);
  const [isLegalDisclosureOpen, setIsLegalDisclosureOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Contract address from vault data or default
  const contractAddress = vault?.id || '0xb742435C6634005329254308448b9759135af1';

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <>
      <Image
        src='/assets/images/vault-detail-glass.svg'
        alt='Vault detail glass'
        width={459}
        height={362}
        className='hidden absolute top-0 right-0 pointer-events-none md:block'
      />

      <section id='vaults' className='pt-6 pb-12 sm:pt-12'>
        {isLoading && <VaultDetailSkeleton />}

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

            <div className='flex lg:gap-16 gap-6 items-start w-full md:mt-[68px] mt-5'>
              <div className='lg:min-w-[58.89%] md:min-w-[55%] w-full'>
                <VaultDetailsSections vault={vault} />
              </div>

              <div className='hidden w-full md:block'>
                <VaultActionTabs vault={vault} />
              </div>
            </div>

            <div className='md:space-y-[30px] space-y-[25px] md:mt-[30px] mt-[25px]'>
              <VaultActivity vault={vault} />

              <VaultTransparency vault={vault} />

              <div className='rounded-[20.78px] border border-[#FF9C4680] bg-[#FF9C460F] md:p-[20px] py-5 px-5'>
                <button
                  onClick={() => setIsRiskDisclosureOpen(!isRiskDisclosureOpen)}
                  className='flex justify-between items-center w-full'
                >
                  <div className='text-white font-dm-sans md:text-[20px] text-[15.91px] font-bold flex items-baseline gap-1 leading-none'>
                    <div>
                      <Image
                        src='/assets/svgs/danger-icon.svg'
                        width={17}
                        height={15}
                        alt='Icon'
                        className='sm:w-[17px] w-[14.5px]'
                      />
                    </div>

                    <span>Risk Disclosure</span>
                  </div>

                  <svg
                    width='9'
                    height='14'
                    viewBox='0 0 9 14'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className={`transition-transform duration-300 ${!isRiskDisclosureOpen ? 'rotate-180' : ''}`}
                  >
                    <path
                      d='M8.7912 10.583L4.4996 6.27251L0.208008 10.583V7.70934L4.4996 3.41775L8.7912 7.70934V10.583Z'
                      fill='white'
                      fillOpacity='0.5'
                    />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isRiskDisclosureOpen ? 'mt-2 opacity-100 max-h-[500px]' : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className='md:pl-2 pl-3 space-y-0.5 list-disc list-inside'>
                    <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
                      Smart contract risk across multiple DeFi protocols
                    </li>

                    <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
                      Liquidation risk in leveraged positions
                    </li>

                    <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
                      Impermanent loss in liquidity provision strategies
                    </li>

                    <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
                      Oracle manipulation and price feed vulnerabilities
                    </li>

                    <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
                      Regulatory uncertainty in DeFi markets
                    </li>
                  </ul>
                </div>
              </div>

              <div className='rounded-[20.78px] border border-white bg-[#FFFFFF0D] md:p-[20px] py-5 px-5'>
                <button
                  onClick={() => setIsLegalDisclosureOpen(!isLegalDisclosureOpen)}
                  className='flex justify-between items-center w-full'
                >
                  <div className='text-white font-dm-sans md:text-[20px] text-[15.91px] font-bold flex items-baseline gap-1 leading-none'>
                    <div>
                      <Image
                        src='/assets/svgs/scale-icon.svg'
                        width={17}
                        height={15}
                        alt='Icon'
                        className='sm:w-[17px] w-[14.5px]'
                      />
                    </div>

                    <span>Legal Disclaimer</span>
                  </div>

                  <svg
                    width='9'
                    height='14'
                    viewBox='0 0 9 14'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className={`transition-transform duration-300 ${!isLegalDisclosureOpen ? 'rotate-180' : ''}`}
                  >
                    <path
                      d='M8.7912 10.583L4.4996 6.27251L0.208008 10.583V7.70934L4.4996 3.41775L8.7912 7.70934V10.583Z'
                      fill='white'
                      fillOpacity='0.5'
                    />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isLegalDisclosureOpen ? 'mt-2 opacity-100 max-h-[500px]' : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className='md:pl-2 pl-3 space-y-0.5 list-disc list-inside'>
                    <li className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px]'>
                      This vault involves significant risks, including smart contract
                      vulnerabilities, regulatory uncertainty, and potential loss of funds. By using
                      this vault, you acknowledge and agree to accept these risks. Consult with a
                      qualified financial advisor before participating.
                    </li>
                  </ul>
                </div>
              </div>

              <div className='space-y-1 md:space-y-5'>
                <div className='text-white font-modernist md:text-xl font-bold leading-[162%] tracking-[-0.4px]'>
                  Contract Information
                </div>

                <div className='rounded-[21px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] md:px-[23px] px-[14px] py-5 flex justify-between items-center gap-3'>
                  <div className='text-white font-dm-sans text-[16px] font-light leading-[128%] tracking-[-0.32px] break-all  '>
                    {contractAddress}
                  </div>

                  <button
                    onClick={handleCopyAddress}
                    className='rounded-[10px] border border-white/40 hover:bg-white/10 transition-colors h-[30px] px-2.5 flex-shrink-0'
                  >
                    <div className='text-[#FFFFFF80] font-dm-sans text-sm font-light leading-[128%] tracking-[-0.28px]'>
                      {copied ? 'Copied!' : 'Copy'}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
