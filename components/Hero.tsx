import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className='sm:pb-[50px] sm:pt-[25px]'>
      <div className='relative'>
        <div className='lg:pt-[355px] sm:pt-10 sm:pl-[21px] space-y-7 pt-[85px]'>
          <h1 className='font-modernist sm:text-[57.48px] text-[41px] font-normal leading-[100%] tracking-[-1.5px] text-white sm:text-left text-center'>
            <span className='hidden sm:inline'>Discover and deposit</span>
            <span className='sm:hidden'>Discover &</span>
            <br />
            <span className='hidden sm:inline'>into </span>
            <span className='sm:hidden'>deposit into</span>
            <br className='sm:hidden' />
            <span className='gradient-text'>Gami Vaults</span>
          </h1>

          <p className='font-dm-sans sm:text-xl font-light leading-[128%] tracking-[-0.5px] text-white max-w-[546px] sm:text-left text-center sm:pt-0 pt-2.5'>
            Institutional-grade vaults with DeFi-native access. Transparent strategies, professional
            management, maximized yields.
          </p>

          <div className='flex gap-5 justify-center items-center sm:pt-2 sm:gap-7 sm:justify-start'>
            <Link
              href='/vaults'
              className='sm:px-[28.44px] px-2.5 sm:h-[40.89px] h-[30px] sm:rounded-[10px] rounded-[4px] bg-gradient-purple text-white sm:text-[14.22px] text-[10.2px] font-medium font-dm-sans hover:opacity-90 transition-opacity flex items-center justify-center'
            >
              Explore Vaults →
            </Link>

            <Link
              href='/about'
              className='flex items-center justify-center sm:px-[28.44px]
               px-2.5 min-w-[64px] sm:h-[40.89px] h-[30px] sm:rounded-[10px] rounded-[4px] 
               shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] text-white sm:text-[14px] text-[10.2px] 
               font-medium font-dm-sans hover:bg-white/10 transition-colors'
            >
              About
            </Link>
          </div>
        </div>

        <div className='absolute top-2.5 right-0 xl:right-[50px] lg:block hidden'>
          <Image
            src='/assets/images/gradient-glass.png'
            alt='Gradient glass vault visualization'
            width={469}
            height={432}
            className='animate-float'
          />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
