// ─────────────────────────────────────────────────────────────────────────────
// calculations/amdahl.ts
// Pure functions implementing Amdahl's Law.
//
// Amdahl's Law formula:
//   Speedup(N) = 1 / ( (1-P) + P/N )
//
//   where:
//     P = parallel fraction (e.g. 0.85 for 85 % parallel work)
//     N = number of processor cores
//
// Maximum theoretical speedup (N → ∞):
//   Speedup_max = 1 / (1-P)
//   When P = 1, this is Infinity (unbounded).
// ─────────────────────────────────────────────────────────────────────────────

import type {
  AmdahlAnalysis,
  AmdahlInput,
  SpeedupResult,
  CalculationStep,
  TableRow,
} from "../types/amdahl";

// ── Core formula functions ────────────────────────────────────────────────────

/**
 * Calculate speedup for a single core count using Amdahl's Law.
 *
 * @param parallelFraction - Fraction of workload parallelisable (0 ≤ P ≤ 1)
 * @param cores            - Number of processor cores (positive integer)
 * @returns Theoretical speedup factor (full floating-point precision)
 */
export function calculateSpeedup(parallelFraction: number, cores: number): number {
  if (parallelFraction < 0 || parallelFraction > 1) {
    throw new RangeError("parallelFraction must be between 0 and 1 (inclusive).");
  }
  if (!Number.isFinite(cores) || cores <= 0) {
    throw new RangeError("cores must be a positive finite number.");
  }

  const serialFraction = 1 - parallelFraction;
  // S(N) = 1 / ((1-P) + P/N)
  return 1 / (serialFraction + parallelFraction / cores);
}

/**
 * Calculate the maximum theoretical speedup as cores → ∞.
 *
 * @param parallelFraction - Fraction of workload parallelisable (0 ≤ P ≤ 1)
 * @returns Maximum theoretical speedup (= 1 / (1-P)), or Infinity when P = 1
 */
export function calculateMaxSpeedup(parallelFraction: number): number {
  if (parallelFraction < 0 || parallelFraction > 1) {
    throw new RangeError("parallelFraction must be between 0 and 1 (inclusive).");
  }
  const serialFraction = 1 - parallelFraction;
  if (serialFraction === 0) return Infinity; // P = 1: no serial bottleneck
  return 1 / serialFraction;
}

/**
 * Relative execution time for N cores: the reciprocal of speedup.
 * T(N) = (1-P) + P/N
 */
export function calculateRelativeTime(parallelFraction: number, cores: number): number {
  if (parallelFraction < 0 || parallelFraction > 1) {
    throw new RangeError("parallelFraction must be between 0 and 1 (inclusive).");
  }
  if (!Number.isFinite(cores) || cores <= 0) {
    throw new RangeError("cores must be a positive finite number.");
  }
  return (1 - parallelFraction) + parallelFraction / cores;
}

// ── Composite analysis ────────────────────────────────────────────────────────

/**
 * Run a full Amdahl's Law analysis for a given set of inputs.
 *
 * @param input - { parallelFraction, cores[] }
 * @returns Full analysis object with per-core results and max speedup
 */
export function runAmdahlAnalysis(input: AmdahlInput): AmdahlAnalysis {
  const { parallelFraction, cores } = input;
  const serialFraction = 1 - parallelFraction;
  const maxTheoreticalSpeedup = calculateMaxSpeedup(parallelFraction);

  const results: SpeedupResult[] = cores.map((n) => {
    const speedup = calculateSpeedup(parallelFraction, n);
    const efficiency = speedup / n;
    return {
      cores: n,
      speedup:    Math.round(speedup    * 10000) / 10000, // 4 d.p.
      efficiency: Math.round(efficiency * 10000) / 10000,
    };
  });

  return {
    parallelFraction,
    serialFraction,
    maxTheoreticalSpeedup: Math.round(maxTheoreticalSpeedup * 10000) / 10000,
    results,
  };
}

// ── Phase 2: step-by-step derivation ─────────────────────────────────────────

/**
 * Build the complete numbered step-by-step calculation for a given P and N.
 * Returns an array of CalculationStep objects — no rounding on stored values,
 * only in the displayed strings.
 *
 * @param parallelFraction - P (0 – 1)
 * @param cores            - N (positive integer)
 */
export function buildCalculationSteps(
  parallelFraction: number,
  cores: number
): CalculationStep[] {
  const P  = parallelFraction;
  const N  = cores;
  const S  = 1 - P;            // serial fraction
  const pn = P / N;            // parallel execution time component
  const total = S + pn;        // total relative execution time
  const speedup = 1 / total;   // final speedup

  return [
    {
      step: 1,
      label: "Parallel fraction",
      expr:  "P",
      result: P.toFixed(8),
    },
    {
      step: 2,
      label: "Serial fraction",
      expr:  `1 − P = 1 − ${P.toFixed(8)}`,
      result: S.toFixed(8),
    },
    {
      step: 3,
      label: "Parallel execution time",
      expr:  `P / N = ${P.toFixed(8)} / ${N}`,
      result: pn.toFixed(8),
    },
    {
      step: 4,
      label: "Total relative execution time",
      expr:  `(1 − P) + P/N = ${S.toFixed(8)} + ${pn.toFixed(8)}`,
      result: total.toFixed(8),
    },
    {
      step: 5,
      label: "Speedup  S(N) = 1 / total time",
      expr:  `1 / ${total.toFixed(8)}`,
      result: `${speedup.toFixed(8)}×`,
    },
  ];
}

// ── Phase 2: full results table ───────────────────────────────────────────────

/**
 * Build the results table for a given parallel fraction across a set of
 * core counts. Returns raw floating-point values; the UI handles rounding.
 *
 * @param parallelFraction - P (0 – 1)
 * @param coreCounts       - array of N values
 */
export function buildResultsTable(
  parallelFraction: number,
  coreCounts: number[]
): TableRow[] {
  const P = parallelFraction;
  const S = 1 - P;

  return coreCounts.map((N) => {
    const parallelTime = P / N;
    const totalTime    = S + parallelTime;
    const speedup      = 1 / totalTime;
    const efficiency   = speedup / N;

    return {
      cores:        N,
      parallelTime,
      serialTime:   S,          // same for every row
      totalTime,
      speedup,
      efficiency,
    };
  });
}
