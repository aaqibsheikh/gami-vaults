import Header from '@/components/Header';
import AboutHero from './components/AboutHero';
import DeFiProtocols from '@/components/DeFiProtocols';
import Footer from '@/components/Footer';
import AboutSection from './components/AboutSection';

export default function Index() {
  return (
    <div className='min-h-screen bg-black'>
      <Header />

      <main>
        <AboutHero />
        <DeFiProtocols />
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}
