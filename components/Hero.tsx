import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className='relative pt-[106px] pb-[50px]'>
      <div className='absolute inset-0 -bottom-[80px]'>
        <div className='h-full max-w-[1280px] mx-auto px-[84px] relative'>
          <div className='absolute left-[84px] top-0 bottom-0 w-px bg-[#242424]' />

          <div className='absolute left-1/2 top-0 bottom-[52px] w-px bg-[#242424] -translate-x-1/2' />

          <div className='absolute right-[84px] top-0 bottom-0 w-px bg-[#242424]' />
        </div>
      </div>

      <div className='absolute left-0 right-0 h-px bg-[#242424] bottom-0' />

      <div className='max-w-[1280px] mx-auto px-[84px] relative z-10'>
        <div className='pt-[355px] pl-[21px] space-y-7'>
          <h1 className='font-modernist text-[57.48px] font-normal leading-[100%] tracking-[-1.5px] text-white'>
            Discover and deposit <br /> into <span className='gradient-text'>Gami Vaults</span>
          </h1>

          <p className='font-dm-sans text-xl font-light leading-[128%] tracking-[-0.4px] text-white max-w-[546px]'>
            Institutional-grade vaults with DeFi-native access. Transparent strategies, professional
            management, maximized yields.
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

        <div className='flex absolute top-0 right-[136px] justify-center lg:justify-end'>
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
