/**
 * Curated Vault List
 * Based on David's specifications from Jon
 * 
 * USDC vaults:
 * - Upshift: 0xD066649Bcb7d8D3335fE29CaD0AED6E17D5828B5
 * - Upshift: 0x0985C88929A776a2E059615137a48bA5A473E25D
 * - Lagoon: 0xdae854d0896ad2fee335689a3f7b4a95fd1a3e46
 * - Lagoon: 0x59b7942f7d2afd085691ce65c152e0d38d4eff22
 * - Lagoon x Stakedo: TBD
 * - IPOR: TBD
 * 
 * BTC vault:
 * - Upshift: 0x6625bA54DC861e9f5c678983dBa5BA96d19a9224
 * 
 * Important Note on Upshift Vaults:
 * - Upshift vaults store funds in subaccounts, not directly in the vault address
 * - This means you cannot get the TVL by checking the vault contract balance
 * - The getVaultSummary() API call from August Digital already aggregates funds from all subaccounts
 * - Our TVL calculation uses getVaultSummary() which correctly handles subaccounts
 */

export interface CuratedVault {
  address: string;
  chainId: number;
  name: string;
  underlyingSymbol: string;
  provider: 'upshift' | 'lagoon' | 'ipor';
  externalUrl?: string;
  note?: string;
}

export const CURATED_VAULTS: CuratedVault[] = [
  // Upshift USDC Vault 1
  {
    address: '0xD066649Bcb7d8D3335fE29CaD0AED6E17D5828B5',
    chainId: 1, // Ethereum mainnet
    name: 'Upshift USDC Vault',
    underlyingSymbol: 'USDC',
    provider: 'upshift',
    externalUrl: 'https://app.upshift.finance/pools/1/0xD066649Bcb7d8D3335fE29CaD0AED6E17D5828B5',
    note: 'Funds in subaccounts - TVL from getVaultSummary() includes all subaccounts'
  },
  
  // Upshift USDC Vault 2
  {
    address: '0x0985C88929A776a2E059615137a48bA5A473E25D',
    chainId: 1, // Ethereum mainnet
    name: 'Upshift USDC Vault',
    underlyingSymbol: 'USDC',
    provider: 'upshift',
    externalUrl: 'https://app.upshift.finance/pools/1/0x0985C88929A776a2E059615137a48bA5A473E25D',
    note: 'Funds in subaccounts - TVL from getVaultSummary() includes all subaccounts'
  },
  
  // Lagoon USDC Vault 1
  {
    address: '0xdae854d0896ad2fee335689a3f7b4a95fd1a3e46',
    chainId: 1, // Ethereum mainnet
    name: 'Lagoon USDC Vault',
    underlyingSymbol: 'USDC',
    provider: 'lagoon',
    externalUrl: 'https://app.lagoon.finance/vault/1/0xdae854d0896ad2fee335689a3f7b4a95fd1a3e46'
  },
  
  // Lagoon USDC Vault 2
  {
    address: '0x59b7942f7d2afd085691ce65c152e0d38d4eff22',
    chainId: 1, // Ethereum mainnet
    name: 'Lagoon USDC Vault',
    underlyingSymbol: 'USDC',
    provider: 'lagoon',
    externalUrl: 'https://app.lagoon.finance/vault/1/0x59b7942f7d2afd085691ce65c152e0d38d4eff22'
  },
  
  // Upshift BTC Vault
  {
    address: '0x6625bA54DC861e9f5c678983dBa5BA96d19a9224',
    chainId: 1, // Ethereum mainnet
    name: 'Upshift BTC Vault',
    underlyingSymbol: 'BTC',
    provider: 'upshift',
    externalUrl: 'https://app.upshift.finance/pools/1/0x6625bA54DC861e9f5c678983dBa5BA96d19a9224'
  }
];

/**
 * Get curated vault by address and chain
 */
export function getCuratedVault(address: string, chainId: number): CuratedVault | undefined {
  return CURATED_VAULTS.find(
    v => v.address.toLowerCase() === address.toLowerCase() && v.chainId === chainId
  );
}

/**
 * Check if a vault is in the curated list
 */
export function isCuratedVault(address: string, chainId: number): boolean {
  return getCuratedVault(address, chainId) !== undefined;
}

/**
 * Get all curated vaults for specific chains
 */
export function getCuratedVaultsByChain(chainIds: number[]): CuratedVault[] {
  return CURATED_VAULTS.filter(v => chainIds.includes(v.chainId));
}

/**
 * Get all curated vault addresses
 */
export function getCuratedVaultAddresses(): Map<number, string[]> {
  const map = new Map<number, string[]>();
  
  CURATED_VAULTS.forEach(vault => {
    if (!map.has(vault.chainId)) {
      map.set(vault.chainId, []);
    }
    map.get(vault.chainId)!.push(vault.address.toLowerCase());
  });
  
  return map;
}
