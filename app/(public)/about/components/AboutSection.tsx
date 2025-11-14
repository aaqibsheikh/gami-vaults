import React from 'react';
import Image from 'next/image';

const AboutSection = () => {
  return (
    <section className='sm:pt-[73px] pt-[40px] sm:pb-[100px] pb-5 grid lg:grid-cols-2 grid-cols-1 gap-[120px]'>
      <div className='hidden items-end lg:flex'>
        <Image
          src='/assets/images/gradient-glass.png'
          alt='Gradient glass vault visualization'
          width={478}
          height={432}
          className='animate-float'
        />
      </div>

      <div className='sm:space-y-[40px] space-y-[36px]'>
        <div className='space-y-[15px]'>
          <div className='bg-[#B852F3] h-1 w-12'></div>

          <div className='sm:text-[32px] text-2xl text-white leading-none tracking-[-0.2px] font-modernist'>
            Mission
          </div>

          <p className='sm:text-lg text-white tracking-[-0.2px] font-light'>
            Our mission is to make on-chain finance investable, secure, and accessible through:
          </p>
        </div>

        <div className='space-y-[15px]'>
          <div className='bg-[#B852F3] h-1 w-12'></div>

          <div className='sm:text-[32px] text-2xl text-white leading-none tracking-[-0.2px] font-modernist'>
            Vault Curation & Yield
          </div>

          <p className='sm:text-lg text-white tracking-[-0.2px] font-light'>
            On-chain asset management platform with optimized strategies for BTC, ETH, and
            stablecoins — including active vault curation and lobbying across DeFi ecosystems
          </p>
        </div>

        <div className='space-y-[15px]'>
          <div className='bg-[#B852F3] h-1 w-12'></div>

          <div className='sm:text-[32px] text-2xl text-white leading-none tracking-[-0.2px] font-modernist'>
            Liquidity Strategies
          </div>

          <p className='sm:text-lg text-white tracking-[-0.2px] font-light'>
            Access to high-yield bootstrapping programs supporting emerging DeFi protocols with
            programmable and attractive incentives
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
