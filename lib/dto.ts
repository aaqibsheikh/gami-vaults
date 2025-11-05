/**
 * Data Transfer Objects for API responses
 * All numeric values are normalized as decimal strings
 * Based on August Digital API structure
 */

// August Digital API Response Types
export interface AugustVaultResponse {
  address: string;
  yield_distributor: string;
  chain: number;
  description: string;
  internal_type: string;
  public_type: string;
  is_featured: boolean;
  is_visible: boolean;
  weekly_performance_fee_bps: number;
  platform_fee_override: Record<string, any>;
  start_datetime: string;
  vault_name: string;
  reserve_target: number;
  reserve_tolerance: number;
  status: 'active' | 'closed';
  is_charge_fees_manual: boolean;
  receipt_token_symbol: string;
  enable_external_assets_update: boolean;
  vault_logo_url: string;
  risk: string;
  max_daily_drawdown: number;
  chain_type: string;
  enabled_historical_price_horizons: number[];
  id: string;
  rewards: AugustReward[];
  subaccounts: AugustSubaccount[];
  reported_apy: AugustAPY;
  receipt_token_integrations: AugustTokenIntegration[];
  hardcoded_strategists: AugustStrategist[];
}

export interface AugustReward {
  id: string;
  updated_at: string;
  created_at: string;
  tokenizedvault_id: string;
  text: string;
  img_url: string;
  multiplier: number;
  start_datetime: string;
}

export interface AugustSubaccount {
  address: string;
  strategist: AugustStrategist;
}

export interface AugustStrategist {
  strategist_name: string;
  strategist_logo: string;
  id: string;
}

export interface AugustAPY {
  apy: number;
  underlying_apy: number;
  liquid_apy: number;
  rewards_compounded: number;
  rewards_claimable: number;
  explainer: string;
  id: string;
  updated_at: string;
  created_at: string;
  tokenized_vault_id: string;
}

export interface AugustTokenIntegration {
  address: string;
  chain: number;
  token_class: string;
  shorthand: string;
  symbol: string;
  tiingo_ticker: string;
  img_url: string;
  is_transferable: boolean;
  id: string;
  updated_at: string;
  created_at: string;
  position_id: string;
  stable_token_pair_id: string;
}

export interface AugustVaultSummary {
  name: string;
  type: string;
  chain: number;
  latest_snapshot: any;
  returns_1d: number;
  returns_7d: number;
  returns_30d: number;
  strategy_allocation: any;
  // TVL calculation fields (may be at root level or in latest_snapshot)
  total_assets?: number | string;
  underlying_price?: number | string;
  tvl?: number | string;
  total_value_locked?: number | string;
}

export interface AugustAPYResponse {
  liquidAPY30Day?: number;
  liquidAPY7Day?: number;
  hgETH30dLiquidAPY?: number; // deprecated
  hgETH7dLiquidAPY?: number; // deprecated
}

export interface AugustWithdrawalSummary {
  total_withdrawals_raw_amount: number;
  normalized_total_withdrawals_amount: string;
  total_assets: string;
  normalized_total_assets: string;
  symbol: string;
  pending_withdrawals: AugustPendingWithdrawal[];
}

export interface AugustPendingWithdrawal {
  date: string;
  amount_raw: number;
  normalized_amount: string;
  vault_percentage: string;
  vault: string;
  receiver: string;
}

// Normalized DTO for our application
export interface VaultDTO {
  id: string;
  chainId: number;
  name: string;
  symbol: string;
  tvlUsd: string; // normalized decimal string
  apyNet: string; // normalized decimal string
  fees: {
    mgmtBps: string; // management fee in basis points
    perfBps: string; // performance fee in basis points
  };
  underlying: {
    symbol: string;
    address: string;
    decimals: number;
  };
  status: 'active' | 'paused' | 'deprecated';
  provider?: 'upshift' | 'ipor' | 'lagoon'; // vault data source
  rewards?: {
    token: string;
    apy: string;
    symbol: string;
  }[];
  strategy?: {
    name: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
  strategist?: {
    name: string;
    logo: string;
    id: string;
  };
  metadata?: {
    website?: string;
    description?: string;
    logo?: string;
    vaultAge?: string;
    realizedApy?: string;
    aprNetAll?: string; // linear annualized APR across full history
    aprNet30d?: string; // linear annualized APR over last 30d
    aprNet7d?: string; // linear annualized APR over last 7d
    apyNetAll?: string; // compounded APY across full history
    apyNet30d?: string; // compounded APY over last 30d
    apyNet7d?: string; // compounded APY over last 7d
  };
}

export interface PositionDTO {
  vault: string;
  chainId: number;
  shares: string; // normalized decimal string
  valueUsd: string; // normalized decimal string
  pnlUsd: string; // normalized decimal string (can be negative)
  entryUsd: string; // normalized decimal string
  rewards?: {
    token: string;
    amount: string; // normalized decimal string
    valueUsd: string; // normalized decimal string
    symbol: string;
  }[];
}

export interface PortfolioDTO {
  address: string;
  chainId: number;
  positions: PositionDTO[];
  totalValueUsd: string; // normalized decimal string
  totalPnlUsd: string; // normalized decimal string
  lastUpdated: string; // ISO timestamp
}

export interface RedemptionDTO {
  vault: string;
  chainId: number;
  address: string;
  claimableAmount: string; // normalized decimal string
  claimableValueUsd: string; // normalized decimal string
  token: {
    symbol: string;
    address: string;
    decimals: number;
  };
  expiry?: string; // ISO timestamp
}

export interface TransactionResponse {
  to: string;
  data: string;
  value: string; // hex string for ETH value
  gasLimit?: string; // hex string
}

export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

// Network configuration
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Cache entry interface
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}
