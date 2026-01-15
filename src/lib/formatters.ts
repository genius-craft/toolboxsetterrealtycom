/**
 * Formatting utilities for Setter Toolbox
 */

/**
 * Format number as Brazilian Real currency
 * @param value Number to format
 * @param showCents Whether to show cents (default: true for small values)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, showCents: boolean = false): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });
  return formatter.format(value);
}

/**
 * Format number as compact currency (e.g., R$ 1,5M)
 * @param value Number to format
 * @returns Formatted compact currency string
 */
export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toFixed(1).replace('.', ',')}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')}K`;
  }
  return formatCurrency(value);
}

/**
 * Format number as percentage
 * @param value Decimal value (e.g., 0.15 for 15%)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Format number with thousands separator
 * @param value Number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format area in square meters
 * @param value Area in sqm
 * @returns Formatted area string
 */
export function formatArea(value: number): string {
  return `${formatNumber(value)} m²`;
}

/**
 * Parse Brazilian currency string to number
 * @param value Currency string (e.g., "R$ 1.500.000,00")
 * @returns Parsed number
 */
export function parseCurrency(value: string): number {
  const cleaned = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Parse percentage string to decimal
 * @param value Percentage string (e.g., "15,5%")
 * @returns Decimal value (e.g., 0.155)
 */
export function parsePercentage(value: string): number {
  const cleaned = value.replace('%', '').replace(',', '.').trim();
  return (parseFloat(cleaned) || 0) / 100;
}

/**
 * Format equity multiple (e.g., 2.5x)
 * @param value Multiple value
 * @returns Formatted multiple string
 */
export function formatMultiple(value: number): string {
  return `${value.toFixed(2).replace('.', ',')}x`;
}

/**
 * Format months/years duration
 * @param months Number of months
 * @returns Formatted duration string
 */
export function formatDuration(months: number): string {
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
    return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
  }
  return `${months} ${months === 1 ? 'mês' : 'meses'}`;
}
