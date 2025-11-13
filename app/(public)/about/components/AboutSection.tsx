import React from 'react';
import Image from 'next/image';

const AboutSection = () => {
  return (
    <section className='sm:pt-[73px] pt-2.5 sm:pb-[100px] pb-5 grid lg:grid-cols-2 grid-cols-1 gap-[30px]'>
      <div className='sm:space-y-6 space-y-[14.5px]'>
        <div className='w-full sm:h-[184px] h-[113px] bg-gradient-to-r from-[#23262A] to-[#121212] sm:rounded-[50.89px] rounded-[31.21px] flex sm:gap-14 gap-[35px] justify-center items-center p-3'>
          <div>
            <div className='sm:text-[18.66px] text-[11.44px] text-[#D5D5D5] font-medium leading-none tracking-[-0.2px] mb-2.5'>
              Total value locked
            </div>

            <div className='sm:text-[54px] text-[33.29px] flex items-center gap-0.5 font-bold leading-none tracking-[-0.8px] text-white font-modernist'>
              <svg
                width='19'
                height='31'
                viewBox='0 0 19 31'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='sm:mt-1 sm:w-[19px] w-[11.14px] sm:h-[31px] h-[18.74px]'
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
                className='sm:-mb-2 -mb-1 sm:ml-1.5 ml-1 sm:w-6 sm:h-6 w-[14.5px] h-[14.5px]'
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
              className='sm:w-[213px] w-[131px]'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 sm:gap-6 gap-[14.5px]'>
          <div className='w-full sm:h-[254px] xs:h-[156px] aspect-square bg-[#090909] sm:rounded-[50.89px] rounded-[31.21px] relative overflow-hidden sm:py-[25px] py-4 sm:px-[10px] px-1.5 flex flex-col justify-between items-center xs:gap-0 gap-3'>
            <div
              className='absolute top-0 left-0 z-0 w-full'
              style={{
                height: '75%',
                background:
                  'radial-gradient(ellipse 100% 100% at 50% 0%, #CF7CFF 0%, #CF7CFF00 100%)',
              }}
            />

            <div className='sm:text-[18.66px] text-[11.44px] text-white font-medium leading-none tracking-[-0.2px] relative z-10'>
              Vault volume
            </div>

            <div className='w-full sm:rounded-[42.41px] rounded-[26px] shadow-[0_0_0_0.5px_#ffffff47,inset_0_2px_8px_rgba(0,0,0,0.20)]  bg-[#FFFFFF0F] backdrop-blur-sm sm:h-[139px] xs:h-[85px] h-full flex items-center justify-center relative z-10'>
              <svg
                width='19'
                height='31'
                viewBox='0 0 19 31'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='sm:mt-1 sm:w-[19px] w-[11.44px] sm:h-[31px] h-[18.74px]'
              >
                <path
                  d='M7.84317 30.5613V27.2821C3.14403 26.8426 0 23.9352 0 20.0136H3.82017C3.82017 21.873 5.44289 23.3267 7.84317 23.6647V16.9034C3.31306 16.092 0.270454 13.3537 0.270454 10.0406C0.270454 6.32187 3.31306 3.61733 7.84317 3.27926V0H10.5477V3.27926C14.9088 3.61733 17.8838 6.28806 17.9514 9.973H14.1312C14.0636 8.35027 12.6437 7.09942 10.5477 6.86278V13.2185C15.4159 14.0974 18.6613 16.9372 18.6613 20.3179C18.6613 24.1042 15.4159 26.8764 10.5477 27.2821V30.5613H7.84317ZM7.84317 12.8128V6.89658C5.74715 7.13323 4.32727 8.38408 4.32727 10.0406C4.32727 11.2577 5.74715 12.3733 7.84317 12.8128ZM10.5477 23.6647C12.9818 23.2929 14.6045 21.9406 14.6045 20.3179C14.6045 19.0332 12.9818 17.85 10.5477 17.3429V23.6647Z'
                  fill='white'
                />
              </svg>

              <span className='sm:text-[54px] text-[33.29px] font-bold leading-none tracking-[-0.8px] text-white font-modernist'>
                50M
              </span>

              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='sm:-mb-2 -mb-1 sm:ml-1.5 ml-1 sm:w-6 sm:h-6 w-[14.5px] h-[14.5px]'
              >
                <path
                  d='M9.13492 23.7508V14.393H0V9.35781H9.13492V0H14.6159V9.35781H23.7508V14.393H14.6159V23.7508H9.13492Z'
                  fill='white'
                />
              </svg>
            </div>

            <div className='sm:text-[11.88px] text-[7.28px] text-white font-bold leading-none tracking-[-0.2px] relative z-10 font-modernist'>
              Gami
            </div>
          </div>

          <div className='w-full sm:h-[254px] xs:h-[156px] aspect-square sm:rounded-[50.89px] rounded-[31.21px] shadow-[0_0_0_0.5px_#ffffff47] sm:px-[32px] px-5 sm:pt-[35px] pt-5 sm:pb-[39px] pb-6 flex flex-col justify-between'>
            <div className='flex justify-between items-center'>
              <div className='sm:text-[18.66px] text-[11.44px] text-[#D5D5D5] font-medium leading-none tracking-[-0.2px]'>
                Average return <br />
                in stablecoin
              </div>

              <Image
                src='/assets/images/icon/avg-return.svg'
                alt='Avg return'
                width={51}
                height={37}
                className='sm:w-[51px] w-[31.44px] sm:h-[37px] h-[22.74px]'
              />
            </div>

            <div className='flex gap-2 items-center'>
              <span className='sm:text-[54px] text-[33.29px] font-bold leading-none tracking-[-0.8px] text-white font-modernist'>
                20%
              </span>

              <span className='sm:text-[33.93px] text-[20.85px] text-white font-bold leading-none tracking-[-0.2px] font-modernist'>
                APY
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='sm:space-y-[50px] space-y-[36px]'>
        <div className='space-y-4'>
          <div className='bg-[#B852F3] h-1 w-12'></div>

          <div className='sm:text-[28px] text-2xl text-white leading-none tracking-[-0.2px] font-modernist'>
            Mission
          </div>

          <p className='sm:text-xl text-white tracking-[-0.2px] font-light'>
            Our mission is to make on-chain finance investable, secure, and accessible through:
          </p>
        </div>

        <div className='space-y-4'>
          <div className='bg-[#B852F3] h-1 w-12'></div>

          <div className='sm:text-[28px] text-2xl text-white leading-none tracking-[-0.2px] font-modernist'>
            Vault Curation & Yield
          </div>

          <p className='sm:text-xl text-white tracking-[-0.2px] font-light'>
            On-chain asset management platform with optimized strategies for BTC, ETH, and
            stablecoins — including active vault curation and lobbying across DeFi ecosystems
          </p>
        </div>

        <div className='space-y-4'>
          <div className='bg-[#B852F3] h-1 w-12'></div>

          <div className='sm:text-[28px] text-2xl text-white leading-none tracking-[-0.2px] font-modernist'>
            Liquidity Strategies
          </div>

          <p className='sm:text-xl text-white tracking-[-0.2px] font-light'>
            Access to high-yield bootstrapping programs supporting emerging DeFi protocols with
            programmable and attractive incentives
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
