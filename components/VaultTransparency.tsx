'use client';

interface VaultTransparencyProps {
  vault?: {
    chainId: number;
    symbol: string;
    tvlUsd: string;
    underlying: {
      symbol: string;
    };
  };
}

export default function VaultTransparency({ vault }: VaultTransparencyProps) {
  const onchainWallets = [
    {
      name: 'Fordefi 3',
      debankUrl: '#',
      amount: '$191.16M',
      percentage: '95.23%',
    },
    {
      name: 'Fordefi 2',
      debankUrl: '#',
      amount: '$9.16M',
      percentage: '4.77%',
    },
    {
      name: 'Fordefi 1',
      debankUrl: '#',
      amount: '$610.16M',
      percentage: '0.0%',
    },
  ];

  const availableLiquidity = [
    {
      name: 'Fordefi 3',
      debankUrl: '#',
      amount: '$191.16M',
      percentage: '95.23%',
    },
  ];
  const toBeDeployed = [
    {
      name: 'Fordefi 1',
      debankUrl: '#',
      amount: '$610.16M',
      percentage: '0.0%',
    },
  ];

  const totalTvl = '$200.75M';

  return (
    <div className='w-full mt-[30px] px-[12px] py-[20px] rounded-[20px] shadow-[0_0_0_0.8px_#ffffff47] bg-[#FFFFFF0F] backdrop-blur-lg'>
      <h2 className='text-white font-dm-sans text-[17px] font-bold leading-[128%] tracking-[-0.344px] mb-[30px] px-3'>
        Transparency
      </h2>

      <div className='grid grid-cols-2 gap-[15px]'>
        <div className='bg-[#1D1D1D] p-3 rounded-[13.7px]'>
          <div className='grid-cols-[1fr_1fr_1fr_1fr] grid mb-2 items-center'>
            <h3 className='text-white font-dm-sans text-[17px] font-normal tracking-[-0.256px] col-span-2'>
              Onchain Wallets
            </h3>

            <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right'>
              $191.16M
            </span>

            <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right'>
              95.23%
            </span>
          </div>

          <div className='space-y-2'>
            {onchainWallets.map((wallet, index) => (
              <div
                key={index}
                className='grid grid-cols-[1fr_1fr_1fr_1fr] items-center bg-[#090909] p-[8.73px] rounded-[13.7px]'
              >
                <span className='text-white font-dm-sans text-[17px] font-normal leading-none tracking-[-0.256px]'>
                  {wallet.name}
                </span>

                <a
                  href={wallet.debankUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className=' font-dm-sans text-[17px] font-medium hover:text-white transition-colors'
                >
                  <span className='text-[#CF7CFF] underline'>Debank</span> →
                </a>

                <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right'>
                  {wallet.amount}
                </span>

                <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right min-w-[60px]'>
                  {wallet.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className='bg-[#1D1D1D] p-3 rounded-[13.7px]'>
            <div className='grid-cols-[1fr_1fr_1fr_1fr] grid mb-2 items-center'>
              <h3 className='text-white font-dm-sans text-[17px] font-normal tracking-[-0.256px] col-span-2'>
                Available Liquidity Buffer
              </h3>

              <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right'>
                $191.16M
              </span>

              <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right'>
                95.23%
              </span>
            </div>

            <div className='space-y-3'>
              {availableLiquidity.map((wallet, index) => (
                <div
                  key={index}
                  className='grid grid-cols-[1fr_1fr_1fr_1fr] items-center bg-[#090909] p-[8.73px] rounded-[13.7px]'
                >
                  <span className='text-white font-dm-sans text-[17px] font-normal leading-none tracking-[-0.256px]'>
                    {wallet.name}
                  </span>

                  <a
                    href={wallet.debankUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className=' font-dm-sans text-[17px] font-medium hover:text-white transition-colors'
                  >
                    <span className='text-[#CF7CFF] underline'>Debank</span> →
                  </a>

                  <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right'>
                    {wallet.amount}
                  </span>

                  <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right min-w-[60px]'>
                    {wallet.percentage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-[#1D1D1D] p-3 rounded-[13.7px]'>
            <div className='grid-cols-[1fr_1fr_1fr_1fr] grid mb-2 items-center'>
              <h3 className='text-white font-dm-sans text-[17px] font-normal tracking-[-0.256px] col-span-2'>
                To be Deployed Asset
              </h3>

              <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right'>
                $191.16M
              </span>

              <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right'>
                95.23%
              </span>
            </div>

            <div className='space-y-3'>
              {toBeDeployed.map((wallet, index) => (
                <div
                  key={index}
                  className='grid grid-cols-[1fr_1fr_1fr_1fr] items-center bg-[#090909] p-[8.73px] rounded-[13.7px]'
                >
                  <span className='text-white font-dm-sans text-[17px] font-normal leading-none tracking-[-0.256px]'>
                    {wallet.name}
                  </span>

                  <a
                    href={wallet.debankUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className=' font-dm-sans text-[17px] font-medium hover:text-white transition-colors'
                  >
                    <span className='text-[#CF7CFF] underline'>Debank</span> →
                  </a>

                  <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right'>
                    {wallet.amount}
                  </span>

                  <span className='text-white font-dm-sans text-[13px] font-normal leading-none tracking-[-0.256px] text-right min-w-[60px]'>
                    {wallet.percentage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-[1fr_auto_auto] gap-4 items-center mt-5'>
        <span className='text-white font-dm-sans text-[17px] font-bold leading-none tracking-[-0.256px]'>
          TOTAL TVL
        </span>

        <span className='text-white font-dm-sans text-[13.6px] font-bold leading-none tracking-[-0.256px] text-right'>
          {totalTvl}
        </span>

        <span className='text-white font-dm-sans text-[13.6px] font-bold leading-none tracking-[-0.256px] text-right min-w-[60px]'>
          100.0%
        </span>
      </div>

      <div className='flex justify-end mt-4'>
        <span className='text-white font-dm-sans text-[13.6px] font-normal italic'>
          As of 2025-10-07
        </span>
      </div>
    </div>
  );
}
