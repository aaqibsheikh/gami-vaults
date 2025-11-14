import Link from 'next/link';

interface VaultCardProps {
  name: string;
  apy: string;
  tvl: string;
  assets: string[];
  chainId: number;
  vaultId: string;
  chainName?: string;
  provider?: 'upshift' | 'ipor' | 'lagoon';
}

const VaultCard = ({
  name,
  apy,
  tvl,
  assets,
  chainId,
  vaultId,
  chainName,
  provider,
}: VaultCardProps) => {
  let badgeText = '';
  let badgeClass = '';
  if (provider === 'ipor') {
    badgeText = 'Advanced';
    badgeClass = 'bg-[#C4511F]';
  } else if (provider === 'lagoon') {
    badgeText = 'Lagoon';
    badgeClass = 'bg-[#6B73FF]';
  } else if (provider === 'upshift') {
    badgeText = 'Upshift';
    badgeClass = 'bg-[#2C2929]';
  } else {
    badgeText = '--';
    badgeClass = 'bg-[#2C2929]';
  }
  return (
    <div className='w-full sm:min-w-[337px] min-h-[335px] rounded-[29.44px] shadow-[0_0_0_0.4px_#ffffff47] p-[11.9px] bg-[#FFFFFF0F] backdrop-blur-lg'>
      <div className='w-full h-full bg-black rounded-[22.37px] sm:px-[22.37px] py-[22.37px] px-3 relative overflow-hidden'>
        <div
          className='absolute top-0 left-0 z-0 w-full'
          style={{
            height: '85%',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, #CF7CFF 0%, #CF7CFF00 100%)',
          }}
        />

        <div className='flex relative z-10 gap-1 justify-between items-start md:gap-2'>
          <div className='flex-1 min-w-0'>
            <div
              className='sm:font-bold sm:text-[17.9px] leading-none tracking-[-0.358px] truncate'
              title={name}
            >
              {name}
            </div>

            <Link
              href={`/vaults/${chainId}/${vaultId}`}
              className='text-white text-[10px] underline hover:text-[#A100FF] transition-colors'
            >
              View Vault
            </Link>
          </div>

          <div className='flex items-center gap-[6px]'>
            {chainName && (
              <div className='text-[9.59px] font-medium leading-none text-white bg-[#2C2929] rounded-[7.49px] h-[17px] flex items-center justify-center px-[4.49px]'>
                <span>{chainName}</span>
              </div>
            )}

            <div
              className={`text-[9.59px] font-medium leading-none text-white bg-[#2C2929] rounded-[7.49px] h-[17px] flex items-center justify-center px-[4.49px]`}
            >
              {badgeText}
            </div>
          </div>
        </div>

        <div className='flex gap-[7px]'>
          <div className='shadow-[0_0_0_0.5px_#ffffff47,inset_0_2px_8px_rgba(0,0,0,0.20)] rounded-[20px] w-full sm:px-[15px] px-3 h-[121px] backdrop-blur-sm bg-[#FFFFFF0F] mt-5 relative flex items-center justify-center'>
            <div className='text-[12px] leading-none absolute top-[11px] right-[9px]'>APY</div>

            <div className='text-center'>
              <div className='font-modernist font-bold text-[30px] leading-none mb-1.5'>{apy}</div>

              <div className='text-[#FFFFFFB2] text-[12px] leading-none'>Target : {apy}</div>
            </div>
          </div>

          <div className='shadow-[0_0_0_0.5px_#ffffff47,inset_0_2px_8px_rgba(0,0,0,0.20)] rounded-[20px] w-full sm:px-[15px] px-3 h-[121px] backdrop-blur-sm bg-[#FFFFFF0F] mt-5 relative flex items-center justify-center'>
            <div className='text-[12px] leading-none absolute top-[11px] right-[9px]'>TVL</div>

            <div className='text-center'>
              <div className='font-modernist font-bold text-[30px] leading-none mb-1.5'>{tvl}</div>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-[11.19px] relative mt-1.5'>
          {assets.map((asset, index) => (
            <div
              key={index}
              className='bg-[#2C2929] rounded-[5px] h-[21px] px-[4.74px] leading-none text-[13.41px] text-white flex items-center justify-center'
            >
              {asset}
            </div>
          ))}
        </div>

        <div className='flex items-center gap-[17px] relative mt-5'>
          <Link
            href={`/vaults/${chainId}/${vaultId}?tab=deposit`}
            className='px-[28.44px] h-[40.89px] rounded-[10px] bg-gradient-purple text-white text-[14.22px] font-medium font-dm-sans hover:opacity-90 transition-opacity flex items-center justify-center w-full'
          >
            Deposit
          </Link>

          <Link
            href={`/vaults/${chainId}/${vaultId}`}
            className='px-[28.44px] h-[40.89px] rounded-[10px] shadow-[0_0_0_1px_#ffffff47] bg-[#FFFFFF0F] text-white text-[14px] font-medium font-dm-sans hover:bg-white/10 transition-colors w-full flex items-center justify-center'
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;
