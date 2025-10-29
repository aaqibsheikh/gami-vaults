'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Link from 'next/link';

export default function Header() {
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-[1280px] mx-auto py-5 px-[84px] flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/assets/images/gami-logo.svg" alt="Gami Labs" className="" />
          </Link>
        </div>

        <nav className="flex items-center gap-5">
          <Link
            href="/vaults"
            className="text-white font-dm-sans text-[14px] font-normal leading-[21px] px-2 py-3 hover:opacity-80 transition-opacity"
          >
            Vaults
          </Link>
          <Link
            href="/portfolio"
            className="text-white font-dm-sans text-[14px] font-normal leading-[21px] px-2 py-3 hover:opacity-80 transition-opacity"
          >
            Portfolio
          </Link>
          <Link
            href="#about"
            className="text-white font-dm-sans text-[14px] font-normal leading-[21px] px-2 py-3 hover:opacity-80 transition-opacity"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-[14px]">
          <div className="flex items-center gap-3 px-4 py-2 rounded-[32px] glass-border bg-white/6">
            <input
              type="text"
              placeholder="Search vaults..."
              className="bg-transparent text-white text-[14px] font-light font-dm-sans outline-none placeholder:text-white/70 w-60"
            />
          </div>
          
          {/* Network Selector */}
          {/* <div className="flex items-center gap-2 px-3 py-2 rounded-[32px] glass-border bg-white/6">
            <span className="text-white text-[14px] font-medium">Ethereum</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div> */}

          {/* Wallet Balance */}
          {/* <div className="flex items-center gap-2 px-3 py-2 rounded-[32px] glass-border bg-white/6">
            <span className="text-white text-[14px] font-medium">$15,700</span>
          </div> */}

          <div className="relative">
            {mounted && isConnected ? (
              <>
                <button 
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  className="px-6 py-2 rounded-[36px] bg-gradient-purple text-white text-[14px] font-medium font-dm-sans hover:opacity-90 transition-opacity"
                >
                  {truncateAddress(address || '')}
                </button>
                {isWalletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={handleDisconnect}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
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
                className="px-6 py-2 rounded-[36px] bg-gradient-purple text-white text-[14px] font-medium font-dm-sans hover:opacity-90 transition-opacity"
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
