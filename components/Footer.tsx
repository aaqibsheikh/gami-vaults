import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='relative bg-black min-h-[229px] md:min-h-[420px] sm:min-h-[350px] overflow-hidden'>
      <div className='flex absolute bottom-[-20px] left-0 items-start'>
        <h2 className='font-modernist font-bold lg:text-[269px] sm:text-[200px] text-[140px] t racking-[-5.385px] text-white leading-none'>
          Gami
        </h2>

        <Image
          className='sm:ml-6 ml-2 mt-[5%] sm:w-[87px] w-[47px]'
          width={87}
          height={87}
          src='/assets/svgs/copyright-icon.svg'
          alt='Copyright Icon'
        />
      </div>

      <div className='relative  xl:px-[84px] sm:px-4 px-6 sm:pt-[47px] pt-[52px] mx-auto max-w-[1280px]'>
        <div className='flex justify-between items-start'>
          <p className='text-white font-dm-sans text-base font-normal leading-[140%] md:block hidden'>
            Gami provides on-chain asset management <br /> infrastructure with active curation &
            dynamic risk <br className='hidden lg:block' /> management
          </p>

          <div className='flex flex-col gap-2 sm:gap-4'>
            <Link
              href='/vaults'
              className='text-white font-dm-sans sm:text-[15px] text-[10px] font-normal hover:opacity-80 transition-opacity'
            >
              Vaults
            </Link>

            <Link
              href='/portfolio'
              className='text-white font-dm-sans sm:text-[15px] text-[10px] font-normal hover:opacity-80 transition-opacity'
            >
              Portfolio
            </Link>

            <Link
              href='/about'
              className='text-white font-dm-sans sm:text-[15px] text-[10px] font-normal hover:opacity-80 transition-opacity'
            >
              About
            </Link>
          </div>

          <div className='flex gap-1 items-center sm:gap-3'>
            <a
              href='#'
              className='flex justify-center items-center sm:w-11 sm:h-11 w-[26.5px] h-[26.5px] rounded-full border transition-colors border-[#FFFFFF40] hover:bg-white/10'
              aria-label='Twitter'
            >
              <Image
                src='/assets/svgs/twitter.svg'
                alt='Twitter'
                width={14.3}
                height={14.3}
                className='sm:w-[14.3px] w-[8.5px]'
              />
            </a>

            <a
              href='#'
              className='flex justify-center items-center sm:w-11 sm:h-11 w-[26.5px] h-[26.5px] rounded-full border transition-colors border-[#FFFFFF40] hover:bg-white/10'
              aria-label='Instagram'
            >
              <Image
                src='/assets/svgs/email.svg'
                alt='Twitter'
                width={20.53}
                height={14.7}
                className='sm:w-[20.53px] w-[12.32px]'
              />
            </a>

            {/* <a
              href='#'
              className='flex justify-center items-center sm:w-11 sm:h-11 w-[26.5px] h-[26.5px] rounded-full border transition-colors border-[#FFFFFF40] hover:bg-white/10'
              aria-label='Instagram'
            >
              <Image
                src='/assets/svgs/instagram.svg'
                alt='Instagram'
                width={14.2}
                height={14.2}
                className='sm:w-[14.2px] w-[8.5px]'
              />
            </a>

            <a
              href='#'
              className='flex justify-center items-center sm:w-11 sm:h-11 w-[26.5px] h-[26.5px] rounded-full border transition-colors border-[#FFFFFF40] hover:bg-white/10'
              aria-label='YouTube'
            >
              <Image
                src='/assets/svgs/youtube.svg'
                alt='YouTube'
                width={19.5}
                height={14.22}
                className='sm:w-[19.5px] w-[11.2px]'
              />
            </a>

            <a
              href='#'
              className='flex justify-center items-center sm:w-11 sm:h-11 w-[26.5px] h-[26.5px] rounded-full border transition-colors border-[#FFFFFF40] hover:bg-white/10'
              aria-label='Telegram'
            >
              <Image
                src='/assets/svgs/telegram.svg'
                alt='Telegram'
                width={14.2}
                height={11.56}
                className='sm:w-[14.2px] w-[8.14px]'
              />
            </a> */}
          </div>
        </div>
      </div>

      <div className='absolute bottom-4 right-[108px] justify-end items-end lg:flex hidden'>
        <div className='text-white font-dm-sans text-[14px] font-normal'>
          ©2025 Gami. All rights reserved.
        </div>
      </div>

      <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[1280px] h-[40px]'>
        <div
          className='w-full h-full'
          style={{
            background: 'radial-gradient(ellipse at center bottom, #CF7CFF 0%, #CF7CFF00 70%)',
          }}
        />
      </div>
    </footer>
  );
}
