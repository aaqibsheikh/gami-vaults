import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import DeFiProtocols from '@/components/DeFiProtocols';
import InstitutionalFeatures from '@/components/InstitutionalFeatures';
import Footer from '@/components/Footer';

export default function Index() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        <Hero />
        <Stats />
        <DeFiProtocols />
        <InstitutionalFeatures />
      </main>
      <Footer />
    </div>
  );
}
