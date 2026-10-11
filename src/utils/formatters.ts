// ─────────────────────────────────────────────────────────────────────────────
// utils/formatters.ts
// Helper functions for formatting numbers displayed in the UI.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a speedup number to a fixed number of decimal places.
 * e.g. formatSpeedup(2.7586) → "2.7586×"
 */
export function formatSpeedup(value: number, decimals = 4): string {
  return `${value.toFixed(decimals)}×`;
}

/**
 * Format efficiency as a percentage.
 * e.g. formatEfficiency(0.6897) → "68.97 %"
 */
export function formatEfficiency(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)} %`;
}

/**
 * Format a fraction as a percentage string.
 * e.g. formatPercent(0.85) → "85 %"
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)} %`;
}

/**
 * Round a number to a given number of significant digits.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
