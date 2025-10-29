export default function DeFiProtocols() {
  const structure = [
    {
      title: 'Protocols',
      items: [
        { name: 'Morpho', logo: '/assets/images/morpho.svg' },
        { name: 'Curve Finance', logo: '/assets/images/curve-finance.svg' },
        { name: 'Spectra Finance', logo: '/assets/images/spectra.svg' },
        { name: 'StakeDAO', logo: '/assets/images/stakedao.svg' },
      ],
    },
    {
      title: 'Partners',
      items: [
        { name: 'Maven11', logo: '/assets/images/maven11.svg' },
        { name: 'Mev Capital', logo: '/assets/images/mev-capital.svg' },
      ],
    },
    {
      title: 'Infrastructure',
      items: [
        { name: 'Upshift', logo: '/assets/images/upshift.svg' },
        { name: 'Morpho', logo: '/assets/images/morpho.svg' },
        { name: 'Curve Finance', logo: '/assets/images/curve-finance.svg' },
        { name: 'Spectra Finance', logo: '/assets/images/spectra.svg' },
      ],
    },
  ];

  return (
    <section className='max-w-[1280px] mx-auto px-[84px] pt-[35px]'>
      <div className='rounded-[20px] shadow-[0_0_0_0.5px_#ffffff47] px-[27px] py-[30px] bg-[#FFFFFF0F]'>
        <div className='flex flex-col items-center gap-[30px]'>
          <div className='space-y-7'>
            <h2 className='font-modernist text-[40px] font-normal leading-[100%] tracking-[-0.8px] text-white text-center'>
              Powered by leading DeFi Protocols
            </h2>

            <p className='font-dm-sans text-xl font-light leading-[128%] tracking-[-0.4px] text-white text-center'>
              We are forming strategic partnerships with leading protocols in the industry to
              provide yields that meet institutional standards, ensuring that our clients benefit
              from top-tier financial opportunities and infrastructures.
            </p>
          </div>

          <div className='flex gap-8 justify-between w-full'>
            {structure.map(section => (
              <div key={section.title} className='flex flex-col gap-5 items-center'>
                <h3 className='text-xl text-white capitalize font-dm-sans'>{section.title}</h3>

                <div className='flex gap-5 justify-center items-center'>
                  {section.items.map(item => (
                    <div
                      key={item.name}
                      className='flex items-center justify-center flex-col rounded-[16px] transition-colors gap-2.5'
                    >
                      <img
                        src={item.logo}
                        alt={item.name}
                        className='object-cover w-[70px] h-[70px] bg-[#1A1A1A] hover:bg-[#252525] rounded-[18px]'
                      />

                      <p className='text-[12.26px] leading-[110%] tracking-[-0.245px] text-white'>
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
