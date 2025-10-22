import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import DeFiProtocols from '@/components/DeFiProtocols';
import InstitutionalFeatures from '@/components/InstitutionalFeatures';
// import ExploreVaults from '@/components/ExploreVaults';
// import Portfolio from '@/components/Portfolio';
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
        {/* <ExploreVaults /> */}
        {/* <Portfolio /> */}
      </main>
      <Footer />
    </div>
  );
}
