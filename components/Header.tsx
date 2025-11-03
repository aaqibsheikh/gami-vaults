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
      <div className='max-w-[1280px] mx-auto py-5 px-[84px] flex items-center justify-between'>
        <div>
          <Link href='/' className='transition-opacity hover:opacity-80'>
            <Image src='/assets/svgs/gami-logo.svg' alt='Gami Logo' width={153} height={24} />
          </Link>
        </div>

        <nav className='flex gap-5 items-center font-modernist'>
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
          <div>
            <input
              type='text'
              placeholder='Search vaults...'
              className='bg-[#FFFFFF0F] text-white placeholder:text-white text-[14px] font-light font-dm-sans outline-none h-[41px] w-[268px] rounded-[10px] px-6 shadow-[0_0_0_0.4px_#ffffff47] backdrop-blur-lg'
            />
          </div>

          <div className='relative'>
            {mounted && isConnected ? (
              <>
                <button
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  className='px-[20.67px] h-[40.89px] rounded-[10px] bg-gradient-purple text-white text-[14.22px] font-medium font-dm-sans hover:opacity-90 transition-opacity'
                >
                  {truncateAddress(address || '')}
                </button>

                {isWalletMenuOpen && (
                  <div className='absolute right-0 z-50 mt-2 w-48 bg-gray-800 rounded-lg border border-gray-700 shadow-lg'>
                    <div className='py-1'>
                      <button
                        onClick={handleDisconnect}
                        className='block px-4 py-2 w-full text-left text-white hover:bg-gray-700'
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleConnect}
                className='px-[28.44px] h-[40.89px] rounded-[10px] bg-gradient-purple text-white text-[14.22px] font-medium font-dm-sans hover:opacity-90 transition-opacity'
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
