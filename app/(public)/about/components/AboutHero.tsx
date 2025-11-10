import React from 'react';
import Link from 'next/link';

const AboutHero = () => {
  return (
    <section className='pt-[106px] pb-[50px]'>
      <div className='pt-[355px] pl-[21px] space-y-7'>
        <h1 className='font-modernist text-[57.48px] font-normal leading-[100%] tracking-[-1.5px] text-white'>
          About <span className='gradient-text'>Gami Vaults</span>
        </h1>

        <p className='font-dm-sans text-xl font-light leading-[128%] tracking-[-0.4px] text-white max-w-[546px]'>
          Gami provides on-chain asset management infrastructure with active curation & dynamic risk
          management
        </p>

        <div className='flex gap-7 items-center pt-2'>
          <Link
            href='/vaults'
            className='px-[28.44px] h-[40.89px] rounded-[10px] bg-gradient-purple text-white text-[14.22px] font-medium font-dm-sans hover:opacity-90 transition-opacity flex items-center justify-center'
          >
            Explore Vaults →
          </Link>

          <button className='px-[28.44px] h-[40.89px] rounded-[10px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] text-white text-[14px] font-medium font-dm-sans hover:bg-white/10 transition-colors'>
            About
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
