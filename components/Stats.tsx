export default function Stats() {
  const stats = [
    { value: '$10.2M+', label: 'TOTAL TVL' },
    { value: '35K', label: 'USERS' },
    { value: '8', label: 'ACTIVE VAULTS' },
    { value: '2', label: 'REWARDS PROGRAM' },
  ];

  return (
    <div className='max-w-[1280px] mx-auto px-[84px] pt-[29px] z-10 relative'>
      <div className='rounded-[20px] shadow-[0_0_0_0.5px_#ffffff47] px-10 py-8 bg-[#FFFFFF0F]'>
        <div className='flex flex-wrap gap-4 justify-between items-center'>
          {stats.map((stat, index) => (
            <div key={index} className='flex flex-col gap-1 items-center'>
              <h3 className='font-modernist text-[43.5px] font-bold leading-[110%] tracking-[-0.87px] text-white'>
                {stat.value}
              </h3>

              <p className='font-dm-sans text-[12.2px] font-normal leading-[110%] tracking-[-0.245px] text-white uppercase'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

