// ─────────────────────────────────────────────────────────────────────────────
// types/amdahl.ts
// Shared TypeScript types for the COA project.
// ─────────────────────────────────────────────────────────────────────────────

/** Configuration for a single parallel-execution scenario */
export interface AmdahlInput {
  /** Fraction of the workload that can run in parallel (0 – 1) */
  parallelFraction: number;
  /** Number of processor cores to evaluate */
  cores: number[];
}

/** Result for a single core count */
export interface SpeedupResult {
  cores: number;
  speedup: number;
  /** Efficiency = speedup / cores  (how well each core is utilised) */
  efficiency: number;
}

/** Full analysis result */
export interface AmdahlAnalysis {
  parallelFraction: number;
  serialFraction: number;
  maxTheoreticalSpeedup: number;
  results: SpeedupResult[];
}

/** E-commerce scenario constants used throughout the app */
export interface ScenarioConfig {
  title: string;
  description: string;
  parallelFraction: number;
  cores: number[];
}

// ── Phase 2 additions ────────────────────────────────────────────────────────

/**
 * One numbered step in the Amdahl's Law derivation.
 * label  — short heading, e.g. "Step 1"
 * expr   — the symbolic / substituted expression
 * result — the numeric result as a formatted string
 */
export interface CalculationStep {
  step: number;
  label: string;
  expr: string;
  result: string;
}

/**
 * One row in the full results table.
 * All numeric fields store full floating-point values;
 * rounding is applied only in the UI.
 */
export interface TableRow {
  cores: number;
  parallelTime: number;   // P / N
  serialTime: number;     // 1 - P  (constant)
  totalTime: number;      // (1-P) + P/N
  speedup: number;        // 1 / totalTime
  efficiency: number;     // speedup / N  (as a fraction, not percent)
}
