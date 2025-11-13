/**
 * Shared number formatting helpers for input handling and display.
 */

/**
 * Format a numeric input string with thousands separators while preserving the
 * user's decimal precision. Returns an empty string for empty values so inputs
 * can clear without forcing a zero.
 */
export function formatNumberInput(value: string): string {
  if (value === '') return '';

  const [intPart, decimalPart] = value.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
}

/**
 * Remove any formatting characters (currently just commas) from a numeric
 * input. Useful before validation or arithmetic.
 */
export function sanitizeNumberInput(value: string): string {
  return value.replace(/,/g, '');
}

/**
 * Truncate a numeric string to the specified number of decimal places without
 * rounding. Supports partial inputs like "0." while preserving the decimal
 * separator so the user can continue typing.
 */
export function truncateDecimals(value: string, maxDecimals: number): string {
  const sanitized = sanitizeNumberInput(value);
  if (sanitized === '') return '';

  if (!sanitized.includes('.')) {
    return sanitized;
  }

  const [intPart, rawDecimal = ''] = sanitized.split('.');

  if (maxDecimals <= 0) {
    return intPart;
  }

  if (rawDecimal.length <= maxDecimals) {
    return `${intPart}.${rawDecimal}`;
  }

  const truncatedDecimal = rawDecimal.slice(0, maxDecimals);
  return truncatedDecimal.length > 0 ? `${intPart}.${truncatedDecimal}` : intPart;
}

/**
 * Parse a formatted numeric string (e.g. with commas) into a number. Returns
 * undefined for empty, non-numeric, or invalid values so callers can decide
 * how to handle missing data.
 */
export function parseFormattedNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;

  const sanitized = sanitizeNumberInput(value);
  if (sanitized === '') return undefined;

  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Format a number (or numeric string) for display with thousands separators.
 * Defaults to trimming trailing zeros while allowing up to six decimal places.
 * Returns "--" for undefined or invalid values to match existing UI patterns.
 */
export function formatNumberDisplay(
  value: number | string | undefined,
  options: Intl.NumberFormatOptions = {},
  locale: string = 'en-US'
): string {
  if (value === undefined || value === null) return '--';

  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return '--';

  const mergedOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 6,
    ...options,
  };

  if (
    mergedOptions.maximumFractionDigits !== undefined &&
    mergedOptions.maximumFractionDigits !== null
  ) {
    const clamped = Math.min(
      Math.max(Math.floor(mergedOptions.maximumFractionDigits), 0),
      20
    );
    mergedOptions.maximumFractionDigits = clamped;
    if (
      mergedOptions.minimumFractionDigits !== undefined &&
      mergedOptions.minimumFractionDigits > clamped
    ) {
      mergedOptions.minimumFractionDigits = clamped;
    }
  }

  const formatter = new Intl.NumberFormat(locale, mergedOptions);

  return formatter.format(num);
}

