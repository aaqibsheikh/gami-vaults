export default function Stats() {
  const stats = [
    { value: '$10.2M+', label: 'TOTAL TVL' },
    { value: '8', label: 'ACTIVE VAULTS' },
  ];

  return (
    <section className='pt-[29px] z-10 relative'>
      <div className='sm:rounded-[20px] sm:shadow-[0_0_0_0.5px_#ffffff47] sm:px-10 sm:py-8 sm:bg-[#FFFFFF0F]'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {stats.map((stat, index) => (
            <div
              key={index}
              className='flex flex-col gap-1 items-center rounded-[20px] shadow-[0_0_0_0.5px_#ffffff47] px-4 py-4 bg-[#FFFFFF0F] sm:px-0 sm:py-0 sm:rounded-none sm:shadow-none sm:bg-transparent'
            >
              <h3 className='font-modernist sm:text-[43.5px] text-[30px] font-bold leading-[110%] tracking-[-0.87px] text-white'>
                {stat.value}
              </h3>

              <p className='font-dm-sans sm:text-[12.2px] text-[10px] font-normal leading-[110%] tracking-[-0.245px] text-white uppercase'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

