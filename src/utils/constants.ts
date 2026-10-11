// ─────────────────────────────────────────────────────────────────────────────
// utils/constants.ts
// Project-wide constants for the e-commerce flash sale scenario.
// ─────────────────────────────────────────────────────────────────────────────

import type { ScenarioConfig } from "../types/amdahl";

/** Default scenario: E-Commerce Flash Sale Order Processing */
export const FLASH_SALE_SCENARIO: ScenarioConfig = {
  title: "E-Commerce Flash Sale – Order Processing",
  description:
    "During a flash sale, the order-processing system receives thousands of concurrent requests. " +
    "85 % of the workload (inventory lookup, payment validation, fulfilment routing) " +
    "can be parallelised across multiple CPU cores. " +
    "The remaining 15 % must run serially (final order confirmation, sequential DB commit).",
  parallelFraction: 0.85,
  cores: [4, 16, 64],
};

/** Expected results for validation / README reference */
export const EXPECTED_RESULTS = [
  { cores: 4,  speedup: 2.7586 },
  { cores: 16, speedup: 4.9231 },
  { cores: 64, speedup: 6.1244 },
] as const;

export const EXPECTED_MAX_SPEEDUP = 6.6667;

/** Chart colours — tuned for light academic theme */
export const CHART_COLORS = {
  speedup:       "#2563eb", // blue-600   — primary Amdahl speedup line
  idealSpeedup:  "#94a3b8", // slate-400  — ideal linear speedup (lighter)
  scenario85:    "#2563eb", // blue-600   — P = 0.85 (project default)
  scenario90:    "#059669", // emerald-600 — P = 0.90
  scenario95:    "#d97706", // amber-600  — P = 0.95
  maxLine:       "#dc2626", // red-600    — max theoretical speedup reference
  grid:          "#e5e7eb", // gray-200   — subtle grid lines
  axis:          "#6b7280", // gray-500   — axis labels
  tooltip:       "#1e2330", // charcoal   — tooltip text
} as const;
