import VaultDetailClient from './VaultDetailClient';

interface VaultDetailPageProps {
  params: Promise<{
    chainId: string;
    vault: string;
  }>;
}

export default async function VaultDetailPage({ params }: VaultDetailPageProps) {
  const { chainId, vault } = await params;
  return <VaultDetailClient chainId={chainId} vault={vault} />;
}