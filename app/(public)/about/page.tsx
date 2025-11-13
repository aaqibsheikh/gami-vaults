import AboutHero from './components/AboutHero';
import DeFiProtocols from '@/components/DeFiProtocols';
import AboutSection from './components/AboutSection';
import Image from 'next/image';

export default function Index() {
  return (
    <>
      <div className='hidden absolute top-0 right-0 md:block'>
        <Image
          src='/assets/images/about-hero.png'
          alt='Gradient glass vault visualization'
          width={680}
          height={515}
          className='animate-float'
        />
      </div>

      <AboutHero />
      <DeFiProtocols />
      <AboutSection />
    </>
  );
}
