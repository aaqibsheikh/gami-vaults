import Image from 'next/image';

export default function DeFiProtocols() {
  const structure = [
    {
      title: 'Protocols',
      classes: 'xl:-mr-[90px]',
      items: [
        { name: 'Morpho', logo: '/assets/images/morpho.svg' },
        { name: 'Curve Finance', logo: '/assets/images/curve-finance.svg' },
        { name: 'Spectra Finance', logo: '/assets/images/spectra.svg' },
        { name: 'StakeDAO', logo: '/assets/images/stakedao.svg' },
      ],
    },
    {
      title: 'Infrastructure',
      items: [
        { name: 'Lagoon', logo: '/assets/images/lagoon.svg' },
        { name: 'Upshift', logo: '/assets/images/upshift.svg' },
        { name: 'Hypernative', logo: '/assets/svgs/hypernative.svg' },
        { name: 'Nexus Mutual', logo: '/assets/svgs/nexus-mutual.svg' },
        { name: 'Fordefi', logo: '/assets/svgs/fordefi.svg' },
      ],
    },
  ];

  return (
    <section className='pt-[35px]'>
      <div className='rounded-[20px] shadow-[0_0_0_0.5px_#ffffff47] sm:px-[27px] px-[15px] sm:py-[30px] py-[20px] bg-[#FFFFFF0F]'>
        <div className='flex flex-col items-center sm:gap-[30px] gap-4'>
          <div className='space-y-4 sm:space-y-7'>
            <h2 className='font-modernist sm:text-[40px] text-xl font-normal leading-[100%] sm:tracking-[-0.8px] text-white text-center'>
              Powered by leading <br className='sm:hidden' /> DeFi Protocols
            </h2>

            <p className='font-dm-sans sm:text-lg text-base font-light leading-[128%] sm:tracking-[-0.4px] text-white text-center'>
              We are forming strategic partnerships with leading protocols in the industry to
              provide yields that meet institutional standards, ensuring that our clients benefit
              from top-tier financial opportunities <span className='hidden sm:inline'>and</span>{' '}
              <span className='sm:hidden'>&</span> infrastructures.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-y-5 items-center w-full lg:grid-cols-2'>
            {structure.map(section => (
              <div
                key={section.title}
                className={`flex flex-col sm:gap-5 gap-3.5 items-center ${section.classes}`}
              >
                <h3 className='text-sm text-white capitalize sm:text-xl font-dm-sans'>
                  {section.title}
                </h3>

                <div className={`flex gap-3.5 justify-center items-center xl:gap-5`}>
                  {section.items.map(item => (
                    <div
                      key={item.name}
                      className='flex items-center justify-center flex-col rounded-[16px] transition-colors gap-2.5'
                    >
                      <div className='sm:w-[70px] w-[50px] sm:h-[70px] h-[50px] relative'>
                        <Image src={item.logo} alt={item.name} fill />
                      </div>

                      <p className='sm:text-[12.26px] text-[8.54px] leading-[110%] sm:tracking-[-0.245px] text-white'>
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
