'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleConnect = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsWalletMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'backdrop-blur-sm bg-black/80 border-white/10' : 'bg-transparent border-transparent'}`}
      >
        <div className='max-w-[1280px] mx-auto sm:py-5 py-[18px] xl:px-[84px] sm:px-4 px-[25px] flex items-center justify-between'>
          <Link
            href='/'
            className='hidden flex-shrink-0 transition-opacity hover:opacity-80 sm:block'
          >
            <Image
              src='/assets/svgs/gami-logo.svg'
              alt='Gami Logo'
              width={153}
              height={24}
              priority
            />
          </Link>

          <Link href='/' className='flex-shrink-0 transition-opacity hover:opacity-80 sm:hidden'>
            <Image
              src='/assets/svgs/gami-logo-sm.svg'
              alt='Gami Logo'
              width={61.5}
              height={18}
              priority
            />
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

            <button onClick={handleMobileMenuToggle} className='sm:hidden'>
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
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className='fixed inset-0 z-50 px-5 py-[14px] h-dvh'>
          <div className='bg-[#141414] rounded-[19.02px] p-[19.02px] w-full space-y-[19px] relative z-10'>
            <div className='flex justify-between items-center'>
              <Link
                href='/'
                onClick={handleCloseMobileMenu}
                className='flex-shrink-0 transition-opacity hover:opacity-80 sm:hidden'
              >
                <Image
                  src='/assets/svgs/gami-logo-sm.svg'
                  alt='Gami Logo'
                  width={61.5}
                  height={18}
                  priority
                />
              </Link>

              <button onClick={handleCloseMobileMenu}>
                <svg
                  width='23'
                  height='20'
                  viewBox='0 0 23 20'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M9.50781 4.07446L21.8685 15.8171'
                    stroke='white'
                    strokeWidth='0.618033'
                  />
                  <path
                    d='M21.8682 3.45654L9.50751 15.8172'
                    stroke='white'
                    strokeWidth='0.618033'
                  />
                </svg>
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <input
                  type='text'
                  placeholder='Search vaults...'
                  className='h-[51px] w-full text-white font-dm-sans text-[17.98px] font-semibold outline-none placeholder-[#FFFFFF80] px-[15px] rounded-[22.6px] bg-[#FFFFFF0D] shadow-[0_0_0_0.6px_#ffffff47]'
                />
              </div>

              {/* <div>
              <select className='h-[51px] w-full text-white font-dm-sans text-[17.98px] font-semibold outline-none placeholder-[#FFFFFF80] px-[15px] rounded-[22.6px] bg-[#FFFFFF0D] shadow-[0_0_0_0.6px_#ffffff47]'>
                <option value='all'>All</option>
              </select>
            </div> */}
            </div>

            <nav className='flex flex-col gap-y-[19px] justify-center items-center text-center'>
              <Link
                href='/vaults'
                onClick={handleCloseMobileMenu}
                className='text-white text-[14px] leading-[21px] px-2 py-1 hover:opacity-80 transition-opacity w-full'
              >
                Vaults
              </Link>

              <Link
                href='/portfolio'
                onClick={handleCloseMobileMenu}
                className='text-white text-[14px] leading-[21px] px-2 py-1 hover:opacity-80 transition-opacity w-full'
              >
                Portfolio
              </Link>

              <Link
                href='/about'
                onClick={handleCloseMobileMenu}
                className='text-white text-[14px] leading-[21px] px-2 py-1 hover:opacity-80 transition-opacity w-full'
              >
                About
              </Link>
            </nav>

            {mounted && isConnected ? (
              <>
                <div className='relative leading-none h-fit'>
                  <button
                    onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                    className='px-[28.44px] h-[29.48px] rounded-[10px] bg-gradient-purple text-white text-[14.26px] font-medium font-dm-sans hover:opacity-90 transition-opacity w-full'
                  >
                    {truncateAddress(address || '')}
                  </button>

                  {isWalletMenuOpen && (
                    <div className='absolute right-0 z-50 mt-2 w-full bg-gray-800 rounded-lg border border-gray-700 shadow-lg sm:w-48'>
                      <div className='py-1'>
                        <button
                          onClick={handleDisconnect}
                          className='block px-4 py-2 w-full text-base text-left text-white hover:bg-gray-700'
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
                className='px-[28.44px] h-[29.48px] rounded-[10px] bg-gradient-purple text-white text-[14.26px] font-medium font-dm-sans hover:opacity-90 transition-opacity w-full'
              >
                Connect Wallet
              </button>
            )}
          </div>

          <div
            className='absolute inset-0 backdrop-blur-sm bg-black/10'
            onClick={handleCloseMobileMenu}
          ></div>
        </div>
      )}
    </>
  );
}
