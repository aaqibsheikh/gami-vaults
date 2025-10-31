/**
 * Number normalization utilities
 * Ensures all numeric values are safely handled as decimal strings
 */

import { parseUnits, formatUnits } from 'viem';

/**
 * Convert a BigInt to a normalized decimal string
 */
export function bigIntToDecimalString(value: bigint, decimals: number): string {
  return formatUnits(value, decimals);
}

/**
 * Convert a decimal string to BigInt
 */
export function decimalStringToBigInt(value: string, decimals: number): bigint {
  return parseUnits(value, decimals);
}

/**
 * Format a decimal string to a readable number with specified decimal places
 */
export function formatDecimalString(
  value: string,
  decimals: number = 6,
  compact: boolean = false
): string {
  const num = parseFloat(value);
  
  if (isNaN(num)) return '0';
  
  if (compact && num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (compact && num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toFixed(decimals);
}

/**
 * Format USD values with proper currency formatting
 */
export function formatUsd(value: string, compact: boolean = true): string {
  const num = parseFloat(value);
  
  if (isNaN(num)) return '$0';
  
  if (compact && num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  } else if (compact && num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  
  return `$${num.toFixed(2)}`;
}

/**
 * Format percentage values
 * Expects the value to be in decimal form (e.g., 0.17 for 17%)
 * and multiplies by 100 to convert to percentage
 */
export function formatPercentage(value: string, decimals: number = 2): string {
  const num = parseFloat(value);
  
  if (isNaN(num)) return '0%';
  
  // Multiply by 100 to convert decimal to percentage
  const percentage = num * 100;
  
  // Remove trailing zeros after decimal
  // For example: 17.00 -> 17, 17.50 -> 17.5, 17.12 -> 17.12
  const formatted = percentage.toFixed(decimals).replace(/\.?0+$/, '');
  
  return `${formatted}%`;
}

/**
 * Safely parse a string to number, returning 0 for invalid values
 */
export function safeParseNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Safely parse a string to BigInt, returning 0n for invalid values
 */
export function safeParseBigInt(value: string | bigint | undefined): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'string') {
    try {
      return BigInt(value);
    } catch {
      return BigInt(0);
    }
  }
  return BigInt(0);
}

/**
 * Check if a decimal string is valid
 */
export function isValidDecimalString(value: string): boolean {
  if (typeof value !== 'string') return false;
  
  // Allow decimal numbers with optional decimal point
  const decimalRegex = /^\d+(\.\d+)?$/;
  return decimalRegex.test(value) && !isNaN(parseFloat(value));
}

/**
 * Normalize a numeric value to a decimal string
 */
export function normalizeToString(value: string | number | bigint | undefined, decimals?: number): string {
  if (value === undefined || value === null) return '0';
  
  if (typeof value === 'string') {
    return isValidDecimalString(value) ? value : '0';
  }
  
  if (typeof value === 'number') {
    return isNaN(value) ? '0' : value.toString();
  }
  
  if (typeof value === 'bigint' && decimals !== undefined) {
    return bigIntToDecimalString(value, decimals);
  }
  
  return '0';
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(oldValue: string, newValue: string): string {
  const old = safeParseNumber(oldValue);
  const current = safeParseNumber(newValue);
  
  if (old === 0) return current > 0 ? '100' : '0';
  
  const change = ((current - old) / old) * 100;
  return change.toFixed(2);
}
