/**
 * Transform August Digital API responses to our normalized DTO format
 */

import { AugustVaultResponse, AugustVaultSummary, AugustAPYResponse, VaultDTO } from './dto';
import { normalizeToString } from './normalize';

/**
 * Common token configurations for Ethereum mainnet
 * These are standard token addresses and decimals for known tokens
 */
const COMMON_TOKENS: Record<string, { address: string; decimals: number }> = {
  'ETH': { address: '0x0000000000000000000000000000000000000000', decimals: 18 },
  'WETH': { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
  'USDC': { address: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C', decimals: 6 },
  'USDT': { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  'DAI': { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  'BTC': { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
  'WBTC': { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
  'wstETH': { address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', decimals: 18 },
  'stETH': { address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', decimals: 18 },
  'rsETH': { address: '0xae78736Cd615f374D3085123A210448E74Fc6393', decimals: 18 },
  'rETH': { address: '0xae78736Cd615f374D3085123A210448E74Fc6393', decimals: 18 },
  'tBTC': { address: '0x18084fbA666a33d37592fA2633fD49a74DD93a88', decimals: 18 },
  'sUSDe': { address: '0x9d39A5DE30e57443BfF2A8307A4256c8797A3497', decimals: 18 },
  'USDe': { address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', decimals: 18 },
  'LBTC': { address: '0x8c6f28f2f1a3c8714dd53dfe9b9e7d0b8c4b4b4b', decimals: 18 },
  'WAVAX': { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', decimals: 18 },
  'AUSD': { address: '0x1234567890123456789012345678901234567890', decimals: 18 },
  'USR': { address: '0x1234567890123456789012345678901234567890', decimals: 18 },
  'TAC': { address: '0x1234567890123456789012345678901234567890', decimals: 18 },
  'tETH': { address: '0x1234567890123456789012345678901234567890', decimals: 18 }
};

/**
 * Get the underlying token for a vault based on August Digital API data
 * This function uses the vault's receipt_token_integrations, receipt_token_symbol, and name to intelligently determine the underlying token
 */
function getVaultUnderlyingToken(
  vaultAddress: string, 
  vaultName?: string, 
  receiptTokenSymbol?: string,
  receiptTokenIntegrations?: any[]
): { symbol: string; address: string; decimals: number } {
  
  // Strategy 0: Use receipt_token_integrations if available (most accurate)
  if (receiptTokenIntegrations && receiptTokenIntegrations.length > 0) {
    console.log(`🎯 [Token Detection] Using receipt_token_integrations for ${vaultAddress}`);
    const integration = receiptTokenIntegrations[0];
    if (integration.symbol && integration.address) {
      console.log(`✅ [Token Detection] Found token: ${integration.symbol} at ${integration.address}`);
      // Use the token information directly from the API
      return {
        symbol: integration.symbol,
        address: integration.address,
        decimals: integration.decimals || 18 // Default to 18 if not provided
      };
    }
  }
  
  // Strategy 1: Use receipt_token_symbol to infer underlying token
  if (receiptTokenSymbol) {
    console.log(`🎯 [Token Detection] Using receipt_token_symbol pattern matching for ${receiptTokenSymbol}`);
    const symbolLower = receiptTokenSymbol.toLowerCase();
    
    // Common patterns in receipt token symbols that indicate underlying tokens
    const tokenPatterns = [
      { pattern: /up(lbtc|btc)/i, token: 'LBTC' },
      { pattern: /shifteth/i, token: 'ETH' },
      { pattern: /gteth/i, token: 'wstETH' },
      { pattern: /upazt|upedge|upgamma|upsylva/i, token: 'USDC' },
      { pattern: /maxiusr|tacusr/i, token: 'USR' },
      { pattern: /tacrse?th/i, token: 'rsETH' },
      { pattern: /uptbtc/i, token: 'tBTC' },
      { pattern: /upsusde/i, token: 'sUSDe' },
      { pattern: /hgeth/i, token: 'rsETH' },
      { pattern: /upavax/i, token: 'WAVAX' },
      { pattern: /tac-teth|taceth/i, token: 'tETH' },
      { pattern: /upausd/i, token: 'AUSD' },
      { pattern: /xupusdc/i, token: 'USDC' },
      { pattern: /upusdc/i, token: 'USDC' },
      { pattern: /upusdt/i, token: 'USDT' },
      { pattern: /upeth/i, token: 'ETH' },
      { pattern: /upwbtc/i, token: 'WBTC' },
      { pattern: /updai/i, token: 'DAI' }
    ];

    for (const { pattern, token } of tokenPatterns) {
      if (pattern.test(symbolLower)) {
        console.log(`✅ [Token Detection] Pattern ${pattern} matched for ${receiptTokenSymbol} → ${token}`);
        const tokenConfig = COMMON_TOKENS[token];
        if (tokenConfig) {
          return { symbol: token, ...tokenConfig };
        }
      }
    }
  }

  // Strategy 2: Use vault name to infer underlying token
  if (vaultName) {
    const nameLower = vaultName.toLowerCase();
    
    const namePatterns = [
      { pattern: /eth|ethereum/i, token: 'ETH' },
      { pattern: /usdc/i, token: 'USDC' },
      { pattern: /usdt/i, token: 'USDT' },
      { pattern: /wsteth|steth|treehouse/i, token: 'wstETH' },
      { pattern: /lbtc/i, token: 'LBTC' },
      { pattern: /tbtc/i, token: 'tBTC' },
      { pattern: /rseth|reth/i, token: 'rsETH' },
      { pattern: /usr/i, token: 'USR' },
      { pattern: /btc|bitcoin/i, token: 'BTC' },
      { pattern: /susde|ethena/i, token: 'sUSDe' },
      { pattern: /tac/i, token: 'TAC' },
      { pattern: /avax/i, token: 'WAVAX' },
      { pattern: /ausd/i, token: 'AUSD' },
      { pattern: /dai/i, token: 'DAI' },
      { pattern: /wbtc/i, token: 'WBTC' }
    ];

    for (const { pattern, token } of namePatterns) {
      if (pattern.test(nameLower)) {
        const tokenConfig = COMMON_TOKENS[token];
        if (tokenConfig) {
          return { symbol: token, ...tokenConfig };
        }
      }
    }
  }

  // Strategy 3: Default fallback
  console.warn(`Could not determine underlying token for vault ${vaultAddress} (${vaultName})`);
  return { symbol: 'UNKNOWN', address: vaultAddress, decimals: 18 };
}

/**
 * Transform August Digital vault response to our VaultDTO format
 */
export function transformAugustVault(augustVault: AugustVaultResponse): VaultDTO {
  console.log(`🔄 [Transform] Processing vault: ${augustVault.vault_name} (${augustVault.address})`);
  console.log(`🔄 [Transform] Receipt token symbol: ${augustVault.receipt_token_symbol}`);
  console.log(`🔄 [Transform] Reported APY:`, augustVault.reported_apy);
  console.log(`🔄 [Transform] Receipt token integrations:`, augustVault.receipt_token_integrations);
  
  // Get strategist information
  const strategists = getStrategists(augustVault);
  const primaryStrategist = strategists.length > 0 ? strategists[0] : undefined;
  
  return {
    // Use the on-chain vault contract address as the ID throughout the app
    id: augustVault.address,
    chainId: augustVault.chain,
    name: augustVault.vault_name,
    symbol: augustVault.receipt_token_symbol,
    tvlUsd: '0', // Will need to be fetched separately or calculated
    apyNet: normalizeToString(augustVault.reported_apy?.apy || 0),
    fees: {
      mgmtBps: '0', // August Digital doesn't provide management fees in the same format
      perfBps: normalizeToString(augustVault.weekly_performance_fee_bps || 0)
    },
    underlying: getVaultUnderlyingToken(
      augustVault.address, 
      augustVault.vault_name, 
      augustVault.receipt_token_symbol,
      augustVault.receipt_token_integrations
    ),
    status: augustVault.status === 'active' ? 'active' : 'paused',
    rewards: augustVault.rewards?.map(reward => ({
      token: reward.id,
      apy: normalizeToString(reward.multiplier || 0),
      symbol: reward.text || 'Reward'
    })) || [],
    strategy: {
      name: augustVault.public_type,
      description: augustVault.description,
      riskLevel: mapRiskLevel(augustVault.risk)
    },
    strategist: primaryStrategist,
    metadata: {
      description: augustVault.description,
      logo: augustVault.vault_logo_url,
      website: undefined // Not provided by August API
    }
  };
}

/**
 * Map August Digital risk levels to our risk levels
 */
function mapRiskLevel(augustRisk: string | null): 'low' | 'medium' | 'high' {
  if (!augustRisk) {
    return 'medium'; // Default to medium if no risk data
  }
  
  const riskLower = augustRisk.toLowerCase();
  
  if (riskLower.includes('low') || riskLower.includes('conservative')) {
    return 'low';
  } else if (riskLower.includes('high') || riskLower.includes('aggressive')) {
    return 'high';
  } else {
    return 'medium';
  }
}

/**
 * Get TVL from August Digital vault summary or calculate from assets
 */
export function getVaultTVL(augustVault: AugustVaultResponse, summary?: AugustVaultSummary): string {
  // If we have summary data with total_assets and underlying_price, calculate TVL
  if (summary && 'total_assets' in summary && 'underlying_price' in summary) {
    const totalAssets = (summary as any).total_assets || 0;
    const underlyingPrice = (summary as any).underlying_price || 0;
    const tvl = totalAssets * underlyingPrice;
    return normalizeToString(tvl);
  }
  
  // Otherwise, we'd need to fetch from on-chain data
  return '0';
}

/**
 * Get enhanced APY data from August Digital
 */
export function getEnhancedAPY(augustAPY: AugustAPYResponse): {
  apy30Day: string;
  apy7Day: string;
} {
  return {
    apy30Day: normalizeToString(augustAPY.liquidAPY30Day || augustAPY.hgETH30dLiquidAPY || 0),
    apy7Day: normalizeToString(augustAPY.liquidAPY7Day || augustAPY.hgETH7dLiquidAPY || 0)
  };
}

/**
 * Check if vault is featured or has special status
 */
export function getVaultStatus(augustVault: AugustVaultResponse): {
  isFeatured: boolean;
  isVisible: boolean;
  status: 'active' | 'paused' | 'deprecated';
} {
  return {
    isFeatured: augustVault.is_featured,
    isVisible: augustVault.is_visible,
    status: augustVault.status === 'active' ? 'active' : 'paused'
  };
}

/**
 * Get vault performance metrics from summary
 */
export function getPerformanceMetrics(summary: AugustVaultSummary): {
  returns1D: string;
  returns7D: string;
  returns30D: string;
} {
  return {
    returns1D: normalizeToString(summary.returns_1d || 0),
    returns7D: normalizeToString(summary.returns_7d || 0),
    returns30D: normalizeToString(summary.returns_30d || 0)
  };
}

/**
 * Get strategist information from August vault
 */
export function getStrategists(augustVault: AugustVaultResponse): Array<{
  name: string;
  logo: string;
  id: string;
}> {
  const strategists = [...augustVault.hardcoded_strategists];
  
  // Add strategists from subaccounts
  augustVault.subaccounts.forEach(subaccount => {
    if (subaccount.strategist) {
      strategists.push(subaccount.strategist);
    }
  });
  
  // Remove duplicates based on ID
  const uniqueStrategists = strategists.filter((strategist, index, self) => 
    index === self.findIndex(s => s.id === strategist.id)
  );
  
  // Transform to the expected format
  return uniqueStrategists.map(strategist => ({
    name: strategist.strategist_name,
    logo: strategist.strategist_logo,
    id: strategist.id
  }));
}
