/**
 * Underlying token unwrapping utilities
 * Handles wrapped tokens and finds the final underlying asset
 */

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isWrapped: boolean;
  underlying?: TokenInfo;
}

export interface UnwrapResult {
  finalToken: TokenInfo;
  unwrapPath: TokenInfo[];
  isWrapped: boolean;
}

/**
 * Common wrapped token mappings
 * TODO: Replace with dynamic detection from contracts
 */
const WRAPPED_TOKENS: Record<number, Record<string, TokenInfo>> = {
  // Ethereum Mainnet
  1: {
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      isWrapped: true,
      underlying: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        name: 'Ether',
        decimals: 18,
        isWrapped: false
      }
    },
    '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C': {
      address: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      isWrapped: false
    }
  },
  // Arbitrum
  42161: {
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      isWrapped: true,
      underlying: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        name: 'Ether',
        decimals: 18,
        isWrapped: false
      }
    }
  },
  // Optimism
  10: {
    '0x4200000000000000000000000000000000000006': {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      isWrapped: true,
      underlying: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        name: 'Ether',
        decimals: 18,
        isWrapped: false
      }
    }
  },
  // Base
  8453: {
    '0x4200000000000000000000000000000000000006': {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      isWrapped: true,
      underlying: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        name: 'Ether',
        decimals: 18,
        isWrapped: false
      }
    }
  }
};

/**
 * Get token info for a given address on a specific chain
 */
export function getTokenInfo(chainId: number, address: string): TokenInfo | null {
  const chainTokens = WRAPPED_TOKENS[chainId];
  if (!chainTokens) return null;
  
  return chainTokens[address.toLowerCase()] || null;
}

/**
 * Unwrap a token to find its underlying asset
 * Handles multiple levels of wrapping
 */
export function unwrapToken(chainId: number, tokenAddress: string): UnwrapResult {
  const unwrapPath: TokenInfo[] = [];
  let currentToken = getTokenInfo(chainId, tokenAddress);
  
  if (!currentToken) {
    // If token is not in our mapping, assume it's not wrapped
    return {
      finalToken: {
        address: tokenAddress,
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18,
        isWrapped: false
      },
      unwrapPath: [],
      isWrapped: false
    };
  }

  unwrapPath.push(currentToken);

  // Follow the unwrap chain
  while (currentToken.isWrapped && currentToken.underlying) {
    const underlyingInfo = getTokenInfo(chainId, currentToken.underlying.address);
    
    if (underlyingInfo) {
      unwrapPath.push(underlyingInfo);
      currentToken = underlyingInfo;
    } else {
      // Use the underlying info from the current token
      unwrapPath.push(currentToken.underlying);
      currentToken = currentToken.underlying;
      break;
    }
  }

  return {
    finalToken: currentToken,
    unwrapPath,
    isWrapped: unwrapPath.length > 1
  };
}

/**
 * Get the final underlying token for a vault
 * This is the actual asset that users deposit/withdraw
 */
export function getVaultUnderlying(chainId: number, vaultTokenAddress: string): TokenInfo {
  const unwrapResult = unwrapToken(chainId, vaultTokenAddress);
  return unwrapResult.finalToken;
}

/**
 * Check if a token is wrapped
 */
export function isWrappedToken(chainId: number, tokenAddress: string): boolean {
  const tokenInfo = getTokenInfo(chainId, tokenAddress);
  return tokenInfo?.isWrapped || false;
}

/**
 * Get all supported tokens for a chain
 */
export function getSupportedTokens(chainId: number): TokenInfo[] {
  const chainTokens = WRAPPED_TOKENS[chainId];
  if (!chainTokens) return [];
  
  return Object.values(chainTokens);
}

/**
 * Find token by symbol on a specific chain
 */
export function findTokenBySymbol(chainId: number, symbol: string): TokenInfo | null {
  const chainTokens = WRAPPED_TOKENS[chainId];
  if (!chainTokens) return null;
  
  for (const token of Object.values(chainTokens)) {
    if (token.symbol.toLowerCase() === symbol.toLowerCase()) {
      return token;
    }
  }
  
  return null;
}

/**
 * Add a new token to the mapping (for dynamic discovery)
 */
export function addTokenMapping(
  chainId: number,
  address: string,
  tokenInfo: TokenInfo
): void {
  if (!WRAPPED_TOKENS[chainId]) {
    WRAPPED_TOKENS[chainId] = {};
  }
  
  WRAPPED_TOKENS[chainId][address.toLowerCase()] = tokenInfo;
}

/**
 * Get the unwrap path as a readable string
 */
export function getUnwrapPathString(chainId: number, tokenAddress: string): string {
  const result = unwrapToken(chainId, tokenAddress);
  
  if (result.unwrapPath.length <= 1) {
    return result.finalToken.symbol;
  }
  
  return result.unwrapPath.map(token => token.symbol).join(' → ');
}
