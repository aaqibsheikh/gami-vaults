export default function VaultCardSkeleton() {
  return (
    <div className='xl:w-[337px] w-full sm:min-w-[337px] min-h-[335px] rounded-[29.44px] shadow-[0_0_0_0.4px_#ffffff47] p-[11.9px] bg-[#FFFFFF0F] backdrop-blur-lg'>
      <div className='w-full h-full bg-black rounded-[22.37px] sm:px-[22.37px] py-[22.37px] px-3 relative overflow-hidden'>
        <div
          className='absolute top-0 left-0 z-0 w-full'
          style={{
            height: '85%',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, #CF7CFF 0%, #CF7CFF00 100%)',
          }}
        />

        <div className='flex relative z-10 justify-between items-start'>
          <div className='space-y-2'>
            <div className='w-32 h-[18px] rounded bg-white/10 animate-pulse'></div>
            <div className='w-20 h-[10px] rounded bg-white/5 animate-pulse'></div>
          </div>

          <div className='flex items-center gap-[6px]'>
            <div className='w-16 h-[20px] rounded-[7.49px] bg-white/10 animate-pulse'></div>
            <div className='w-[60px] h-[20px] rounded-[7.49px] bg-white/10 animate-pulse'></div>
          </div>
        </div>

        <div className='shadow-[0_0_0_0.5px_#ffffff47,inset_0_2px_8px_rgba(0,0,0,0.20)] rounded-[27.17px] w-full sm:px-[21.13px] px-3 h-[121px] backdrop-blur-sm bg-[#FFFFFF0F] mt-5 relative flex items-center justify-between'>
          <div className='space-y-2'>
            <div className='w-10 h-[11px] rounded bg-white/5 animate-pulse'></div>
            <div className='w-20 h-[30px] rounded bg-white/10 animate-pulse'></div>
            <div className='w-24 h-[10px] rounded bg-white/5 animate-pulse'></div>
          </div>

          <div className='h-[56px] border-l-[1.12px] border-white w-fit'></div>

          <div className='space-y-2 text-center'>
            <div className='w-10 h-[11px] rounded bg-white/5 animate-pulse mx-auto'></div>
            <div className='w-20 h-[30px] rounded bg-white/10 animate-pulse mx-auto'></div>
          </div>
        </div>

        <div className='flex items-center gap-[11.19px] relative mt-1.5'>
          <div className='w-16 h-[21px] rounded-[5px] bg-white/10 animate-pulse'></div>
          <div className='w-16 h-[21px] rounded-[5px] bg-white/10 animate-pulse'></div>
        </div>

        <div className='flex items-center gap-[17px] relative mt-5'>
          <div className='h-[40.89px] rounded-[10px] bg-white/10 animate-pulse w-full'></div>
          <div className='h-[40.89px] rounded-[10px] bg-white/10 animate-pulse w-full max-w-[122px]'></div>
        </div>
      </div>
    </div>
  );
}
