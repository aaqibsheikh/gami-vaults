export default function DeFiProtocols() {
  const protocols = [
    {
      name: 'Morpho',
      logo: '/assets/images/morpho.svg',
    },
    {
      name: 'Upshift',
      logo: '/assets/images/upshift.svg',
    },
    {
      name: 'Maven11',
      logo: '/assets/images/maven11.svg',
    },
    {
      name: 'Mev Capital',
      logo: '/assets/images/mev-capital.svg',
    },
    {
      name: 'Curve Finance',
      logo: '/assets/images/curve-finance.svg',
    },
    {
      name: 'Spectra Finance',
      logo: '/assets/images/spectra.svg',
    },
    {
      name: 'StakeDAO',
      logo: '/assets/images/stakedao.svg',
    },
  ];

  return (
    <section className="max-w-[1280px] mx-auto px-[84px] py-16">
      <div className="rounded-[20px] glass-border bg-white/6 p-10">
        <div className="space-y-7 flex flex-col items-center">
          <h2 className="font-modernist text-[40px] font-normal leading-[100%] tracking-[-0.8px] text-white text-center max-w-4xl">
            Powered by leading DeFi Protocols
          </h2>

          <p className="font-dm-sans text-[20px] font-light leading-[128%] tracking-[-0.4px] text-white text-center max-w-4xl">
            We are forming strategic partnerships with leading protocols in the industry to provide yields that meet institutional standards, ensuring that our clients benefit from top-tier financial opportunities.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 w-full justify-items-center">
            {protocols.map((protocol) => (
              <div key={protocol.name} className="flex flex-col items-center gap-2.5">
                <div className="w-[88px] h-[88px] rounded-[23px] border border-[#323232] overflow-hidden flex items-center justify-center bg-gray-900">
                  <img
                    src={protocol.logo}
                    alt={protocol.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.245px] text-white text-center">
                  {protocol.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
