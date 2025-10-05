/**
 * Header component matching Upshift design
 */

'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function Header() {
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isChainMenuOpen, setIsChainMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Avoid hydration mismatch by deferring wallet state-dependent UI until mounted
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
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              Gami Capital
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/vaults" className="text-white hover:text-gray-300 transition-colors">
              Vaults
            </a>
            <a href="/portfolio" className="text-white hover:text-gray-300 transition-colors">
              Portfolio
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              About
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              Contact
            </a>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            {/* Chain selector */}
            <div className="relative">
              <button
                onClick={() => setIsChainMenuOpen(!isChainMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span>Ethereum</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isChainMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-white hover:bg-gray-700">
                      Ethereum
                    </a>
                    <a href="#" className="block px-4 py-2 text-white hover:bg-gray-700">
                      Arbitrum
                    </a>
                    <a href="#" className="block px-4 py-2 text-white hover:bg-gray-700">
                      Optimism
                    </a>
                    <a href="#" className="block px-4 py-2 text-white hover:bg-gray-700">
                      Base
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet connection */}
            <div className="relative">
              {mounted && isConnected ? (
                <button
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {truncateAddress(address || '')}
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Connect Wallet
                </button>
              )}

              {mounted && isWalletMenuOpen && isConnected && (
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
