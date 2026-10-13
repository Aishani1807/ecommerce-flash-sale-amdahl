// ─────────────────────────────────────────────────────────────────────────────
// types/comparison.ts
// TypeScript types for Phase 4: Server Comparison & Recommendation Simulator.
// ─────────────────────────────────────────────────────────────────────────────

// ── Workload scenarios ────────────────────────────────────────────────────────

/** A named workload scenario (fixed parallel/serial fraction pair) */
export interface WorkloadScenario {
  id:               string;
  label:            string;
  parallelFraction: number;   // 0 – 1
  serialFraction:   number;   // = 1 - parallelFraction
}

// ── Per-configuration comparison row ─────────────────────────────────────────

/**
 * All metrics for a single server configuration under a chosen workload.
 * All numbers are stored at full float precision; the UI handles rounding.
 */
export interface ComparisonRow {
  cores:              number;
  speedup:            number;   // Amdahl S(N)
  efficiency:         number;   // S(N) / N  (fraction, not percent)
  pctOfMax:           number;   // speedup / maxSpeedup × 100
  relativeExecTime:   number;   // 1 / speedup × 100  (single-core = 100%)
  marginalGainOver4:  number;   // (speedup - speedup@4) / speedup@4 × 100
}

// ── Cost assumptions (user-provided, all optional) ────────────────────────────

/**
 * User-supplied cost / power assumptions.
 * `null` means "not provided" — cost analysis remains unavailable.
 */
export interface CostAssumptions {
  /** Estimated monthly server cost in USD (user's own estimate) */
  monthlyCostUsd: number | null;
  /** Power consumption in watts */
  powerWatts: number | null;
  /** Electricity price in USD per kWh */
  electricityUsdPerKwh: number | null;
  /** Hours the server runs per day */
  hoursPerDay: number | null;
}

/** Result of a cost calculation for one configuration */
export interface CostResult {
  monthlyCostUsd:        number | null;
  monthlyElectricityCost: number | null;
  totalMonthlyCost:      number | null;
  speedupPerDollar:      number | null;   // speedup / totalMonthlyCost
}

// ── Recommendation ────────────────────────────────────────────────────────────

/** Structured recommendation produced by the recommendation engine */
export interface Recommendation {
  /** Recommended core count */
  recommendedCores: number;
  /** Plain-English headline */
  headline: string;
  /** Numerical evidence supporting the choice */
  evidence: string[];
  /** Explanation of why the next larger config may not be worthwhile */
  nextConfigNote: string;
  /** What real-world data would be needed before deployment */
  deploymentCaveats: string[];
  /** Whether the recommendation was based on performance only (no cost data) */
  performanceOnly: boolean;
}
