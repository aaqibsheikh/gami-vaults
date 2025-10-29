import VaultTableVaultDetail from '../../../components/VaultTableVaultDetail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ExploreVaults() {
  const tabs = ['All Vaults', 'Flagship', 'Advanced', 'Partner'];

  return (
    <div className="min-h-screen bg-black">
      <Header />
    <section id="vaults" className="w-full relative pt-32 pb-12 overflow-hidden">
      <img
        src="/assets/images/vault-detail-glass.svg"
        alt=""
        className="absolute right-0 top-[-175px] w-[390px] h-[655px] object-contain pointer-events-none"
      />
      
      <div className="max-w-[1280px] mx-auto px-[84px] flex flex-col items-center gap-10 relative z-10">
        <div className="flex flex-col items-start gap-7 self-stretch">
          <div className="flex h-10 justify-end items-center relative">
            <div className="absolute left-0 top-0 h-10">
              <p className="font-modernist text-[57px] font-normal flex gap-2  text-white">
                Explore <span className="font-bold">Vaults</span>
              </p>
            </div>
          </div>
          <div className="self-stretch text-white font-dm-sans text-[20px] font-normal leading-[128%] tracking-[-0.4px] mt-4">
            Discover and deposit into professionally managed DeFi Vaults
          </div>
        </div>

        <div className="flex w-[1106px] p-5 flex-col justify-center items-center gap-5 rounded-[22px] bg-gradient-to-b from-[#141414] to-[#141414]">
          <div className="flex justify-between items-start self-stretch">
            <div className="flex items-center gap-[14px]">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`flex h-10 px-2 justify-center items-center gap-2 rounded-[21px] ${
                    index === 0
                      ? 'border border-[#A100FF] bg-[#A100FF]/18'
                      : 'glass-border bg-white/6 hover:bg-white/10'
                  } transition-colors`}
                >
                  <div className="text-white font-dm-sans text-[14px] font-light leading-[150%]">
                    {tab}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex w-[292px] justify-between items-start">
              <button className="flex h-10 px-2 justify-center items-center gap-2 rounded-[19px] glass-border bg-white/6 hover:bg-white/10 transition-colors">
                <div className="text-white font-dm-sans text-[14px] font-light leading-[150%]">
                  Sort by: Highest APY
                </div>
                <div className="rotate-90 text-white font-dm-sans text-[14px] font-light leading-[150%]">
                  {'>'}
                </div>
              </button>
              <div className="flex items-center gap-[2px]">
                <div className="flex w-[50px] h-10 px-2 justify-center items-center gap-2 rounded-[19px] glass-border bg-white/6 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-[2px]">
                    <svg width="4" height="11" viewBox="0 0 4 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.53801 1.09851H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M1.53801 5.49231H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M1.53801 9.88611H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                    </svg>
                    <svg width="4" height="11" viewBox="0 0 4 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.53801 1.09851H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M1.53801 5.49231H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M1.53801 9.88611H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                    </svg>
                    <svg width="4" height="11" viewBox="0 0 4 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.53801 1.09851H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M1.53801 5.49231H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M1.53801 9.88611H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex w-[50px] h-10 px-2 justify-center items-center gap-2 rounded-[19px] border border-[#A100FF] bg-[#A100FF]/12 cursor-pointer">
                  <div className="flex w-[15px] items-center gap-[3px]">
                    <svg width="5" height="11" viewBox="0 0 5 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.29554 1.09851H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M3.29554 5.49231H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M3.29554 9.88611H1.09863" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                    </svg>
                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.09863 1.09851H10.4355" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M1.09863 5.49231H10.4355" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                      <path d="M1.09863 9.88611H10.4355" stroke="white" strokeWidth="2.19691" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <VaultTableVaultDetail />
        </div>

      </div>
    </section>
    
    <Footer />
    </div>
  );
}