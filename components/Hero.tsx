export default function Hero() {
  return (
    <section className="relative pt-32 pb-12 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-0 top-0 w-full h-[888px] flex justify-center items-stretch gap-[278px]">
          <div className="w-px h-full bg-white/14"></div>
          <div className="w-px h-full bg-white/14"></div>
          <div className="w-px h-full bg-white/14"></div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-[84px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-7 pt-80">
            <div className="space-y-0">
              <h1 className="font-modernist text-[57px] font-normal leading-[100%] tracking-[-1.15px] text-white">
                Discover and deposit into
                <span className="font-modernist ml-2 text-[57px] font-normal leading-[100%] tracking-[-1.15px] text-gami-dark text-shadow-glow relative inline-block">
                  <span className="absolute inset-0 bg-gradient-to-r from-gami-purple to-gami-blue bg-clip-text text-transparent">
                     Gami Vaults
                  </span>
                  <span className="relative bg-gradient-to-r from-gami-purple to-gami-blue bg-clip-text text-transparent">
                    Gami Vaults
                  </span>
                </span>
              </h1>
            </div>

            <p className="font-dm-sans text-[20px] font-light leading-[128%] tracking-[-0.4px] text-white max-w-[546px]">
              Institutional-grade vaults with DeFi-native access. Transparent strategies, professional management, maximized yields.
            </p>

            <div className="flex items-center gap-7 pt-2">
              <button className="px-6 py-3 rounded-[36px] bg-gradient-purple text-white text-[14px] font-medium font-dm-sans hover:opacity-90 transition-opacity">
                Explore Vaults →
              </button>
              <button className="px-6 py-3 rounded-[32px] glass-border bg-white/6 text-white text-[14px] font-medium font-dm-sans hover:bg-white/10 transition-colors">
                About
              </button>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <img
              src="/assets/images/gradient-glass.png"
              alt="Gradient glass vault visualization"
              className="w-[478px] h-[441px] object-contain animate-float"
            />
          </div>
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

