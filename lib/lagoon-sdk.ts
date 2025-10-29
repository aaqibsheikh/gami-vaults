/**
 * Lagoon SDK
 * Integrates with Lagoon vaults by reading on-chain data
 * 
 * Documentation: https://docs.lagoon.finance/developer-hub
 */

import { createPublicClient, http, PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { VaultDTO } from './dto';
import { normalizeToString } from './normalize';

/**
 * Lagoon vault contract ABI (minimal for reading basic data)
 */
const LAGOON_VAULT_ABI = [
  // Read functions
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'asset',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Lagoon vault data structure
 */
export interface LagoonVaultData {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  totalAssets: bigint;
  asset: string;
  paused: boolean;
}

/**
 * Get public client for reading on-chain data
 */
function getPublicClient(): PublicClient {
  // Try environment variable first, then fallback to public RPC
  const rpcUrl = process.env.RPC_1 || 'https://eth.llamarpc.com';
  
  return createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl)
  });
}

/**
 * Fetch Lagoon vault data from on-chain contract
 */
export async function fetchLagoonVault(address: string, chainId: number): Promise<LagoonVaultData> {
  console.log(`🔍 [Lagoon SDK] Fetching vault data for ${address} on chain ${chainId}`);
  const publicClient = getPublicClient();
  
  try {
    // Read vault data with individual error handling for each call
    let name = 'Lagoon Vault';
    let symbol = 'LAG';
    let totalSupply = BigInt(0);
    let totalAssets = BigInt(0);
    let assetAddress = '';
    let paused = false;

    // Try to read name
    try {
      console.log(`📖 [Lagoon SDK] Reading name for ${address}`);
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'name',
      });
      name = result || name;
      console.log(`✅ [Lagoon SDK] Name: ${name}`);
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read name for ${address}:`, error);
    }

    // Try to read symbol
    try {
      console.log(`📖 [Lagoon SDK] Reading symbol for ${address}`);
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'symbol',
      });
      symbol = result || symbol;
      console.log(`✅ [Lagoon SDK] Symbol: ${symbol}`);
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read symbol for ${address}:`, error);
    }

    // Try to read totalSupply
    try {
      console.log(`📖 [Lagoon SDK] Reading totalSupply for ${address}`);
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'totalSupply',
      });
      totalSupply = result as bigint;
      console.log(`✅ [Lagoon SDK] Total Supply: ${totalSupply.toString()}`);
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read totalSupply for ${address}:`, error);
    }

    // Try to read totalAssets
    try {
      console.log(`📖 [Lagoon SDK] Reading totalAssets for ${address}`);
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'totalAssets',
      });
      totalAssets = result as bigint;
      console.log(`✅ [Lagoon SDK] Total Assets: ${totalAssets.toString()}`);
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read totalAssets for ${address}:`, error);
    }

    // Try to read asset
    try {
      console.log(`📖 [Lagoon SDK] Reading asset for ${address}`);
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'asset',
      });
      assetAddress = result as string;
      console.log(`✅ [Lagoon SDK] Asset: ${assetAddress}`);
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read asset for ${address}:`, error);
    }

    // Try to read paused
    try {
      console.log(`📖 [Lagoon SDK] Reading paused for ${address}`);
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: LAGOON_VAULT_ABI,
        functionName: 'paused',
      });
      paused = result as boolean;
      console.log(`✅ [Lagoon SDK] Paused: ${paused}`);
    } catch (error) {
      console.warn(`❌ [Lagoon SDK] Failed to read paused for ${address}:`, error);
    }

    const result = {
      address,
      name,
      symbol,
      totalSupply,
      totalAssets,
      asset: assetAddress,
      paused,
    };
    
    console.log(`✅ [Lagoon SDK] Successfully fetched vault data:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to fetch Lagoon vault data for ${address}:`, error);
    throw new Error(`Failed to fetch Lagoon vault data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get USDC price in USD (simplified - in production, use an oracle)
 */
async function getUsdcPrice(): Promise<number> {
  // USDC should be ~$1, but we can add oracle integration later
  return 1;
}

/**
 * Transform Lagoon vault data to VaultDTO format
 */
export function transformLagoonVault(
  vaultData: LagoonVaultData,
  chainId: number,
  underlyingSymbol: string,
  assetDecimals: number
): VaultDTO {
  // Calculate TVL: totalAssets in USD
  // Note: This is simplified. In production, you'd use the actual USDC price
  const tvlUsd = Number(vaultData.totalAssets) / Math.pow(10, assetDecimals);
  
  return {
    id: vaultData.address,
    chainId,
    name: vaultData.name,
    symbol: vaultData.symbol,
    tvlUsd: normalizeToString(tvlUsd),
    apyNet: '0', // Lagoon doesn't provide APY via on-chain calls
    fees: {
      mgmtBps: '0',
      perfBps: '0'
    },
    underlying: {
      symbol: underlyingSymbol,
      address: vaultData.asset,
      decimals: assetDecimals
    },
    status: vaultData.paused ? 'paused' : 'active',
    provider: 'lagoon',
    metadata: {
      website: `https://app.lagoon.finance/vault/${chainId}/${vaultData.address.toLowerCase()}`,
      description: `Lagoon ${underlyingSymbol} Vault`,
      logo: undefined
    }
  };
}

/**
 * Fetch and transform Lagoon vault for a specific address
 */
export async function getLagoonVault(
  address: string,
  chainId: number,
  underlyingSymbol: string,
  assetDecimals: number
): Promise<VaultDTO> {
  try {
    const vaultData = await fetchLagoonVault(address, chainId);
    return transformLagoonVault(vaultData, chainId, underlyingSymbol, assetDecimals);
  } catch (error) {
    console.error(`Error fetching Lagoon vault ${address}:`, error);
    throw error;
  }
}
