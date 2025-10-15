/**
 * IPOR Fusion SDK
 * Integrates with IPOR Fusion API to fetch Plasma Vault data
 * 
 * API Documentation: https://api.ipor.io/fusion/vaults
 * Repository: https://github.com/IPOR-Labs/ipor-abi
 */

import { VaultDTO } from './dto';
import { normalizeToString } from './normalize';

/**
 * IPOR Fusion API response types
 */
export interface IporVaultResponse {
  address: string;
  chainId: number;
  name: string;
  asset: string; // Token symbol (e.g., "USDC", "USDT")
  assetAddress: string; // Underlying token contract address
  tvl: string; // Total Value Locked in USD
  apy: string; // Annual Percentage Yield
}

export interface IporVaultsApiResponse {
  vaults: IporVaultResponse[];
}

/**
 * IPOR Fusion API endpoint
 */
const IPOR_FUSION_API_URL = 'https://api.ipor.io/fusion/vaults';

/**
 * GitHub addresses for public vault filtering
 */
const IPOR_GITHUB_ADDRESSES_URL = 
  'https://raw.githubusercontent.com/IPOR-Labs/ipor-abi/refs/heads/main/mainnet/addresses.json';

/**
 * Supported chains configuration
 */
const IPOR_CHAIN_CONFIG: Record<number, string> = {
  1: 'ethereum',
  42161: 'arbitrum',
  8453: 'base',
  43114: 'avalanche',
  130: 'unichain',
  239: 'tac',
  57073: 'ink'
};

/**
 * Retry utility for API calls
 */
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Fetch public vault addresses from GitHub
 */
async function getPublicVaultAddresses(): Promise<Map<string, string[]>> {
  try {
    const response = await fetch(IPOR_GITHUB_ADDRESSES_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch public vaults: ${response.statusText}`);
    }
    
    const publicVaults = await response.json();
    const chainVaults = new Map<string, string[]>();

    Object.entries(publicVaults).forEach(([chainName, chainData]: [string, any]) => {
      if (chainData.vaults) {
        const lowerCaseVaults = chainData.vaults.map(
          (vault: any) => vault.PlasmaVault.toLowerCase()
        );
        chainVaults.set(chainName, lowerCaseVaults);
      }
    });

    return chainVaults;
  } catch (error) {
    console.error('Error fetching public vault addresses:', error);
    // Return empty map if fetch fails
    return new Map();
  }
}

/**
 * Fetch all IPOR Fusion vaults from API
 */
export async function fetchIporVaults(): Promise<IporVaultResponse[]> {
  return retryApiCall(async () => {
    console.log(`🔍 [IPOR API] Fetching vaults from: ${IPOR_FUSION_API_URL}`);
    
    const response = await fetch(IPOR_FUSION_API_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Gami-Vaults/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`IPOR API error: ${response.status} ${response.statusText}`);
    }

    const data: IporVaultsApiResponse = await response.json();
    console.log(`📊 [IPOR API] Received ${data.vaults.length} vaults`);
    
    return data.vaults;
  });
}

/**
 * Fetch IPOR vaults filtered by chain
 */
export async function fetchIporVaultsByChain(chainId: number): Promise<IporVaultResponse[]> {
  const allVaults = await fetchIporVaults();
  const chainVaults = allVaults.filter(vault => vault.chainId === chainId);
  
  console.log(`📊 [IPOR API] Found ${chainVaults.length} vaults for chain ${chainId}`);
  return chainVaults;
}

/**
 * Transform IPOR vault response to our VaultDTO format
 */
export function transformIporVault(iporVault: IporVaultResponse): VaultDTO {
  console.log(`🔄 [IPOR Transform] Processing vault: ${iporVault.name} (${iporVault.address})`);
  
  const chainName = IPOR_CHAIN_CONFIG[iporVault.chainId] || 'unknown';
  const vaultUrl = `https://app.ipor.io/fusion/${chainName}/${iporVault.address.toLowerCase()}`;
  
  return {
    id: iporVault.address,
    chainId: iporVault.chainId,
    name: iporVault.name,
    symbol: `ip${iporVault.asset}`, // e.g., "ipUSDC"
    tvlUsd: normalizeToString(iporVault.tvl),
    apyNet: normalizeToString(iporVault.apy),
    fees: {
      mgmtBps: '0', // IPOR doesn't expose fees via API
      perfBps: '0'
    },
    underlying: {
      symbol: iporVault.asset,
      address: iporVault.assetAddress,
      decimals: getTokenDecimals(iporVault.asset)
    },
    status: 'active',
    provider: 'ipor',
    strategy: {
      name: 'IPOR Fusion',
      description: 'Advanced yield optimization with leveraged strategies',
      riskLevel: 'high' // IPOR looping strategies are higher risk
    },
    strategist: {
      name: 'IPOR Protocol',
      logo: 'https://app.ipor.io/favicon.ico',
      id: 'ipor-protocol'
    },
    metadata: {
      website: vaultUrl,
      description: `IPOR Plasma Vault for ${iporVault.asset}`,
      logo: 'https://app.ipor.io/favicon.ico'
    }
  };
}

/**
 * Get token decimals based on symbol
 */
function getTokenDecimals(symbol: string): number {
  const decimalsMap: Record<string, number> = {
    'USDC': 6,
    'USDT': 6,
    'USDbC': 6,
    'DAI': 18,
    'ETH': 18,
    'WETH': 18,
    'weETH': 18,
    'wstETH': 18,
    'rETH': 18,
    'rsETH': 18,
    'WBTC': 8,
    'MORPHO': 18,
    'LINK': 18,
    'AERO': 18,
    'VIRTUAL': 18,
    'ZRO': 18
  };
  
  return decimalsMap[symbol] || 18;
}

/**
 * Fetch and transform IPOR vaults for specific chains
 */
export async function getIporVaults(chainIds: number[]): Promise<VaultDTO[]> {
  try {
    // Fetch all vaults from API
    const allVaults = await fetchIporVaults();
    
    // Get public vault addresses (optional - for filtering)
    const publicVaults = await getPublicVaultAddresses();
    
    // Filter by requested chains
    const filteredVaults = allVaults.filter(vault => {
      // Filter by chain
      if (!chainIds.includes(vault.chainId)) {
        return false;
      }
      
      // Filter out pilot vaults
      if (vault.name.toLowerCase().includes('pilot')) {
        return false;
      }
      
      // Optional: Filter to only public vaults
      // Uncomment this if you only want public vaults
      /*
      const chainName = IPOR_CHAIN_CONFIG[vault.chainId];
      const publicAddresses = publicVaults.get(chainName) || [];
      if (!publicAddresses.includes(vault.address.toLowerCase())) {
        return false;
      }
      */
      
      return true;
    });
    
    console.log(`📊 [IPOR] Filtered to ${filteredVaults.length} vaults for chains: ${chainIds.join(', ')}`);
    
    // Deduplicate by address (some vaults appear multiple times with different names)
    const uniqueVaults = filteredVaults.reduce((acc, vault) => {
      const key = `${vault.chainId}-${vault.address.toLowerCase()}`;
      if (!acc.has(key)) {
        acc.set(key, vault);
      } else {
        // Keep the one with the longer/more descriptive name
        const existing = acc.get(key)!;
        if (vault.name.length > existing.name.length) {
          acc.set(key, vault);
        }
      }
      return acc;
    }, new Map<string, IporVaultResponse>());
    
    const deduplicatedVaults = Array.from(uniqueVaults.values());
    console.log(`📊 [IPOR] Deduplicated to ${deduplicatedVaults.length} unique vaults`);
    
    // Transform to VaultDTO format
    const transformedVaults = deduplicatedVaults.map(transformIporVault);
    
    return transformedVaults;
  } catch (error) {
    console.error('Error fetching IPOR vaults:', error);
    return [];
  }
}

/**
 * Check if IPOR integration is enabled
 */
export function isIporEnabled(): boolean {
  return process.env.ENABLE_IPOR !== 'false';
}

