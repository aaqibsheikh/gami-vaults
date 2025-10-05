/**
 * Tests for normalize.ts utility functions
 */

import {
  formatUsd,
  formatPercentage,
  safeParseNumber,
  safeParseBigInt,
  isValidDecimalString,
  normalizeToString,
  calculatePercentageChange
} from '@/lib/normalize';

describe('normalize.ts', () => {
  describe('formatUsd', () => {
    it('should format USD values correctly', () => {
      expect(formatUsd('1000.50')).toBe('$1.00K');
      expect(formatUsd('1000000.75')).toBe('$1.00M');
      expect(formatUsd('500.25')).toBe('$500.25');
      expect(formatUsd('0')).toBe('$0');
    });

    it('should handle compact formatting', () => {
      expect(formatUsd('1000.50', true)).toBe('$1.00K');
      expect(formatUsd('1000000.75', true)).toBe('$1.00M');
      expect(formatUsd('500.25', false)).toBe('$500.25');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage values correctly', () => {
      expect(formatPercentage('5.25')).toBe('5.25%');
      expect(formatPercentage('10.5')).toBe('10.50%');
      expect(formatPercentage('0')).toBe('0%');
    });

    it('should handle custom decimal places', () => {
      expect(formatPercentage('5.256789', 3)).toBe('5.257%');
      expect(formatPercentage('10.5', 1)).toBe('10.5%');
    });
  });

  describe('safeParseNumber', () => {
    it('should parse valid numbers correctly', () => {
      expect(safeParseNumber('123.45')).toBe(123.45);
      expect(safeParseNumber(678.90)).toBe(678.90);
      expect(safeParseNumber('0')).toBe(0);
    });

    it('should handle invalid inputs', () => {
      expect(safeParseNumber('invalid')).toBe(0);
      expect(safeParseNumber(undefined)).toBe(0);
      expect(safeParseNumber(null as any)).toBe(0);
    });
  });

  describe('safeParseBigInt', () => {
    it('should parse valid BigInt values correctly', () => {
      expect(safeParseBigInt('1234567890123456789')).toBe(BigInt('1234567890123456789'));
      expect(safeParseBigInt(BigInt(123))).toBe(BigInt(123));
    });

    it('should handle invalid inputs', () => {
      expect(safeParseBigInt('invalid')).toBe(0n);
      expect(safeParseBigInt(undefined)).toBe(0n);
    });
  });

  describe('isValidDecimalString', () => {
    it('should validate decimal strings correctly', () => {
      expect(isValidDecimalString('123.45')).toBe(true);
      expect(isValidDecimalString('0')).toBe(true);
      expect(isValidDecimalString('999999.999999')).toBe(true);
    });

    it('should reject invalid decimal strings', () => {
      expect(isValidDecimalString('')).toBe(false);
      expect(isValidDecimalString('abc')).toBe(false);
      expect(isValidDecimalString('12.34.56')).toBe(false);
      expect(isValidDecimalString('-123.45')).toBe(false);
      expect(isValidDecimalString(123 as any)).toBe(false);
    });
  });

  describe('normalizeToString', () => {
    it('should normalize various input types to strings', () => {
      expect(normalizeToString('123.45')).toBe('123.45');
      expect(normalizeToString(678.90)).toBe('678.9');
      expect(normalizeToString(undefined)).toBe('0');
      expect(normalizeToString(null as any)).toBe('0');
    });

    it('should handle BigInt with decimals', () => {
      expect(normalizeToString(BigInt('1000000000000000000'), 18)).toBe('1');
      expect(normalizeToString(BigInt('500000000000000000'), 18)).toBe('0.5');
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate percentage change correctly', () => {
      expect(calculatePercentageChange('100', '110')).toBe('10.00');
      expect(calculatePercentageChange('100', '90')).toBe('-10.00');
      expect(calculatePercentageChange('0', '100')).toBe('100');
    });

    it('should handle edge cases', () => {
      expect(calculatePercentageChange('0', '0')).toBe('0');
      expect(calculatePercentageChange('100', '100')).toBe('0.00');
    });
  });
});
