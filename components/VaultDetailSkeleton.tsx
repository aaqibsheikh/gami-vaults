export default function VaultDetailSkeleton() {
  return (
    <div className='animate-pulse'>
      {/* VaultDetail Skeleton */}
      <div className='w-full sm:px-[18.76px] sm:py-[21px] py-[14.5px] px-[14.6px] sm:rounded-[21.2px] rounded-[14.6px] bg-[#FFFFFF0F] backdrop-blur-lg space-y-5'>
        {/* Header Card */}
        <div className='flex bg-[#141414] sm:rounded-[16.11px] rounded-[11.28px] w-full sm:!p-[14.97px] px-2.5 py-4 justify-between items-start'>
          <div className='space-y-2'>
            <div className='h-8 sm:h-10 bg-white/10 rounded w-48 sm:w-64'></div>
            <div className='h-3 bg-white/10 rounded w-32'></div>
          </div>
          <div className='h-8 w-20 bg-white/10 rounded-[10px]'></div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-y-20 justify-between md:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='flex flex-col gap-0.5 justify-center items-center sm:gap-2'>
              <div className='h-8 sm:h-10 bg-white/10 rounded w-24 sm:w-32'></div>
              <div className='h-3 bg-white/10 rounded w-16 sm:w-20'></div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className='flex lg:gap-16 gap-6 items-start w-full md:mt-[68px] mt-5'>
        {/* Left Side - VaultDetailsSections Skeleton */}
        <div className='lg:min-w-[58.89%] md:w-[55%] w-full'>
          <div className='md:space-y-[30px] space-y-[22px]'>
            {/* Strategy Overview */}
            <div className='space-y-4'>
              <div className='h-6 bg-white/10 rounded w-48'></div>
              <div className='space-y-2'>
                <div className='h-4 bg-white/10 rounded w-full'></div>
                <div className='h-4 bg-white/10 rounded w-full'></div>
                <div className='h-4 bg-white/10 rounded w-3/4'></div>
              </div>
            </div>

            {/* Chart Section */}
            <div className='space-y-5'>
              <div className='flex h-[237px] px-3 py-3 shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] rounded-[30px]'>
                <div className='w-full h-full bg-white/5 rounded-[20px]'></div>
              </div>
            </div>

            {/* Protocol Allocation */}
            <div className='rounded-[20px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] md:px-3 px-2.5 md:py-[30px] py-4 md:space-y-5 space-y-2.5'>
              <div className='h-6 bg-white/10 rounded w-48 md:px-3 px-2'></div>
              <div className='md:space-y-[18px] space-y-2.5'>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className='md:rounded-[16px] rounded-[8.66px] bg-[#141414] flex justify-between items-center md:p-[14.97px] p-2'
                  >
                    <div className='flex gap-2 items-center'>
                      <div className='md:w-[15px] w-2 md:h-[15px] h-2 rounded-full bg-white/10'></div>
                      <div className='h-5 bg-white/10 rounded w-24'></div>
                    </div>
                    <div className='h-4 bg-white/10 rounded w-12'></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Structure */}
            <div className='rounded-[20px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] md:px-3 px-2.5 md:py-[30px] py-4 md:space-y-5 space-y-2.5'>
              <div className='h-6 bg-white/10 rounded w-40 md:px-3 px-2'></div>
              <div className='md:space-y-[18px] space-y-2.5'>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className='md:rounded-[16px] rounded-[8.66px] bg-[#141414] flex justify-between items-center md:py-[14.97px] py-2 md:px-[13px] px-2'
                  >
                    <div className='h-5 bg-white/10 rounded w-32'></div>
                    <div className='h-4 bg-white/10 rounded w-24'></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Disclosure */}
            <div className='rounded-[20.78px] border border-[#FF9C4680] bg-[#FF9C460F] md:py-[30px] md:px-[20px] py-5 px-5 space-y-3.5'>
              <div className='h-6 bg-white/10 rounded w-44'></div>
              <div className='space-y-2'>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='h-4 bg-white/10 rounded w-full'></div>
                ))}
              </div>
            </div>

            {/* Contract Information */}
            <div className='space-y-1 md:space-y-5'>
              <div className='h-6 bg-white/10 rounded w-48 md:px-3'></div>
              <div className='rounded-[21px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] md:px-[9.5px] px-[14px] py-5 flex justify-between items-center gap-3'>
                <div className='h-5 bg-white/10 rounded flex-1'></div>
                <div className='h-[30px] w-16 bg-white/10 rounded-[10px]'></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - DepositForm Skeleton */}
        <div className='hidden w-full md:block'>
          <div className='sticky top-24'>
            <div className='rounded-[20px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] p-6 space-y-6'>
              {/* Tabs */}
              <div className='flex gap-2'>
                <div className='h-10 bg-white/10 rounded flex-1'></div>
                <div className='h-10 bg-white/10 rounded flex-1'></div>
              </div>

              {/* Balance */}
              <div className='space-y-2'>
                <div className='h-4 bg-white/10 rounded w-24'></div>
                <div className='h-6 bg-white/10 rounded w-32'></div>
              </div>

              {/* Input */}
              <div className='space-y-2'>
                <div className='h-4 bg-white/10 rounded w-20'></div>
                <div className='h-12 bg-[#141414] rounded-lg'></div>
              </div>

              {/* Stats */}
              <div className='space-y-3'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='flex justify-between'>
                    <div className='h-4 bg-white/10 rounded w-24'></div>
                    <div className='h-4 bg-white/10 rounded w-20'></div>
                  </div>
                ))}
              </div>

              {/* Button */}
              <div className='h-12 bg-white/10 rounded-lg'></div>
            </div>
          </div>
        </div>
      </div>

      {/* VaultTransparency Skeleton */}
      <div className='mt-12 space-y-8'>
        <div className='h-8 bg-white/10 rounded w-64'></div>

        {/* Transparency Cards */}
        <div className='grid gap-6 md:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='rounded-[20px] shadow-[0_0_0_0.4px_#ffffff47] bg-[#FFFFFF0F] p-6 space-y-4'
            >
              <div className='h-6 bg-white/10 rounded w-40'></div>
              <div className='space-y-3'>
                {[1, 2].map((j) => (
                  <div key={j} className='space-y-2'>
                    <div className='h-4 bg-white/10 rounded w-32'></div>
                    <div className='h-5 bg-white/10 rounded w-full'></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

