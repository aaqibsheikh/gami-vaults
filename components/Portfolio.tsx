export default function Portfolio() {
  const positions = [
    { name: 'Flagship ETH Vault', deposited: '$5,000', current: '$5,400', earned: '+$400' },
    { name: 'Stable Yield Vault', deposited: '$5,000', current: '$5,400', earned: '+$400' },
  ];

  const transactions = [
    { date: 'Oct 12, 2025', vault: 'Flagship ETH Vault', action: 'Deposit', amount: '$5,240', status: 'Completed' },
    { date: 'Oct 12, 2025', vault: 'Flagship ETH Vault', action: 'Deposit', amount: '$5,240', status: 'Completed' },
    { date: 'Oct 12, 2025', vault: 'Flagship ETH Vault', action: 'Deposit', amount: '$5,240', status: 'Completed' },
    { date: 'Oct 12, 2025', vault: 'Flagship ETH Vault', action: 'Deposit', amount: '$5,240', status: 'Completed' },
  ];

  return (
    <section id="portfolio" className="max-w-[1280px] mx-auto px-[84px] py-6 space-y-6">
      <h2 className="font-modernist text-[34px] font-normal leading-[100%] tracking-[-0.685px] text-white">
        Portfolio
      </h2>
      <p className="font-dm-sans text-[20px] font-light leading-[128%] tracking-[-0.4px] text-white">
        Track your positons and performance across all vaults
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {positions.map((position, index) => (
            <div key={index} className="p-3 rounded-[28px] glass-border bg-white/6">
              <div className="p-5 rounded-[22px] bg-gradient-to-b from-gami-dark-alt to-gami-dark-alt space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-dm-sans text-[17px] font-bold leading-[128%] tracking-[-0.344px] text-white">
                      {position.name}
                    </h3>
                    <p className="font-dm-sans text-[13px] font-light leading-[128%] tracking-[-0.26px] text-white">
                      Active position
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-[7px] bg-gami-dark-card text-white font-dm-sans text-[10px] font-medium leading-[128%] tracking-[-0.204px]">
                    Flagship
                  </span>
                </div>

                <div className="py-8 px-5 flex items-center justify-center gap-[89px]">
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-dm-sans text-[11px] font-normal leading-[110%] tracking-[-0.215px] text-white uppercase">
                      Deposited
                    </p>
                    <h4 className="font-modernist text-[23px] font-bold leading-[110%] tracking-[-0.464px] text-white">
                      {position.deposited}
                    </h4>
                  </div>

                  <div className="h-[13px] w-px bg-white"></div>

                  <div className="flex flex-col items-center gap-2">
                    <p className="font-dm-sans text-[11px] font-normal leading-[110%] tracking-[-0.215px] text-white uppercase">
                      Current Value
                    </p>
                    <h4 className="font-modernist text-[23px] font-bold leading-[110%] tracking-[-0.464px] text-white">
                      {position.current}
                    </h4>
                  </div>

                  <div className="h-[13px] w-px bg-white"></div>

                  <div className="flex flex-col items-center gap-2">
                    <p className="font-dm-sans text-[11px] font-normal leading-[110%] tracking-[-0.215px] text-white uppercase">
                      Earned
                    </p>
                    <h4 className="font-modernist text-[23px] font-bold leading-[110%] tracking-[-0.464px] text-white">
                      {position.earned}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button className="flex-1 py-3 px-3 rounded-[38px] bg-gradient-purple text-white font-dm-sans text-[15px] font-bold leading-[150%] hover:opacity-90 transition-opacity">
                    Add Funds
                  </button>
                  <button className="flex-1 py-3 px-3 rounded-[38px] border glass-border bg-white/5 text-white font-dm-sans text-[15px] font-normal leading-[150%] hover:bg-white/10 transition-colors">
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-[28px] glass bg-white/6">
          <div className="p-5 rounded-[22px] bg-gradient-to-b from-gami-dark-alt to-gami-dark-alt h-full flex flex-col items-center justify-between space-y-5">
            <h3 className="font-dm-sans text-[17px] font-bold leading-[128%] tracking-[-0.344px] text-white self-start">
              Allocation Breakdown
            </h3>

            <div className="flex-1 flex items-center justify-center py-8 px-5 rounded-[26px] bg-white/6 w-full">
              <p className="font-dm-sans text-[11px] font-normal leading-[110%] tracking-[-0.215px] text-white text-center">
                Pie Chart or 3d image of a vault
              </p>
            </div>

            <div className="space-y-3 w-full">
              <p className="font-dm-sans text-[11px] font-normal leading-[110%] tracking-[-0.215px] text-white text-center uppercase">
                Total Portfolio Value
              </p>
              <h2 className="font-dm-sans text-[32px] font-bold leading-[72%] text-white text-center">
                $15,700
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-[28px] glass bg-white/6">
        <div className="p-5 rounded-[22px] bg-gradient-to-b from-gami-dark-alt to-gami-dark-alt space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-dm-sans text-[17px] font-bold leading-[128%] tracking-[-0.344px] text-white">
                Transaction History
              </h3>
              <p className="font-dm-sans text-[13px] font-light leading-[128%] tracking-[-0.26px] text-white">
                Active position
              </p>
            </div>
            <button className="px-2 py-1 rounded-[7px] bg-gami-dark-card text-white font-dm-sans text-[10px] font-medium leading-[128%] tracking-[-0.204px] hover:bg-gami-dark-card/80 transition-colors">
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/50">
                  <th className="py-2 text-white font-dm-sans text-[13px] font-bold text-center">DATE</th>
                  <th className="py-2 text-white font-dm-sans text-[13px] font-bold text-center">VAULT</th>
                  <th className="py-2 text-white font-dm-sans text-[13px] font-bold text-center">ACTION</th>
                  <th className="py-2 text-white font-dm-sans text-[13px] font-bold text-center">AMOUNT</th>
                  <th className="py-2 text-white font-dm-sans text-[13px] font-bold text-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b border-white/50 last:border-0">
                    <td className="py-3 text-white font-dm-sans text-[13px] font-normal text-center">{tx.date}</td>
                    <td className="py-3 text-white font-dm-sans text-[13px] font-normal text-center">{tx.vault}</td>
                    <td className="py-3 text-white font-dm-sans text-[13px] font-normal text-center">{tx.action}</td>
                    <td className="py-3 text-white font-dm-sans text-[13px] font-bold text-center">{tx.amount}</td>
                    <td className="py-3 text-gami-green font-dm-sans text-[13px] font-normal text-center">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

