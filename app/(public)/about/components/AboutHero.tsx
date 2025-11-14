import React from 'react';
import Link from 'next/link';

const AboutHero = () => {
  return (
    <section className='sm:pb-[43px] pb-2'>
      <div className='md:pt-[309px] sm:pt-[70px] pt-[100px] space-y-[26px] sm:text-left text-center'>
        <h1 className='font-modernist sm:text-[57px] text-[41.21px] font-normal leading-[100%] tracking-[-1.5px] text-white'>
          About <br className='sm:hidden' />
          <span className='gradient-text'>Gami Vaults</span>
        </h1>

        <p className='font-dm-sans sm:text-xl font-light leading-[128%] tracking-[-0.4px] text-white sm:max-w-[546px] max-w-[300px] mx-auto sm:mx-0 sm:pt-0 pt-8'>
          Gami provides on-chain yield infrastructure infrastructure with active curation & dynamic
          risk management
        </p>

        <div className='flex justify-center items-center sm:justify-start'>
          <Link
            href='/vaults'
            className='sm:px-[28.44px] px-2.5 sm:h-[40.89px] h-[30px] sm:rounded-[10px] rounded-[4px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] text-white sm:text-[14.22px] text-[10.2px] font-medium font-dm-sans transition-all flex items-center justify-center hover:bg-gradient-purple'
          >
            Explore Vaults →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
