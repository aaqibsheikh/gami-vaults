interface SimpleVaultCardProps {
  title: string;
  badge: string;
  badgeColor?: string;
  apy: string;
  tvl: string;
  tokens: string[];
}

export default function SimpleVaultCard({ title, badge, badgeColor = '#2C2929', apy, tvl, tokens }: SimpleVaultCardProps) {
  return (
    <div className="p-3 rounded-[29px] glass-border bg-white/6">
      <div className="p-6 rounded-[22px] bg-gradient-purple-fade bg-gami-dark flex flex-col gap-7">
        <div className="flex items-start justify-between">
          <h3 className="font-dm-sans text-[18px] font-bold leading-[128%] tracking-[-0.358px] text-white">
            {title}
          </h3>
          <span
            className="px-2 py-1 rounded-[7px] text-white font-dm-sans text-[11px] font-medium leading-[128%] tracking-[-0.212px]"
            style={{ backgroundColor: badgeColor }}
          >
            {badge}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between px-5 py-8 rounded-[27px] glass-bg">
            <div className="flex flex-col items-center gap-1.5">
              <h4 className="font-modernist text-[24px] font-bold leading-[110%] tracking-[-0.482px] text-white">
                {apy}
              </h4>
              <p className="font-dm-sans text-[11px] font-normal leading-[110%] tracking-[-0.224px] text-white">
                TARGET APY
              </p>
            </div>

            <div className="h-[30px] w-px bg-white"></div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.8282 14.2971V12.8403C1.74068 12.6451 0.343994 11.3535 0.343994 9.61144H2.04104C2.04104 10.4374 2.76191 11.0832 3.8282 11.2334V8.22977C1.81577 7.86934 0.464139 6.65287 0.464139 5.18109C0.464139 3.52909 1.81577 2.32764 3.8282 2.17746V0.720703H5.02965V2.17746C6.96699 2.32764 8.28859 3.51408 8.31862 5.15105H6.62157C6.59154 4.43018 5.96078 3.87451 5.02965 3.76938V6.59279C7.19226 6.98327 8.634 8.24479 8.634 9.7466C8.634 11.4286 7.19226 12.6601 5.02965 12.8403V14.2971H3.8282ZM3.8282 6.41258V3.7844C2.89708 3.88953 2.26632 4.4452 2.26632 5.18109C2.26632 5.72174 2.89708 6.21734 3.8282 6.41258ZM5.02965 11.2334C6.11096 11.0682 6.83183 10.4675 6.83183 9.7466C6.83183 9.17591 6.11096 8.65028 5.02965 8.42501V11.2334Z"
                    fill="white"
                  />
                </svg>
                <h4 className="font-modernist text-[24px] font-bold leading-[110%] tracking-[-0.482px] text-white">
                  {tvl}
                </h4>
              </div>
              <p className="font-dm-sans text-[11px] font-normal leading-[110%] tracking-[-0.224px] text-white">
                TVL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {tokens.map((token, index) => (
              <span
                key={index}
                className="px-2 py-1.5 rounded-[9px] bg-gami-dark-card text-white font-dm-sans text-[13px] font-medium leading-[128%] tracking-[-0.268px]"
              >
                {token}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button className="flex-1 py-4 px-3 rounded-[40px] bg-gradient-purple text-white font-dm-sans text-[16px] font-bold leading-[150%] hover:opacity-90 transition-opacity">
            Deposit
          </button>
          <button className="flex-1 py-4 px-3 rounded-[40px] border glass-border bg-white/5 text-white font-dm-sans text-[16px] font-normal leading-[150%] hover:bg-white/10 transition-colors">
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

