// ─────────────────────────────────────────────────────────────────────────────
// calculations/amdahl.ts
// Pure functions implementing Amdahl's Law.
//
// Amdahl's Law formula:
//   Speedup(n) = 1 / ( S + P/n )
//
//   where:
//     S = serial fraction   (e.g. 0.15 for 15 % serial work)
//     P = parallel fraction (e.g. 0.85 for 85 % parallel work)
//     n = number of processor cores
//
// Maximum theoretical speedup (n → ∞):
//   Speedup_max = 1 / S
// ─────────────────────────────────────────────────────────────────────────────

import type { AmdahlAnalysis, AmdahlInput, SpeedupResult } from "../types/amdahl";

/**
 * Calculate speedup for a single core count using Amdahl's Law.
 *
 * @param parallelFraction - Fraction of workload that is parallelisable (0 < p < 1)
 * @param cores            - Number of processor cores (positive integer)
 * @returns Theoretical speedup factor
 */
export function calculateSpeedup(parallelFraction: number, cores: number): number {
  if (parallelFraction < 0 || parallelFraction > 1) {
    throw new RangeError("parallelFraction must be between 0 and 1 (inclusive).");
  }
  if (cores <= 0 || !Number.isFinite(cores)) {
    throw new RangeError("cores must be a positive finite number.");
  }

  const serialFraction = 1 - parallelFraction;

  // Amdahl's Law: Speedup = 1 / (S + P/n)
  return 1 / (serialFraction + parallelFraction / cores);
}

/**
 * Calculate the maximum theoretical speedup as cores → ∞.
 *
 * @param parallelFraction - Fraction of workload that is parallelisable
 * @returns Maximum theoretical speedup (= 1 / serialFraction)
 */
export function calculateMaxSpeedup(parallelFraction: number): number {
  if (parallelFraction < 0 || parallelFraction > 1) {
    throw new RangeError("parallelFraction must be between 0 and 1 (inclusive).");
  }
  const serialFraction = 1 - parallelFraction;

  // When serialFraction = 0 the speedup is infinite
  if (serialFraction === 0) return Infinity;

  return 1 / serialFraction;
}

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
    const efficiency = speedup / n; // fraction of each core that is useful
    return {
      cores: n,
      speedup: Math.round(speedup * 10000) / 10000, // 4 d.p.
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
