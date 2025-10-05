/**
 * Zod validation schemas for API requests
 */

import { z } from 'zod';

/**
 * Chain ID validation - supports common networks
 */
export const chainIdSchema = z.number().int().min(1).max(999999999);

/**
 * Ethereum address validation
 */
export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

/**
 * Decimal string validation (for token amounts)
 */
export const decimalStringSchema = z.string().regex(/^\d+(\.\d+)?$/, 'Invalid decimal string');

/**
 * Hex string validation
 */
export const hexStringSchema = z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex string');

/**
 * Vault ID validation
 */
export const vaultIdSchema = z.string().min(1).max(100);

/**
 * API request schemas
 */

// GET /api/vaults
export const getVaultsSchema = z.object({
  chains: z.string().optional().transform((val) => {
    if (!val) return [];
    return val.split(',').map(Number).filter(Number.isInteger);
  })
});

// GET /api/vaults/[chainId]/[vault]
export const getVaultSchema = z.object({
  chainId: chainIdSchema,
  vault: vaultIdSchema
});

// GET /api/portfolio
export const getPortfolioSchema = z.object({
  // Query params arrive as strings; coerce to number for validation
  chain: z.coerce.number().int().min(1).max(999999999),
  address: addressSchema
});

// GET /api/redemptions
export const getRedemptionsSchema = z.object({
  chain: z.coerce.number().int().min(1).max(999999999),
  vault: addressSchema,
  address: addressSchema
});

// POST /api/tx/deposit
export const depositTxSchema = z.object({
  chain: chainIdSchema,
  vault: addressSchema,
  owner: addressSchema,
  amount: decimalStringSchema
});

// POST /api/tx/withdraw
export const withdrawTxSchema = z.object({
  chain: chainIdSchema,
  vault: addressSchema,
  owner: addressSchema,
  shares: decimalStringSchema
});

/**
 * Query parameter schemas
 */
export const queryParamSchema = z.object({
  chains: z.string().optional(),
  chain: z.string().optional(),
  address: z.string().optional(),
  vault: z.string().optional()
});

/**
 * Response schemas for validation
 */
export const vaultDTOSchema = z.object({
  id: z.string(),
  chainId: z.number(),
  name: z.string(),
  symbol: z.string(),
  tvlUsd: z.string(),
  apyNet: z.string(),
  fees: z.object({
    mgmtBps: z.string(),
    perfBps: z.string()
  }),
  underlying: z.object({
    symbol: z.string(),
    address: z.string(),
    decimals: z.number()
  }),
  status: z.enum(['active', 'paused', 'deprecated']),
  rewards: z.array(z.object({
    token: z.string(),
    apy: z.string(),
    symbol: z.string()
  })).optional(),
  strategy: z.object({
    name: z.string(),
    description: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high'])
  }).optional(),
  metadata: z.object({
    website: z.string().optional(),
    description: z.string().optional(),
    logo: z.string().optional()
  }).optional()
});

export const positionDTOSchema = z.object({
  vault: z.string(),
  chainId: z.number(),
  shares: z.string(),
  valueUsd: z.string(),
  pnlUsd: z.string(),
  entryUsd: z.string(),
  rewards: z.array(z.object({
    token: z.string(),
    amount: z.string(),
    valueUsd: z.string(),
    symbol: z.string()
  })).optional()
});

export const portfolioDTOSchema = z.object({
  address: z.string(),
  chainId: z.number(),
  positions: z.array(positionDTOSchema),
  totalValueUsd: z.string(),
  totalPnlUsd: z.string(),
  lastUpdated: z.string()
});

export const redemptionDTOSchema = z.object({
  vault: z.string(),
  chainId: z.number(),
  address: z.string(),
  claimableAmount: z.string(),
  claimableValueUsd: z.string(),
  token: z.object({
    symbol: z.string(),
    address: z.string(),
    decimals: z.number()
  }),
  expiry: z.string().optional()
});

export const transactionResponseSchema = z.object({
  to: z.string(),
  data: z.string(),
  value: z.string(),
  gasLimit: z.string().optional()
});

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional()
});

/**
 * Type exports
 */
export type GetVaultsParams = z.infer<typeof getVaultsSchema>;
export type GetVaultParams = z.infer<typeof getVaultSchema>;
export type GetPortfolioParams = z.infer<typeof getPortfolioSchema>;
export type GetRedemptionsParams = z.infer<typeof getRedemptionsSchema>;
export type DepositTxParams = z.infer<typeof depositTxSchema>;
export type WithdrawTxParams = z.infer<typeof withdrawTxSchema>;
export type QueryParams = z.infer<typeof queryParamSchema>;
