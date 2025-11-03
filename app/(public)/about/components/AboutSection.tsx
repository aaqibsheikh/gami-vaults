import React from 'react';
import Image from 'next/image';

const AboutSection = () => {
  return (
    <div className='max-w-[1280px] mx-auto px-[84px] pt-[73px] pb-[100px] grid grid-cols-2 gap-[30px]'>
      <div className='space-y-6'>
        <div className='w-full h-[184px] bg-gradient-to-r from-[#23262A] to-[#121212] rounded-[50.89px] flex gap-14 justify-center items-center p-3'>
          <div>
            <div className='text-[18.66px] text-[#D5D5D5] font-medium leading-none tracking-[-0.2px] mb-2.5'>
              Total value locked
            </div>

            <div className='text-[54px] flex items-center gap-0.5 font-bold leading-none tracking-[-0.8px] text-white font-modernist'>
              <svg
                width='19'
                height='31'
                viewBox='0 0 19 31'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='mt-1'
              >
                <path
                  d='M7.84317 30.5613V27.2821C3.14403 26.8426 0 23.9352 0 20.0136H3.82017C3.82017 21.873 5.44289 23.3267 7.84317 23.6647V16.9034C3.31306 16.092 0.270454 13.3537 0.270454 10.0406C0.270454 6.32187 3.31306 3.61733 7.84317 3.27926V0H10.5477V3.27926C14.9088 3.61733 17.8838 6.28806 17.9514 9.973H14.1312C14.0636 8.35027 12.6437 7.09942 10.5477 6.86278V13.2185C15.4159 14.0974 18.6613 16.9372 18.6613 20.3179C18.6613 24.1042 15.4159 26.8764 10.5477 27.2821V30.5613H7.84317ZM7.84317 12.8128V6.89658C5.74715 7.13323 4.32727 8.38408 4.32727 10.0406C4.32727 11.2577 5.74715 12.3733 7.84317 12.8128ZM10.5477 23.6647C12.9818 23.2929 14.6045 21.9406 14.6045 20.3179C14.6045 19.0332 12.9818 17.85 10.5477 17.3429V23.6647Z'
                  fill='white'
                />
              </svg>

              <span>20M</span>

              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='-mb-2 ml-1.5'
              >
                <path
                  d='M9.13492 23.7508V14.393H0V9.35781H9.13492V0H14.6159V9.35781H23.7508V14.393H14.6159V23.7508H9.13492Z'
                  fill='white'
                />
              </svg>
            </div>
          </div>

          <div>
            <Image
              src='/assets/images/graph-photo.png'
              alt='Graph photo'
              width={213}
              height={111}
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <div className='w-full h-[254px] bg-[#090909] rounded-[50.89px] relative overflow-hidden py-[25px] px-[10px] flex flex-col justify-between items-center'>
            <div
              className='absolute top-0 left-0 z-0 w-full'
              style={{
                height: '75%',
                background:
                  'radial-gradient(ellipse 100% 100% at 50% 0%, #CF7CFF 0%, #CF7CFF00 100%)',
              }}
            />

            <div className='text-[18.66px] text-white font-medium leading-none tracking-[-0.2px] relative z-10'>
              Vault volume
            </div>

            <div className='w-full rounded-[42.41px] shadow-[0_0_0_0.5px_#ffffff47,inset_0_2px_8px_rgba(0,0,0,0.20)]  bg-[#FFFFFF0F] backdrop-blur-sm h-[139px] flex items-center justify-center relative z-10'>
              <svg
                width='19'
                height='31'
                viewBox='0 0 19 31'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='mt-1'
              >
                <path
                  d='M7.84317 30.5613V27.2821C3.14403 26.8426 0 23.9352 0 20.0136H3.82017C3.82017 21.873 5.44289 23.3267 7.84317 23.6647V16.9034C3.31306 16.092 0.270454 13.3537 0.270454 10.0406C0.270454 6.32187 3.31306 3.61733 7.84317 3.27926V0H10.5477V3.27926C14.9088 3.61733 17.8838 6.28806 17.9514 9.973H14.1312C14.0636 8.35027 12.6437 7.09942 10.5477 6.86278V13.2185C15.4159 14.0974 18.6613 16.9372 18.6613 20.3179C18.6613 24.1042 15.4159 26.8764 10.5477 27.2821V30.5613H7.84317ZM7.84317 12.8128V6.89658C5.74715 7.13323 4.32727 8.38408 4.32727 10.0406C4.32727 11.2577 5.74715 12.3733 7.84317 12.8128ZM10.5477 23.6647C12.9818 23.2929 14.6045 21.9406 14.6045 20.3179C14.6045 19.0332 12.9818 17.85 10.5477 17.3429V23.6647Z'
                  fill='white'
                />
              </svg>

              <span className='text-[54px] font-bold leading-none tracking-[-0.8px] text-white font-modernist'>
                50M
              </span>

              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='-mb-2 ml-1.5'
              >
                <path
                  d='M9.13492 23.7508V14.393H0V9.35781H9.13492V0H14.6159V9.35781H23.7508V14.393H14.6159V23.7508H9.13492Z'
                  fill='white'
                />
              </svg>
            </div>

            <div className='text-[11.88px] text-white font-bold leading-none tracking-[-0.2px] relative z-10 font-modernist'>
              Gami
            </div>
          </div>

          <div className='w-full h-[254px] rounded-[50.89px] shadow-[0_0_0_0.5px_#ffffff47] px-[32px] pt-[35px] pb-[39px] flex flex-col justify-between'>
            <div className='flex justify-between items-center'>
              <div className='text-[18.66px] text-[#D5D5D5] font-medium leading-none tracking-[-0.2px]'>
                Average return <br />
                in stablecoin
              </div>

              <Image
                src='/assets/images/icon/avg-return.svg'
                alt='Avg return'
                width={51}
                height={37}
              />
            </div>

            <div className='flex gap-2 items-center'>
              <span className='text-[54px] font-bold leading-none tracking-[-0.8px] text-white font-modernist'>
                20%
              </span>

              <span className='text-[33.93px] text-white font-bold leading-none tracking-[-0.2px] font-modernist'>
                APY
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='space-y-[50px]'>
        <div className='space-y-3'>
          <div className='bg-[#B852F3] h-1 w-12'></div>

          <div className='text-[28px] text-white leading-none tracking-[-0.2px] font-modernist'>
            Mission
          </div>

          <p className='text-xl text-white tracking-[-0.2px] font-light'>
            Our mission is to make on-chain finance investable, secure, and accessible through:
          </p>
        </div>

        <div className='space-y-3'>
          <div className='bg-[#B852F3] h-1 w-12'></div>

          <div className='text-[28px] text-white leading-none tracking-[-0.2px] font-modernist'>
            Vault Curation & Yield
          </div>

          <p className='text-xl text-white tracking-[-0.2px] font-light'>
            On-chain asset management platform with optimized strategies for BTC, ETH, and
            stablecoins — including active vault curation and lobbying across DeFi ecosystems
          </p>
        </div>

        <div className='space-y-3'>
          <div className='bg-[#B852F3] h-1 w-12'></div>

          <div className='text-[28px] text-white leading-none tracking-[-0.2px] font-modernist'>
            Liquidity Strategies
          </div>

          <p className='text-xl text-white tracking-[-0.2px] font-light'>
            Access to high-yield bootstrapping programs supporting emerging DeFi protocols with
            programmable and attractive incentives
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
