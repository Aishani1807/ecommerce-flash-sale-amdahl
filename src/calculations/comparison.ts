// ─────────────────────────────────────────────────────────────────────────────
// calculations/comparison.ts
// Phase 4 — Server Comparison & Recommendation Simulator
//
// Pure functions for:
//   - Building per-configuration comparison rows
//   - Cost / electricity analysis (user-provided assumptions only)
//   - Transparent recommendation engine
//
// All arithmetic re-uses calculateSpeedup / calculateMaxSpeedup from
// calculations/amdahl.ts. No formula duplication here.
// ─────────────────────────────────────────────────────────────────────────────

import { calculateSpeedup, calculateMaxSpeedup } from "./amdahl";
import type {
  WorkloadScenario,
  ComparisonRow,
  CostAssumptions,
  CostResult,
  Recommendation,
} from "../types/comparison";

// ── Constants ─────────────────────────────────────────────────────────────────

/** The five server configurations to compare */
export const SERVER_CORE_COUNTS: readonly number[] = [4, 16, 32, 64, 128];

/** The three named workload scenarios */
export const WORKLOAD_SCENARIOS: readonly WorkloadScenario[] = [
  { id: "p85", label: "85% parallel / 15% serial", parallelFraction: 0.85, serialFraction: 0.15 },
  { id: "p90", label: "90% parallel / 10% serial", parallelFraction: 0.90, serialFraction: 0.10 },
  { id: "p95", label: "95% parallel / 5% serial",  parallelFraction: 0.95, serialFraction: 0.05 },
];

// ── Comparison table ──────────────────────────────────────────────────────────

/**
 * Build one ComparisonRow for a single server configuration.
 *
 * @param cores            - N (number of CPU cores)
 * @param parallelFraction - P (0 – 1)
 * @param speedupAt4       - S(4) under the same P, used for marginal gain
 */
export function buildComparisonRow(
  cores: number,
  parallelFraction: number,
  speedupAt4: number
): ComparisonRow {
  const maxSpeedup = calculateMaxSpeedup(parallelFraction);
  const speedup    = calculateSpeedup(parallelFraction, cores);
  const efficiency = speedup / cores;

  // % of max theoretical speedup (cap at 100 if maxSpeedup is Infinity)
  const pctOfMax = isFinite(maxSpeedup)
    ? (speedup / maxSpeedup) * 100
    : 100; // P=1 edge case: every finite speedup is 100% of unbounded

  // Relative execution time with 1-core baseline = 100%
  // T(1) = 1, T(N) = 1/speedup → relative = (1/speedup)*100
  const relativeExecTime = (1 / speedup) * 100;

  // Marginal gain vs 4-core configuration (%)
  const marginalGainOver4 =
    speedupAt4 > 0 ? ((speedup - speedupAt4) / speedupAt4) * 100 : 0;

  return {
    cores,
    speedup,
    efficiency,
    pctOfMax,
    relativeExecTime,
    marginalGainOver4,
  };
}

/**
 * Build all ComparisonRows for all SERVER_CORE_COUNTS under a given P.
 */
export function buildComparisonTable(parallelFraction: number): ComparisonRow[] {
  // Calculate speedup at 4 cores first — used as marginal-gain baseline
  const speedupAt4 = calculateSpeedup(parallelFraction, 4);
  return SERVER_CORE_COUNTS.map((n) =>
    buildComparisonRow(n, parallelFraction, speedupAt4)
  );
}

// ── Cost analysis ─────────────────────────────────────────────────────────────

/**
 * Validate a cost/power assumption value.
 * Returns true when v is a finite number strictly greater than 0.
 */
export function isValidCostInput(v: number | null): v is number {
  return v !== null && Number.isFinite(v) && v > 0;
}

/**
 * Calculate cost metrics for one server configuration.
 *
 * - Monthly electricity cost = powerWatts / 1000 * hoursPerDay * 30 * electricityUsdPerKwh
 * - Speedup per dollar       = speedup / totalMonthlyCost  (only if costs are known)
 *
 * Any missing or invalid assumption yields null for the affected fields.
 * No real-world prices are assumed or injected.
 */
export function calculateCostResult(
  speedup: number,
  assumptions: CostAssumptions
): CostResult {
  const { monthlyCostUsd, powerWatts, electricityUsdPerKwh, hoursPerDay } = assumptions;

  const serverCost = isValidCostInput(monthlyCostUsd) ? monthlyCostUsd : null;

  const electricityCost =
    isValidCostInput(powerWatts) &&
    isValidCostInput(electricityUsdPerKwh) &&
    isValidCostInput(hoursPerDay)
      ? (powerWatts / 1000) * hoursPerDay * 30 * electricityUsdPerKwh
      : null;

  const totalMonthlyCost =
    serverCost !== null && electricityCost !== null
      ? serverCost + electricityCost
      : serverCost !== null
      ? serverCost           // electricity unknown: show server cost only
      : electricityCost !== null
      ? electricityCost      // server cost unknown: show electricity only
      : null;

  const speedupPerDollar =
    totalMonthlyCost !== null && totalMonthlyCost > 0 && Number.isFinite(speedup)
      ? speedup / totalMonthlyCost
      : null;

  return {
    monthlyCostUsd:         serverCost,
    monthlyElectricityCost: electricityCost,
    totalMonthlyCost,
    speedupPerDollar,
  };
}

/**
 * Returns true when at least enough cost inputs are provided for a
 * meaningful (partial or full) cost analysis.
 */
export function hasSufficientCostData(assumptions: CostAssumptions): boolean {
  return (
    isValidCostInput(assumptions.monthlyCostUsd) ||
    (isValidCostInput(assumptions.powerWatts) &&
      isValidCostInput(assumptions.electricityUsdPerKwh) &&
      isValidCostInput(assumptions.hoursPerDay))
  );
}

// ── Recommendation engine ─────────────────────────────────────────────────────

/**
 * Marginal speedup improvement when stepping from `fromCores` to `toCores`.
 * Returns percentage gain (e.g. 12.4 for 12.4%).
 */
export function marginalSpeedupGain(
  parallelFraction: number,
  fromCores: number,
  toCores: number
): number {
  const sFrom = calculateSpeedup(parallelFraction, fromCores);
  const sTo   = calculateSpeedup(parallelFraction, toCores);
  return sFrom > 0 ? ((sTo - sFrom) / sFrom) * 100 : 0;
}

/**
 * Core recommendation logic.
 *
 * Selection heuristic (performance-only path):
 *   - The "recommended" configuration is the first one where the marginal
 *     improvement over the previous tier drops below a meaningful threshold
 *     (15%), indicating diminishing returns have set in.
 *   - If no tier drops below 15%, recommend the last (highest cores).
 *   - When cost data is available, prefer the highest speedup-per-dollar.
 *
 * @param rows        - ComparisonRows for all configurations
 * @param costResults - CostResult for each row (same order), or null array
 * @param parallelFraction - P used for the analysis
 * @param hasCost     - whether valid cost data is present
 */
export function generateRecommendation(
  rows: ComparisonRow[],
  costResults: (CostResult | null)[],
  parallelFraction: number,
  hasCost: boolean
): Recommendation {
  const maxSpeedup = calculateMaxSpeedup(parallelFraction);
  const serialPct  = ((1 - parallelFraction) * 100).toFixed(0);

  // ── Find recommended config ────────────────────────────────────────────────
  let recommendedIdx = 0; // default: 4-core (lowest), most efficient

  if (hasCost && costResults.length > 0) {
    // Cost path: find the config with the best speedup-per-dollar
    let bestSpd = -Infinity;
    rows.forEach((_, i) => {
      const cr = costResults[i];
      if (cr && cr.speedupPerDollar !== null && cr.speedupPerDollar > bestSpd) {
        bestSpd = cr.speedupPerDollar;
        recommendedIdx = i;
      }
    });
  } else {
    // Performance-only path: find where marginal gain drops below 15%
    let foundKnee = false;
    for (let i = 0; i < rows.length - 1; i++) {
      const gain = marginalSpeedupGain(parallelFraction, rows[i].cores, rows[i + 1].cores);
      if (gain < 15) {
        recommendedIdx = i;
        foundKnee = true;
        break;
      }
    }
    // If every step still gives >= 15%, recommend the last (most cores)
    if (!foundKnee) {
      recommendedIdx = rows.length - 1;
    }
  }

  const rec = rows[recommendedIdx];
  const nextIdx = recommendedIdx + 1;
  const hasNext = nextIdx < rows.length;
  const nextRow = hasNext ? rows[nextIdx] : null;

  // ── Build evidence ─────────────────────────────────────────────────────────
  const evidence: string[] = [
    `${rec.cores}-core configuration achieves a theoretical speedup of ${rec.speedup.toFixed(4)}×.`,
    `Parallel efficiency: ${(rec.efficiency * 100).toFixed(2)}% — each core delivers ${(rec.efficiency * 100).toFixed(2)}% of its single-core work rate.`,
    `This is ${rec.pctOfMax.toFixed(1)}% of the theoretical maximum speedup (${isFinite(maxSpeedup) ? maxSpeedup.toFixed(4) + "×" : "unbounded"}).`,
  ];

  if (hasCost) {
    const cr = costResults[recommendedIdx];
    if (cr && cr.totalMonthlyCost !== null) {
      evidence.push(
        `Estimated combined monthly cost: $${cr.totalMonthlyCost.toFixed(2)} (based on your assumptions).`
      );
    }
    if (cr && cr.speedupPerDollar !== null) {
      evidence.push(
        `Speedup per $100/month: ${(cr.speedupPerDollar * 100).toFixed(4)}×.`
      );
    }
  }

  // ── Next-config note ───────────────────────────────────────────────────────
  let nextConfigNote: string;
  if (!hasNext || !nextRow) {
    nextConfigNote =
      `${rec.cores} cores is the highest configuration compared. Adding more cores ` +
      `will yield further speedup, but the ${serialPct}% serial fraction limits total ` +
      `gain to ${isFinite(maxSpeedup) ? maxSpeedup.toFixed(4) + "×" : "unbounded"} regardless of core count.`;
  } else {
    const marginalGain = marginalSpeedupGain(parallelFraction, rec.cores, nextRow.cores);
    const nextCostNote = (() => {
      if (!hasCost) return "";
      const cr = costResults[nextIdx];
      const recCr = costResults[recommendedIdx];
      if (cr && cr.totalMonthlyCost !== null && recCr && recCr.totalMonthlyCost !== null) {
        const delta = cr.totalMonthlyCost - recCr.totalMonthlyCost;
        return ` At your assumed costs, moving to ${nextRow.cores} cores adds roughly $${delta.toFixed(2)}/month.`;
      }
      return "";
    })();

    if (marginalGain < 10) {
      nextConfigNote =
        `Upgrading to ${nextRow.cores} cores would add only ${marginalGain.toFixed(1)}% more speedup ` +
        `(${nextRow.speedup.toFixed(4)}× vs ${rec.speedup.toFixed(4)}×). ` +
        `This small gain is unlikely to justify the additional cost and complexity.${nextCostNote}`;
    } else if (marginalGain < 25) {
      nextConfigNote =
        `Upgrading to ${nextRow.cores} cores adds ${marginalGain.toFixed(1)}% more speedup ` +
        `(${nextRow.speedup.toFixed(4)}×). Whether this is worthwhile depends on your ` +
        `actual throughput requirements and budget.${nextCostNote}`;
    } else {
      nextConfigNote =
        `Upgrading to ${nextRow.cores} cores adds ${marginalGain.toFixed(1)}% more speedup ` +
        `(${nextRow.speedup.toFixed(4)}×). This is a meaningful improvement; ` +
        `consider it if throughput is the primary concern.${nextCostNote}`;
    }
  }

  // ── Deployment caveats ─────────────────────────────────────────────────────
  const deploymentCaveats: string[] = [
    "Measure the actual parallel fraction of your workload under realistic flash-sale load — Amdahl's Law results are only as accurate as that measurement.",
    "Profile serial bottlenecks (database commit sequences, order-confirmation locks) before adding cores.",
    "Benchmark memory bandwidth and inter-core communication overhead, which can reduce effective parallelism.",
    "Evaluate OS scheduling overhead and thread synchronisation cost at high core counts.",
    hasCost
      ? "Verify server pricing with your cloud or hardware vendor — the cost inputs here are your own estimates."
      : "Obtain verified server pricing from your cloud or hardware vendor before making a procurement decision.",
  ];

  // ── Headline ───────────────────────────────────────────────────────────────
  const headline = hasCost
    ? `${rec.cores}-core configuration offers the best estimated speedup-per-dollar under your cost assumptions.`
    : `${rec.cores}-core configuration offers the best balance of speedup and parallel efficiency for ${(parallelFraction * 100).toFixed(0)}% parallel workloads (performance-only assessment).`;

  return {
    recommendedCores: rec.cores,
    headline,
    evidence,
    nextConfigNote,
    deploymentCaveats,
    performanceOnly: !hasCost,
  };
}
