export default function VaultListSkeleton() {
  return (
    <>
      <div className='grid grid-cols-[2fr_1fr_1fr_2fr_1.5fr] gap-4 text-[#FFFFFF80] text-[13.24px] pb-5 pl-1 font-dm-sans font-light shadow-[0_0.4px_0_0_#ffffff47]'>
        <div>VAULT</div>
        <div>APY</div>
        <div>TVL</div>
        <div>ASSETS EXPOSITION</div>
        <div>ACTIONS</div>
      </div>

      {[1, 2, 3].map(i => (
        <div
          key={i}
          className='grid grid-cols-[2fr_1fr_1fr_2fr_1.5fr] gap-4 items-center shadow-[0_0.5px_0_0_#ffffff47] py-[26px] animate-pulse'
        >
          <div className='flex items-center gap-2'>
            <div className='w-32 h-4 rounded bg-white/10'></div>
            <div className='w-16 h-[21px] rounded-[5px] bg-white/5'></div>
          </div>

          <div className='w-16 h-4 rounded bg-white/10'></div>

          <div className='w-20 h-4 rounded bg-white/10'></div>

          <div className='flex gap-2 items-center'>
            <div className='w-12 h-[21px] rounded-[5px] bg-white/5'></div>
            <div className='w-12 h-[21px] rounded-[5px] bg-white/5'></div>
          </div>

          <div className='flex gap-3.5 justify-start items-center'>
            <div className='w-[90px] h-[33px] rounded-[10px] bg-white/10'></div>
            <div className='w-[90px] h-[33px] rounded-[10px] bg-white/10'></div>
          </div>
        </div>
      ))}
    </>
  );
}

