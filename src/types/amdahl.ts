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
