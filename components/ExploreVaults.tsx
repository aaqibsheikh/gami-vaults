import SimpleVaultCard from './SimpleVaultCard';

export default function ExploreVaults() {
  const vaults = [
    {
      title: 'Flagship ETH Vault',
      badge: 'Flagship',
      badgeColor: '#2C2929',
      apy: '12.4%',
      tvl: '1.2M',
      tokens: ['ETH', 'USDC', 'USDC'],
    },
    {
      title: 'Flagship ETH Vault',
      badge: 'Flagship',
      badgeColor: '#2C2929',
      apy: '12.4%',
      tvl: '1.2M',
      tokens: ['ETH', 'USDC', 'DAI'],
    },
    {
      title: 'Flagship ETH Vault',
      badge: 'Advanced',
      badgeColor: '#C4511F',
      apy: '12.4%',
      tvl: '1.2M',
      tokens: ['ETH', 'WBTC', 'Airdrop'],
    },
  ];

  const tabs = ['All Vaults', 'Flagship', 'Advanced', 'Partner'];

  return (
    <section id="vaults" className="max-w-[1280px] mx-auto px-[84px] py-6">
      <div className="space-y-7">
        <h2 className="font-modernist text-[36px] font-normal leading-[100%] tracking-[-0.712px] text-white">
          Explore Vaults
        </h2>

        <div className="rounded-[21px] glass-border bg-white/6 p-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-[21px] text-white font-dm-sans text-[14px] font-light leading-[150%] transition-all ${
                    index === 0
                      ? 'border border-[#A100FF] bg-white/6'
                      : 'glass-border bg-white/6 hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button className="px-4 py-2 rounded-[19px] glass-border bg-white/6 text-white font-dm-sans text-[14px] font-light leading-[150%] flex items-center gap-2 hover:bg-white/10 transition-colors">
              <span>Sort by: Highest APY</span>
              <span className="rotate-90">{'>'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault, index) => (
            <SimpleVaultCard key={index} {...vault} />
          ))}
        </div>
      </div>
    </section>
  );
}

