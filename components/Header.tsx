'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleConnect = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsWalletMenuOpen(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'backdrop-blur-sm bg-black/80 border-white/10' : 'bg-transparent border-transparent'}`}
    >
      <div className='max-w-[1280px] mx-auto sm:py-5 py-[18px] xl:px-[84px] sm:px-4 px-[25px] flex items-center justify-between'>
        <Link
          href='/'
          className='hidden flex-shrink-0 transition-opacity hover:opacity-80 sm:block'
        >
          <Image src='/assets/svgs/gami-logo.svg' alt='Gami Logo' width={153} height={24} />
        </Link>

        <Link href='/' className='flex-shrink-0 transition-opacity hover:opacity-80 sm:hidden'>
          <Image src='/assets/svgs/gami-logo-sm.svg' alt='Gami Logo' width={61.5} height={18} />
        </Link>

        <nav className='hidden gap-5 items-center font-modernist sm:flex'>
          <Link
            href='/vaults'
            className='text-white text-[14px] leading-[21px] px-2 py-2.5 hover:opacity-80 transition-opacity'
          >
            Vaults
          </Link>

          <Link
            href='/portfolio'
            className='text-white text-[14px] leading-[21px] px-2 py-2.5 hover:opacity-80 transition-opacity'
          >
            Portfolio
          </Link>

          <Link
            href='/about'
            className='text-white text-[14px] leading-[21px] px-2 py-2.5 hover:opacity-80 transition-opacity'
          >
            About
          </Link>
        </nav>

        <div className='flex items-center gap-[14px]'>
          <div className='hidden lg:block'>
            <input
              type='text'
              placeholder='Search vaults...'
              className='bg-[#FFFFFF0F] text-white placeholder:text-white text-[14px] font-light font-dm-sans outline-none h-[41px] w-[268px] rounded-[10px] px-6 shadow-[0_0_0_0.4px_#ffffff47] backdrop-blur-lg'
            />
          </div>

          {mounted && isConnected ? (
            <>
              <div className='relative leading-none h-fit'>
                <button
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  className='sm:px-[20.67px] px-2 sm:h-[40.89px] h-[18.5px] sm:rounded-[10px] rounded-[4px] bg-gradient-purple text-white sm:text-[14.22px] text-[6.39px] font-medium font-dm-sans hover:opacity-90 transition-opacity'
                >
                  {truncateAddress(address || '')}
                </button>

                {isWalletMenuOpen && (
                  <div className='absolute right-0 z-50 mt-2 sm:w-48 w-[100px] bg-gray-800 rounded-lg border border-gray-700 shadow-lg'>
                    <div className='py-1'>
                      <button
                        onClick={handleDisconnect}
                        className='block sm:px-4 px-2 sm:py-2 py-1 w-full text-left text-white hover:bg-gray-700 sm:text-base text-[12px]'
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={handleConnect}
              className='sm:px-[28.44px] px-2 h-[18.5px] sm:h-[40.89px] sm:rounded-[10px] rounded-[4px] bg-gradient-purple text-white sm:text-[14.22px] text-[6.39px] font-medium font-dm-sans hover:opacity-90 transition-opacity'
            >
              Connect Wallet
            </button>
          )}

          <div className='sm:hidden'>
            <svg
              width='15'
              height='18'
              viewBox='0 0 15 18'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect width='15' height='4.5' rx='2.25' fill='white' />
              <rect y='6.5' width='15' height='4.5' rx='2.25' fill='white' />
              <rect y='13' width='15' height='4.5' rx='2.25' fill='white' />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
