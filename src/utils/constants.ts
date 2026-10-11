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

/** Chart colours */
export const CHART_COLORS = {
  speedup:    "#3b82f6", // blue-500
  efficiency: "#22c55e", // green-500
  maxLine:    "#f97316", // orange-500
  grid:       "#334155", // slate-700
  axis:       "#94a3b8", // slate-400
} as const;
