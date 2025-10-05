import Link from 'next/link';
import { headers } from 'next/headers';
import { getSupportedNetworks } from '@/lib/sdk';

async function getStats() {
  try {
    const hdrs = await headers();
    const hostFromHeaders = hdrs.get('host');
    const vercelUrl = process.env.VERCEL_URL; // e.g. gami-vaults.vercel.app
    const host = hostFromHeaders || vercelUrl || 'localhost:3000';
    const proto = hdrs.get('x-forwarded-proto') || (vercelUrl ? 'https' : 'http');
    const base = `${proto}://${host}`;

    const res = await fetch(`${base}/api/stats`, { cache: 'no-store', next: { revalidate: 0 } });
    if (!res.ok) return null;
    return (await res.json()) as {
      totalTvlUsd: number;
      averageApy: number;
      activeVaults: number;
      networks: number;
    };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const supportedNetworks = getSupportedNetworks();
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Gami Capital</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/vaults" className="text-white hover:text-gray-300 transition-colors">
                Vaults
              </Link>
              <Link href="/portfolio" className="text-white hover:text-gray-300 transition-colors">
                Portfolio
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Institutional DeFi Vaults
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Professional-grade yield vaults for institutional allocators and DeFi users. 
            Discover flagship simple vaults and advanced strategies powered by Gami Capital's expertise.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/vaults"
              className="bg-green-600 hover:bg-green-700 text-white font-medium text-lg px-8 py-4 rounded-lg transition-colors"
            >
              Discover Vaults
            </Link>
            <Link
              href="/portfolio"
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium text-lg px-8 py-4 rounded-lg border border-gray-600 transition-colors"
            >
              View Portfolio
            </Link>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats ? `$${stats.totalTvlUsd.toLocaleString()}` : '—'}
              </div>
              <div className="text-gray-400">Total TVL</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">
                {stats ? `${(stats.averageApy).toFixed(2)}%` : '—'}
              </div>
              <div className="text-gray-400">Average APY</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">
                {stats ? stats.activeVaults : '—'}
              </div>
              <div className="text-gray-400">Active Vaults</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">
                {stats ? stats.networks : supportedNetworks.length}
              </div>
              <div className="text-gray-400">Networks</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Chain Support</h3>
            <p className="text-gray-300">
              Access vaults across Ethereum, Arbitrum, Optimism, and Base networks from a single interface.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Institutional-Grade</h3>
            <p className="text-gray-300">
              Professional strategies designed for institutional allocators with advanced risk management.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure & Audited</h3>
            <p className="text-gray-300">
              Built with security-first principles and regularly audited smart contracts.
            </p>
          </div>
        </div>

        {/* Supported Networks */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Supported Networks
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {supportedNetworks.map((chainId) => (
              <div key={chainId} className="text-center p-4 border border-gray-600 rounded-lg bg-gray-700">
                <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {chainId === 1 ? 'ETH' : 
                     chainId === 42161 ? 'ARB' : 
                     chainId === 10 ? 'OP' : 
                     chainId === 8453 ? 'BASE' : '?'}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">
                  {chainId === 1 ? 'Ethereum' : 
                   chainId === 42161 ? 'Arbitrum' : 
                   chainId === 10 ? 'Optimism' : 
                   chainId === 8453 ? 'Base' : `Chain ${chainId}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Connect your wallet and start earning institutional-grade yields across multiple networks.
          </p>
          <Link
            href="/vaults"
            className="bg-green-600 hover:bg-green-700 text-white font-medium text-lg px-8 py-4 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Gami Capital. Professional DeFi infrastructure.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
