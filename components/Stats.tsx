export default function Stats() {
  const stats = [
    { value: '$10.2M+', label: 'TOTAL TVL' },
    { value: '9.2%', label: 'TOTAL TVL' },
    { value: '8', label: 'ACTIVE VAULTS' },
    { value: '2', label: 'REWARDS PROGRAM' },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-[84px] py-8">
      <div className="rounded-[20px] glass-border bg-white/6 p-8">
        <div className="flex items-center justify-center gap-[122px] flex-wrap">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <h3 className="font-modernist text-[43px] font-bold leading-[110%] tracking-[-0.87px] text-white">
                {stat.value}
              </h3>
              <p className="font-dm-sans text-[12px] font-normal leading-[110%] tracking-[-0.245px] text-white uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

